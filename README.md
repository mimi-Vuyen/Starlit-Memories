# Starlit Memories

Website quà sinh nhật tương tác riêng tư. Phase 01 triển khai **Scene 01 — The Invitation**, Phase 02 triển khai **Untie the Ribbon**, và Phase 03 có chòm sao Scorpius cùng trải nghiệm Polaroid cho một ký ức mẫu.

## Chạy bằng VS Code Live Server

1. Mở thư mục `Starlit-Memories` trong VS Code.
2. Cài extension **Live Server** nếu máy chưa có.
3. Mở `index.html`, chọn **Go Live** ở thanh trạng thái hoặc nhấp phải và chọn **Open with Live Server**.
4. Mở trang trên điện thoại cùng mạng nội bộ nếu muốn kiểm tra bố cục di động.
5. Để xem trực tiếp Scene 03 trong lúc phát triển, mở `index.html?scene=constellation` qua Live Server.

Không cần cài dependency, backend hoặc build step.

## Cấu trúc

- `index.html` — cấu trúc semantic của ba cảnh.
- `css/style.css` — giao diện đáp ứng, hiệu ứng chuyển động và chế độ giảm chuyển động.
- `js/app.js` — tương tác Scene 01.
- `js/scenes.js` — chuyển cảnh từ lời mời sang hộp quà.
- `js/gift.js` — state machine và thao tác kéo/mở hộp quà Scene 02.
- `js/constellation-data.js` — tọa độ sao Hipparcos và các đoạn nối Scorpius theo stick figure phương Tây của Stellarium/Skyfield.
- `js/constellation.js` — dựng SVG, focus/keyboard và điểm sự kiện cho chín sao ký ức.
- `js/memory-experience.js` — hiển thị và đóng Polaroid mẫu; các sao còn lại chưa có nội dung ký ức.
- `js/stars.js` — nền sao Canvas 2D.
- `js/memories.js` — chín mục dữ liệu ký ức mẫu chưa có nội dung cá nhân.
- `js/audio.js` — các hàm quản lý âm thanh, không tự phát nhạc.
- `assets/images/memory-sample.svg` — minh họa dọc cục bộ dùng cho Polaroid mẫu.
- `assets/` — vị trí dành cho ảnh, âm thanh và biểu tượng về sau.

Phase 02 hỗ trợ kéo ruy băng bằng chuột/cảm ứng và có nút mở thay thế. Nút cuối chuyển sang Scene 03. Tọa độ trong bản đồ là RA/Dec J2000 từ danh mục Hipparcos; đường nối theo `constellationship.fab` của [Skyfield](https://github.com/skyfielders/python-skyfield/blob/master/ci/constellationship.fab), sử dụng các đường chòm sao phương Tây của Stellarium. Chín sao chính phát sự kiện `starlit:memory-star-select`; hiện chỉ sao đầu tiên có một ký ức mẫu. Tám ký ức còn lại, Constellation Awakening, lời chúc cuối, Phase 04 và nhạc mới chưa triển khai. Không tự động phát nhạc.
