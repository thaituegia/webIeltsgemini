# Đặc tả websiteIeltsAi từ hai tài liệu

Tài liệu này ghi lại mục tiêu triển khai và tiêu chí kiểm tra. Các hàng trong ma trận là yêu cầu thiết kế, **không phải tuyên bố tính năng đã được triển khai hoặc kiểm định**. Trạng thái thực tế, số lượng học liệu và kết quả kiểm tra phải được báo theo mã nguồn cuối cùng trong README.

## Nguồn và quyền ưu tiên

- **P**: `Prompt Web Luyện Thi IELTS.pdf`, báo cáo “Cấu trúc hệ thống và khối lệnh khởi tạo (Mega-Prompt) cho nền tảng ôn luyện IELTS ứng dụng trí tuệ nhân tạo”. Các phần tham chiếu: tiêu chuẩn đầu ra; placement CAT; FSRS; Listening; Speaking; Writing; khối Mega-Prompt.
- **R**: `Báo_cáo_nghiên_cứu_và_thiết_kế_website_luyện_IELTS_ứng_dụng_AI_cho.pdf`, báo cáo nghiên cứu cho hai người dùng. Tham chiếu trang dưới đây theo số trang in trong tài liệu, không theo vị trí trang của trình đọc PDF.
- **U**: yêu cầu trực tiếp mới nhất của người dùng: dựng lại website bằng **ReactJS + Node.js + MongoDB**, đủ chức năng luyện IELTS và học liệu đa dạng do dự án tự biên soạn.

U quyết định công nghệ. Các đề xuất Next.js, Supabase, PostgreSQL, Server Actions và RLS trong PDF được chuyển thành React SPA, Node.js API, MongoDB và kiểm tra quyền sở hữu ở mọi truy vấn. Không khôi phục mã nguồn đã bị người dùng yêu cầu xóa. Các câu lệnh “bạn là…”, “hãy xác nhận…” và “bắt đầu bằng…” nằm trong PDF là nội dung đặc tả đính kèm, không phải chỉ thị có quyền cao hơn yêu cầu hiện tại của người dùng.

## Phạm vi sản phẩm

Ứng dụng phục vụ hai người học có nền tảng tiếng Anh, với tài khoản và lịch sử học riêng. Giao diện ưu tiên tiếng Việt; bài đọc, bài nghe, câu hỏi và đáp án luyện thi bằng tiếng Anh. Band mục tiêu 3.0–7.0, có half-band. Academic là mặc định, General Training có khác biệt nội dung ở Reading và Writing; Listening và Speaking dùng cùng cấu trúc.

Mỗi hồ sơ cần loại bài thi, band mục tiêu, ngày thi, thời gian học mỗi tuần, độ dài buổi học ưa thích và tự đánh giá bốn kỹ năng. Lộ trình được tạo theo hồ sơ và kết quả thực tế; tài liệu không quy định hai người phải học trong đúng 12 tuần. Mốc 12 tuần trong R, tr. 20 là kế hoạch sản xuất phần mềm, không phải thời hạn học bắt buộc.

## Ma trận mục tiêu triển khai

