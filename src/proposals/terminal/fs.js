import { BLOG_URL, CWD, HOSTNAME, USER, envLines, socialLinks } from "./constants.js";
import { normalizeLookup } from "./utils.js";

function makeDir(name, { owner = USER, group = USER, date = "Jun 17 10:00" } = {}) {
  return {
    mode: "drwxr-xr-x",
    links: "2",
    owner,
    group,
    size: "4096",
    date,
    name,
    shortName: name,
  };
}

function makeFile(name, size, { owner = USER, group = USER, date = "Jun 17 10:00" } = {}) {
  return {
    mode: "-rw-r--r--",
    links: "1",
    owner,
    group,
    size: String(size),
    date,
    name,
    shortName: name,
  };
}

function makeSymlink(name, target, { label, href, date = "Jun 17 10:00" } = {}) {
  return {
    mode: "lrwxrwxrwx",
    links: "1",
    owner: USER,
    group: USER,
    size: String(target.length),
    date,
    name: `${name} -> ${target}`,
    shortName: name,
    href,
    label,
  };
}

function makeHidden(name, size, { owner = USER, group = USER, date = "Jun 17 10:00" } = {}) {
  return {
    ...makeFile(name, size, { owner, group, date }),
    hidden: true,
  };
}

export const readmeLines = [
  [{ text: "Denys Vitali", className: "term-r-bold term-r-blue" }],
  [
    {
      text: "Software systems, reverse engineering, Go, Kubernetes, security, automation.",
      className: "term-r-fg",
    },
  ],
  "",
  [
    { text: "Primary link: ", className: "term-r-bold term-r-green" },
    { text: BLOG_URL, className: "term-r-blue term-r-underline" },
  ],
  [
    { text: "Social links live in ", className: "term-r-fg" },
    { text: "~/social", className: "term-r-blue" },
    { text: ". Try: ", className: "term-r-fg" },
    { text: "ls -la ~/social", className: "term-r-yellow term-r-bold" },
  ],
  [
    { text: "Projects live in ", className: "term-r-fg" },
    { text: "~/projects", className: "term-r-blue" },
    { text: ". Try: ", className: "term-r-fg" },
    { text: "ls projects", className: "term-r-yellow term-r-bold" },
  ],
  "",
  [
    {
      text: "This terminal is a local browser sandbox. ",
      className: "term-r-fg",
    },
    {
      text: "A real Linux/WASM lab could fit here later.",
      className: "term-r-muted term-r-italic",
    },
  ],
  "",
  [
    { text: "▸ ", className: "term-r-green term-r-bold" },
    { text: "Try: ", className: "term-r-fg" },
    { text: "help", className: "term-r-yellow term-r-bold" },
    { text: "  ", className: "term-r-fg" },
    { text: "neofetch", className: "term-r-yellow term-r-bold" },
    { text: "  ", className: "term-r-fg" },
    { text: "open blog", className: "term-r-yellow term-r-bold" },
  ],
];

export const motdLines = [
  {
    text: "Welcome to denvit-web",
    className: "term-motd-welcome",
  },
  {
    text: "Try: help, ls, cat README.md, neofetch, open blog",
    className: "term-motd-hint",
  },
];

export const bashrcLines = [
  "#!/bin/browser-sh",
  "# ~/.bashrc: executed by browser-sh(1) for non-login shells.",
  "",
  "export PS1='\\u@\\h:\\w$ '" ,
  "export EDITOR=vim",
  "export PAGER=less",
  "",
  "alias ll='ls -la'",
  "alias la='ls -a'",
  "alias l='ls -CF'",
  "alias ..='cd ..'",
  "",
  "# added for denvit-web sandbox",
  "neofetch",
];

export const profileLines = [
  "#!/bin/browser-sh",
  "# ~/.profile: executed by the command interpreter for login shells.",
  "",
  "export PATH=/usr/local/bin:/usr/bin:/bin",
  "export HOME=/home/denvit",
  "export USER=denvit",
  "",
  'if [ -f ~/.bashrc ]; then',
  "  . ~/.bashrc",
  "fi",
];

export const osReleaseLines = [
  'PRETTY_NAME="BrowserOS 1.0 (sandbox)"',
  'NAME="BrowserOS"',
  "VERSION_ID=\"1.0\"",
  'VERSION="1.0 (stable)"',
  'ID=browseros',
  'ID_LIKE=debian',
  "HOME_URL=\"https://denv.it\"",
  'SUPPORT_URL="https://github.com/denysvitali"',
  'BUG_REPORT_URL="https://github.com/denysvitali/denvit-website/issues"',
];

export const hostnameLine = HOSTNAME;

export const passwdLine =
  "denvit:x:1000:1000:Denys Vitali:/home/denvit:/bin/browser-sh";

const projects = [
  {
    name: "denvit-website",
    description: "This website (React + Vite + browser-sh sandbox).",
  },
  { name: "nginxparser", description: "NGINX config parser in Go." },
  { name: "chess-openings", description: "Chess opening trainer." },
  { name: "travel", description: "Self-hosted travel itinerary tools." },
];

const rootEntries = [
  { ...makeDir("."), hidden: true },
  { ...makeDir("..", { owner: "root", group: "root" }), hidden: true },
  makeFile("README.md", 276),
  makeSymlink("blog", BLOG_URL, { label: "blog", href: BLOG_URL }),
  makeDir("social"),
  makeDir("projects"),
  makeHidden(".bashrc", 312),
  makeHidden(".profile", 198),
];

