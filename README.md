# websiteIeltsAi — IELTS AI

Website luyện IELTS bằng **React 19 + TypeScript + Vite**, **Node.js 24 + Express 5** và **MongoDB 8**. Giao diện tiếng Việt, học liệu tiếng Anh; hỗ trợ hai học viên với lịch sử riêng, Academic và General Training.

Mã nguồn được xây dựng mới theo hai PDF người dùng cung cấp. React + Node.js + MongoDB là yêu cầu trực tiếp của người dùng, thay cho Next.js/Supabase trong tài liệu. [Ma trận yêu cầu](docs/requirements.md) ghi rõ nguồn và phạm vi; [hợp đồng API](docs/api-contract.md) mô tả dữ liệu và endpoint.

[Xem ảnh giao diện desktop/mobile](docs/preview.md) · [Kết quả kiểm tra](docs/validation.md).

## Chạy tại máy của bạn

Cần Node.js **24+**, npm, Docker có Docker Compose và một trình duyệt hiện đại.

```sh
npm ci
cp .env.example .env
npm run mongo:start
npm run dev
```

Mở `http://localhost:5173`. API chạy cổng 3001; frontend proxy giữ nguyên Host để xác thực cookie và kiểm tra Origin. Nếu thay cổng API, đặt `PORT` trong `.env`; Vite đọc cùng cấu hình. `WEB_PORT` thay cổng giao diện. Để dùng MongoDB đang có hoặc Atlas, đặt `MONGODB_URI` thực trong môi trường server và bỏ bước `mongo:start`.

Chọn **Học viên 01 / 02** để thử ngay. Hai hồ sơ ban đầu không có lịch sử giả. Hoặc đăng ký tối đa hai tài khoản thật với email/mật khẩu riêng; hai hồ sơ thử không chiếm chỗ tài khoản thật. Mật khẩu được băm scrypt; session ngẫu nhiên được lưu dưới dạng hash trong MongoDB, cookie HttpOnly/SameSite.

MongoDB local dùng image chính thức ghim digest, chỉ mở cổng loopback và lưu `.local/mongo`. Lệnh `npm run mongo:stop` dừng dịch vụ nhưng giữ dữ liệu; `mongo:status` kiểm tra ping thực. Xem [hướng dẫn MongoDB](docs/mongodb.md). Khởi động API tự tạo indexes và seed shared content theo cách idempotent, không xóa tiến độ cá nhân. `npm run seed` có thể chạy lại an toàn.

## Tính năng

| Phần            | Hành vi                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hồ sơ           | Mục tiêu 3.0–7.0, ngày thi, Academic/GT, thời lượng học, tự đánh giá bốn kỹ năng có nhãn riêng                                                                         |
| Đầu vào         | Quick 15 hoặc Deep 30 câu Reading/Listening thích ứng Rasch/MAP; chọn theo thông tin Fisher, không lặp trong một bài; lưu và tiếp tục sau reload                       |
| Kho bài tập     | Tìm/lọc kỹ năng, chủ đề, CEFR, mục tiêu band, loại thi; có Reading, Listening, Writing, Speaking và grammar                                                            |
| Reading         | Passage/câu hỏi MCQ, T/F/NG, Y/N/NG, matching, trả lời ngắn; chấm ở server, giải thích và evidence sau nộp                                                             |
| Listening       | Bốn phần xã hội/học thuật, nhiều người nói, bẫy đính chính/phủ định; audio ElevenLabs khi cấu hình hoặc giọng đọc trình duyệt ghi rõ nguồn                             |
| Writing         | Academic chart/GT letter và Task 2; số từ 150/250, lưu nháp MongoDB; hai tác nhân trích dẫn rồi chấm bốn tiêu chí; Task 2 trọng số gấp đôi                             |
| Speaking        | Ba phần, ghi âm WAV PCM mono 16 kHz, nghe lại và lưu riêng bằng GridFS; Whisper nhận diện; SSE hiện tiến trình; Azure đo phát âm nếu được cấu hình                     |
| Thi thử         | Reading 3 sections/40 câu/60 phút; Listening 4 parts/40 câu/30 phút; Writing 2 tasks/60 phút; Speaking 3 parts/12 phút; deadline do server lưu, không reset khi reload |
| Từ vựng         | Kho từ theo nghĩa, IPA, nghĩa Việt/định nghĩa Anh, collocations, word families, ví dụ, lỗi thường gặp; flashcards FSRS thật, bốn mức Quên/Khó/Tốt/Dễ                   |
| Lộ trình        | Kế hoạch tuần theo thời lượng và mục tiêu, ưu tiên kỹ năng cần bằng chứng, bài mới và từ đến hạn; đánh dấu hoàn thành                                                  |
| Theo dõi        | Điểm kỹ năng từ các form khác nhau, đồ thị, thời gian hoạt động, lịch sử bài luyện/đầu vào, sổ lỗi và đề xuất tiếp theo                                                |
| Dữ liệu cá nhân | Xuất JSON và xóa lịch sử của riêng mình; recording tải qua endpoint kiểm tra owner; không đưa API key ra trình duyệt                                                   |

