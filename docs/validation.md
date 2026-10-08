# Kết quả kiểm tra

## Giao diện chiến dịch Hỏa + Mộc — 2026-10-08

Production build TypeScript/Vite đạt. **30/30 Playwright tests** trên desktop 1440px và mobile 390px đạt, gồm toàn bộ 26 kiểm tra trước đó và bốn kiểm tra giao diện chiến dịch mới. Các trang đăng nhập, tổng quan, thư viện, thi thử, đầu vào, lộ trình, từ vựng, lịch sử, sổ lỗi và cài đặt tải được font/ảnh, không tràn ngang. Font Be Vietnam Pro tải được các trọng lượng dùng trong UI với mẫu tiếng Việt; các tiêu đề không dùng serif fallback hoặc khoảng cách chữ âm.

Sau chỉnh sửa nhỏ để caption minh họa dashboard tách hai dòng, production build và **4/4 kiểm tra chiến dịch** được chạy lại, đạt; ảnh preview đã được chụp từ bundle cuối này.

Kiểm tra bằng hai tài khoản tổng hợp trong MongoDB riêng xác nhận: một người hoàn thành chưa mở huy hiệu chung; cả hai hoàn thành mở đúng huy hiệu đầu tiên; một người đạt Gate chưa mở chặng sau, cả hai đạt mới mở huy hiệu Gate và các buổi kế tiếp. Chọn quân cờ chỉ đưa tới thẻ buổi học, không ghi tiến độ hay bỏ qua khóa. Các kiểm tra bài đọc, nghe, biểu đồ, sơ đồ, nháp Writing, WAV Speaking, lịch sử và FSRS cũ vẫn đạt.

**30/30 kiểm tra updater**, không skip, gồm native MongoDB, đạt sau khi thêm đối chiếu CSS, WebP/SVG và WOFF2 qua HTTPS theo MIME, dung lượng và SHA256 của image đã build. Kiểm tra từ chối trang HTML200 giả tài nguyên, font sai nguồn và CSS cũ dù cùng dung lượng. Không chạy triển khai VPS trong lượt kiểm tra này; cloud vẫn không kết nối được SSH22 tới VPS. HTTPS công khai hiện xác nhận website đang dùng Duo phone auth và ngân hàng 544/84/744/640; đây chưa phải bằng chứng giao diện chiến dịch đã lên live.

Thay đổi giao diện không sửa mã backend, seed hoặc ngân hàng học liệu. Font được đóng gói cùng website với giấy phép OFL; không yêu cầu truy cập Google Fonts. Ảnh preview dùng tài khoản tổng hợp, không chứa thông tin đăng nhập thật.

## Duo và học liệu band 7.5–8.0 — 2026-10-08

Hai tài khoản cố định đăng nhập bằng số điện thoại, với tên và mục tiêu 8.0 từ cấu hình riêng chứa hash scrypt. Không có số điện thoại hoặc mật khẩu thật trong source/bundle. Session cũ chưa gắn đúng danh tính không thể đăng nhập vào bản Duo. Kho bài và thi thường mở độc lập; backend bảo vệ riêng tiến độ lộ trình, Gate và kỳ thi nâng band.

Lượt kiểm tra cuối trên source đã chốt đạt **172/172 Node tests, không skip**, với native Mongo cho updater/verifier; **26/26 Playwright desktop/mobile**; TypeScript và build Vite đạt. Production Node được chạy riêng với MongoDB thật và cấu hình Duo private: health phone-only, demo tắt, ngân hàng đúng số lượng, anonymous user null, đăng ký bị từ chối, SPA và JavaScript 415.010 byte phục vụ đúng. Kiểm tra này không tạo điểm hoặc tiến độ học giả và không triển khai lên VPS.

Setup cloud được chạy lại thành công từ lockfile: `npm ci`, MongoDB ping, cả ba audit, production build và seed. Hash các collection cá nhân sau setup khớp receipt development trước đó; không xóa dữ liệu để kiểm tra startup.

Ngân hàng đạt **544 bài luyện, 84 đề mô phỏng, 744 mục từ và 640 câu placement**. Bổ sung 64 bài luyện, 12 đề, 96 mục từ và 64 câu placement. Audit đối chiếu đúng hash nguồn của toàn bộ 552/648/576 bản ghi v3, chấm đủ 784 đáp án khách quan mới, kiểm tra dẫn chứng, giới hạn từ, bố cục, workload đề và hình vẽ. Không phát hiện nguồn hoặc hình mới trùng nguyên bản hay overlap Reading/Listening vượt ngưỡng 55% theo cụm 5 từ. Đây là kiểm tra tự động; nội dung vẫn có nhãn AI chưa được chuyên gia thẩm định và độ khó ước lượng.

MongoDB test thực chứng minh seed chỉ thêm ID mới, giữ nguyên mọi học liệu cũ, kể cả các ID đã chỉnh sửa và học liệu thêm riêng. Hai lượt seed giữ nguyên 13 collection riêng, gồm bốn collection Duo, cùng ghi âm GridFS 4096 byte/32 chunk. Khi cập nhật database development thật, toàn bộ 552/648/576 tài liệu cũ và dữ liệu cá nhân giữ nguyên; provisioning bổ sung đúng hai tài khoản cố định, không xóa tài khoản legacy hoặc tiến độ.

