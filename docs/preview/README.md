# IELTS Compass — bản preview tương tác

Tải `index.html` và mở bằng Chrome, Edge hoặc Firefox. Không cần Node.js hay máy chủ. Chọn **Học viên 01** hoặc **Học viên 02** để xem giao diện và thử bài mẫu.

Bản preview sử dụng giao diện React của ứng dụng và logic chấm Reading/Listening, kiểm tra đầu vào thích ứng, lịch ôn FSRS trong mã nguồn. Bạn có thể luyện bài, thêm từ và xem lịch sử riêng cho hai hồ sơ. Dữ liệu lưu trong trình duyệt trên thiết bị đang dùng; xóa dữ liệu trình duyệt sẽ xóa lịch sử preview. Đây không phải tài khoản thật và không đồng bộ với máy chủ.

Các dịch vụ AI không được kết nối trong bản preview. Writing/Speaking chỉ trả nhận xét cục bộ và không cấp band AI. Listening dùng giọng đọc có sẵn của trình duyệt khi được hỗ trợ. Ghi âm và chuyển lời nói thành văn bản tùy thuộc quyền và khả năng của trình duyệt; Whisper, Azure và ElevenLabs cần ứng dụng đầy đủ với API key phía máy chủ.

Tạo lại file từ mã nguồn:

```sh
npm ci
npm run build:preview
```

Ứng dụng đầy đủ với React + Node.js vẫn chạy bằng `npm run dev`; xem README ở thư mục gốc để cấu hình.
