import { Fragment } from "react";

const TOKEN_SOURCE = String.raw`(\[[^\]]+\]\([^)]+\)|` + "`[^`]+`" + String.raw`|\*\*[^*]+\*\*|\*[^*]+\*|(?:[\w./-]+\.md)\b)`;

function safeHref(value, baseHref) {
  const href = String(value || "").trim();
  if (href.startsWith("/") || href.startsWith("#")) return href;

  if (!href.startsWith("//") && !/^[a-z][a-z\d+.-]*:/i.test(href)) {
    if (href.split("/").includes("..")) return "";
    try {
      const base = new URL(String(baseHref || ""));
      const path = href.replace(/^\.\//, "");
      if (base.hostname === "github.com") {
        return `${base.origin}${base.pathname.replace(/\/$/, "")}/blob/main/${path}`;
      }
      return new URL(path, `${base.href.replace(/\/$/, "")}/`).href;
    } catch {
      return href;
    }
  }

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function renderToken(token, key, baseHref) {
  if (token.startsWith("[") && token.includes("](")) {
    const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const href = safeHref(match?.[2], baseHref);
    if (!match || !href) return <Fragment key={key}>{token}</Fragment>;
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        key={key}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {renderInlineParts(match[1], `${key}-label`, baseHref)}
      </a>
    );
  }

  if (token.startsWith("`") && token.endsWith("`")) {
    const value = token.slice(1, -1);
    const className = /(?:^|[./-])[\w.-]+\.md$/i.test(value)
      ? "blog-inline-code blog-markdown-file"
      : "blog-inline-code";
    return <code className={className} key={key}>{value}</code>;
  }

  if (token.startsWith("**") && token.endsWith("**")) {
    return <strong key={key}>{renderInlineParts(token.slice(2, -2), `${key}-strong`, baseHref)}</strong>;
  }

  if (token.startsWith("*") && token.endsWith("*")) {
    return <em key={key}>{renderInlineParts(token.slice(1, -1), `${key}-em`, baseHref)}</em>;
  }

  if (/\.md$/i.test(token)) {
    return <code className="blog-markdown-file" key={key}>{token}</code>;
  }

  return <Fragment key={key}>{token}</Fragment>;
}

function renderInlineParts(value, keyPrefix = "inline", baseHref) {
  const text = String(value || "");
  const nodes = [];
  const tokenPattern = new RegExp(TOKEN_SOURCE, "gi");
  let cursor = 0;
  let match;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(<Fragment key={`${keyPrefix}-text-${cursor}`}>{text.slice(cursor, match.index)}</Fragment>);
    }
    nodes.push(renderToken(match[0], `${keyPrefix}-token-${match.index}`, baseHref));
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-text-${cursor}`}>{text.slice(cursor)}</Fragment>);
  }

  return nodes;
}

export default function BlogInlineText({ children, baseHref }) {
  return renderInlineParts(children, "inline", baseHref);
}