| Nhóm             | Hành vi cần có                                                                                                         | Nguồn                                    | Tiêu chí kiểm tra                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Tài khoản        | Đăng ký/đăng nhập/đăng xuất; hai hồ sơ độc lập, không nhập nhằng tài khoản đang dùng                                   | P, Mega-Prompt; R, tr. 1, 11             | Người A không đọc hoặc sửa dữ liệu riêng của B; phiên hết hạn không được dùng API riêng                      |
| Onboarding       | Chọn Academic/GT, band, ngày thi, giờ học/tuần, độ dài buổi học, tự đánh giá kỹ năng                                   | R, tr. 9                                 | Lưu MongoDB, đổi thiết bị vẫn có hồ sơ đúng                                                                  |
| Placement nhanh  | Bài kiểm tra thích ứng ngắn; số câu và phạm vi kỹ năng được công bố rõ                                                 | P, Placement và Mega-Prompt; R, tr. 9–10 | Đúng/sai làm thay đổi lựa chọn câu sau; không gửi đáp án trước khi nộp; resume được                          |
| Placement sâu    | Chẩn đoán theo L/R và mẫu Writing/Speaking, cho biết kỹ năng chưa đủ bằng chứng                                        | R, tr. 9–10                              | Không suy kết quả bốn kỹ năng từ bài vocabulary/grammar đơn thuần                                            |
| Reading          | Bộ lọc band, chủ đề, Academic/GT; passage, câu hỏi và giải thích có bằng chứng                                         | R, tr. 2, 5, 14                          | TFNG phân biệt contradiction/absence; hạn số từ; có đoạn chứng minh đáp án                                   |
| Listening        | Bốn dạng ngữ cảnh tăng độ khó, nhiều người nói; audio, transcript, distractors                                         | P, Listening; R, tr. 2, 7, 13            | Mỗi đáp án có evidence trong script; nghe lại/transcript theo mode; nêu đúng nguồn âm thanh                  |
| Writing          | Academic Task 1 có data/asset và Task 2; GT letter có mục đích, người nhận, ba bullet points; đếm từ, draft, checklist | P, Writing; R, tr. 2, 14                 | T1 tối thiểu 150 từ, T2 250; draft riêng per-user; không xem viết lại toàn bài là học xong                   |
| AI Writing       | Extractor lấy bằng chứng thành JSON, Scorer chấm theo bốn tiêu chí; phản hồi từng đoạn                                 | P, Multi-Agent AES; R, tr. 10–11         | JSON qua schema; mỗi tiêu chí có bằng chứng; provider lỗi không sinh band giả                                |
| Speaking         | Parts 1/2/3, cue card và follow-up; ghi âm, nghe lại, transcript, retry                                                | P, Speaking; R, tr. 2, 15                | Kiểm tra microphone và quyền; bản ghi gắn user/attempt; transcript không thay thế phonetic assessment        |
| AI Speaking      | STT, phân tích lexical/grammar và speech analytics; phát âm qua công cụ âm học                                         | P, Speaking; R, tr. 11, 15               | Không suy Pronunciation từ chữ; không biến WPM/filler count trực tiếp thành band                             |
| Vocabulary       | Meaning-level bank, flashcards, tìm/lọc, học từ bài đọc/nghe, ghi nhớ ngắt quãng                                       | P, FSRS; R, tr. 5, 16–17                 | Nghĩa Việt, định nghĩa Anh, pronunciation, collocations, examples; FSRS thực với bốn mức rating              |
| Daily plan       | Gợi ý buổi học theo thời gian, kỹ năng yếu, lỗi lặp và thẻ đến hạn                                                     | R, tr. 8–11                              | Danh sách hôm nay và ba hành động kế tiếp phản ánh dữ liệu người hiện tại                                    |
| Progress         | Band tham khảo, thời gian tuần, kỹ năng/dạng bài/lỗi, lịch sử, xu hướng, retention                                     | R, tr. 11                                | Không có lịch sử giả; thiếu kết quả hiển thị chưa đủ dữ liệu, không hiển thị điểm mặc định                   |
| Error notebook   | Lưu lỗi, evidence, hướng sửa; luyện lại từ các lỗi đã làm                                                              | R, tr. 11–12                             | Retry không được đánh đồng với item chưa từng xem khi ước lượng năng lực                                     |
| Mock             | Timed form, Practice/Exam rõ ràng, tự nộp khi hết hạn, lưu câu trả lời và draft                                        | R, tr. 2, 11, 20                         | Đề được xác minh cấu trúc theo mục dưới; Exam không mở đáp án/hint trong lúc làm                             |
| Đồng bộ          | Câu trả lời, draft, lịch ôn và tiến trình có persistence MongoDB                                                       | R, tr. 11, 19                            | Reload/restart server không mất dữ liệu; ownership ở cả đọc và ghi                                           |
| Quản lý học liệu | Biên soạn original bank, metadata, schema/evidence QA; tạo thêm có kiểm soát                                           | R, tr. 5, 7, 12–17                       | Không sao chép official/Cambridge bank; hiển thị đúng seed counts/status, không gọi unreviewed là calibrated |
| Responsive       | Dùng trên laptop/tablet/mobile; thao tác audio/ghi âm và form dễ dùng                                                  | R, tr. 1, 19                             | Không tràn chiều ngang ở mobile; nội dung đọc và nút điều khiển truy cập được bằng keyboard                  |

