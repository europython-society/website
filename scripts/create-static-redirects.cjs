const fs = require("fs");
const path = require("path");
const redirects = require("../src/data/redirects.json");

const GENERATED_DIR = path.join(__dirname, "../generated");

// make sure the generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// create a redirect.html file in the generated directory
Object.keys(redirects.redirects).forEach((route) => {
  const outputDir = path.join(GENERATED_DIR, route);
  const outputFile = path.join(outputDir, "index.html");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=/redirect.html?path=${route}" />
</head>
<body></body>
</html>`;

  fs.writeFileSync(outputFile, htmlContent, "utf-8");
  console.log(`✅ Redirect for ${route} created.`);
});
