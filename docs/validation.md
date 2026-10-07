# Kết quả kiểm tra

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