const socialEntries = [
  { ...makeDir("."), hidden: true },
  { ...makeDir(".."), hidden: true },
  ...socialLinks.map((link) =>
    makeSymlink(link.command, link.href, {
      label: link.label,
      href: link.href,
    })
  ),
];

const projectEntries = [
  { ...makeDir("."), hidden: true },
  { ...makeDir(".."), hidden: true },
  ...projects.map((project) => makeDir(project.name)),
];

const etcEntries = [
  { ...makeDir("."), hidden: true },
  { ...makeDir("..", { owner: "root", group: "root" }), hidden: true },
  makeFile("motd", 64, { owner: "root", group: "root" }),
  makeFile("hostname", 10, { owner: "root", group: "root" }),
  makeFile("os-release", 180, { owner: "root", group: "root" }),
  makeFile("passwd", 58, { owner: "root", group: "root" }),
];

export const directories = {
  home: {
    total: "28",
    entries: rootEntries,
  },
  social: {
    total: "32",
    entries: socialEntries,
  },
  projects: {
    total: "16",
    entries: projectEntries,
  },
  etc: {
    total: "20",
    entries: etcEntries,
  },
};

export const fileContents = {
  "/home/denvit/readme.md": readmeLines,
  "/home/denvit/.bashrc": bashrcLines.map((line) => ({ type: "output", text: line })),
  "/home/denvit/.profile": profileLines.map((line) => ({ type: "output", text: line })),
  "/etc/motd": motdLines.map((line) => ({ type: "motd", ...line })),
  "/etc/hostname": [{ type: "output", text: hostnameLine }],
  "/etc/os-release": osReleaseLines.map((line) => ({ type: "output", text: line })),
  "/etc/passwd": [{ type: "output", text: passwdLine }],
};

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

export function isReadmePath(path) {
  return readmeAliases.has(normalizeLookup(path));
}

export function resolveDirectory(path = "", currentDir = "home") {
  const normalized = normalizeLookup(path || ".");

  if (normalized === ".") return currentDir;
  if (normalized === "~" || normalized === CWD.toLowerCase()) return "home";
  if (
    normalized === "social" ||
    normalized === "./social" ||
    normalized === "~/social" ||
    normalized === `${CWD.toLowerCase()}/social`
  ) {
    return "social";
  }
  if (
    normalized === "projects" ||
    normalized === "./projects" ||
    normalized === "~/projects" ||
    normalized === `${CWD.toLowerCase()}/projects`
  ) {
    return "projects";
  }
  if (normalized === "etc" || normalized === "/etc") return "etc";
  if (normalized === "..") return currentDir === "home" ? "" : "home";

  return "";
}

export function normalizeHomePath(path = "", currentDir = "home") {
  const normalized = normalizeLookup(path || ".");

  if (normalized.startsWith(`${CWD.toLowerCase()}/`)) {
    return normalized.slice(CWD.length + 1);
  }
  if (normalized.startsWith("~/")) return normalized.slice(2);
  if (normalized.startsWith("./")) return normalized.slice(2);
  if (normalized === ".") return "";
  if (normalized === ".." && currentDir !== "home") return "";
  return normalized;
}

export function findDirectoryEntry(path = "", currentDir = "home") {
  const normalized = normalizeHomePath(path, currentDir);
  const entries = directories[currentDir]?.entries || directories.home.entries;

  if (!normalized || normalized.includes("/")) return null;

  return (
    entries.find((entry) => {
      if (entry.hidden) return false;
      const names = [entry.shortName, entry.name];
      return names.some((name) => normalizeLookup(name) === normalized);
    }) || null
  );
}

export function getDirectoryKey(currentDir = "home") {
  return directories[currentDir] ? currentDir : "home";
}

export function isDirectory(entry) {
  return entry.mode.startsWith("d");
}

export function isSymlink(entry) {
  return entry.mode.startsWith("l");
}

export function formatEntryName(entry) {
  const name = entry.shortName || entry.name.split(" -> ")[0];

  if (isDirectory(entry) && name !== "." && name !== "..") {
    return `${name}/`;
  }
  if (isSymlink(entry)) return `${name}@`;
  return name;
}

export function entryNameClass(entry) {
  if (isDirectory(entry) && entry.shortName !== "." && entry.shortName !== "..") {
    return "term-name-dir";
  }
  if (isSymlink(entry)) return "term-name-link-symlink";
  return "term-name";
}

export function listAllEntryNames(currentDir = "home") {
  const dir = directories[currentDir] || directories.home;
  return dir.entries
    .filter((entry) => !entry.hidden)
    .map((entry) => entry.shortName || entry.name.split(" -> ")[0]);
}

export function tree(dirKey = "home", prefix = "") {
  const dir = directories[dirKey];
  if (!dir) return [];

  const visible = dir.entries.filter((entry) => !entry.hidden);
  const lines = [];

  visible.forEach((entry, index) => {
    const isLast = index === visible.length - 1;
    const connector = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${connector}${entry.shortName || entry.name}`);

    if (isDirectory(entry) && directories[entry.shortName]) {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      lines.push(...tree(entry.shortName, childPrefix));
    }
  });

  return lines;
}
