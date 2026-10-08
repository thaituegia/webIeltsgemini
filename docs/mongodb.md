# MongoDB và dữ liệu Duo

Dự án dùng MongoDB 8 thật và MongoDB Node.js driver. Local helper dùng image `mongo:8.0` chính thức ghim digest trong `compose.yaml`; startup kiểm tra health và `adminCommand({ping:1})` trước khi gọi database sẵn sàng.

```sh
node scripts/mongo.mjs start
node scripts/mongo.mjs status
node scripts/mongo.mjs stop
```

URI local mặc định là `mongodb://127.0.0.1:27017/ielts_ai`. Cổng chỉ bind loopback. Dữ liệu lưu trong `.local/mongo` đã được Git ignore; stop/restart hoặc tạo lại container không xóa dữ liệu. Không xóa thư mục này để sửa lỗi khởi động. Production dùng MongoDB/Atlas có xác thực, TLS, quyền scoped và backup; URI thực giữ trong secrets, không commit/in ra log.

## Ngân hàng công khai và seed

Các collection `content`, `vocabulary`, `placementItems` dùng chung. API trả content được sanitize, không gửi đáp án trước chấm. Bộ seed sau bổ sung tới band 8.0 có **544 bài luyện + 84 mocks = 628 content**, **744 vocabulary**, **640 placement items**; baseline v3 là **480/72/648/576** và giữ toàn bộ ID cũ.

`seedDatabase` xác thực toàn bộ cấu trúc trước khi ghi, sau đó upsert bằng **`$setOnInsert`**. Chạy seed lại chỉ thêm ID thiếu; không ghi đè dữ liệu đã có, kể cả ID nằm trong seed nhưng đã được chỉnh. ID riêng ngoài seed được giữ. Vì vậy số đếm và nội dung đang lưu có thể khác manifest nguồn; health báo số MongoDB thực. Updater đối chiếu bản ghi trước đó nguyên vẹn và chỉ đòi nội dung đúng manifest với ID mới chèn. Seed không sửa accounts, sessions, attempts, placements, cards, plans hoặc recordings.

Đáp án/cấu trúc/độ dài và metadata qua audit không chứng minh chuyên gia đã duyệt. Nội dung AI giữ trạng thái unreviewed và difficulty/band ước lượng, chưa hiệu chuẩn tâm trắc.

## Danh tính và dữ liệu riêng

`users` giữ hồ sơ, tên/phone/role/duoId và hash scrypt; `sessions` giữ hash session, expiry và phiên bản credential Duo. Chỉ hai account cấu hình riêng được login. Provisioning tái sử dụng đúng ID nếu phone khớp một danh tính hợp lệ; nếu chưa có thì tạo ID cố định theo nhóm/vai trò. Không nhận người theo tên, email, thứ tự hoặc registration slot. Tên, binding và target 8.0 được cập nhật theo cấu hình, còn điểm cá nhân/ID/thời lượng/ngày tạo và dữ liệu học giữ nguyên. Bản ghi tài khoản legacy khác được giữ nhưng không được cấp quyền đăng nhập.

`attempts`, `cards`, `placements`, `plans`, `audio` và GridFS `recordings.files/chunks` truy vấn theo owner lấy từ session. Bài viết, transcript và recording không phải tài nguyên static public; tải audio cần kiểm tra owner ở cả metadata và GridFS. Profile trả cho client không chứa password hash. Credential JSON private có quyền `0600`, không nằm trong build context hoặc Git.

## Collections Duo

| Collection | Dữ liệu và kiểm soát |
| --- | --- |
| `duo_learning_paths` | Một document/duo: member IDs, starting/current/target band, cấu hình Gate, các band/lesson progress/gate results/promotion results, revision và dấu mốc nâng band. |
| `duo_placement_results` | Kết quả placement riêng, link tới attempt đã hoàn tất của đúng người. Hai kết quả tạo path theo MIN; placement mới không reset path đang học. |
| `duo_assessments` | Mọi lượt Gate/promotion: owner, protected content parts, attempt links, schedule/deadline, score/result state và kết quả chờ AI. |
| `duo_promotion_rooms` | Phiên thi chung: band, hai thành viên, join/presence/Ready/Companion, countdown và deadline server, trạng thái/revision. |

Progress và promotion receipts được nhúng trong path hoặc gắn assessment; không bắt buộc tạo một collection cho mỗi tên trong đặc tả nếu logic/quyền/persistence tương đương. Shared current band khác personal estimates. Gate mặc định 5 buổi, tùy cấu hình 10; số buổi có thể khác theo band. Thi thường và bài luyện thường không bị khóa theo path.

Backend kiểm tra bằng chứng hoàn thành, hai pass Gate và hai kết quả nâng band hợp lệ. Một người đạt được bảo lưu; Companion chỉ dùng khi có kết quả đạt và non-strict mode. Path thay đổi bằng **compare-and-swap với revision** của một document, nên việc hai người cùng nâng band không phụ thuộc multi-document transactions hoặc replica set. Indexes bảo vệ uniqueness của active assessments/rooms; stale receipts không tự mở khóa band.

Writing/Speaking thiếu chấm AI/bằng chứng âm học hợp lệ tiếp tục `pending-ai`; nội dung thật được lưu để regrade, không chèn score giả. Hết phiên/mất mạng không xóa bài; reload giữ deadline. Lịch sử assessments không bị cắt vì chỉ UI snapshot lấy phần gần đây: API `/api/duo/history` phân trang toàn bộ theo owner.

## Kiểm tra và cập nhật an toàn

Unit/API/browser tests dùng namespace UUID riêng và kiểm tra namespace trước `dropDatabase`; không dùng learner DB hay VPS cho test. Browser Duo dùng synthetic credentials, hai cookie jars và server/MongoDB test riêng. Tests/transport giả lập điểm AI là kiểm tra logic, không phải provider live.

VPS updater ghi snapshot public và hash các collections riêng trước khi chuyển app, giữ private audit `0600`, xác minh identity bindings và mọi ID cũ. Chỉ riêng app IELTS được chuyển; không xóa/khôi phục MongoDB khi bản mới có thể đã ghi. Bước xác minh dùng regular-file stdin cho mongosh để tránh `EAGAIN` với payload lớn, kiểm tra SHA256 và xóa file tạm private. Xem [deploy/README.md](../deploy/README.md).

Cloud là máy riêng: mỗi phiên mới cần start MongoDB và kiểm tra ping lại, vì tiến trình chạy không tồn tại qua publish environment. Với MongoDB bên ngoài, giữ URI/mạng/credentials đã cấu hình và không tạo helper thay thế.
