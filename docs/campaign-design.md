# Giao diện chiến dịch Hỏa + Mộc

Toàn bộ không gian học dùng xanh rừng, đỏ đất, vàng hổ phách và nền giấy ấm. Bản đồ chiến dịch, quân cờ, cổng thử thách, rương thưởng và thành trì là các minh họa hoạt hình gốc. Trang đăng nhập, tổng quan, thư viện, thi thử, lộ trình, từ vựng, lịch sử, sổ lỗi và cài đặt dùng chung ngôn ngữ thiết kế. Màn hình làm bài vẫn giữ bố cục đọc và nhập câu trả lời rõ ràng.

## Tiến độ và huy hiệu

Bản đồ Duo lấy trạng thái trực tiếp từ snapshot của server. Quân cờ thể hiện buổi chưa mở, buổi đã mở, một người hoàn thành hoặc cả hai hoàn thành. Chọn quân cờ đưa tới thẻ buổi học tương ứng; thao tác này không mở khóa hoặc tự ghi nhận hoàn thành. Buổi tiếp theo của người đang đăng nhập được đánh dấu bằng màu Hỏa.

Các huy hiệu là dấu mốc hiển thị từ dữ liệu đã có, không tạo hệ thống tiền thưởng mới:

- **Bước đầu đồng hành:** cả hai hoàn thành ít nhất một buổi.
- **Vượt cổng kiến thức:** cả hai đạt ít nhất một Duo Gate.
- **Chinh phục chặng mới:** hoàn thành ít nhất một band chung.
- **Đỉnh band 8.0:** hoàn thành band mục tiêu chung.

Học riêng vẫn được phép trong thư viện và thi thử. Chỉ kỳ thi nâng band yêu cầu cả hai cùng vào phòng và sẵn sàng. Giao diện không thay đổi các quy tắc này hay dữ liệu học liệu, đáp án, tiến độ, tài khoản hoặc bản ghi âm.

## Font và tài nguyên

Be Vietnam Pro được phục vụ từ `/fonts/`, gồm Latin, Latin mở rộng và tiếng Việt cho các trọng lượng 400, 500, 600, 700, 800; có italic 400 cho nội dung cần chữ nghiêng. Các tiêu đề bỏ khoảng cách chữ âm, dùng chiều cao dòng đủ rộng cho dấu tiếng Việt. Font không cần kết nối Google Fonts khi sử dụng website.

Font lấy từ gói `@fontsource/be-vietnam-pro@5.3.0`; giấy phép SIL Open Font License nằm ở `public/fonts/OFL-BeVietnamPro.txt`. Minh họa chiến dịch được tạo riêng cho dự án và lưu tại `public/assets/campaign-world.webp`; biểu tượng và các vật phẩm SVG nằm trong frontend.

Các kiểm tra trình duyệt dùng tài khoản tổng hợp và MongoDB test riêng để kiểm tra font, tài nguyên, bố cục desktop/mobile và mở huy hiệu theo kết quả thật. Ảnh xem trước chỉ chứa tài khoản tổng hợp.
