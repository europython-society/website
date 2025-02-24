import { findAfter } from "unist-util-find-after";
import { visitParents } from "unist-util-visit-parents";
import { is } from "unist-util-is";

// @ts-ignore
import type { Node, Parent } from "unist";
import type { Heading } from "mdast";
import { matches } from "unist-util-select";

const isMainHeading = (node: Node): node is Heading => {
  return is(node, { type: "heading" }) && (node as Heading).depth === 2;
};

export function wrapInArticles() {
  return transform;
}

const hasOnlyOneImage = (node: Node): node is Parent => {
  return (
    matches("paragraph", node as any) &&
    (node as Parent).children.length == 1 &&
    matches("image", (node as any).children[0])
  );
};

const shouldNotWrap = (node: Node) => {
  if (is(node, { type: "jsx" })) {
    // @ts-ignore
    const value = node.value;
    if (
      value.startsWith("<BenefitsList>") ||
      value.startsWith("<SponsorTiers />") ||
      value.startsWith("<Note>")
    ) {
      return true;
    }
  }

  return false;
};

function transform(tree: Node) {
  const children = [];
  let currentArticle = null;
  let totalArticles = 0;

  for (let i = 0; i < (tree as Parent).children.length; i++) {
    const child = (tree as Parent).children[i];

    if (matches("thematicBreak", child as any) || shouldNotWrap(child)) {
      currentArticle = null;
      children.push(child);
    } else if (hasOnlyOneImage(child)) {
      currentArticle = null;
      children.push(child.children[0]);
    } else if (
      !currentArticle ||
      isMainHeading(child) ||
      shouldNotWrap(child)
    ) {
      currentArticle = {
        type: "section",
        children: [] as Node[],
        data: {
          hName: "article",
          hProperties: {
            className: totalArticles % 2 === 0 ? "accent-left" : "accent-right",
          },
        },
      };
      totalArticles += 1;
      children.push(currentArticle);
    }

    if (currentArticle) {
      currentArticle.children.push(child);
    }
  }

  (tree as Parent).children = children;
}
