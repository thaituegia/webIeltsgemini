import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
await build({
  root: projectRoot,
  configFile: fileURLToPath(
    new URL("../vite.preview.config.ts", import.meta.url),
  ),
});
const [javascript, css] = await Promise.all([
  readFile(new URL("../.preview-build/preview.js", import.meta.url), "utf8"),
  readFile(new URL("../.preview-build/preview.css", import.meta.url), "utf8"),
]);
const output = new URL("../docs/preview/index.html", import.meta.url);
const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Preview tương tác IELTS Compass: bài mẫu, kiểm tra đầu vào, luyện 4 kỹ năng và từ vựng. Dữ liệu chỉ lưu trong trình duyệt." />
  <title>IELTS Compass — Preview</title>
  <style>${css.replace(/<\/style/gi, "<\\/style")}</style>
</head>
<body>
  <div id="root"></div>
  <noscript>Vui lòng bật JavaScript để xem bản preview IELTS Compass.</noscript>
  <script>${javascript.replace(/<\/script/gi, "<\\/script")}</script>
</body>
</html>
`;
await mkdir(new URL("../docs/preview/", import.meta.url), { recursive: true });
await writeFile(output, html);
console.log(
  `Standalone preview: ${fileURLToPath(output)} (${Buffer.byteLength(html)} bytes)`,
);
