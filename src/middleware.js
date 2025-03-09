import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import redirects from "../src/data/redirects.json" assert { type: "json" };

export function onRequest(context, next) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const generatedDir = path.join(__dirname, "../generated");

  const requestPath = context.url.pathname.replace(/\/$/, "");
  if (redirects.redirects[requestPath]) {
    const redirectPath = path.join(generatedDir, requestPath, "index.html");

    if (fs.existsSync(redirectPath)) {
      const fileContents = fs.readFileSync(redirectPath, "utf-8");
      return new Response(fileContents, {
        headers: { "Content-Type": "text/html" },
      });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }

  return next();
}
