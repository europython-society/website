import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { h } from "hastscript";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import metaTags from "astro-meta-tags";
import publicDir from 'astro-public';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [
      [
        remarkToc,
        {
          heading: "contents",
        },
      ],
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          content() {
            return [h("span.heading-link", "#")];
          },
        },
      ],
    ],
  },
  site: "https://ep2025.europython.eu",
  integrations: [
    mdx(),
    sitemap(),
    react(),
    tailwind({
      nesting: true,
    }),
    metaTags(),
    publicDir("generated/"),
  ],
  output: "static",
  middleware: "src/middleware.js",
});
