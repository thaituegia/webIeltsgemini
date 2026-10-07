# Gắn tên miền vào website IELTS đang chạy

Website hiện tại chạy riêng tại `https://66.42.62.123:8088`. Địa chỉ yêu cầu là
`https://sutonghanyu.vn`, dùng HTTPS mặc định trên cổng 443. Việc thêm DNS phải
đi cùng cấu hình gateway, chứng chỉ hợp lệ và `APP_ORIGIN` của ứng dụng.

## Kiểm tra trước khi thay đổi

Chạy `domain-preflight.sh` bằng tài khoản `root` trên VPS, truyền đúng tên miền
và thư mục ứng dụng đã cài. Script có thể tải riêng từ một commit đã xác minh;
không cần cập nhật hoặc cài lại thư mục ứng dụng đang chạy.

```bash
bash /path/to/domain-preflight.sh sutonghanyu.vn /opt/websiteIeltsAi-20261007T172235Z-7D7gnc
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

Sau khi xác nhận `sutonghanyu.vn` sẽ phục vụ website IELTS, bản ghi apex cần là:

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

Với `sutonghanyu.vn`, trang quản lý DNS người dùng đã cung cấp là **Mắt Bão**.
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
và MongoDB volume đang dùng, rồi chỉnh `APP_ORIGIN` thành `https://sutonghanyu.vn`
theo cấu hình triển khai đã kiểm tra. Chứng chỉ tự ký hiện tại chưa phải chứng chỉ
hợp lệ cho tên miền mới; chỉ công bố hoàn tất sau khi DNS, HTTPS, giao diện và
luồng đăng nhập đã được kiểm tra thực tế.


## Cấu hình HTTPS trên gateway đã kiểm tra

VPS hiện có Nginx trên host phục vụ các project khác ở cổng 80/443. Script
`domain-setup.sh` chỉ dành cho trường hợp này, chạy bằng root với đúng lần cài
đang hoạt động:

```bash
bash /path/to/domain-setup.sh sutonghanyu.vn /opt/websiteIeltsAi-20261007T172235Z-7D7gnc
```

Tải script từ một commit cụ thể qua HTTPS và xác minh SHA256 trước khi chạy.
Một file chứa cả wrapper Compose và helper gia hạn, không cần cập nhật source
hoặc build lại website đang chạy.

Script kiểm tra DNS A/AAAA, Nginx đang sở hữu cổng 80/443, tên miền chưa thuộc
virtual host khác, Docker/Compose và website IP hiện tại trước khi tạo cấu hình.
Nó ghi lại ID/trạng thái/thời gian khởi động container, socket, PID master Nginx
và hash/quyền/đường dẫn của các file Nginx cũ để đối chiếu sau thay đổi.

Một virtual host mới chỉ nhận đúng `sutonghanyu.vn`. HTTP-01 dùng webroot riêng,
755 để worker Nginx đọc được; tài khoản CA, khóa và log được giữ trong thư mục
private 700/600. Certbot chính thức được pin theo digest, chạy trong container
riêng giới hạn 256 MiB/0,25 CPU, thử ACME staging trước khi cấp chứng chỉ thật.
Không dùng plugin Nginx hoặc thay đổi `/etc/letsencrypt`/hook/cron của site khác.

HTTPS 443 đi từ Nginx host đến một cổng HTTP **chỉ bind 127.0.0.1** của app.
Cổng nội bộ được chọn trong 19088–19188 sau khi kiểm tra socket và Docker.
Override riêng `.local/deploy/domain.compose.yaml` lưu cổng cùng
`APP_ORIGIN=https://sutonghanyu.vn`; wrapper Compose luôn nạp override đó.
Chỉ app được tạo lại bằng `--no-deps --no-build --wait`; MongoDB, volume,
tài khoản, bản ghi âm và proxy 8088 giữ nguyên. Nếu proxy riêng đang cache IP
app cũ, script kiểm tra cấu hình rồi reload riêng process của proxy đó.
Chứng chỉ tự ký của URL IP 8088 không nằm trong luồng truy cập tên miền.

Các file Nginx mới được ghi ở ngoài glob include rồi chuyển vào bằng rename.
Mỗi lần reload gateway đều kiểm tra cấu hình và hiện trạng cũ; không restart
Nginx/Docker hoặc đổi default server. Kiểm tra cuối dùng CA hệ thống, đúng SNI,
so sánh chứng chỉ Nginx thực sự phục vụ, health MongoDB/data bank, JavaScript,
redirect HTTP và Origin đăng ký bằng body không hợp lệ, không tạo tài khoản thử.

Helper `domain-renew.sh` có khóa chung với setup, kiểm tra riêng lineage và CA,
chỉ reload Nginx khi chứng chỉ đã thay đổi. Khóa/chứng chỉ phục vụ được chuyển
bằng symlink atomic; nếu reload/health/chứng chỉ thực tế không đúng, helper
khôi phục phiên bản chứng chỉ cũ. Cron riêng kiểm tra hai lần mỗi ngày, filename
không có dấu chấm để cron.d nhận diện; các lịch/hook gia hạn khác giữ nguyên.

Các kiểm tra Bash/Python/awk, CLI Certbot và Compose merge có thể chạy trong
cloud; chúng không thay thế ACME/DNS/HTTPS thực tế trên VPS. Chỉ xác nhận gắn
tên miền sau khi output VPS hoàn tất và website được kiểm tra từ Internet.
Sau chuyển đổi, đăng nhập lại ở tên miền mới vì cookie cũ thuộc địa chỉ IP.

## Nếu lần cấu hình thất bại

Script cố khôi phục riêng virtual host/cron/override/wrapper và app Origin cũ,
không xóa volume MongoDB. Log/chứng chỉ riêng được giữ lại; script không ghi đè
một lần cấu hình hoặc thư mục ACME đã có khi chạy lại.

- `result=failed-safe`: bước khôi phục và hiện trạng cũ đã được xác minh. Đọc log
  trong thư mục `audit` được in ra, sửa nguyên nhân rồi lưu trữ riêng trạng thái
  và webroot của lần thử thất bại trước khi chạy lại.
- `result=failed-incomplete`: còn bước khôi phục chưa được xác minh. Kiểm tra
  log app/Nginx/proxy riêng và trạng thái thật trước; không chạy lại, xóa trạng
  thái hay restart các project khác.

Việc lưu trữ lần thử chỉ áp dụng khi file `owner` đúng tên miền, đường dẫn app
và Compose project; không còn virtual host/cron/override mới; Origin IP cũ và
health 8088 đã được khôi phục. Giữ toàn bộ ACME account/certificates/logs trong
bản lưu trữ private, không dùng `rm -rf` hoặc `docker compose down -v`.
