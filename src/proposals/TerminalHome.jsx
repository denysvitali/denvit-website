import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink, Maximize2, Minus, X } from "lucide-react";
import {
  HOSTNAME,
  USER,
  defaultTheme,
  prefersReducedMotion,
  themes,
} from "./terminal/constants.js";
import {
  directories,
  entryNameClass,
  findDirectoryEntry,
  formatEntryName,
  isDirectory,
  isReadmePath,
  isSymlink,
  motdLines,
} from "./terminal/fs.js";
import { getCompletions, runCommand } from "./terminal/commands.js";
import { formatDeviceDate, getCwdPath, getPrompt } from "./terminal/utils.js";
import "./terminal.css";

const HISTORY_KEY = "denvit-terminal-history";
const THEME_KEY = "denvit-terminal-theme";

if (typeof window !== "undefined" && !window.__DENVIT_BOOT_TIME__) {
  window.__DENVIT_BOOT_TIME__ = Date.now();
}

const bootLines = [
  { type: "kernel", text: "[    0.000000] Linux version 6.8.0-browser-sandbox" },
  { type: "kernel", text: "[    0.000123] Command line: init=/bin/browser-sh quiet splash" },
  { type: "kernel", text: "[    0.000456] x86/cpu: VMX (outside TXT) disabled by BIOS" },
  { type: "kernel", text: "[    0.000789] browser-sh: mounting pseudo-root at /home/denvit" },
  ...motdLines.map((line) => ({ type: "motd", ...line })),
  { type: "output", text: "Type help to list supported sandbox commands." },
  { type: "command", text: "neofetch" },
  {
    type: "output",
    segments: [
      { text: "       _.---._", className: "term-r-fg" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "     .'       '.", className: "term-r-fg" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "    /   .   .   \\   ", className: "term-r-fg" },
      { text: `${USER}@${HOSTNAME}`, className: "term-r-bold term-r-blue" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "   |    \\___/    |  ", className: "term-r-fg" },
      { text: "----------------", className: "term-r-muted" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "    \\            /   ", className: "term-r-fg" },
      { text: "OS: BrowserOS 1.0", className: "term-r-fg" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "     '.        .'    ", className: "term-r-fg" },
      { text: "Shell: browser-sh", className: "term-r-fg" },
    ],
  },
  {
    type: "output",
    segments: [
      { text: "       `'---'`      ", className: "term-r-fg" },
      { text: "Theme: darcula", className: "term-r-fg" },
    ],
  },
  { type: "command", text: "ls" },
  { type: "names", items: directories.home.entries.filter((entry) => !entry.hidden) },
];

function loadHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-500)));
  } catch {
    // ignore quota errors
  }
}

