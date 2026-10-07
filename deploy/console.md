# Cài website khi chưa kết nối được SSH

Gói này chưa xác nhận VPS đã triển khai thành công. Chỉ chạy lệnh bên dưới **trong Console của đúng VPS `66.42.62.123`**, không dán vào một server khác.

1. Mở trang quản trị nơi bạn mua VPS, chọn máy `66.42.62.123`, rồi mở **Console**, **Web Console** hoặc **VNC**.
2. Đăng nhập tài khoản `root` bằng mật khẩu VPS. Khi nhập mật khẩu, màn hình có thể không hiện ký tự; đây là bình thường. Không gửi mật khẩu vào chat hoặc chụp ảnh có mật khẩu.
3. Dán lệnh cài đặt được cung cấp trong cuộc trò chuyện, rồi nhấn Enter. Lệnh tải script từ đúng commit đã công bố và kiểm tra SHA256 trước khi chạy; không dùng đường dẫn `main` thay cho commit này.
4. Đợi đến dòng **HOÀN TẤT kiểm tra trên server**. Mở địa chỉ `Website: https://66.42.62.123:CỔNG` mà script in ra. Gửi lại các dòng kết quả cuối nếu có lỗi; không gửi nội dung file `.env`.

Script tạo thư mục `/opt/websiteIeltsAi-THỜI_GIAN-MÃ_RIÊNG`, tự chọn cổng trống từ 8088 đến 8188 và dựng ba container riêng. Nó xác minh checksum mã nguồn, kiểm tra tài nguyên/CPU, giới hạn tài nguyên build/runtime, so sánh container/cổng cũ trước và sau, rồi kiểm tra HTTPS, MongoDB, dữ liệu và JavaScript. Nếu lỗi sau khi khởi chạy, nó chỉ dừng container của website vừa tạo, giữ dữ liệu và log để kiểm tra. Chạy lại tạo một project mới; không dùng lệnh này để cập nhật project đã chạy.

Nếu Docker/Compose chưa có hoặc server có dưới 2 GiB RAM khả dụng/8 GiB dung lượng trống, script dừng, không tự cài/nâng cấp phần mềm hệ thống. Nó không sửa nginx, PM2 hoặc project cũ. Sau khi website healthy, nếu UFW đang hoạt động thì chỉ thêm rule cho đúng cổng TCP vừa chọn, ghi chú tên project riêng; không tắt/reset firewall hoặc sửa rule khác. Firewall của nhà cung cấp và loại firewall khác giữ nguyên. Truy cập Internet có thể cần mở đúng cổng website trong trang quản trị nhà cung cấp; gửi thông báo lỗi để được hướng dẫn theo hiện trạng thay vì tắt firewall.

Chưa có domain nên website dùng chứng chỉ HTTPS tự ký cho đúng IP. Trình duyệt sẽ cảnh báo; kiểm tra địa chỉ VPS trước khi chấp nhận ngoại lệ. Một số trình duyệt vẫn có thể hạn chế ghi âm khi chứng chỉ chưa được tin cậy. Đăng ký tài khoản trên giao diện (tối đa hai tài khoản); các API key AI để trống và chỉ thêm sau vào `.local/deploy/app.env` nếu cần chấm AI trực tiếp.
