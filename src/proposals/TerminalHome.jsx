import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import "./terminal.css";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BLOG_URL = "https://blog.denv.it";
const CWD = "/home/denvit";

const socialLinks = [
  {
    command: "github",
    label: "GitHub",
    href: "https://github.com/denysvitali",
    aliases: ["gh"],
  },
  {
    command: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/denysvitali",
    aliases: ["in"],
  },
  {
    command: "telegram",
    label: "Telegram",
    href: "https://t.me/denvit",
    aliases: ["tg"],
  },
  {
    command: "instagram",
    label: "Instagram",
    href: "https://instagram.com/denvit",
    aliases: ["ig"],
  },
  {
    command: "twitter",
    label: "Twitter",
    href: "https://twitter.com/DenysVitali",
    aliases: ["x"],
  },
];

const openTargets = [
  {
    command: "blog",
    label: "blog",
    href: BLOG_URL,
    aliases: ["weblog", BLOG_URL],
  },
  ...socialLinks,
];

const readmeLines = [
  "Denys Vitali",
  "Software systems, reverse engineering, Go, Kubernetes, security, automation.",
  "",
  `Primary link: ${BLOG_URL}`,
  "Social links live in ~/social. Try: ls -la ~/social",
];

const rootEntries = [
  {
    mode: "drwxr-xr-x",
    links: "5",
    owner: "denvit",
    group: "denvit",
    size: "4096",
    date: "Jun 16 09:15",
    name: ".",
    shortName: ".",
    hidden: true,
  },
  {
    mode: "drwxr-xr-x",
    links: "3",
    owner: "root",
    group: "root",
    size: "4096",
    date: "Jun 15 18:40",
    name: "..",
    shortName: "..",
    hidden: true,
  },
  {
    mode: "-rw-r--r--",
    links: "1",
    owner: "denvit",
    group: "denvit",
    size: "276",
    date: "Jun 16 09:16",
    name: "README.md",
    shortName: "README.md",
  },
  {
    mode: "lrwxrwxrwx",
    links: "1",
    owner: "denvit",
    group: "denvit",
    size: String(BLOG_URL.length),
    date: "Jun 16 09:16",
    name: `blog -> ${BLOG_URL}`,
    shortName: "blog",
    href: BLOG_URL,
    label: "blog",
  },
  {
    mode: "drwxr-xr-x",
    links: "2",
    owner: "denvit",
    group: "denvit",
    size: "4096",
    date: "Jun 16 09:17",
    name: "social",
    shortName: "social",
  },
];

const socialEntries = [
  {
    mode: "drwxr-xr-x",
    links: "2",
    owner: "denvit",
    group: "denvit",
    size: "4096",
    date: "Jun 16 09:17",
    name: ".",
    shortName: ".",
    hidden: true,
  },
  {
    mode: "drwxr-xr-x",
    links: "5",
    owner: "denvit",
    group: "denvit",
    size: "4096",
    date: "Jun 16 09:15",
    name: "..",
    shortName: "..",
    hidden: true,
  },
  ...socialLinks.map((link) => ({
    mode: "lrwxrwxrwx",
    links: "1",
    owner: "denvit",
    group: "denvit",
    size: String(link.href.length),
    date: "Jun 16 09:18",
    name: `${link.command} -> ${link.href}`,
    shortName: link.command,
    href: link.href,
    label: link.label,
  })),
];

const directories = {
  home: {
    total: "20",
    entries: rootEntries,
  },
  social: {
    total: "32",
    entries: socialEntries,
  },
};

const bootLines = [
  { type: "command", text: "whoami" },
  { type: "output", text: "Denys Vitali" },
  {
    type: "output",
    text: "Software systems, reverse engineering, Go, Kubernetes, security, automation.",
  },
  { type: "command", text: "open blog" },
  {
    type: "link",
    text: BLOG_URL,
    href: BLOG_URL,
    label: "Open blog",
    primary: true,
  },
  { type: "command", text: "ls -la ~/social" },
  {
    type: "ls",
    total: directories.social.total,
    rows: directories.social.entries,
  },
  { type: "output", text: "Type help to list supported sandbox commands." },
];

const readmeAliases = new Set([
  "readme",
  "readme.md",
  "./readme",
  "./readme.md",
  "~/readme",
  "~/readme.md",
  "/home/denvit/readme",
  "/home/denvit/readme.md",
]);

const normalizeLookup = (value) =>
  value.trim().replace(/\/+$/, "").toLowerCase();

const normalizeUrl = (value) =>
  value.trim().replace(/\/+$/, "").toLowerCase();

const result = (output, openHref = "") => ({ output, openHref });

function resolveDirectory(path = "") {
  const normalized = normalizeLookup(path || ".");

  if (
    normalized === "." ||
    normalized === "~" ||
    normalized === CWD.toLowerCase()
  ) {
    return "home";
  }

  if (
    normalized === "social" ||
    normalized === "./social" ||
    normalized === "~/social" ||
    normalized === `${CWD.toLowerCase()}/social`
  ) {
    return "social";
  }

  return "";
}

