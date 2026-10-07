# Gắn tên miền vào website IELTS đang chạy

Website hiện tại chạy riêng tại `https://66.42.62.123:8088`. Địa chỉ yêu cầu là
`https://sutunghanyu.vn`, dùng HTTPS mặc định trên cổng 443. Việc thêm DNS phải
đi cùng cấu hình gateway, chứng chỉ hợp lệ và `APP_ORIGIN` của ứng dụng.

## Kiểm tra trước khi thay đổi

Chạy `domain-preflight.sh` bằng tài khoản `root` trên VPS, truyền đúng tên miền
và thư mục ứng dụng đã cài. Script có thể tải riêng từ một commit đã xác minh;
không cần cập nhật hoặc cài lại thư mục ứng dụng đang chạy.

```bash
bash /path/to/domain-preflight.sh sutunghanyu.vn /opt/websiteIeltsAi-20261007T172235Z-7D7gnc
```

Script chỉ kiểm tra:

- DNS A/AAAA/NS/CAA qua resolver hiện có nếu có `dig`; nếu không có, dùng
  `getent` để xem địa chỉ resolve và thông báo phần chưa kiểm tra.
- Socket TCP 80/443/8088, tên tiến trình và container sở hữu cổng.
- Compose project IELTS, trạng thái service và riêng giá trị `APP_ORIGIN` đang
  chạy. Không in API key, `app.env` hay các biến môi trường khác.
- Metadata của chứng chỉ công khai hiện tại, gồm ngày hết hạn, SAN và SHA256.
- Cấu hình Nginx trên host nếu có: phiên bản, kết quả kiểm tra và chỉ các giá trị
  được phép của `server_name`, `listen`, đường dẫn chứng chỉ công khai và file
  cấu hình. Toàn bộ nội dung cấu hình được giữ trong bộ nhớ, không in ra.

Script không đổi DNS hay cấu hình, không cài phần mềm, build, reload hoặc restart
service. Lệnh kiểm tra chuẩn `nginx -t`/`-T` có thể mở file PID/log hoặc tạo thư mục
tạm theo cấu hình Nginx hiện có. Nếu Nginx chạy trong container, script chỉ nhận diện container/cổng; chưa đọc
cấu hình bên trong container. Một cấu hình Nginx dùng regex, biến hoặc include
fragment có thể cần kiểm tra thêm trước khi xác định chủ sở hữu tên miền.

Gửi kết quả kiểm tra và tên nhà cung cấp DNS cho người triển khai. Không thay đổi
gateway trước khi xác định project nào đang dùng 80/443 và tên miền hiện tại.

## DNS cần chuẩn bị

Sau khi xác nhận `sutunghanyu.vn` sẽ phục vụ website IELTS, bản ghi apex cần là:

| Loại | Tên | Giá trị |
| --- | --- | --- |
| A | `@` | `66.42.62.123` |

Không tự thêm bản ghi `www` khi chưa chọn dùng địa chỉ đó. Kiểm tra bản ghi AAAA
hiện có: nếu đang trỏ sang máy khác, khách dùng IPv6 có thể vào sai website. Nếu
có CAA, phải xác nhận nó cho phép nhà cấp chứng chỉ được chọn. Giữ các bản ghi
MX/TXT và tên miền phụ của dịch vụ khác.

Nơi mua tên miền và nơi quản lý DNS có thể khác nhau; cần xác nhận trang DNS thực
tế từ NS hiện có hoặc nhà cung cấp. Không giả định DNS thuộc Vultr chỉ vì VPS
thuê tại Vultr. Nếu thay một bản ghi đang có, cần ghi lại giá trị trước đó để có
thể khôi phục.

Với `sutunghanyu.vn`, trang quản lý DNS người dùng đã cung cấp là **Mắt Bão**.
Bản ghi `NS` phải trỏ đến tên máy chủ DNS, không dùng IP website. Nếu đã thêm nhầm
`NS @ → 66.42.62.123.`, chỉ xóa bản ghi NS sai đó; giữ bản ghi `A @ → 66.42.62.123`
và các NS hợp lệ của nhà cung cấp.

## Chọn cách đưa tên miền lên HTTPS

Kết quả kiểm tra quyết định cách làm:

- Nếu có Nginx/gateway đang dùng 80/443, thêm cấu hình riêng cho tên miền vào
  gateway đó, xác minh cấu hình trước khi reload và giữ các virtual host khác.
- Nếu 80/443 chưa có chủ sở hữu, có thể chuẩn bị gateway riêng sau khi kiểm tra
  mạng, firewall và tài nguyên. Không dừng ứng dụng khác để lấy cổng.
- Nếu tên miền đã thuộc một virtual host hiện có, phải xác định website đang
  phục vụ tên miền đó và phạm vi chuyển đổi trước khi thay cấu hình.

Không chạy lại `bootstrap.sh` để gắn tên miền: script đó tạo một lần cài mới và
không di chuyển tài khoản/dữ liệu của lần cài hiện tại. Cần giữ Compose project
và MongoDB volume đang dùng, rồi chỉnh `APP_ORIGIN` thành `https://sutunghanyu.vn`
theo cấu hình triển khai đã kiểm tra. Chứng chỉ tự ký hiện tại chưa phải chứng chỉ
hợp lệ cho tên miền mới; chỉ công bố hoàn tất sau khi DNS, HTTPS, giao diện và
luồng đăng nhập đã được kiểm tra thực tế.