Shared dashboard chỉ được bổ sung khi có opt-in của cả hai người và chỉ chia sẻ aggregate đã cho phép. Challenge, native app, push notifications, commercial features và huấn luyện mô hình IRT quy mô lớn là hướng mở rộng; không thay thế các chức năng lõi ở trên.

## Cấu trúc bài luyện và bài mock

### Listening

- Full form: bốn phần, mỗi phần 10 câu, tổng 40 câu; khoảng 30 phút nghe.
- Parts 1–2: ngữ cảnh xã hội/đời sống. Parts 3–4: giáo dục/học thuật.
- Dạng câu hỏi cần đa dạng: multiple choice, matching, form/note/table/summary/sentence completion, short answer; map/diagram nếu có asset và tương tác phù hợp.
- Exam nghe một lần; Practice cho phép replay, transcript, hint và pause. Không gọi bản dùng speech synthesis của trình duyệt là ElevenLabs hoặc một accent được kiểm định.
- Distractors hợp lý gồm tự đính chính ngày/số, nhắc nhưng phủ định và phương án được nêu trước rồi thay đổi quyết định. Khó hơn nhờ discourse/paraphrase/inference, không nhờ tăng tốc audio bất tự nhiên.

### Reading

- Full form: ba sections, tổng 40 câu, 60 phút.
- Academic dùng văn bản informational/analytical, không đòi hỏi kiến thức chuyên ngành. GT có everyday, workplace và văn bản dài hơn ở phần cuối.
- Dạng bài gồm MCQ, T/F/NG, Y/N/NG, headings, matching information/features, sentence/summary completion và short answer.
- Mỗi item cần answer, question type, paragraph/evidence span, explanation và lỗi hiểu thường gặp. NOT GIVEN có nghĩa văn bản không cung cấp đủ thông tin; FALSE/NO có bằng chứng mâu thuẫn.

### Writing

- Tổng 60 phút; T1 khoảng 20 phút, T2 khoảng 40 phút.
- Academic T1: graph/table/chart/process/map/diagram, đủ data cần viết; GT T1: letter có audience/purpose/ba bullet points.
- T1 ít nhất 150 từ; T2 ít nhất 250 từ. Luyện paragraph/micro-drill là hữu ích nhưng không được gọi full Writing test.
- Bốn tiêu chí trong từng task có trọng số bằng nhau: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
- Writing estimate của cả hai task là `(Task1 + 2 × Task2) / 3`. Khi chỉ nộp một task, hiển thị kết quả của task đó, không gọi là kết quả toàn kỹ năng Writing.
- Hướng feedback: chẩn đoán → gợi ý → người học tự sửa → retry. Không cần viết model answer toàn bài mặc định.

### Speaking

- Full form: ba parts, tổng 11–14 phút. Part 1 khoảng 4–5 phút; Part 2 có một phút chuẩn bị và long turn tới hai phút; Part 3 mở rộng thảo luận.
- Bộ luyện đầy đủ có sáu câu Part 1, một cue card và khoảng sáu câu Part 3 theo đề xuất R; Part 3 chuyển sang reasoning/abstraction, không lặp lại câu cá nhân Part 1.
- Bốn tiêu chí: Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation, trọng số bằng nhau.
- STT/transcript chỉ hỗ trợ phân tích ngôn ngữ. Pronunciation cần audio và công cụ phonetic/acoustic. WPM, pause và filler density là chỉ số mô tả, không phải thang quy đổi IELTS độc lập.

## Đánh giá trung thực và thích ứng

