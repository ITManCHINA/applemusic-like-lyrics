// 1. 声明模块：告诉 Rust 去看同目录下的 screen_capture.rs 文件
mod screen_capture;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        // ... 其他插件 ...
        .invoke_handler(tauri::generate_handler![
            // 2. 注册命令：指明使用 screen_capture 模块里的 take_screenshot 函数
            screen_capture::take_screenshot,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
