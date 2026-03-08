// 1. 声明模块
mod screen_capture;
use tauri::Manager; // 【修改点 2】引入 Manager 才能操作窗口

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // ... 其他插件 ...
        // 【修改点 3】添加 setup 钩子，开启调试权限
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // 获取主窗口，允许 Safari 对其进行远程调试
                // 这在 iOS 16.4+ 之后是必须的，否则 Webview 可能被系统挂起
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.open_devtools();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            screen_capture::take_screenshot,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