Các lần làm lại cùng form không tạo thêm bằng chứng độc lập để tăng điểm năng lực. Mỗi dữ liệu riêng đều truy vấn theo userId trong MongoDB; đây là cơ chế kiểm soát owner ở API, không gọi là PostgreSQL RLS. Session và drafts tồn tại qua khởi động lại API. Website dành cho một instance API và nhóm nhỏ; không tuyên bố đây là hệ thống thi có giám sát.

## Ngân hàng học liệu ban đầu

| Loại      | Lessons | Full mocks |
| --------- | ------: | ---------: |
| Reading   |      48 |          8 |
| Listening |      48 |          8 |
| Writing   |      24 |          4 |
| Speaking  |      24 |          4 |
| Grammar   |      16 |          0 |
| **Tổng**  | **160** |     **24** |

Ngoài ra có **216 mục từ vựng**, **192 câu placement**, **12 chủ đề**, đủ A2/B1/B2/C1 và 208 section texts riêng trong lessons. Nội dung được biên soạn nguyên bản bằng các họ template có tình huống, phương pháp, kết quả và câu hỏi khác nhau. Một số full mocks ghép lại section từ bài luyện và có tag provenance; 24 mocks không có nghĩa là 24 ngân hàng hoàn toàn độc lập. Mức khó và phân loại từ là ước lượng hướng dẫn học, chưa hiệu chuẩn tâm trắc hay thẩm định bởi giám khảo IELTS.

`npm run audit:content` kiểm tra ID, đáp án, evidence, word limits và cấu trúc đầy đủ. Audit không thay thế thẩm định nội dung/chất lượng giáo dục. [Ghi chú ngân hàng](server/data/README.md) mô tả cụ thể nguồn tái sử dụng. Tính năng sinh thêm bài qua AI dùng schema validation và critic trước khi lưu, vẫn gắn trạng thái `ai-unreviewed`.

## Điểm luyện tập và AI

Mọi band hiển thị là **ước lượng luyện tập, không phải điểm thi chính thức**. Chỉ bài Reading/Listening đủ 40 câu mới quy đổi bằng bảng tham khảo; bài ngắn hiển thị số câu đúng và dẫn chứng, không suy band từ vài câu. Overall chỉ có khi đủ bốn điểm kỹ năng, làm tròn đúng ngưỡng .25/.75.

Nếu chưa có OpenAI, Writing/Speaking trả thống kê/checklist với band `null`. Website không tự bịa điểm AI. Transcript riêng không đủ để đo phát âm hoặc tốc độ/khoảng dừng; Speaking không có điểm toàn kỹ năng khi thiếu bằng chứng âm thanh. Azure scores 0–100 cũng không phải bảng chuyển thẳng sang band IELTS. Provider đã cấu hình mà lỗi sẽ báo lỗi và giữ nháp/recording để thử lại.

TTS trình duyệt là giọng máy để tự luyện, không phải ElevenLabs và không xác nhận accent chuẩn. Trong Exam, giao diện ẩn transcript/hints và server chỉ cấp nguồn nghe một lần; nguồn đọc native vẫn có thể được người dùng kỹ thuật kiểm tra. Đây là mô phỏng thi để tự học, không phải cơ chế chống gian lận.

## Cấu hình dịch vụ phía server

Không điền khóa trong code, commit, biến frontend `VITE_*` hoặc chat. `.env.example` chỉ chứa giá trị trống cho credentials. Dùng secrets của nơi triển khai hoặc file `.env` riêng không theo dõi bởi Git.

