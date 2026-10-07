# Supabase cho nhóm hai học viên

1. Tạo một Supabase project riêng cho hai học viên. Trong SQL Editor, chạy toàn bộ [migration](migrations/202610070001_ielts_learning.sql) **một lần**. Migration tạo hồ sơ, lịch sử, thẻ FSRS, bản lưu trạng thái và chính sách RLS; không thay thế `auth.users` có sẵn.
2. Đặt `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong biến môi trường **Node.js server**. Dùng anon JWT hoặc publishable key; module chủ động từ chối service-role/secret key. Không thêm tiền tố `VITE_` cho các biến này. Giữ `SESSION_SECRET` riêng, tối thiểu 32 ký tự ở production.
3. Trong Authentication → URL Configuration, đặt Site URL thành địa chỉ website. Cấu hình SMTP và xác nhận email theo nhu cầu. Khi xác nhận email đang bật, người dùng phải mở liên kết xác nhận rồi đăng nhập bằng email/mật khẩu; đăng ký chưa xác nhận sẽ không tạo phiên ứng dụng.
4. Khởi động lại Node.js server sau khi cập nhật biến môi trường. Đăng ký hai tài khoản và kiểm tra mỗi tài khoản chỉ thấy lịch sử của mình. Demo vẫn lưu cục bộ và không chiếm suất Supabase.

Trigger giới hạn **toàn bộ tài khoản trong `auth.users` ở hai người**, kể cả tài khoản chưa xác nhận email. Nếu cần bỏ một đăng ký lỗi, quản trị viên xóa người dùng đó trong Authentication. Các bảng dữ liệu tự xóa liên quan qua khóa ngoại. Dùng project riêng, vì trigger cũng áp dụng cho lời mời, OAuth và người dùng được tạo từ dashboard.

Mọi truy vấn ứng dụng dùng public key kèm JWT của người học. Hàm `save_learner_state` chạy `SECURITY INVOKER` và lưu trạng thái, hồ sơ, lịch sử, thẻ FSRS trong cùng một giao dịch. `retrievability` trong bảng là giá trị do `ts-fsrs` tính tại lần lưu gần nhất; giao diện tính lại khả năng nhớ hiện tại. Các bảng mirror hỗ trợ truy vấn báo cáo; frontend hiện lấy cập nhật qua API Node.js.

Realtime là tùy chọn: có thể bật cho `user_profiles`, `test_history`, `fsrs_cards` trong dashboard; RLS vẫn áp dụng. Không bật Realtime cho `learner_state`, vì bản lưu nội bộ chứa đáp án bài tập.

Chỉ cấu hình hai biến không chứng minh Supabase đã sẵn sàng. Cần kiểm tra kết nối, xác nhận email, migration và đăng nhập thực tế với project của bạn. Không lưu khóa hoặc JWT trong Git.
