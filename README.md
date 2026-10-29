# Starlit Memories

Website quà sinh nhật tương tác riêng tư. Phase 01 triển khai **Scene 01 — The Invitation** và Phase 02 triển khai **Untie the Ribbon**; bầu trời ký ức ở Phase 03 chưa được thực hiện.

## Chạy bằng VS Code Live Server

1. Mở thư mục `Starlit-Memories` trong VS Code.
2. Cài extension **Live Server** nếu máy chưa có.
3. Mở `index.html`, chọn **Go Live** ở thanh trạng thái hoặc nhấp phải và chọn **Open with Live Server**.
4. Mở trang trên điện thoại cùng mạng nội bộ nếu muốn kiểm tra bố cục di động.

Không cần cài dependency, backend hoặc build step.

## Cấu trúc

- `index.html` — cấu trúc semantic của hai cảnh.
- `css/style.css` — giao diện đáp ứng, hiệu ứng chuyển động và chế độ giảm chuyển động.
- `js/app.js` — tương tác Scene 01.
- `js/scenes.js` — chuyển cảnh từ lời mời sang hộp quà.
- `js/gift.js` — state machine và thao tác kéo/mở hộp quà Scene 02.
- `js/stars.js` — nền sao Canvas 2D.
- `js/memories.js` — chín mục dữ liệu ký ức mẫu chưa có nội dung cá nhân.
- `js/audio.js` — các hàm quản lý âm thanh, không tự phát nhạc.
- `assets/` — vị trí dành cho ảnh, âm thanh và biểu tượng về sau.

Phase 02 hỗ trợ kéo ruy băng bằng chuột/cảm ứng và có nút mở thay thế. Nút cuối hiển thị thông báo rằng bầu trời ký ức đang được chuẩn bị; Phase 03 chưa được triển khai. Không tự động phát nhạc.