Kiểm thử backend bao gồm MIN placement, placement lại không reset, bằng chứng hoàn thành cá nhân, Gate bảo lưu pass, phòng thi hai Ready, đồng hồ server, pending AI, Companion/strict retake, band 7.5 → 8.0 và nâng band nguyên tử. Chấm lại chỉ dùng bài/âm thanh đã lưu của chủ tài khoản; dữ liệu nộp sau hạn bị từ chối. Provider transport trong tests được kiểm soát, không phải gọi chấm AI live.

Bài nâng band Writing yêu cầu đủ các task và điểm AI của từng task. Nộp/chấm dùng lease MongoDB riêng và đối chiếu đúng bản làm, nên autosave hoặc upload từ phiên khác không đổi nguồn đang chấm. Worker hết hạn không thể thay/xóa ghi âm mới; API và JSON export không lộ token lease. Phòng thi giữ lượt đang được chấm hợp lệ qua hạn nộp, còn lease bỏ dở hết hạn cho phép thi lại. Năm tình huống race được chạy qua hai app instance trên cùng database test.

`deploy/update-duo.sh` đã kiểm tra bằng Compose thực và MongoDB test, gồm payload toàn ngân hàng trên 7 MiB, helper regular-file 0600 và hash của collection Duo/cá nhân/ghi âm. Script chỉ thay app IELTS, giữ MongoDB, proxy, host Nginx, chứng chỉ, cấu hình và project khác. Bản Duo **chưa được triển khai trên VPS** trong lượt kiểm tra này; cloud không có kết nối SSH vào VPS, người dùng cần chạy lệnh đã ghim commit/checksum trong phiên SSH hiện có.

Chưa có credentials để kiểm tra provider AI live. Writing/Speaking trong kỳ thi nâng band chờ kết quả AI hợp lệ; Speaking cần bằng chứng âm thanh phù hợp. Không thay bằng điểm giả. Build Node/Vite và trình duyệt chạy trực tiếp trên cloud; hạn chế CA proxy của Docker build nêu bên dưới vẫn áp dụng.

## Xác minh cập nhật VPS và sửa lỗi EAGAIN — 2026-10-08

Người dùng đã chạy updater v3 trên VPS: build production đạt và app mới đang phục vụ. Kiểm tra độc lập qua HTTPS công khai xác nhận `https://sutonghanyu.vn/api/health` trả MongoDB, demo tắt và ngân hàng 480/72/648/576; session anonymous và JavaScript build cũng trả đúng. Đây là bằng chứng website mới đang chạy, chưa phải bằng chứng so sánh từng bản ghi cũ hoặc toàn bộ baseline trên VPS.

Lượt updater gốc dừng khi `mongosh` đọc manifest 7.963.147 byte trực tiếp từ Docker stdin: fd 0 trở thành nonblocking, khiến `fs.readFileSync(0)` báo `EAGAIN`. Cùng lỗi này làm guarded rollback từ chối xử lý; không phải bằng chứng học liệu bị thiếu. Đã tái hiện bằng manifest đầy đủ với MongoDB thực, không chỉ fixture nhỏ.

`deploy/update.sh` sửa ba truy vấn nhận payload bằng helper chuyển dữ liệu tới file tạm riêng quyền 0600 trong đúng Mongo container, xác minh kích thước/SHA256, dùng regular-file stdin và tự dọn file. 22 kiểm thử updater đạt, gồm xác minh toàn bộ manifest và guarded rollback nhiều MB trong database test riêng; dữ liệu học tập được đối chiếu giữ nguyên. Không thay đổi điều kiện an toàn của rollback.

`deploy/verify-update.sh` dành riêng cho app commit `3e6037bf7da2d9ddf5e84b4193353f7a721e9bc9` đã chạy. Script chỉ đọc các collection public, so sánh toàn bộ seed và bản ghi public cũ bằng canonical EJSON, đối chiếu image/digest/release/origin/loopback, HTTPS/assets và baseline container/cổng/cấu hình. Nó chỉ tạo receipt riêng và file tạm; không build, seed, restart, thay đổi database, proxy, host Nginx hoặc firewall. PID Nginx được kiểm tra giữ nguyên trong lượt xác minh; cấu hình được đối chiếu với audit trước cập nhật. Người dùng đã gửi kết quả xác minh đạt trên VPS: 552/648/576 seed khớp, 184/216/192 bản ghi cũ giữ nguyên, baseline container/cổng/cấu hình đạt. Đây là receipt của bản v3, không phải bằng chứng bản Duo đã triển khai.

21 kiểm thử verifier đạt, gồm các nhánh thiếu/thay đổi bản ghi, custom material, BSON, audit selection và image parser từ heredoc thật. Truy vấn verifier thật nhận 10.549.633 byte qua stdin regular-file quyền 0600 trên MongoDB test: 552/648/576 bản ghi seed và 185/217/193 bản ghi cũ/custom khớp; hash của ba collection public và chín collection cá nhân giữ nguyên, file tạm được dọn. Lượt kiểm thử cuối bật native Mongo cho cả updater/verifier: **99/99 đạt, không skip**. TypeScript, cú pháp Bash và cả bảy Python heredoc đạt. Không chạy lại browser suite vì không thay đổi app/giao diện/học liệu.

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
