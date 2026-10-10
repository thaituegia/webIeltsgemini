> Updater dưới đây là quy trình lịch sử giữ dữ liệu của bộ cũ. Với yêu cầu clear toàn bộ và bộ fresh-20261011, dùng [bank-reset.md](bank-reset.md) và deploy/reset-bank.sh.

# Cập nhật VPS sang Duo và mục tiêu 8.0

`deploy/update-duo.sh` dành cho triển khai IELTS hiện có tại `/opt/websiteIeltsAi-20261007T172235Z-7D7gnc`, HTTPS `sutonghanyu.vn`, app nội bộ `127.0.0.1:19088`, endpoint IP HTTPS `8088`. Script từ chối nếu đường dẫn, quyền sở hữu root, Compose project, labels, origin hoặc cổng không khớp.

## Đầu vào riêng

```bash
bash deploy/update-duo.sh LIVE_DIR SOURCE_COMMIT ARCHIVE_SHA256 < PRIVATE_HASHED_CREDENTIALS_JSON
```

Ba đối số lần lượt là thư mục live, commit nguồn đầy đủ 40 ký tự và SHA256 của archive nguồn. Cấu hình hai tài khoản được chuyển riêng qua stdin, giới hạn 16 KiB, cùng định dạng trong `docs/duo-auth.md`: nhóm và đúng hai vai trò, tên, số điện thoại, hash scrypt; không chứa mật khẩu nguyên văn. Không đặt JSON này vào Git, đối số dòng lệnh hoặc build context. Script ghi tệp JSON và `duo.env` quyền `0600` trong thư mục audit/release riêng quyền `0700`; biến JSON trong env file được trích dẫn để không nội suy ký tự `$` trong tên.

Lệnh được chuẩn bị cho người vận hành phải pin cả commit, checksum archive và checksum updater được tải. `--check` chạy preflight mà không tải, build, dừng app hoặc ghi dữ liệu.

## Phạm vi thay đổi

Script kiểm tra bộ nguồn tải từ GitHub theo SHA256 trước khi giải nén; từ chối symlink, hardlink, đường dẫn vượt ra ngoài thư mục nguồn và archive quá giới hạn. Build dùng tối đa 1024 MiB RAM, không swap và 0,5 CPU khi app cũ vẫn chạy. Thiếu tài nguyên hoặc build lỗi thì dừng trước khi chuyển app.

Release override mới chỉ đổi image/build context của app và nối thêm env file Duo. `app.env` cũ, cấu hình base/domain, MongoDB, proxy, volume, host Nginx, firewall và chứng chỉ không bị thay thế. Kiểm tra Compose thực đối chiếu toàn bộ cấu hình sau khi loại trừ đúng các thay đổi được phép. Chỉ service app được dừng và tạo lại với `--no-deps --no-build`.

Nếu endpoint IP `8088` cần cập nhật địa chỉ upstream sau khi app được tạo lại, script kiểm tra và reload riêng Nginx trong container proxy IELTS. Container proxy không bị dừng hoặc tạo lại; host Nginx không reload.

## Đối chiếu dữ liệu

Sau khi dừng app cũ và trước khi khởi động app mới, script lưu toàn bộ học liệu công khai cũ, bản ghi users và hash BSON của mọi collection riêng, gồm sessions, attempts, cards, placements, plans, audio, `recordings.files`, `recordings.chunks` và tiến độ Duo nếu đã tồn tại. Hash ghi âm được tính qua cursor để không tải mọi chunk lên RAM cùng lúc.

Manifest nguồn yêu cầu **628 bản ghi content: 544 bài luyện và 84 đề mô phỏng; 744 mục từ; 640 câu placement**. Seed chỉ thêm ID chưa tồn tại. Kiểm tra MongoDB xác nhận mọi ID seed có mặt, các ID mới khớp nguồn và từng tài liệu cũ khớp bản trước cập nhật. Các học liệu đã được chỉnh sửa trên server và học liệu ngoài seed đều được giữ lại. Mọi collection tiến độ và ghi âm cũ phải có cùng số lượng và hash trước/sau.

Với users, chỉ hai danh tính cấu hình được thay đổi phần đăng nhập, tên cố định và mục tiêu 8.0. Nếu đã có đúng số điện thoại, ID, email, điểm đã đánh giá và cấu hình cá nhân của người đó phải giữ nguyên. Tài khoản legacy khác phải giống hoàn toàn; hai tài khoản mới dùng ID nhóm–vai trò cố định và không được lấn vào ID cũ. Kiểm tra không thử đăng nhập bằng hash; nó đối chiếu binding database và xác nhận endpoint đăng nhập bằng số điện thoại hoạt động, người ngoài danh sách/đăng ký/demo đều bị từ chối. Mật khẩu thật cần kiểm tra riêng bằng giao diện.

Payload Mongo lớn đi qua tệp tạm riêng trong container Mongo, kiểm tra độ dài/SHA256 và xóa sau khi đọc. Đây là cùng helper đã sửa lỗi `EAGAIN`, không đọc trực tiếp pipe không blocking.

## Xử lý lỗi

Nếu app mới chưa được khởi động, script chỉ khôi phục app/config cũ sau khi kiểm tra image cũ vẫn đúng digest. Nếu app mới đã bắt đầu chạy, script **không rollback database, xóa học liệu hoặc xóa/khôi phục users**. Bản mới và mọi dữ liệu được giữ để xử lý bằng audit riêng. Các tệp audit có dữ liệu cá nhân; chỉ gửi các log lỗi cụ thể, không công khai cả thư mục hoặc tệp credentials.

Thành công yêu cầu HTTPS tin cậy, MongoDB/phone auth, file JavaScript, dữ liệu và baseline các container khác, listener cũ, file cấu hình, PID host Nginx đều đạt. Bộ kiểm tra tài nguyên cũng đọc CSS đã build và WebP/SVG/WOFF2 từ `/app/dist` của app mới, đối chiếu ảnh/font với nguồn đã ghim rồi tải qua gateway HTTPS để xác minh MIME, dung lượng và SHA256. Phản hồi HTML200 thay cho ảnh/font, CSS cũ hoặc file khác nguồn đều bị từ chối. Giới hạn 128 tài nguyên, 16 MiB mỗi file và 32 MiB tổng. Việc chạy script trên server không tự chứng minh truy cập Internet từ thiết bị ngoài.

Kiểm thử gồm Bash/Python syntax, private input/env quoting bằng Compose thật, scope Compose, trường hợp dữ liệu thay đổi và chạy verifier với cả ngân hàng trên MongoDB test riêng. Kiểm thử không triển khai trên VPS hoặc thay đổi project đang phục vụ người dùng.
