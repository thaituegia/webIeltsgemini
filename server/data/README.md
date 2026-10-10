# Ngân hàng đang dùng: fresh-20261011

Seed runtime chỉ import các tệp `fresh/`: 270 bài luyện, 36 đề mô phỏng, 216 mục từ và 160 câu placement mới. Bộ trước được chuyển sang `previous-bank.ts` làm fixture lịch sử và đầu vào sàng lọc trùng lặp; app không seed bộ đó. Xem [quy trình reset](../../docs/bank-reset.md) và [README](../../README.md) cho số lượng/kiểm tra hiện hành. Dữ liệu cũ trong database được thay bằng công cụ backup/reset riêng theo yêu cầu người dùng, không bằng seed thường.

```sh
npm run audit:content
npm run audit:fresh
```

Các đoạn dưới là tài liệu lịch sử v3, không mô tả seed hiện hành.

## Lịch sử ngân hàng học liệu IELTS v3

Phần mở rộng dựa trên danh mục trong `Tong_hop_cac_dang_bai_IELTS.docx`, được AI biên soạn trực tiếp thành dữ liệu của dự án. Không cần API key để seed bộ học liệu này. Địa danh, nhân vật, dự án và số liệu là hư cấu phục vụ luyện tập; không phải báo cáo nghiên cứu thực tế hoặc đề IELTS chính thức.

| Kỹ năng | Bài cũ | Thêm bài | Tổng bài | Đề cũ | Thêm đề | Tổng đề |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reading | 48 | 96 | 144 | 8 | 16 | 24 |
| Listening | 48 | 96 | 144 | 8 | 16 | 24 |
| Writing | 24 | 48 | 72 | 4 | 8 | 12 |
| Speaking | 24 | 48 | 72 | 4 | 8 | 12 |
| Grammar | 16 | 32 | 48 | 0 | 0 | 0 |
| Tổng | 160 | 320 | 480 | 24 | 48 | 72 |

Vocabulary: giữ 216, thêm 432, tổng 648 mục từ. Placement: giữ 192, thêm 384, tổng 576 câu; Reading/Listening và bốn mức CEFR cân bằng trong phần mới. Các ID cũ và liên kết vocabulary của bài cũ được giữ lại. Seed chỉ upsert ba collection học liệu, không xóa tài khoản, attempts, flashcards, placement sessions, kế hoạch hoặc recordings.

## Dạng bài và cấu trúc

- **Listening:** multiple choice một/nhiều đáp án, matching, map/plan/diagram labelling; form/note/table/flow-chart/summary completion; sentence completion; short answer. Đề mới có 4 Parts × 10 câu, 30 phút. Part 1 là hội thoại đời sống, Part 2 độc thoại xã hội, Part 3 trao đổi học thuật, Part 4 bài giảng. Mỗi lời thoại full-mock có 650–850 từ thực sự được nói, không tính tên người nói.
- **Reading:** đủ 14 biến thể trong tài liệu. Bài luyện có khung bài tập hỗn hợp để luyện các kỹ năng; đề mới tổ chức câu hỏi thành các nhóm liên tiếp, 3 bài đọc, 40 câu, 60 phút. Academic và General Training đều có 2.150–2.750 từ/đề; phần cuối General dài hơn hai phần trước. Các đoạn đề mới được viết riêng và không lấy lại từ bài luyện.
- **Writing:** Task 1 có line/bar/pie/table/map/process/mixed, cùng thư General; Task 2 có opinion/discussion/advantages-disadvantages/problems-solutions/causes-effects/two-part. Task 1 yêu cầu ít nhất 150 từ; Task 2 ít nhất 250 từ. Mỗi đề có hai tasks trong 60 phút; bộ chấm vẫn áp dụng trọng số Task 2 gấp đôi.
- **Speaking:** mỗi bộ mới gồm 6 câu Part 1, cue card 4 ý Part 2, 6 câu Part 3; đề mô phỏng gồm cả ba phần. Các hướng luyện phát âm, short answer, follow-up và lập luận phục vụ practice. Điểm phát âm cần bằng chứng âm thanh; transcript riêng không đủ.

Biểu đồ lưu rows/series/unit. Map/plan/diagram lưu tọa độ, hình vùng, đường đi và nhãn; process lưu nodes/connections. Chỗ trống được tham chiếu bằng số câu thực. Không lưu SVG/HTML tùy ý hoặc giấu đáp án trong alt text của hình. Câu chọn nhiều có một nhóm lựa chọn chung nhưng một hàng đáp án cho mỗi số câu; kết quả vẫn tối đa 40 điểm thô ở đề receptive.

## Nguồn và giới hạn

Học liệu cũ giữ `authored` / `authored-unreviewed`. Phần v3 dùng `ai` / `ai-unreviewed`, với provenance, mục tiêu học, nhóm lỗi và mức khó ước lượng. `structural-checks-passed` chỉ mô tả những kiểm tra cấu trúc được liệt kê; không có tuyên bố đã được giám khảo hoặc chuyên gia duyệt. Các kiểm tra máy không chứng minh độ khó đã hiệu chuẩn, mọi distractor đều tối ưu hoặc mọi cách diễn đạt đều hoàn hảo.

Các **đề cũ** vẫn có section-source/context-source để công bố việc ghép lại bài luyện và các đoạn bối cảnh. Chỉ phần mở rộng được yêu cầu dùng nguồn độc lập. Giữ lại những records này giúp lịch sử học tiếp tục hoạt động; không được đổi nhãn của đề cũ thành nguồn độc lập mới.

Difficulty của placement ban đầu được gán `(band - 5) × 1.2`, chưa được hiệu chuẩn Rasch từ kết quả thí sinh. CEFR/band của bài học là chỉ định biên soạn và không phải ánh xạ tuyệt đối. Accent metadata mô tả hướng tạo audio, không chứng minh accent thực tế của giọng TTS trình duyệt.

## Kiểm tra và cập nhật

```bash
npm run audit:content
npm run audit:expansion
npm run test
npm run build
npm run seed
```

Audit v3 kiểm tra đủ số lượng, ID/keys/options/limits, nguồn evidence, visual/blank references, các dạng bài, bố cục đề và chấm toàn bộ đáp án đúng. Nó so sánh section mới với cả cũ và mới, đồng thời phát hiện nguồn Reading/Listening có quá 55% trùng chuỗi 5 từ trên văn bản ngắn hơn. Đây là phép sàng lọc độ trùng văn bản; nó không chứng minh rằng không còn tương đồng ngữ nghĩa.

Để lưu báo cáo máy đọc được: `npm run audit:expansion -- --report .local/reports/content-v3-audit.json`. Báo cáo gồm số lượng theo kỹ năng, độ phủ dạng bài, workload từng đề, các lỗi và giới hạn của phép kiểm tra. Chỉ seed/publish sau khi các kiểm tra đạt.