function isReadmePath(path) {
  return readmeAliases.has(normalizeLookup(path));
}

function listDirectory(args) {
  let showAll = false;
  let longFormat = false;
  let targetPath = "";

  for (const arg of args) {
    if (arg.startsWith("-") && arg.length > 1) {
      for (const flag of arg.slice(1)) {
        if (flag === "a") {
          showAll = true;
        } else if (flag === "l") {
          longFormat = true;
        } else {
          return result([
            {
              type: "error",
              text: `ls: invalid option -- '${flag}'`,
            },
            { type: "output", text: "Try: ls -la ~/social" },
          ]);
        }
      }
    } else if (!targetPath) {
      targetPath = arg;
    } else {
      return result([
        {
          type: "error",
          text: "ls: multiple paths are not supported in this sandbox",
        },
      ]);
    }
  }

  const directoryKey = resolveDirectory(targetPath);

  if (!directoryKey) {
    return result([
      {
        type: "error",
        text: `ls: cannot access '${targetPath}': No such file or directory`,
      },
    ]);
  }

  const directory = directories[directoryKey];
  const entries = showAll
    ? directory.entries
    : directory.entries.filter((entry) => !entry.hidden);

  if (longFormat) {
    return result([
      {
        type: "ls",
        total: directory.total,
        rows: entries,
      },
    ]);
  }

  return result([
    {
      type: "names",
      items: entries,
    },
  ]);
}

function readReadme(args) {
  if (args.length === 0) {
    return result([
      { type: "error", text: "cat: missing operand" },
      { type: "output", text: "Try: cat README.md" },
    ]);
  }

  if (args.length > 1) {
    return result([
      {
        type: "error",
        text: "cat: multiple files are not supported in this sandbox",
      },
    ]);
  }

  if (!isReadmePath(args[0])) {
    return result([
      {
        type: "error",
        text: `cat: ${args[0]}: No such file or directory`,
      },
    ]);
  }

  return result(readmeLines.map((text) => ({ type: "output", text })));
}

function findOpenTarget(args) {
  const rawTarget = args.join(" ");
  const normalized = normalizeUrl(rawTarget);

  return openTargets.find((target) => {
    const aliases = [target.command, target.href, ...(target.aliases || [])];
    return aliases.some((alias) => normalizeUrl(alias) === normalized);
  });
}

function openKnownTarget(args) {
  if (args.length === 0) {
    return result([
      { type: "error", text: "open: missing target" },
      { type: "output", text: "Try: open blog or open github" },
    ]);
  }

  const normalized = normalizeLookup(args.join(" "));

  if (
    normalized === "social" ||
    normalized === "links" ||
    normalized === "~/social"
  ) {
    return result([
      { type: "output", text: "Known social links:" },
      ...socialLinks.map((link) => ({
        type: "link",
        text: `${link.command}: ${link.href}`,
        href: link.href,
        label: `Open ${link.label}`,
      })),
    ]);
  }

  const target = findOpenTarget(args);

  if (!target) {
    return result([
      {
        type: "error",
        text: `open: '${args.join(" ")}' is outside this sandbox`,
      },
      {
        type: "output",
        text: "Supported targets: blog, github, linkedin, telegram, instagram, twitter",
      },
    ]);
  }

  return result(
    [
      { type: "output", text: `Opening ${target.label}...` },
      {
        type: "link",
        text: target.href,
        href: target.href,
        label: `Open ${target.label}`,
      },
    ],
    target.href
  );
}

function supportedCommands() {
  return result([
    { type: "output", text: "Supported sandbox commands:" },
    { type: "output", text: "  help                         show this list" },
    { type: "output", text: "  whoami                       print the sandbox user" },
    { type: "output", text: "  pwd                          print the current directory" },
    { type: "output", text: "  ls [-la] [~/social]          list local sandbox files" },
    { type: "output", text: "  cat README.md | readme       read the profile note" },
    { type: "output", text: "  open blog|github|linkedin    open a known external link" },
    { type: "output", text: "  open social                  show all known social links" },
    { type: "output", text: "  history                      show command history" },
    { type: "output", text: "  clear                        clear interactive output" },
  ]);
}

function commandHistoryOutput(history) {
  return result(
    history.map((command, index) => ({
      type: "output",
      text: `${String(index + 1).padStart(2, " ")}  ${command}`,
    }))
  );
}

