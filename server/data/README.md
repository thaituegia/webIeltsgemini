# Ngân hàng học liệu authored v1

Các văn bản, số liệu, hội thoại và ví dụ được biên soạn cho dự án. Địa danh, dự án và số liệu trong case studies là hư cấu phục vụ luyện tập; không phải bản tin nghiên cứu thực tế. Không sử dụng ngân hàng Cambridge hay đề IELTS chính thức.

Kết quả kiểm tra `tsx scripts/audit-content.ts`:

| Kỹ năng   | Lessons | Full mocks |
| --------- | ------: | ---------: |
| Reading   |      48 |          8 |
| Listening |      48 |          8 |
| Writing   |      24 |          4 |
| Speaking  |      24 |          4 |
| Grammar   |      16 |          0 |
| Tổng      |     160 |         24 |

Có 216 mục từ ở cấp nghĩa, 192 placement items (96 Reading và 96 Listening), 12 chủ đề và bốn mức CEFR A2/B1/B2/C1. Riêng lessons chứa 208 section texts khác nhau. Đây là số lượng bản ghi/học liệu của phiên bản này, không phải số lượng dạng bài độc lập hoặc số đề đã được hiệu chuẩn.

Reading dùng 48 case studies có vấn đề, phương pháp, nhóm người, kết quả và giới hạn khác nhau. Khung câu hỏi nhất quán giúp kiểm tra trực tiếp detail, inference, contradiction, absence of evidence và author position. Listening dùng hội thoại có ngày/giá được sửa, thông tin được nhắc rồi phủ định, và phương pháp cũ được đối chiếu với phương pháp mới. Full Listening forms có social dialogue, public monologue, academic workshop discussion và lecture.

Full mocks tái sử dụng các case facts của lesson sections, có source IDs trong tags/instructions. Reading mock passages bổ sung các background modules nguyên bản riêng theo 12 chủ đề, xen giữa các đoạn case để tạo workload dài hơn; context-source IDs chỉ rõ phần context được reuse giữa các forms. Các drills ngắn vẫn giữ nguyên. Academic forms dài 2.551–2.592 từ; GT forms dài 2.391–2.430 từ, có phần thông tin thực hành/community, workplace briefing và phần phân tích cuối dài hơn. Số từ này được audit trực tiếp, không phải mục tiêu chưa thực hiện. Các câu hỏi và keyed evidence vẫn bám vào case facts; background cung cấp bối cảnh đọc chứ không bổ sung sở thích hay dữ liệu riêng của participants. Các form Reading/Listening có 40 câu với cấu trúc lần lượt ba/bốn phần; Writing có đủ hai tasks; Speaking có đủ ba parts. Một full mock không đại diện cho một bộ passages hoàn toàn chưa từng xuất hiện trong thư viện.

Placement dùng các short-scenario template families với distractors và dữ liệu khác nhau, không phải 192 dạng câu hỏi độc lập. Difficulty được gán ban đầu bằng `(band - 5) × 1.2`; chưa có dữ liệu thử nghiệm để chứng minh hiệu chuẩn Rasch. CEFR và band của học liệu là chỉ định biên soạn, không phải ánh xạ IELTS–CEFR tuyệt đối.

Vocabulary có nghĩa Việt, định nghĩa Anh, IPA, ít nhất hai collocations và hai ví dụ, word family, lỗi thường gặp, synonyms và register. Liên kết vocabulary của bài ưu tiên từ xuất hiện trong text, sau đó là từ cùng chủ đề/mức độ; không phải mọi target liên kết đều xuất hiện nguyên dạng trong passage.

Audit kiểm tra cấu trúc, ID, đáp án trong options, giới hạn từ, evidence spans, mâu thuẫn T/F/NG, cấu trúc mock, số từ workload Reading và provenance. Tất cả học liệu vẫn mang `source: authored`, `quality: authored-unreviewed`. Kiểm tra tự động không thay thế chuyên gia rà soát độ tự nhiên, độ khó, độ dài, distractors, hoặc hiệu chuẩn điểm thi.
