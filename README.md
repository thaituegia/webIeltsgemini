# IELTS Compass

Website luyện IELTS bằng **React 19 + TypeScript + Vite** và **Node.js 24 + Express 5**, dành cho hai học viên, từ band 3.0 đến 7.0. Giao diện tiếng Việt, bài luyện tiếng Anh.

Yêu cầu chức năng được triển khai từ tài liệu “Prompt Web Luyện Thi IELTS”. React + Node.js được dùng theo yêu cầu trực tiếp của chủ dự án, thay cho Next.js trong tài liệu. API AI chạy hoàn toàn phía server; trình duyệt không nhận khóa API.

## Chạy tại máy cá nhân

Yêu cầu Node.js **24 trở lên** (dùng SQLite tích hợp trong Node), npm và một trình duyệt hiện đại.

```sh
npm ci
cp .env.example .env
npm run dev
```

Vite chạy ở cổng `5173`, API ở cổng `3001`. Mở địa chỉ Vite được hiển thị trong terminal. Trong môi trường cloud onboarding, kiểm tra qua HTTP nội bộ; nền tảng onboarding không cung cấp đường dẫn preview.

Không cần khóa dịch vụ để luyện bằng bài mẫu. Chọn một trong hai học viên trải nghiệm, hoặc đăng ký tài khoản riêng. Hai hồ sơ trải nghiệm dùng dữ liệu riêng và bắt đầu với lịch sử trống. Hai tài khoản đăng ký là giới hạn của không gian học tập; tài khoản trải nghiệm không dùng mật khẩu và chỉ phục vụ thử tính năng.

SQLite lưu ở `.local/ielts.sqlite` cùng session và lịch sử. Thư mục này và `.env` được loại khỏi Git. Đổi `DATABASE_PATH` để dùng vị trí lưu trữ khác. Chế độ Supabase và chế độ local sử dụng hai nguồn dữ liệu độc lập; cấu hình Supabase không tự chuyển dữ liệu local lên cloud.

## Các luồng học

| Chức năng        | Hành vi                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kiểm tra đầu vào | 15 câu thích ứng A2–C1, độ khó tăng/giảm theo câu trả lời; chọn và chấm ở server, lưu band khởi điểm ước lượng. OpenAI tạo ngân hàng 32 câu trong một lần gọi khi đã cấu hình; mặc định dùng ngân hàng biên soạn sẵn. Đây là mô phỏng CAT, chưa phải ngân hàng IRT được hiệu chuẩn thực nghiệm.                                                                |
| Reading          | Bài đọc và câu hỏi, chấm tự động, giải thích đáp án; tự thêm từ vựng bài học vào bộ thẻ của học viên.                                                                                                                                                                                                                                                          |
| Listening        | Đủ bốn sections, có bẫy đính chính và phủ định. ElevenLabs tạo hội thoại đa giọng khi cấu hình; nếu chưa có, trình duyệt đọc bài mẫu và giao diện ghi rõ nguồn âm thanh.                                                                                                                                                                                       |
| Writing          | Task 1 có biểu đồ, Task 2 nghị luận; đếm từ, lưu nháp theo học viên. Khi có OpenAI, tác nhân trích xuất dẫn chứng và tác nhân chấm độc lập trả điểm từng tiêu chí, sửa lỗi và nhận xét từng đoạn.                                                                                                                                                              |
| Speaking         | Ghi âm microphone, nghe lại, WAV PCM16 mono 16 kHz; Whisper chuyển lời nói thành văn bản, AI phản hồi từ vựng/ngữ pháp/lưu loát. Phản hồi tiến trình và transcript được gửi qua SSE. Azure đánh giá phát âm từ âm thanh: REST cho đoạn ngắn, SDK continuous cho bản ghi tối đa ba phút. Chỉ ước lượng band tổng khi có đủ dẫn chứng âm thanh cho bốn tiêu chí. |
| Vocabulary       | Flashcard với `ts-fsrs`, bốn mức Quên/Khó/Tốt/Dễ, lưu difficulty/stability/lịch ôn/lịch sử, tính khả năng truy xuất và thẻ đến hạn.                                                                                                                                                                                                                            |
| Tiến độ          | Lịch sử làm bài và phản hồi, điểm kỹ năng mới nhất, chuỗi ngày học và mục tiêu cá nhân. Overall chỉ có khi đủ điểm cả bốn kỹ năng; làm tròn IELTS ở ngưỡng `.25` và `.75`.                                                                                                                                                                                     |

Các bài mẫu ngắn dùng để luyện và kiểm tra chức năng, không phải đề thi IELTS đầy đủ 40 câu. Band bài mẫu và AI là **ước lượng luyện tập**, không phải điểm thi chính thức. Khi chưa có OpenAI, Writing/Speaking chỉ trả gợi ý luyện tập và thống kê, **không tự tạo điểm AI**. Văn bản đơn thuần không đủ để đánh giá phát âm; điểm phát âm chỉ xuất hiện khi Azure phân tích âm thanh.

## Cấu hình dịch vụ

Điền giá trị qua `.env` tại máy cá nhân, hoặc mục secrets/variables trong môi trường triển khai. Không đưa khóa vào source, biến frontend `VITE_*`, chat hoặc Git.

