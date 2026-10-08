# Kết quả kiểm tra

## Mở rộng nội dung v3 — 2026-10-08

Node.js 24, MongoDB 8 và Chromium thực: `npm run build`, `npm run audit:content`, `npm run audit:expansion`, 76 kiểm thử Node và 22 kiểm thử trình duyệt desktop/mobile đều đạt. Lượt Node này bật cả hai trường hợp kiểm tra rollback bằng BSON/MongoDB thực qua `IELTS_UPDATE_GUARD_MONGO_CONTAINER=website-ielts-ai-mongo`; không có trường hợp bị bỏ qua.

Ngân hàng hiện có 480 bài luyện, 72 đề mô phỏng, 648 mục từ và 576 câu placement. Audit chấm đủ 3.776 đáp án khách quan mới; kiểm tra dạng bài, trích dẫn, giới hạn từ, thứ tự đáp án trong lời thoại, workload đề đủ 40 câu, hình vẽ và nhóm chọn nhiều đáp án. Không phát hiện section mới trùng nguyên văn hoặc cặp bài Reading/Listening mới có độ giao nhau 5-gram vượt 55% với nội dung cũ/mới. Kiểm tra tự động không thay thế việc thẩm định chuyên môn hay hiệu chuẩn độ khó; nội dung mới giữ nhãn `ai-unreviewed`.

Thử seed trên MongoDB thực trong database test riêng chứng minh giữ tài khoản, session, bài làm, flashcard, placement, lộ trình và GridFS recording qua hai lần seed. Khi cập nhật database development, đã đối chiếu hash của cả 9 collection cá nhân trước/sau, cùng toàn bộ 184/216/192 bản ghi public cũ: tất cả giữ nguyên, số lượng public sau cập nhật đạt 552/648/576.

Giao diện được kiểm tra với đủ bảy dạng Writing Task 1, bản đồ/sơ đồ Reading/Listening, sáu bố cục completion, chọn nhiều đáp án, resume và ẩn đáp án/lời thoại trong Exam. Sơ đồ snow fence được kiểm tra riêng để chú giải tự suy ra từ đường vẽ không làm lộ đáp án.

`deploy/update.sh` đã qua 20 kiểm thử riêng, gồm preflight chỉ đọc với Docker mô phỏng và rollback với MongoDB/BSON thực; chưa chạy trên VPS trong đợt mở rộng này. Kiểm tra public cho thấy `https://sutonghanyu.vn/api/health` vẫn trả ngân hàng cũ 160/24/216/192. SSH cổng 22 từ cloud bị từ chối, nên cần chạy lệnh cập nhật đã ghim commit/checksum trong phiên SSH của người dùng. Không suy diễn kiểm tra cloud thành triển khai thành công trên VPS.

Dockerfile production được thử build với giới hạn 1024 MiB RAM, không swap và 0,5 CPU. `npm ci` trong image Node chính thức bị chặn bởi `SELF_SIGNED_CERT_IN_CHAIN`: image chưa có CA của proxy HTTPS trong cloud. Thử mạng host vẫn gặp cùng lỗi; không tắt xác minh TLS, sửa Dockerfile hay cấu hình DNS để né lỗi. Chưa tạo được image production trong cloud. Build Node/Vite và manifest trực tiếp trên host đạt, gồm 105 visuals và 345 nhóm câu hỏi; container MongoDB không đổi. Script cập nhật VPS tự build và kiểm tra image trước khi dừng app cũ.

## Kiểm tra phiên bản trước — 2026-10-07

Đã chạy trong cloud workspace ngày 2026-10-07, bằng Node.js 24, Chromium và MongoDB 8.0.32 thực.

| Kiểm tra                                            | Kết quả                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `bash scripts/cloud-setup.sh`                       | Đạt: `npm ci` từ lockfile, MongoDB ping, seed idempotent, audit và production build                             |
| `npm test`                                          | 41/41 đạt, không skip                                                                                           |
| `npm run test:e2e`                                  | 16/16 đạt: tám luồng trên desktop 1440 px và mobile 390 px                                                      |
| Kiểm tra lại các luồng learning sau mở rộng Reading | 8/8 đạt trên hai kích thước màn hình                                                                            |
| `npm audit --omit=dev --audit-level=high`           | Không phát hiện lỗ hổng dependency                                                                              |
| Production Node/Express                             | Đạt: MongoDB kết nối thực, SPA/deep link và JavaScript assets được phục vụ, demo tắt, CSP có private blob audio |

Các API tests dùng database riêng và kiểm tra đăng ký đồng thời tối đa hai tài khoản, owner isolation, cookie session/hash, resume qua khởi động lại, draft updates, nộp đồng thời/idempotency, 40-item reference grading, CAT quick/deep, FSRS, server deadline, exam nghe một lượt, Writing/Speaking chưa có band khi offline, SSE và private GridFS recording 17 MB.

Browser tests chạy thật giao diện/API/MongoDB: tài khoản/hồ sơ/lộ trình, lịch sử riêng, thư viện và bài Reading, kiểm tra đầu vào 15 câu, thi Reading 40 câu/timeout, Writing hai tasks/biểu đồ/draft, Speaking microphone WAV/retry/SSE, Listening practice transcript và exam một lượt. Browser fake microphone cung cấp audio vào pipeline thu âm thực để kiểm tra định dạng/lưu trữ; đây không phải kiểm định phát âm của người học. Kiểm tra không có browser exceptions bất thường hay horizontal overflow.

AI adapters được kiểm tra bằng transport kiểm soát: exact evidence quotations, trọng số Writing Task 2, provider failures, Whisper multipart, acoustic-only constraints, Azure continuous recognition thời lượng 12 phút, ElevenLabs voice mapping, và schema/critic validation của bài sinh thêm. **Chưa có credentials để gọi OpenAI, Azure hoặc ElevenLabs live.** Các kiểm tra này không xác nhận chất lượng chấm AI hay voice thực tế.

Audit nội dung xác nhận 160 lessons, 24 mocks, 216 mục từ và 192 placement items; IDs, câu hỏi, đáp án, evidence, word limits, cấu trúc và Reading workload. Học liệu vẫn chưa được giám khảo thẩm định hay hiệu chuẩn tâm trắc.

Docker MongoDB đã chạy/ping/restart với dữ liệu bền vững. Dockerfile ứng dụng được cung cấp nhưng container build chưa xác minh hoàn tất trong cloud này: npm registry không resolve được từ container. Production Node chạy trực tiếp trong workspace đã được kiểm tra riêng. Không triển khai public hosting hoặc URL preview bên ngoài.

Database dùng cho tests được cô lập với database development và xóa sau từng run. Các ảnh trong [preview.md](preview.md) là ảnh chụp trình duyệt, không phải mockup thiết kế.