function loadTheme() {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return themes[stored] ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function saveTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

function MatrixRain({ active, theme }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const dropsRef = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / 14);
      dropsRef.current = Array.from({ length: columns }, () =>
        Math.floor(Math.random() * -100)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const isLight = theme === "paperwhite";

    const draw = () => {
      ctx.fillStyle = isLight
        ? "rgba(245, 242, 232, 0.12)"
        : "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isLight ? "#1565c0" : "#33ff33";
      ctx.font = "14px monospace";

      dropsRef.current.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14;
        ctx.fillText(text, x, y * 14);

        if (y * 14 > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        } else {
          dropsRef.current[i] = y + 1;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, theme]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="term-matrix"
      aria-hidden="true"
    />
  );
}

export default function TerminalHome() {
  const [theme, setTheme] = useState(loadTheme);
  const [visibleCount, setVisibleCount] = useState(
    prefersReducedMotion ? bootLines.length : 0
  );
  const [showCursor, setShowCursor] = useState(true);
  const [typingLine, setTypingLine] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const [isReady, setIsReady] = useState(prefersReducedMotion);
  const [inputValue, setInputValue] = useState("");
  const [sessions, setSessions] = useState([]);
  const [commandHistory, setCommandHistory] = useState(loadHistory);
  const [historyIndex, setHistoryIndex] = useState(null);
  const [currentDir, setCurrentDir] = useState("home");
  const [autoCommand, setAutoCommand] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [completionIndex, setCompletionIndex] = useState(-1);
  const [matrixActive, setMatrixActive] = useState(false);
  const [statusTime, setStatusTime] = useState(formatDeviceDate(new Date()));
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionIdRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme];
    for (const [key, value] of Object.entries(vars)) {
      if (key !== "name" && key !== "label") {
        root.style.setProperty(key, value);
      }
    }
    saveTheme(theme);
  }, [theme]);

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
      for (let i = 0; i < bootLines.length; i++) {
        if (cancelled) return;
        const line = bootLines[i];

        if (line.type === "command" || line.type === "link") {
          setTypingLine(i);
          setTypedText("");
          for (let j = 0; j <= line.text.length; j++) {
            if (cancelled) return;
            setTypedText(line.text.slice(0, j));
            await delay(35);
          }
          setTypingLine(-1);
          setVisibleCount((c) => c + 1);
          await delay(400);
        } else if (
          line.type === "output" ||
          line.type === "motd" ||
          line.type === "kernel" ||
          line.type === "ls" ||
          line.type === "names"
        ) {
          setVisibleCount((c) => c + 1);
          await delay(220);
        }
      }

      setIsReady(true);
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
  }, [visibleCount, typedText, sessions, isReady, currentDir]);

  useEffect(() => {
    if (!autoCommand || !isReady) return;

    let cancelled = false;
    const t = timeoutsRef.current;

    const delay = (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        t.push(id);
      });

    const type = async () => {
      setInputValue("");
      for (let i = 0; i <= autoCommand.length; i++) {
        if (cancelled) return;
        setInputValue(autoCommand.slice(0, i));
        await delay(35);
      }
      if (cancelled) return;
      submitCommand(autoCommand);
      setAutoCommand(null);
    };

    type();

    return () => {
      cancelled = true;
    };
  }, [autoCommand, isReady]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusTime(formatDeviceDate(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    saveHistory(commandHistory);
  }, [commandHistory]);

  const focusInput = () => {
    if (isReady && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleShellClick = (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest("a, input, button, .term-titlebar")
    ) {
      return;
    }
    focusInput();
  };

  const applyCompletion = (completion) => {
    const trimmed = inputValue.trimStart();
    const parts = trimmed.split(/\s+/);

    if (parts.length <= 1) {
      setInputValue(completion + " ");
    } else {
      parts[parts.length - 1] = completion;
      setInputValue(parts.join(" ") + " ");
    }

    setCompletions([]);
    setCompletionIndex(-1);
    focusInput();
  };

  const submitCommand = (command) => {
    const normalized = command.trim().replace(/\s+/g, " ");
    if (!normalized) return;

    const nextHistory = [...commandHistory, normalized];

    setInputValue("");
    setHistoryIndex(null);
    setCompletions([]);
    setCompletionIndex(-1);
    setCommandHistory(nextHistory);

    if (normalized.toLowerCase() === "clear") {
      setSessions([]);
      return;
    }

    const { output, openHref, newDir, theme: newTheme, matrix, reboot, shutdown } =
      runCommand(normalized, {
        history: nextHistory,
        currentDir,
        theme,
        bootTime: window?.__DENVIT_BOOT_TIME__ || Date.now(),
      });

    if (newDir) setCurrentDir(newDir);
    if (newTheme) setTheme(newTheme);
    if (matrix) setMatrixActive((active) => !active);

    if (reboot) {
      setSessions([]);
      setVisibleCount(prefersReducedMotion ? bootLines.length : 0);
      setIsReady(prefersReducedMotion);
      setCurrentDir("home");
      if (!prefersReducedMotion) {
        setTimeout(() => window.location.reload(), 800);
      }
      return;
    }

    if (shutdown) {
      setMatrixActive(false);
    }

    setSessions((current) => [
      ...current,
      {
        id: sessionIdRef.current++,
        command: normalized,
        output,
      },
    ]);

    if (openHref && typeof window !== "undefined") {
      window.open(openHref, "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (completions.length > 0 && completionIndex >= 0) {
      applyCompletion(completions[completionIndex]);
      return;
    }
    submitCommand(inputValue);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (commandHistory.length === 0) return;

      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setInputValue(commandHistory[nextIndex]);
      setCompletions([]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (commandHistory.length === 0 || historyIndex === null) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInputValue("");
      } else {
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex]);
      }
      setCompletions([]);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      if (completions.length > 1) {
        const nextIndex = (completionIndex + 1) % completions.length;
        setCompletionIndex(nextIndex);
        const completion = completions[nextIndex];
        const trimmed = inputValue.trimStart();
        const parts = trimmed.split(/\s+/);
        if (parts.length <= 1) {
          setInputValue(completion + " ");
        } else {
          parts[parts.length - 1] = completion;
          setInputValue(parts.join(" ") + " ");
        }
        return;
      }

      const trimmed = inputValue.trimStart();
      const candidates = getCompletions(trimmed, currentDir);

      if (candidates.length === 0) return;

      if (candidates.length === 1) {
        applyCompletion(candidates[0]);
        return;
      }

      setCompletions(candidates);
      setCompletionIndex(0);
      const first = candidates[0];
      const parts = trimmed.split(/\s+/);
      if (parts.length <= 1) {
        setInputValue(first + " ");
      } else {
        parts[parts.length - 1] = first;
        setInputValue(parts.join(" ") + " ");
      }
      return;
    }

    if (event.key === "Escape") {
      setCompletions([]);
      setCompletionIndex(-1);
    }
  };

  const renderCursor = () => (
    <span
      className={showCursor ? "term-cursor" : "term-cursor term-cursor-off"}
      aria-hidden="true"
    />
  );

  const renderPrompt = () => {
    const prompt = getPrompt(currentDir);
    const [userHost, pathAndDollar] = prompt.split(":");
    const path = pathAndDollar.slice(0, -1);
    const dollar = pathAndDollar.slice(-1);

    return (
      <span className="term-prompt" aria-hidden="true">
        <span className="term-prompt-userhost">{userHost}</span>
        <span>:</span>
        <span className="term-prompt-path">{path}</span>
        <span>{dollar}</span>
      </span>
    );
  };

  const renderCommandLine = (command, key, isTyping = false) => (
    <div key={key} className="term-line term-command">
      {renderPrompt()} {" "}
      <span className="term-command-text">{command}</span>
      {isTyping && renderCursor()}
    </div>
  );

  const renderLsOutput = (line, key) => (
    <div key={key} className="term-ls" role="group" aria-label="ls output">
      {line.total && (
        <div className="term-line term-output">total {line.total}</div>
      )}
      {line.rows.map((row) => {
        const fileName = row.shortName || row.name;
        const onFileClick =
          !row.href && fileName
            ? () => setAutoCommand(`cat ${fileName}`)
            : undefined;

        const content = (
          <>
            <span className="term-perms">{row.mode}</span>
            <span className="term-links">{row.links}</span>
            <span className="term-user">{row.owner}</span>
            <span className="term-group">{row.group}</span>
            <span className="term-size">{row.size}</span>
            <span className="term-date">{row.date}</span>
            {onFileClick ? (
              <button
                type="button"
                className={`${entryNameClass(row)} term-ls-file`}
                onClick={onFileClick}
                aria-label={`Cat ${fileName}`}
              >
                {row.name}
              </button>
            ) : (
              <span className={entryNameClass(row)}>{row.name}</span>
            )}
            {row.href && <ExternalLink size={14} aria-hidden="true" />}
          </>
        );

        if (row.href) {
          return (
            <a
              key={row.name}
              href={row.href}
              className="term-ls-row term-ls-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${row.label}`}
            >
              {content}
            </a>
          );
        }

        return (
          <div key={row.name} className="term-ls-row">
            {content}
          </div>
        );
      })}
    </div>
  );

  const renderNames = (line, key) => (
    <div key={key} className="term-name-list">
      {line.items.map((item) => {
        const name = formatEntryName(item);
        const shortName = item.shortName || item.name.split(" -> ")[0];

        if (item.href) {
          return (
            <a
              key={item.name}
              href={item.href}
              className={`term-name-link ${isSymlink(item) ? "term-name-link-symlink" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${item.label}`}
            >
              {name}
            </a>
          );
        }

        if (isDirectory(item) && item.shortName !== "." && item.shortName !== "..") {
          return (
            <button
              key={item.name}
              type="button"
              className={entryNameClass(item)}
              onClick={() => setAutoCommand(`ls ${item.shortName}`)}
              aria-label={`List ${item.shortName} directory`}
            >
              {name}
            </button>
          );
        }

        if (shortName && shortName !== "." && shortName !== "..") {
          return (
            <button
              key={item.name}
              type="button"
              className={`${entryNameClass(item)} term-name-file`}
              onClick={() => {
                if (isReadmePath(shortName)) {
                  setAutoCommand(`cat ${shortName}`);
                } else {
                  setAutoCommand(`cat ${shortName}`);
                }
              }}
              aria-label={`Cat ${shortName}`}
            >
              {name}
            </button>
          );
        }

        return (
          <span key={item.name} className={entryNameClass(item)}>
            {name}
          </span>
        );
      })}
    </div>
  );

  const renderOutput = (line, key) => {
    if (line.type === "output") {
      if (Array.isArray(line.segments)) {
        return (
          <div key={key} className="term-line term-output">
            {line.segments.map((segment, index) =>
              segment.className ? (
                <span key={index} className={segment.className}>
                  {segment.text}
                </span>
              ) : (
                <span key={index}>{segment.text}</span>
              )
            )}
          </div>
        );
      }
      return (
        <div key={key} className="term-line term-output">
          {line.text}
        </div>
      );
    }

    if (line.type === "motd") {
      return (
        <div key={key} className={`term-line ${line.className}`}>
          {line.text}
        </div>
      );
    }

    if (line.type === "kernel") {
      return (
        <div key={key} className="term-line term-kernel">
          {line.text}
        </div>
      );
    }

    if (line.type === "error") {
      return (
        <div key={key} className="term-line term-error">
          {line.text}
        </div>
      );
    }

    if (line.type === "link") {
      return (
        <div key={key} className="term-line term-link-line">
          <a
            href={line.href}
            className={line.primary ? "term-link term-link-primary" : "term-link"}
            aria-label={line.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {line.text}
            <ArrowUpRight size={line.primary ? 20 : 16} aria-hidden="true" />
          </a>
        </div>
      );
    }

    if (line.type === "ls") {
      return renderLsOutput(line, key);
    }

    if (line.type === "names") {
      return renderNames(line, key);
    }

    return null;
  };

  const renderBootLine = (line, index) => {
    const isTyping = typingLine === index;
    const isVisible = index < visibleCount;

    if (!isVisible && !isTyping) return null;

    const key = `line-${index}`;

    if (line.type === "command") {
      return renderCommandLine(isTyping ? typedText : line.text, key, isTyping);
    }

    if (line.type === "link" && isTyping) {
      return renderOutput({ ...line, text: typedText }, key);
    }

    return renderOutput(line, key);
  };

  const title = `${USER}@${HOSTNAME}: ${
    currentDir === "home" ? "~" : currentDir === "etc" ? "/etc" : `~/${currentDir}`
  }`;

  return (
    <main
      className="term-shell"
      data-theme={theme}
      aria-label="Interactive terminal sandbox"
      onClick={handleShellClick}
    >
      <MatrixRain active={matrixActive} theme={theme} />

      <div className="term-crt" aria-hidden="true" />
      <div className="term-scanlines" aria-hidden="true" />

      <div className="term-window" onClick={(e) => e.stopPropagation()}>
        <div className="term-titlebar">
          <div className="term-traffic-lights">
            <button
              type="button"
              className="term-light term-light-close"
              aria-label="Close"
              onClick={() => setSessions([])}
            >
              <X size={10} strokeWidth={3} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="term-light term-light-minimize"
              aria-label="Minimize"
              onClick={() => setMatrixActive(false)}
            >
              <Minus size={10} strokeWidth={3} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="term-light term-light-maximize"
              aria-label="Maximize"
              onClick={() => focusInput()}
            >
              <Maximize2 size={10} strokeWidth={3} aria-hidden="true" />
            </button>
          </div>
          <div className="term-title">{title}</div>
          <div className="term-title-spacer" />
        </div>

        <div className="term-screen" ref={containerRef}>
          <div className="term-content">
            {bootLines.map((line, i) => renderBootLine(line, i))}

            <div
              className="term-history"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {sessions.map((session) => (
                <div className="term-session" key={session.id}>
                  {renderCommandLine(
                    session.command,
                    `session-${session.id}-command`
                  )}
                  {session.output.map((line, index) =>
                    renderOutput(line, `session-${session.id}-output-${index}`)
                  )}
                </div>
              ))}
            </div>

            {isReady && (
              <form
                className="term-input-form"
                onSubmit={handleSubmit}
                onClick={focusInput}
                onPointerDown={focusInput}
              >
                <label className="term-sr-only" htmlFor="terminal-command">
                  Terminal command
                </label>
                <label
                  className="term-prompt term-input-prompt"
                  htmlFor="terminal-command"
                  aria-label="Focus terminal input"
                >
                  {renderPrompt()}
                </label>
                <input
                  id="terminal-command"
                  ref={inputRef}
                  className="term-input"
                  value={inputValue}
                  onChange={(event) => {
                    setInputValue(event.target.value);
                    setCompletions([]);
                    setCompletionIndex(-1);
                  }}
                  onKeyDown={handleInputKeyDown}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="text"
                />
              </form>
            )}

            {completions.length > 1 && (
              <div className="term-completions" role="listbox">
                {completions.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    role="option"
                    aria-selected={index === completionIndex}
                    className={
                      index === completionIndex
                        ? "term-completion term-completion-active"
                        : "term-completion"
                    }
                    onClick={() => applyCompletion(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="term-statusbar">
          <span className="term-status-user">{USER}@{HOSTNAME}</span>
          <span className="term-status-dir">{getCwdPath(currentDir)}</span>
          <span className="term-status-theme">{themes[theme].label}</span>
          <span className="term-status-time">{statusTime}</span>
        </div>
      </div>
    </main>
  );
}