| Biến                                                                                   | Mục đích                                                                          |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `MONGODB_URI`                                                                          | URI MongoDB thật; local mặc định ở trên, production dùng database đã bảo vệ/TLS   |
| `IELTS_OPENAI_API_KEY`                                                                 | OpenAI content, Writing/Speaking; alias local `OPENAI_API_KEY`                    |
| `CONTENT_MODEL`, `EXTRACTOR_MODEL`, `SCORING_MODEL`                                    | Tách vai trò model, mặc định `gpt-4o`                                             |
| `TRANSCRIPTION_MODEL`                                                                  | Whisper STT, mặc định `whisper-1`                                                 |
| `ELEVENLABS_API_KEY`                                                                   | API tạo hội thoại; cần thêm ba voice IDs thực                                     |
| `ELEVENLABS_VOICE_BRITISH`, `ELEVENLABS_VOICE_AMERICAN`, `ELEVENLABS_VOICE_AUSTRALIAN` | Voice IDs từ tài khoản ElevenLabs                                                 |
| `ELEVENLABS_MODEL`                                                                     | Text-to-dialogue model, mặc định `eleven_v3`                                      |
| `IELTS_AZURE_SPEECH_KEY`, `IELTS_AZURE_SPEECH_REGION`                                  | Đo phát âm; alias local `AZURE_SPEECH_KEY/REGION`                                 |
| `APP_ORIGIN`                                                                           | Origin chính xác; bắt buộc HTTPS trong production                                 |
| `TRUST_PROXY`                                                                          | `true` chỉ khi API đứng sau reverse proxy tin cậy                                 |
| `DEMO_ENABLED`, `MAX_LEARNERS`                                                         | Mở hồ sơ demo và số tài khoản thật; production mặc định tắt demo nếu không đặt rõ |

Đích mạng: `api.openai.com`, `api.elevenlabs.io`, `<region>.stt.speech.microsoft.com`, hostname MongoDB/Atlas tương ứng. Flags `/api/health` chỉ cho biết đã cấu hình, không xác minh kết nối live. Nhà cung cấp có thể thu phí; hiện giới hạn tạo bài AI năm lần/ngày/học viên. Chỉ đưa voice/region thực khi đã chọn ở tài khoản của bạn.

## Kiểm tra

```sh
npm run typecheck
npm run audit:content
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit/API tests dùng MongoDB thật với database UUID riêng, bao gồm owner isolation, persistence, adaptive placement, FSRS, grading, timeout, drafts, SSE và GridFS recording vượt 16 MB. Test provider dùng transport kiểm soát, không coi là đã gọi API live. Browser tests dùng database riêng và Chromium desktop/mobile; `/usr/bin/chromium` được dùng nếu có, hoặc browser Playwright đã cài. Các cấu hình E2E có cổng riêng để không đụng phiên development đang chạy.

## Production

```sh
npm ci
npm run build
NODE_ENV=production APP_ORIGIN=https://your-domain.example MONGODB_URI='your-secure-uri' npm start
```

Express phục vụ cả `dist` và API ở một port; TLS được cung cấp bởi hosting/reverse proxy. Không đưa URI thật có mật khẩu vào câu lệnh ghi lịch sử shell: khi triển khai, nhập qua secrets và chạy `npm start`. `Dockerfile` dựng image Node.js và frontend, chạy bằng user `node`; cấp MongoDB URI và HTTPS origin qua cấu hình hosting. Container app không tự tạo MongoDB; local Mongo Compose là tiện ích development.

Cloud environment đã có Node và MongoDB/Docker được kiểm tra. Cấu hình install/start được lưu riêng để tái sử dụng; các tiến trình phải khởi động lại ở phiên mới. Đây chưa phải bản triển khai public: URL công khai cần hosting cho API và MongoDB cùng cấu hình domain/secrets.

Hướng dẫn khởi động lại cloud và script thiết lập: [docs/cloud-start.md](docs/cloud-start.md). Dockerfile được cung cấp cho hosting có truy cập npm; build container trong cloud này chưa xác minh được do DNS của container không truy cập được npm registry. Build Node/Vite và các kiểm tra trình duyệt dùng MongoDB thực chạy trực tiếp trong workspace.
