import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ROLE_LABELS } from "./MessageBubble.constants";
import type { MessageBubbleProps } from "./MessageBubble.types";
import styles from "./MessageBubble.module.css";

type CodeBlockProps = {
  className?: string;
  children?: ReactNode;
};

function formatJson(code: string) {
  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch {
    return code;
  }
}

function formatOneLineCode(code: string) {
  const lines = code
    .replace(/;\s*/g, ";\n")
    .replace(/\{\s*/g, "{\n")
    .replace(/\}\s*/g, "\n}\n")
    .replace(/\)\s*\./g, ")\n.")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let indent = 0;

  return lines
    .map((line) => {
      if (line.startsWith("}")) {
        indent = Math.max(indent - 1, 0);
      }

      const current = `${"  ".repeat(indent)}${line}`;

      if (line.endsWith("{") && !line.startsWith("}")) {
        indent += 1;
      }

      return current;
    })
    .join("\n");
}

function normalizeLanguage(language: string) {
  return language.trim().toLowerCase();
}

function extractCodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    const parts = node.map(extractCodeText);
    const joined = parts.join("");

    // Some Markdown renderers may split code into parts without explicit newlines.
    // If that happens, preserve line intent by joining with "\n".
    if (!joined.includes("\n") && parts.length > 1) {
      return parts.join("\n");
    }

    return joined;
  }

  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return extractCodeText(props.children);
  }

  return "";
}

function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language =
    className?.replace("language-", "").trim() || "text";
  const rawCode = extractCodeText(children).replace(/\n$/, "");
  const normalizedLanguage = normalizeLanguage(language);
  const code = rawCode.includes("\n")
    ? rawCode
    : normalizedLanguage === "json"
      ? formatJson(rawCode)
      : formatOneLineCode(rawCode);

  const codeLines = code.split("\n");

  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_CODEBLOCKS === "true") {
    console.log("[zenai][codeblock]", {
      language,
      length: code.length,
      lines: code.split("\n").length,
      hasNewlines: code.includes("\n"),
      preview: code.slice(0, 160),
    });
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLanguage}>{language}</span>
        <button
          className={styles.codeCopyButton}
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <div className={styles.preformatted}>
        <pre className={styles.codePre}>
          <code className={styles.codeContent}>
            {codeLines.map((line, index) => (
              <span key={index} className={styles.codeLine}>
                <span className={styles.codeLineNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.codeLineText}>{line.length ? line : " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className={styles.markdownParagraph}>{children}</p>
        ),
        ul: ({ children }) => (
          <ul className={styles.markdownList}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className={styles.markdownOrderedList}>{children}</ol>
        ),
        li: ({ children }) => (
          <li className={styles.markdownListItem}>{children}</li>
        ),
        a: ({ children, href }) => (
          <a
            className={styles.markdownLink}
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {children}
          </a>
        ),
        code: ({ children, className, ...props }) => {
          const isBlock = Boolean(className);

          if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
          }

          return (
            <code className={styles.inlineCode} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className={styles.tableWrapper}>
            <table className={styles.markdownTable}>{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className={styles.markdownTableHead}>{children}</th>
        ),
        td: ({ children }) => (
          <td className={styles.markdownTableCell}>{children}</td>
        ),
        blockquote: ({ children }) => (
          <blockquote className={styles.markdownBlockquote}>
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const rowClassName = [
    styles.row,
    isUser ? styles.userRow : styles.assistantRow,
  ].join(" ");

  const bubbleClassName = [
    styles.bubble,
    isUser ? styles.userBubble : styles.assistantBubble,
  ].join(" ");

  return (
    <div className={rowClassName}>
      <article className={bubbleClassName}>
        <div className={styles.meta}>{ROLE_LABELS[message.role]}</div>
        {isUser ? (
          <p className={styles.content}>{message.content}</p>
        ) : (
          <div className={styles.markdownContent}>
            <AssistantMarkdown content={message.content} />
          </div>
        )}
      </article>
    </div>
  );
}