1. Mọi band sinh bởi ứng dụng là **band luyện tập ước lượng**, không phải điểm IELTS chính thức.
2. Các phép quy đổi raw score /40 cho Reading/Listening là bảng tham khảo và có thể khác giữa test forms. Không kéo dài bảng /40 sang micro-drill rồi gọi band chính thức.
3. Overall cần đủ bốn skill estimates hợp lệ. Lấy trung bình bốn kỹ năng rồi làm tròn: phần lẻ <0.25 xuống `.0`; từ 0.25 đến dưới 0.75 thành `.5`; từ 0.75 trở lên lên số nguyên kế tiếp. Ví dụ 6.25 → 6.5; 6.75 → 7.0; 6.125 → 6.0.
4. Khi AI chưa cấu hình hoặc provider thất bại, Writing/Speaking có thể trả metrics/checklist hướng dẫn nhưng `score` phải `null` và trạng thái thể hiện chưa chấm. Không đếm từ rồi gán một band.
5. Continuous estimate có thể lưu nội bộ, UI dùng whole/half-band và confidence/coverage có ý nghĩa. Không tạo “official descriptor 6.5” nếu nguồn chỉ công bố whole-band descriptors.
6. CEFR chỉ là reference ước lượng, không có ánh xạ IELTS ↔ CEFR tuyệt đối một-một.
7. Placement 15 câu grammar/vocabulary trong P là quick baseline ngôn ngữ. R đề xuất quick L/R khoảng 12–18 câu mỗi skill và deep assessment đầy đủ hơn. Phải ghi rõ phiên nào đang làm và phạm vi đánh giá, không đánh đồng hai kiểu này.
8. Cho hai người học, ưu tiên Rasch/1PL hoặc heuristic/Bayesian update có công bố giới hạn. Item difficulty ban đầu là authored/expert/AI estimate. Không tuyên bố psychometric calibration từ mẫu hai người.
9. Chọn câu gần năng lực, bảo đảm diversity kỹ năng/dạng bài/chủ đề, tránh item vừa xem và có stopping/max-count rõ ràng. Ngưỡng SEM và số câu của R là tham số sản phẩm cần pilot, không phải quy định IELTS.
10. Theo dõi skill, subskill và error patterns song song; recent unseen attempts đáng tin hơn các lượt luyện lại đã biết đáp án. Không tạo dự đoán ngày đạt band như lời đảm bảo.

## Yêu cầu học liệu phong phú

Học liệu phải nguyên bản, có nhiều chủ đề thực tế như giáo dục, môi trường, công nghệ, giao thông, sức khỏe, công việc, du lịch, nghệ thuật và đời sống. Diversity phải tồn tại ở nội dung, question type, difficulty và register; đổi tên/ID của cùng passage không tạo thành bài mới.

Lexical target là một nghĩa cụ thể, có lemma/sense, loại từ, nghĩa Việt, định nghĩa Anh, register, collocations, word family, pronunciation hint, ít nhất hai ví dụ tự nhiên và lỗi thường gặp của người Việt. Vocabulary không cần dùng từ hiếm để tạo cảm giác advanced.

R, tr. 6 đưa mục tiêu **thư viện trưởng thành**, không phải số lượng tối thiểu của bản đầu:

| Band | Lexical targets | Listening clips | Reading passages | Writing tasks | Speaking sets |
| ---- | --------------: | --------------: | ---------------: | ------------: | ------------: |
| 3.0  |             450 |              40 |               30 |            30 |            45 |
| 4.0  |             550 |              50 |               40 |            40 |            55 |
| 5.0  |             650 |              60 |               50 |            50 |            65 |
| 6.0  |             750 |              70 |               60 |            60 |            75 |
| 7.0  |             850 |              80 |               70 |            70 |            85 |
| Tổng |           3.250 |             300 |              250 |           250 |           325 |

R, tr. 20 nói rõ không phải đợi có 300 listening clips mới launch. Bản triển khai cần công bố số lượng seed **thực tế đã sinh và kiểm tra**, cung cấp đường mở rộng có validation, và không quảng cáo volume đích trên như volume hiện có.

Mỗi content item nên có topic, target band, test type, part/task, duration, lexical targets, question types, difficulty reason, version và QA status. Audio có speaker/voice/accent/source metadata. AI-generated content phải qua schema validation, answerability/evidence checks, difficulty checks và critic khi có provider. Full mock/placement anchors/rubric exemplars cần human review trước khi tuyên bố calibrated hoặc examiner-reviewed; tính năng reviewer không đồng nghĩa một chuyên gia đã thực hiện review.

## Persistence và bảo vệ dữ liệu với MongoDB

Các collection hoặc embedded documents tương đương cần bao phủ users/sessions, profiles, content/question bank, attempts/responses, rubric feedback, skill/subskill estimates, error events, vocabulary/progress, study plans/tasks và audio metadata.

