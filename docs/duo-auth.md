# Đăng nhập riêng cho hai người học

Chế độ Duo dùng số điện thoại và mật khẩu; chỉ hai danh tính đã cấu hình được đăng nhập. Chế độ này không cho đăng ký, đăng nhập email hoặc tài khoản demo. Cả hai vẫn mở bài luyện và đề mô phỏng riêng; điều kiện cùng tham gia chỉ áp dụng cho bài đánh giá nâng band.

## Cấu hình riêng

Thông tin thật không nằm trong Git, client hoặc bundle giao diện. `DUO_CREDENTIALS_FILE` trỏ đến tệp JSON tuyệt đối, là tệp thường, quyền `0600`, không qua symlink. Có thể dùng `DUO_ACCOUNTS_JSON` từ kho secrets thay cho tệp; không cấu hình đồng thời cả hai.

Tệp phải có `duoId` và đúng hai phần tử `accounts`, mỗi phần tử gồm `role` (`husband` hoặc `wife`), `name`, `phone`, `passwordHash`. Hai vai trò và hai số điện thoại phải khác nhau. `passwordHash` là kết quả `hashPassword` trong `server/auth.ts`: `scrypt:<salt 16 byte hex>:<hash 64 byte hex>`. Tệp không chứa mật khẩu nguyên văn. Thông báo cấu hình sai không in nội dung tệp hoặc thông tin cá nhân.

Ứng dụng xác minh cấu hình trước khi khởi động. Có thể chạy `npx tsx scripts/provision-duo.ts` để tạo hai tài khoản từ cấu hình đã chuẩn bị. Script chỉ in số tài khoản, không in tên, số điện thoại hoặc hash.

## Giữ dữ liệu và danh tính

Nếu database đã có một người dùng với đúng số điện thoại, provisioning tái sử dụng ID người đó sau khi kiểm tra vai trò và nhóm không xung đột. Nếu chưa có, ID cố định là `<duoId>-husband` hoặc `<duoId>-wife`; email nội bộ chỉ phục vụ index cũ. Script không lấy tài khoản của người khác dựa trên tên, email, vị trí đăng ký hoặc thứ tự dữ liệu.

Provisioning cập nhật thông tin đăng nhập cố định, tên đã cấu hình và mục tiêu 8.0; giữ điểm đã đánh giá, thời gian học cá nhân, ngày tạo, email, ID và các bản ghi học. Các tài khoản cũ khác, bài tập, đề thi, placement, attempts, thẻ từ, kế hoạch và file ghi âm đều được giữ nguyên. Việc giữ bản ghi không cấp quyền đăng nhập cho tài khoản thứ ba.

Nếu phát hiện số điện thoại bị lặp hoặc danh tính xung đột, script dừng. Hai danh tính được kiểm tra trước khi cập nhật người thứ nhất. Chạy lại không tạo thêm tài khoản và không đặt lại tiến độ.

## Phiên đăng nhập

Phiên mới gắn với hash của nhóm, vai trò, số điện thoại và phiên bản mật khẩu. Middleware xác minh cả danh tính cố định lẫn phiên bản này. Phiên legacy không có binding, phiên người thứ ba và phiên mật khẩu cũ bị từ chối; bản ghi của các phiên đó vẫn được giữ lại. Cookie tiếp tục dùng `HttpOnly`, `SameSite=Lax`, `Secure` khi production.

Các test dùng tên, số điện thoại, mật khẩu và database ngẫu nhiên riêng cho kiểm thử. Test Mongo đối chiếu dữ liệu học trước/sau provisioning, kiểm tra tái sử dụng đúng người, tính idempotent, từ chối người thứ ba và phiên legacy, và thay đổi mật khẩu làm mất hiệu lực phiên cũ. Test không kết nối hay thay đổi VPS.
