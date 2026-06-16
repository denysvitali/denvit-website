import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import "./terminal.css";

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BLOG_URL = "https://blog.denv.it";
const CWD = "/home/denvit";
const HOSTNAME = "denvit-web";
const PROMPT = `denvit@${HOSTNAME}:~$`;

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
  "",
  "This terminal is a local browser sandbox. A real Linux/WASM lab could fit here later.",
];

const motdLines = [
  "Welcome to denvit-web 6.8.0-browser-sandbox",
  "Try: help, ls, cat README.md, open blog",
];

const envLines = [
  "HOME=/home/denvit",
  "HOSTNAME=denvit-web",
  "LANG=C.UTF-8",
  "PATH=/usr/local/bin:/usr/bin:/bin",
  "PWD=/home/denvit",
  "SHELL=/bin/browser-sh",
  "TERM=xterm-256color",
  "USER=denvit",
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
  {
    type: "output",
    text: "Last login: Tue Jun 16 09:14:07 2026 from 127.0.0.1",
  },
  { type: "command", text: "cat /etc/motd" },
  ...motdLines.map((text) => ({ type: "output", text })),
  { type: "output", text: "Type help to list supported sandbox commands." },
  { type: "command", text: "ls" },
  {
    type: "names",
    items: directories.home.entries.filter((entry) => !entry.hidden),
  },
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

function normalizeHomePath(path = "") {
  const normalized = normalizeLookup(path || ".");

  if (normalized.startsWith(`${CWD.toLowerCase()}/`)) {
    return normalized.slice(CWD.length + 1);
  }

  if (normalized.startsWith("~/")) {
    return normalized.slice(2);
  }

  if (normalized.startsWith("./")) {
    return normalized.slice(2);
  }

  return normalized;
}

function findDirectoryEntry(path = "") {
  const normalized = normalizeHomePath(path);

  if (!normalized || normalized.includes("/")) {
    return null;
  }

  return (
    rootEntries.find((entry) => {
      if (entry.hidden) return false;
      const names = [
        entry.shortName,
        entry.name,
        formatEntryName(entry).replace(/[\/@]$/, ""),
      ].filter(Boolean);
      return names.some((name) => normalizeLookup(name) === normalized);
    }) || null
  );
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

  if (!directoryKey && targetPath) {
    const entry = findDirectoryEntry(targetPath);

    if (entry) {
      if (longFormat) {
        return result([
          {
            type: "ls",
            total: "",
            rows: [entry],
          },
        ]);
      }

      return result([
        {
          type: "names",
          items: [entry],
        },
      ]);
    }
  }

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

function readLocalFile(args) {
  if (args.length === 0) {
    return result([
      { type: "error", text: "cat: missing operand" },
      { type: "output", text: "Try: cat README.md or cat /etc/motd" },
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

  const path = normalizeLookup(args[0]);

  if (path === "/etc/motd" || path === "motd") {
    return result(motdLines.map((text) => ({ type: "output", text })));
  }

  return readReadme(args);
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
    { type: "output", text: "Supported local sandbox commands:" },
    { type: "output", text: "  help                         show this list" },
    { type: "output", text: "  whoami                       print the sandbox user" },
    { type: "output", text: "  hostname                     print the sandbox host" },
    { type: "output", text: "  id                           print simulated uid/gid data" },
    { type: "output", text: "  uname [-a]                   print simulated kernel info" },
    { type: "output", text: "  date                         print this device's local time" },
    { type: "output", text: "  pwd                          print the current directory" },
    { type: "output", text: "  env                          print simulated environment" },
    { type: "output", text: "  echo [text]                  print text back" },
    { type: "output", text: "  ls [-la] [~/social]          list local sandbox files" },
    { type: "output", text: "  cat README.md or /etc/motd   read local sandbox files" },
    { type: "output", text: "  readme                       same as cat README.md" },
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

function formatDeviceDate(date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
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

  if (verb === "hostname") {
    return result([{ type: "output", text: HOSTNAME }]);
  }

  if (verb === "id") {
    return result([
      {
        type: "output",
        text: "uid=1000(denvit) gid=1000(denvit) groups=1000(denvit),27(sudo),100(users)",
      },
    ]);
  }

  if (verb === "uname") {
    const invalidFlag = args.find((arg) => arg.startsWith("-") && arg !== "-a");

    if (invalidFlag) {
      return result([
        { type: "error", text: `uname: invalid option -- '${invalidFlag}'` },
        { type: "output", text: "Try: uname or uname -a" },
      ]);
    }

    return result([
      {
        type: "output",
        text: args.includes("-a")
          ? "Linux denvit-web 6.8.0-browser-sandbox #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux"
          : "Linux",
      },
    ]);
  }

  if (verb === "date") {
    return result([{ type: "output", text: formatDeviceDate(new Date()) }]);
  }

  if (verb === "pwd") {
    return result([{ type: "output", text: CWD }]);
  }

  if (verb === "env" || verb === "printenv") {
    return result(envLines.map((text) => ({ type: "output", text })));
  }

  if (verb === "echo") {
    return result([{ type: "output", text: args.join(" ") }]);
  }

  if (verb === "ls") {
    return listDirectory(args);
  }

  if (verb === "cat") {
    return readLocalFile(args);
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
      text: `${verb}: command not found in this local sandbox`,
    },
    { type: "output", text: "Type help for supported commands." },
  ]);
}

function isDirectory(entry) {
  return entry.mode.startsWith("d");
}

function isSymlink(entry) {
  return entry.mode.startsWith("l");
}

function formatEntryName(entry) {
  const name = entry.shortName || entry.name.split(" -> ")[0];

  if (isDirectory(entry) && name !== "." && name !== "..") {
    return `${name}/`;
  }

  if (isSymlink(entry)) {
    return `${name}@`;
  }

  return name;
}

function entryNameClass(entry) {
  if (isDirectory(entry) && entry.shortName !== "." && entry.shortName !== "..") {
    return "term-name-dir";
  }
  if (isSymlink(entry)) {
    return "term-name-link-symlink";
  }
  return "term-name";
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

  const renderPrompt = () => {
    const [userHost, pathAndDollar] = PROMPT.split(":");
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
      {renderPrompt()}{" "}
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
        const content = (
          <>
            <span className="term-perms">{row.mode}</span>
            <span className="term-links">{row.links}</span>
            <span className="term-user">{row.owner}</span>
            <span className="term-group">{row.group}</span>
            <span className="term-size">{row.size}</span>
            <span className="term-date">{row.date}</span>
            <span className={entryNameClass(row)}>{row.name}</span>
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
              className={`term-name-link ${isSymlink(item) ? "term-name-link-symlink" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${item.label}`}
            >
              {name}
            </a>
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
