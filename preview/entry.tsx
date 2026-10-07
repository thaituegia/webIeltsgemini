import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "../client/App";
import "../client/styles.css";
import "./preview.css";
import { installPreviewApi } from "./api";

installPreviewApi();
document.body.classList.add("preview-page");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="preview-banner" role="status">
      <strong>BẢN PREVIEW</strong>
      <span>
        Chọn Học viên 01 / 02 để khám phá · Dữ liệu lưu trong trình duyệt · AI
        chưa kết nối
      </span>
    </div>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
