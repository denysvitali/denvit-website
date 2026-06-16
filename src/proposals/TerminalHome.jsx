import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import "./terminal.css";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const lines = [
  { type: "command", text: "whoami" },
  { type: "output", text: "Denys Vitali" },
  {
    type: "output",
    text: "Software systems, reverse engineering, Go, Kubernetes, security, automation.",
  },
  { type: "command", text: "open https://blog.denv.it" },
  {
    type: "link",
    text: "https://blog.denv.it",
    href: "https://blog.denv.it",
    label: "Open blog",
  },
  { type: "command", text: "ls -la ~/social" },
  {
    type: "table",
    rows: [
      { perms: "drwxr-xr-x", name: "GitHub", href: "https://github.com/denysvitali" },
      { perms: "drwxr-xr-x", name: "LinkedIn", href: "https://www.linkedin.com/in/denysvitali" },
      { perms: "drwxr-xr-x", name: "Telegram", href: "https://t.me/denvit" },
      { perms: "drwxr-xr-x", name: "Instagram", href: "https://instagram.com/denvit" },
      { perms: "drwxr-xr-x", name: "Twitter", href: "https://twitter.com/DenysVitali" },
    ],
  },
];

export default function TerminalHome() {
  const [visibleCount, setVisibleCount] = useState(
    prefersReducedMotion ? lines.length : 0
  );
  const [showCursor, setShowCursor] = useState(true);
  const [typingLine, setTypingLine] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let cancelled = false;
    const t = timeoutsRef.current;

    const delay = (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        t.push(id);
      });

    const run = async () => {
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        const line = lines[i];

        if (line.type === "command" || line.type === "link") {
          setTypingLine(i);
          setTypedText("");
          const text = line.type === "command" ? `$ ${line.text}` : line.text;
          for (let j = 0; j <= text.length; j++) {
            if (cancelled) return;
            setTypedText(text.slice(0, j));
            await delay(35);
          }
          setTypingLine(-1);
          setVisibleCount((c) => c + 1);
          await delay(400);
        } else if (line.type === "output" || line.type === "table") {
          setVisibleCount((c) => c + 1);
          await delay(300);
        }
      }
    };

    run();

    const cursorInterval = setInterval(() => {
      setShowCursor((s) => !s);
    }, 530);

    return () => {
      cancelled = true;
      t.forEach(clearTimeout);
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount, typedText]);

  const renderLine = (line, index) => {
    const isTyping = typingLine === index;
    const isVisible = index < visibleCount;

    if (!isVisible && !isTyping) return null;

    const key = `line-${index}`;

    if (line.type === "command") {
      return (
        <div key={key} className="term-line term-command">
          <span className="term-prompt" aria-hidden="true">
            $
          </span>{" "}
          <span className="term-command-text">
            {isTyping ? typedText : line.text}
          </span>
          {isTyping && (
            <span
              className={showCursor ? "term-cursor" : "term-cursor term-cursor-off"}
              aria-hidden="true"
            />
          )}
        </div>
      );
    }

    if (line.type === "output") {
      return (
        <div key={key} className="term-line term-output">
          {line.text}
        </div>
      );
    }

    if (line.type === "link") {
      return (
        <div key={key} className="term-line term-link-line">
          <a
            href={line.href}
            className="term-link"
            aria-label={line.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isTyping ? typedText : line.text}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          {isTyping && (
            <span
              className={showCursor ? "term-cursor" : "term-cursor term-cursor-off"}
              aria-hidden="true"
            />
          )}
        </div>
      );
    }

    if (line.type === "table") {
      return (
        <div key={key} className="term-table">
          {line.rows.map((row, ri) => (
            <a
              key={ri}
              href={row.href}
              className="term-table-row"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${row.name}`}
            >
              <span className="term-perms">{row.perms}</span>
              <span className="term-user">denvit</span>
              <span className="term-group">denvit</span>
              <span className="term-size">--</span>
              <span className="term-date">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              <span className="term-name">{row.name}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <main className="term-shell" aria-label="Terminal boot sequence">
      <div className="term-crt" aria-hidden="true" />
      <div className="term-scanlines" aria-hidden="true" />
      <div className="term-screen" ref={containerRef}>
        <div className="term-content">
          {lines.map((line, i) => renderLine(line, i))}
          {visibleCount >= lines.length && (
            <div className="term-line">
              <span className="term-prompt" aria-hidden="true">
                $
              </span>{" "}
              <span
                className={showCursor ? "term-cursor" : "term-cursor term-cursor-off"}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
