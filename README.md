# Starlit Memories

Website quà sinh nhật tương tác riêng tư. Phase 01 triển khai **Scene 01 — The Invitation**, Phase 02 triển khai **Untie the Ribbon**, và Phase 03 có chòm sao Scorpius, Polaroid Star 01–08 cùng trải nghiệm Final Wish tại Star 09.

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
- `js/memory-experience.js` — hiển thị Polaroid, tiến trình khám phá và animation dùng chung cho Star 01–08.
- `js/final-wish.js` — mở khóa, timeline Final Wish, replay và quay về chòm sao từ Star 09.
- `js/stars.js` — nền sao Canvas 2D.
- `js/memories.js` — nguồn dữ liệu duy nhất cho nội dung ký ức Star 01–08; Star 09 dành cho lời chúc cuối.
- `js/audio.js` — các hàm quản lý âm thanh, không tự phát nhạc.
- `assets/images/memory-sample.svg` — ảnh placeholder cục bộ dùng cho Star 02–08 và ảnh dự phòng khi ảnh riêng không tải được.
- `assets/` — vị trí dành cho ảnh, âm thanh và biểu tượng về sau.

Phase 02 hỗ trợ kéo ruy băng bằng chuột/cảm ứng và có nút mở thay thế. Nút cuối chuyển sang Scene 03. Tọa độ trong bản đồ là RA/Dec J2000 từ danh mục Hipparcos; đường nối theo `constellationship.fab` của [Skyfield](https://github.com/skyfielders/python-skyfield/blob/master/ci/constellationship.fab), sử dụng các đường chòm sao phương Tây của Stellarium. Star 09 chỉ mở khi tám ký ức riêng biệt đã được khám phá; người dùng phải chọn sao này để bắt đầu Final Wish. Không tự động phát nhạc.

## Chỉnh nội dung ký ức

Sửa đối tượng có ID tương ứng trong `js/memories.js`: `image` là đường dẫn tương đối từ thư mục dự án, còn `caption`, `title`, `message` và `alt` điều khiển chú thích, tiêu đề, lời nhắn và mô tả ảnh. Có thể dùng ảnh JPG, PNG, WebP hoặc SVG hợp lệ; giữ ảnh gốc và tỷ lệ hiển thị dùng `object-fit: contain`. Thay ảnh placeholder bằng đường dẫn ảnh mới, hoặc đặt ảnh mới vào `assets/images/` rồi cập nhật trường `image`. Nếu ảnh riêng không tải được, giao diện chuyển sang `assets/images/memory-sample.svg`.

## Chỉnh lời chúc cuối

Sửa duy nhất object `window.StarlitMemories.finalWish` trong `js/memories.js` để thay `title`, `message`, `signature` hoặc `subtitle`. Danh sách `wishes` độc lập với số lượng ngôi sao; mỗi mục gồm `id` duy nhất, `message`, `image` tùy chọn và `duration` tùy chọn tính bằng milliseconds (10.000–16.000). Bỏ `image` để tự dùng ảnh ký ức tương ứng; ảnh không tải được sẽ chuyển sang ảnh cục bộ dự phòng. Mục thiếu ID hoặc nội dung sẽ được bỏ qua; thời lượng không hợp lệ dùng 12 giây. Chế độ giảm chuyển động hiển thị danh sách lời chúc tĩnh thay cho hiệu ứng trôi. Không cần sửa engine animation hoặc logic mở khóa khi thay nội dung.
