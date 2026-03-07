use tauri::AppHandle;

// 逻辑：只有在【非移动端】（即电脑端）才需要导入 Manager 来查找窗口
#[cfg(not(mobile))]
use tauri::Manager;

use anyhow_tauri::IntoTAResult;

#[tauri::command]
pub async fn take_screenshot(
    // 逻辑：在变量名前加下划线 _，这样在 iOS 下即使没用到这些变量，编译器也不会报错
    app: AppHandle,
    _resize_window: bool,
    _target_width: u32,
    _target_height: u32,
    _recover_size: bool,
) -> anyhow_tauri::TAResult<String> {

    // ==========================================
    // 1. 移动端逻辑 (iOS / Android)
    // ==========================================
    #[cfg(mobile)]
    {
        // 直接返回不支持，不执行任何后续复杂的窗口操作
        anyhow_tauri::bail!("移动端暂不支持屏幕截图功能");
    }

    // ==========================================
    // 2. 桌面端逻辑 (Windows / macOS / Linux)
    // ==========================================
    #[cfg(not(mobile))]
    {
        // 将下划线变量重新赋值给正常变量，方便在桌面端逻辑中使用
        let resize_window = _resize_window;
        let target_width = _target_width;
        let target_height = _target_height;
        let recover_size = _recover_size;

        let win = app.get_webview_window("main");

        let win = if let Some(win) = win {
            win
        } else {
            anyhow_tauri::bail!("找不到主窗口")
        };

        let orig_size = win.inner_size().into_ta_result()?;

        if resize_window {
            win.set_size(tauri::Size::Physical(tauri::PhysicalSize::new(
                target_width,
                target_height,
            )))
            .into_ta_result()?;
            win.set_resizable(false).into_ta_result()?;
        }

        let result: anyhow::Result<String> = {
            // --- Windows 专属：通过 DevTools 协议截图 ---
            #[cfg(target_os = "windows")]
            {
                let win = win.clone();
                #[derive(serde::Deserialize, Debug)]
                struct ScreenshotResult {
                    data: String,
                }

                struct DevToolsRunner(tauri::WebviewWindow<tauri::Wry>);

                impl DevToolsRunner {
                    async fn run(
                        &self,
                        name: &'static str,
                        json_data: serde_json::Value,
                    ) -> anyhow::Result<String> {
                        use anyhow::Context;
                        use webview2_com::CallDevToolsProtocolMethodCompletedHandler;
                        let (os_sx, os_rx) = tokio::sync::oneshot::channel();

                        let json_data = serde_json::to_string(&json_data)
                            .expect("序列化 JSON 失败");

                        self.0
                            .with_webview(move |webview| {
                                let ctl = webview.controller();
                                unsafe {
                                    let core_wv = ctl.CoreWebView2().unwrap();
                                    let name = webview2_com::pwstr_from_str(name);
                                    let json_data = webview2_com::pwstr_from_str(&json_data);
                                    let handler =
                                        CallDevToolsProtocolMethodCompletedHandler::create(
                                            Box::new(move |a, b| {
                                                let _ = os_sx.send((a, b));
                                                Ok(())
                                            }),
                                        );

                                    core_wv
                                        .CallDevToolsProtocolMethod(name, json_data, Some(&handler))
                                        .unwrap();
                                }
                            })
                            .unwrap();

                        let result = os_rx.await.unwrap();
                        result
                            .0
                            .map(|_| result.1)
                            .context("调用 DevTools 协议失败")
                    }

                    async fn take_screenshot(&self) -> anyhow::Result<String> {
                        let json_data = serde_json::json!({
                            "format": "png",
                            "optimizeForSpeed": true,
                        });
                        let res = self.run("Page.captureScreenshot", json_data).await?;
                        let res = serde_json::from_str::<ScreenshotResult>(&res)?;
                        Ok(res.data)
                    }
                }

                let dev_tools_runner = DevToolsRunner(win);

                if resize_window {
                    tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                }
                dev_tools_runner.take_screenshot().await
            }

            // --- 非 Windows 桌面端 (macOS/Linux) ---
            #[cfg(not(target_os = "windows"))]
            {
                anyhow_tauri::bail!(
                    "此平台暂不支持通过 DevTools 截图。"
                )
            }
        };

        let result = result.into_ta_result()?;

        // 恢复窗口大小的逻辑
        if resize_window {
            if recover_size {
                let _ = win.set_size(tauri::Size::Physical(orig_size));
            }
            let _ = win.set_resizable(true);
        }

        Ok(result)
    }
}