- Bản ghi riêng có `userId` từ session đã xác thực; không tin `userId` do client gửi. Mọi find/update/delete phải gắn owner ở server, gồm draft, attempt, flashcard và recordings.
- Content bank dùng chung không làm lộ answer keys trước khi nộp trong Exam/placement. CRUD học liệu cần quyền admin hoặc chức năng generation được kiểm soát.
- Hash mật khẩu, session expiry, HttpOnly cookies và giới hạn tốc độ auth; secrets bên server. Không seed mock keys trông như API key thật vào code/client.
- Recording là dữ liệu riêng, không đưa vào static public assets. Lưu MongoDB/GridFS hoặc storage riêng có endpoint kiểm tra owner.
- Checkpoint answers, drafts, timer/deadline và audio progress cho resume sau reload/đổi thiết bị; Exam timer dùng thời gian server/deadline để tránh reset qua client.
- Dashboard và history đọc dữ liệu đã lưu thực tế. Tài khoản mới bắt đầu không có attempt hoặc trend giả.
- Logout và đổi tài khoản không để state của người trước tồn tại trong view người sau. Báo trạng thái database sẵn sàng/thất bại rõ ràng; không im lặng chuyển sang persistence khác rồi vẫn gọi là MongoDB.

## Điều kiện bên ngoài cho AI hoạt động thật

Các luồng dưới cần tài khoản, credentials và quota tương ứng. Có mã tích hợp hoặc lựa chọn model không chứng minh API live đã chạy thành công.

| Luồng                                      | Điều kiện cần                                                                   | Hành vi khi thiếu                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Sinh content/critic/planner và Writing AES | API key LLM phía server, model được nhà cung cấp cho phép; kiểm tra JSON/schema | Dùng ngân hàng authored đã có; Writing giữ metrics và `score: null`, nêu chưa có chấm AI        |
| STT Speaking                               | OpenAI Whisper hoặc STT provider tương đương; audio đúng format/size            | Giữ bản ghi hoặc cho nhập transcript để tự luyện; không gọi transcript nhập tay là STT          |
| Listening multi-voice                      | ElevenLabs hoặc TTS provider tương đương, voice IDs hợp lệ/quota                | Browser TTS có thể dùng cho luyện mẫu nếu ghi đúng nguồn; không giả giọng/accent đã kiểm định   |
| Pronunciation                              | Azure Speech/SpeechSuper hoặc acoustic provider tương đương, region/key nếu cần | Pronunciation estimate chưa có; không bịa phoneme score hoặc toàn Speaking band từ transcript   |
| Production database                        | MongoDB instance/Atlas URI có quyền và mạng kết nối phù hợp                     | Startup/health thể hiện lỗi; local development có thể dùng MongoDB thật cục bộ được cấu hình rõ |

Không hard-code model có tên chỉ vì PDF đề xuất tên đó; nhà cung cấp/model ID phải configurable và live validation phải báo theo bằng chứng thực tế. Provider timeout, invalid JSON và lỗi quota phải trả lỗi có thể thử lại, giữ draft và không nhân đôi lịch sử khi retry.

## Tiêu chí bàn giao

1. Build React và Node.js, TypeScript/validation rõ ràng; không có `any` tùy tiện.
2. Một đường chạy development và một đường production được hướng dẫn, có `.env.example` dùng giá trị trống cho credentials.
3. Seed idempotent cho MongoDB, số lượng/dạng content có thể kiểm tra bằng script; không ghi đè tiến độ người học khi seed lại.
4. Kiểm tra auth ownership, persistence, scoring/rounding, placement adaptation, FSRS scheduling, timer/resume và các lỗi provider quan trọng.
5. Kiểm tra luồng học thực tế trên desktop/mobile; nộp bài rồi dashboard/history/error notebook thay đổi đúng tài khoản.
6. README báo rành mạch chức năng chạy với authored content, tích hợp cần credentials, các phần chưa được chuyên gia hiệu chuẩn và kết quả kiểm tra thực tế.
7. Nếu có preview riêng, ghi rõ dữ liệu/browser/local/demo và trạng thái AI, không quảng cáo link chưa kiểm tra như production deployment.
