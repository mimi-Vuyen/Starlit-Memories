# Starlit Memories

Website quà sinh nhật tương tác riêng tư. Phase 01 hiện chỉ triển khai **Scene 01 — The Invitation**; các màn ký ức và nội dung tiếp theo chưa được thực hiện.

## Chạy bằng VS Code Live Server

1. Mở thư mục `Starlit-Memories` trong VS Code.
2. Cài extension **Live Server** nếu máy chưa có.
3. Mở `index.html`, chọn **Go Live** ở thanh trạng thái hoặc nhấp phải và chọn **Open with Live Server**.
4. Mở trang trên điện thoại cùng mạng nội bộ nếu muốn kiểm tra bố cục di động.

Không cần cài dependency, backend hoặc build step.

## Cấu trúc

- `index.html` — cấu trúc semantic của Scene 01.
- `css/style.css` — giao diện đáp ứng, hiệu ứng chuyển động và chế độ giảm chuyển động.
- `js/app.js` — trạng thái và tương tác Scene 01.
- `js/stars.js` — nền sao Canvas 2D.
- `js/memories.js` — chín mục dữ liệu ký ức mẫu chưa có nội dung cá nhân.
- `js/audio.js` — các hàm quản lý âm thanh, không tự phát nhạc.
- `assets/` — vị trí dành cho ảnh, âm thanh và biểu tượng về sau.
