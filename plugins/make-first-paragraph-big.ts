import { select } from "unist-util-select";
// @ts-ignore
import type { Node } from "unist";

export function makeFirstParagraphBig() {
  return transform;
}

function transform(tree: Node) {
  const paragraph = select("heading + paragraph", tree as any);

  if (paragraph) {
    paragraph.data = paragraph.data || {};
    paragraph.data.hProperties = paragraph.data.hProperties || {};
    (paragraph.data.hProperties as any).className = "large";
  }
}