| Biến                                                                                            | Mục đích                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `IELTS_OPENAI_API_KEY`                                                                          | Khóa OpenAI; cũng hỗ trợ `OPENAI_API_KEY` trong môi trường local.                           |
| `OPENAI_MODEL`                                                                                  | Mô hình tạo bài và chấm bài, mặc định `gpt-4o`.                                             |
| `OPENAI_TIMEOUT_MS`                                                                             | Thời gian chờ, mặc định 60000 ms.                                                           |
| `ELEVENLABS_API_KEY`                                                                            | Tạo âm thanh bài nghe bằng Text-to-Dialogue.                                                |
| `ELEVENLABS_VOICE_BRITISH_ID`, `ELEVENLABS_VOICE_AUSTRALIAN_ID`, `ELEVENLABS_VOICE_AMERICAN_ID` | Voice ID thực từ tài khoản ElevenLabs; cần đủ ba ID.                                        |
| `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`                                                       | Phân tích phát âm tùy chọn, ví dụ region `southeastasia`.                                   |
| `AZURE_SPEECH_LANGUAGE`                                                                         | Ngôn ngữ nhận diện, mặc định `en-US`.                                                       |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`                                                             | Bật Supabase Auth và lưu PostgreSQL với JWT riêng từng học viên.                            |
| `SESSION_SECRET`                                                                                | Chuỗi ngẫu nhiên tối thiểu 32 ký tự, bắt buộc production.                                   |
| `APP_ORIGIN`                                                                                    | Origin chính xác của website; dùng để kiểm tra nguồn request thay đổi dữ liệu.              |
| `PORT`, `DATABASE_PATH`                                                                         | Cổng API và đường dẫn SQLite/session.                                                       |
| `HOST`, `TRUST_PROXY`                                                                           | Địa chỉ bind mặc định `0.0.0.0`; `TRUST_PROXY=true` chỉ khi dùng một reverse proxy tin cậy. |
| `ALLOW_DEMO`                                                                                    | Chỉ đặt `true` nếu muốn mở đăng nhập trải nghiệm trong production.                          |

Đích mạng cần thiết khi bật dịch vụ: `api.openai.com`, `api.elevenlabs.io`, `<region>.stt.speech.microsoft.com` và hostname Supabase của dự án. Các nhà cung cấp có thể thu phí theo sử dụng. Thiếu cấu hình hoặc lỗi dịch vụ được hiển thị; lỗi live không được âm thầm đổi thành điểm mẫu.

## Supabase

1. Tạo dự án Supabase, chạy migration trong `supabase/migrations/` bằng SQL Editor.
2. Bật đăng nhập Email/Password. Nếu bật xác nhận email, học viên xác nhận email rồi đăng nhập để khởi tạo hồ sơ.
3. Đặt URL dự án và anon/publishable key tương thích API vào `.env` ở server, khởi động lại.
4. Đăng ký/đăng nhập tài khoản thật. Luồng trải nghiệm vẫn dùng SQLite local.

Migration tạo `user_profiles`, `test_history`, `fsrs_cards` và `learner_state`. Một RPC lưu trạng thái học đồng thời cập nhật các bảng chuẩn trong giao dịch. RLS kiểm tra `auth.uid()`; server sử dụng JWT học viên, không dùng service-role key. RLS và schema cần được kiểm tra trong dự án Supabase thật trước khi dùng production. Các request trong một instance được khóa theo học viên để tránh ghi đè do thao tác song song; chạy một instance API cho không gian hai người này.

## Kiểm tra và build

```sh
npm run typecheck
npm test
npm run build
# Có Chromium hệ thống: CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
# Nếu chưa có browser:
npx playwright install --with-deps chromium
npm run test:e2e
```

Test dùng database tạm độc lập. E2E kiểm tra giao diện desktop/mobile bằng browser thật. CI chạy build, kiểm thử API và E2E khi push/pull request. Các tích hợp trả phí được kiểm tra bằng response giả lập; test này không chứng minh kết nối, chất lượng giọng hoặc độ chính xác chấm điểm từ dịch vụ thật.

## Chạy production

```sh
npm ci
npm run build
# Cấu hình NODE_ENV=production, SESSION_SECRET và APP_ORIGIN bằng deployment settings.
npm start
```

Express phục vụ cả API và React build từ `dist/` trên một cổng. Dùng HTTPS qua reverse proxy để cookie `Secure` hoạt động và trình duyệt cho phép microphone. `APP_ORIGIN` cần khớp chính xác origin public (scheme, hostname, port nếu có). Tài khoản demo mặc định bị chặn ở production.

Dockerfile Node 24 kèm healthcheck và volume `/app/.data`. Truyền biến qua secret manager hoặc `--env-file`; đặt volume lưu trữ bền vững cho SQLite và sao lưu định kỳ. Không chạy SQLite trên filesystem tạm hoặc nhiều replica cùng ghi một file. Ngay cả khi dùng Supabase, session server vẫn cần volume bền vững hoặc người học sẽ cần đăng nhập lại sau redeploy.

## Cấu trúc

```text
client/                 React, CSS, ghi âm WAV, API client và trang luyện tập
server/                 Express, xác thực, SQLite, curriculum, FSRS, AI, Supabase
shared/types.ts         Kiểu dữ liệu dùng chung frontend/backend
supabase/migrations/    PostgreSQL, RLS và RPC lưu trạng thái
tests/                  Kiểm thử API, thuật toán và trình duyệt
```

Mật khẩu local được băm bằng scrypt; session opaque có chữ ký, cookie HttpOnly/SameSite/Secure ở production. Input được kiểm tra bằng Zod, API có giới hạn request, upload giới hạn dung lượng, đáp án không gửi trong payload đề bài. Nội dung và kết quả học luôn được kiểm tra theo tài khoản đang đăng nhập.
