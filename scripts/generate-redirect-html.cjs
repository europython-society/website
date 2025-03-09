const fs = require("fs");
const path = require("path");
const redirects = require("../src/data/redirects.json");

const GENERATED_DIR = path.join(__dirname, "../generated");

// make sure the generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript">
    (function() {
      const redirects = ${JSON.stringify(redirects.redirects)};
      const urlParams = new URLSearchParams(window.location.search);
      const requestedPath = urlParams.get("path") || window.location.pathname;
      const destination = redirects[requestedPath];

      if (destination) {
        window.location.replace(destination);
      } else {
        window.location.replace("/");
      }
    })();
  </script>
</head>
<body></body>
</html>`;

fs.writeFileSync(path.join(GENERATED_DIR, "redirect.html"), htmlContent, "utf-8");
console.log("✅ redirect.html generated successfully!");