function runCommand(command, history) {
  const parts = command.split(/\s+/);
  const verb = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (verb === "help") {
    return supportedCommands();
  }

  if (verb === "whoami") {
    return result([{ type: "output", text: "denvit" }]);
  }

  if (verb === "pwd") {
    return result([{ type: "output", text: CWD }]);
  }

  if (verb === "ls") {
    return listDirectory(args);
  }

  if (verb === "cat") {
    return readReadme(args);
  }

  if (verb === "readme" || verb === "cat/readme") {
    return result(readmeLines.map((text) => ({ type: "output", text })));
  }

  if (verb === "open") {
    return openKnownTarget(args);
  }

  if (verb === "blog") {
    return openKnownTarget(["blog"]);
  }

  if (verb === "history") {
    return commandHistoryOutput(history);
  }

  return result([
    {
      type: "error",
      text: `${verb}: command not found in this sandbox`,
    },
    { type: "output", text: "Type help for supported commands." },
  ]);
}

function formatEntryName(entry) {
  const name = entry.shortName || entry.name.split(" -> ")[0];

  if (entry.mode.startsWith("d") && name !== "." && name !== "..") {
    return `${name}/`;
  }

  if (entry.mode.startsWith("l")) {
    return `${name}@`;
  }

  return name;
}

export default function TerminalHome() {
  const [visibleCount, setVisibleCount] = useState(
    prefersReducedMotion ? bootLines.length : 0
  );
  const [showCursor, setShowCursor] = useState(true);
  const [typingLine, setTypingLine] = useState(-1);
  const [typedText, setTypedText] = useState("");
  const [isReady, setIsReady] = useState(prefersReducedMotion);
  const [inputValue, setInputValue] = useState("");
  const [sessions, setSessions] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutsRef = useRef([]);
  const sessionIdRef = useRef(0);

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
          line.type === "ls" ||
          line.type === "names"
        ) {
          setVisibleCount((c) => c + 1);
          await delay(300);
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
  }, [visibleCount, typedText, sessions, isReady]);

  const focusInput = () => {
    if (isReady && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleShellClick = (event) => {
    if (event.target instanceof Element && event.target.closest("a, input")) {
      return;
    }

    focusInput();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const command = inputValue.trim().replace(/\s+/g, " ");
    if (!command) return;

    const nextHistory = [...commandHistory, command];
    const lowerCommand = command.toLowerCase();

    setInputValue("");
    setHistoryIndex(null);
    setCommandHistory(nextHistory);

    if (lowerCommand === "clear") {
      setSessions([]);
      return;
    }

    const { output, openHref } = runCommand(command, nextHistory);

    setSessions((current) => [
      ...current,
      {
        id: sessionIdRef.current++,
        command,
        output,
      },
    ]);

    if (openHref && typeof window !== "undefined") {
      window.open(openHref, "_blank", "noopener,noreferrer");
    }
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
    }
  };

  const renderCursor = () => (
    <span
      className={showCursor ? "term-cursor" : "term-cursor term-cursor-off"}
      aria-hidden="true"
    />
  );

  const renderCommandLine = (command, key, isTyping = false) => (
    <div key={key} className="term-line term-command">
      <span className="term-prompt" aria-hidden="true">
        $
      </span>{" "}
      <span className="term-command-text">{command}</span>
      {isTyping && renderCursor()}
    </div>
  );

  const renderLsOutput = (line, key) => (
    <div key={key} className="term-ls" role="group" aria-label="ls output">
      <div className="term-line term-output">total {line.total}</div>
      {line.rows.map((row) => {
        const content = (
          <>
            <span className="term-perms">{row.mode}</span>
            <span className="term-links">{row.links}</span>
            <span className="term-user">{row.owner}</span>
            <span className="term-group">{row.group}</span>
            <span className="term-size">{row.size}</span>
            <span className="term-date">{row.date}</span>
            <span className="term-name">{row.name}</span>
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

        if (item.href) {
          return (
            <a
              key={item.name}
              href={item.href}
              className="term-name-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${item.label}`}
            >
              {name}
            </a>
          );
        }

        return <span key={item.name}>{name}</span>;
      })}
    </div>
  );

  const renderOutput = (line, key) => {
    if (line.type === "output") {
      return (
        <div key={key} className="term-line term-output">
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
            className={
              line.primary ? "term-link term-link-primary" : "term-link"
            }
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

  return (
    <main
      className="term-shell"
      aria-label="Interactive terminal sandbox"
      onClick={handleShellClick}
    >
      <div className="term-crt" aria-hidden="true" />
      <div className="term-scanlines" aria-hidden="true" />
      <div className="term-screen" ref={containerRef}>
        <div className="term-content">
          {bootLines.map((line, i) => renderBootLine(line, i))}

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

          {isReady && (
            <form
              className="term-input-form"
              onSubmit={handleSubmit}
              onClick={focusInput}
            >
              <label className="term-sr-only" htmlFor="terminal-command">
                Terminal command
              </label>
              <span className="term-prompt" aria-hidden="true">
                $
              </span>
              <input
                id="terminal-command"
                ref={inputRef}
                className="term-input"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleInputKeyDown}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
              />
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
