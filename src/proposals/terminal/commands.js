import {
  BLOG_URL,
  CWD,
  HOSTNAME,
  USER,
  defaultTheme,
  envLines,
  openTargets,
  socialLinks,
  themes,
} from "./constants.js";
import {
  directories,
  fileContents,
  findDirectoryEntry,
  formatEntryName,
  isDirectory,
  isReadmePath,
  isSymlink,
  listAllEntryNames,
  resolveDirectory,
  tree,
  readmeLines,
} from "./fs.js";
import {
  banner,
  cowsay,
  figlet,
  neofetchAscii,
} from "./ascii.js";
import {
  formatDeviceDate,
  formatUptime,
  getCwdPath,
  normalizeLookup,
  normalizeUrl,
  result,
} from "./utils.js";

const COMMANDS = [
  "help",
  "whoami",
  "hostname",
  "id",
  "uname",
  "date",
  "pwd",
  "cd",
  "env",
  "printenv",
  "echo",
  "ls",
  "cat",
  "readme",
  "open",
  "blog",
  "history",
  "clear",
  "neofetch",
  "tree",
  "uptime",
  "cowsay",
  "figlet",
  "banner",
  "matrix",
  "sudo",
  "reboot",
  "shutdown",
  "theme",
  "which",
  "type",
  "man",
  "alias",
  "ll",
  "la",
];

const ALIASES = {
  ll: "ls -la",
  la: "ls -a",
  l: "ls -CF",
  "..": "cd ..",
  cls: "clear",
};

function findOpenTarget(args) {
  const rawTarget = args.join(" ");
  const normalized = normalizeUrl(rawTarget);

  return openTargets.find((target) => {
    const aliases = [target.command, target.href, ...(target.aliases || [])];
    return aliases.some((alias) => normalizeUrl(alias) === normalized);
  });
}

function commandList() {
  return [
    { type: "output", text: "Supported local sandbox commands:" },
    { type: "output", text: "  help                         show this list" },
    { type: "output", text: "  whoami                       print the sandbox user" },
    { type: "output", text: "  hostname                     print the sandbox host" },
    { type: "output", text: "  id                           print simulated uid/gid data" },
    { type: "output", text: "  uname [-a]                   print simulated kernel info" },
    { type: "output", text: "  date                         print this device's local time" },
    { type: "output", text: "  uptime                       print sandbox uptime" },
    { type: "output", text: "  pwd                          print the current directory" },
    { type: "output", text: "  cd [~|social|projects|..]    change the simulated directory" },
    { type: "output", text: "  env                          print simulated environment" },
    { type: "output", text: "  echo [text]                  print text back" },
    { type: "output", text: "  ls [-la] [path]              list local sandbox files" },
    { type: "output", text: "  cat README.md or /etc/motd   read local sandbox files" },
    { type: "output", text: "  tree [dir]                   show directory tree" },
    { type: "output", text: "  readme                       same as cat README.md" },
    { type: "output", text: "  open blog|github|linkedin    open a known external link" },
    { type: "output", text: "  open social                  show all known social links" },
    { type: "output", text: "  neofetch                     show system info banner" },
    { type: "output", text: "  cowsay [text]                a cow says things" },
    { type: "output", text: "  figlet [text]                large ASCII letters" },
    { type: "output", text: "  banner [text]                boxed ASCII banner" },
    { type: "output", text: "  theme [name]                 switch theme" },
    { type: "output", text: "  matrix                       toggle matrix rain effect" },
    { type: "output", text: "  history                      show command history" },
    { type: "output", text: "  clear                        clear interactive output" },
  ];
}

function supportedCommands() {
  return result(commandList());
}

function commandHistoryOutput(history) {
  return result(
    history.map((command, index) => ({
      type: "output",
      text: `${String(index + 1).padStart(3, " ")}  ${command}`,
    }))
  );
}

function listDirectory(args, currentDir = "home") {
  let showAll = false;
  let longFormat = false;
  let targetPath = "";

  for (const arg of args) {
    if (arg.startsWith("-") && arg.length > 1) {
      for (const flag of arg.slice(1)) {
        if (flag === "a") showAll = true;
        else if (flag === "l") longFormat = true;
        else {
          return result([
            { type: "error", text: `ls: invalid option -- '${flag}'` },
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

  const directoryKey = resolveDirectory(targetPath, currentDir);

  if (!directoryKey && targetPath) {
    const entry = findDirectoryEntry(targetPath, currentDir);
    if (entry) {
      if (longFormat) {
        return result([{ type: "ls", total: "", rows: [entry] }]);
      }
      return result([{ type: "names", items: [entry] }]);
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
    return result([{ type: "ls", total: directory.total, rows: entries }]);
  }

  return result([{ type: "names", items: entries }]);
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

  const path = normalizeLookup(args[0]);

  if (fileContents[path]) {
    return result(fileContents[path]);
  }

  if (isReadmePath(args[0])) {
    return result(
      readmeLines.map((line) => {
        if (typeof line === "string") return { type: "output", text: line };
        return { type: "output", segments: line };
      })
    );
  }

  return result([
    { type: "error", text: `cat: ${args[0]}: No such file or directory` },
  ]);
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

  if (fileContents[path]) {
    return result(fileContents[path]);
  }

  if (isReadmePath(args[0])) {
    return readReadme(args);
  }

  return result([
    { type: "error", text: `cat: ${args[0]}: No such file or directory` },
  ]);
}

function openKnownTarget(args) {
  if (args.length === 0) {
    return result([
      { type: "error", text: "open: missing target" },
      { type: "output", text: "Try: open blog or open github" },
    ]);
  }

  const normalized = normalizeLookup(args.join(" "));

  if (normalized === "social" || normalized === "links" || normalized === "~/social") {
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
        text: "Supported targets: blog, github, linkedin, telegram, instagram, x",
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
    { openHref: target.href }
  );
}

function neofetch(theme = defaultTheme) {
  const ascii = neofetchAscii();
  const info = [
    `${USER}@${HOSTNAME}`,
    "-".repeat(`${USER}@${HOSTNAME}`.length),
    "OS: BrowserOS 1.0 (sandbox)",
    "Kernel: Linux 6.8.0-browser-sandbox",
    "Shell: browser-sh 1.0",
    `Terminal: xterm-256color (${window?.innerWidth}x${window?.innerHeight})`,
    `Uptime: ${formatUptime(Date.now() - window?.__DENVIT_BOOT_TIME__ || Date.now())}`,
    "Packages: react, lucide-react, vite",
    "Resolution: 100vw x 100vh",
    `Theme: ${theme}`,
  ];

  const rows = Math.max(ascii.length, info.length);
  const lines = [];
  for (let i = 0; i < rows; i++) {
    const left = ascii[i] || " ".repeat(ascii[0]?.length || 20);
    const right = info[i] || "";
    lines.push(`${left}   ${right}`);
  }

  return result(lines.map((text) => ({ type: "output", text })));
}

function directoryTree(args, currentDir = "home") {
  const target = args[0] || ".";
  const dirKey = resolveDirectory(target, currentDir);

  if (!dirKey) {
    return result([
      { type: "error", text: `tree: '${target}': No such directory` },
    ]);
  }

  const displayName = dirKey === "home" ? "/home/denvit" : `/home/denvit/${dirKey}`;
  const lines = [displayName, ...tree(dirKey)];

  return result(lines.map((text) => ({ type: "output", text })));
}

function uptimeCommand(bootTime) {
  const elapsed = Date.now() - bootTime;
  const now = formatDeviceDate(new Date());
  return result([
    {
      type: "output",
      text: ` ${now} up ${formatUptime(elapsed)},  1 user,  load average: 0.00, 0.00, 0.00`,
    },
  ]);
}

function themeCommand(args) {
  if (args.length === 0) {
    return result([
      { type: "output", text: "Available themes:" },
      ...Object.values(themes).map((theme) => ({
        type: "output",
        text: `  ${theme.name.padEnd(12)} ${theme.label}`,
      })),
      { type: "output", text: "Usage: theme [name]" },
    ]);
  }

  const requested = args[0].toLowerCase();
  if (!themes[requested]) {
    return result([
      { type: "error", text: `theme: '${args[0]}' is not a known theme` },
      {
        type: "output",
        text: `Available: ${Object.keys(themes).join(", ")}`,
      },
    ]);
  }

  return result(
    [{ type: "output", text: `Switched to ${themes[requested].label} theme.` }],
    { theme: requested }
  );
}

function whichCommand(args) {
  if (args.length === 0) {
    return result([{ type: "error", text: "which: missing operand" }]);
  }

  const builtins = new Set(COMMANDS);
  return result(
    args.map((arg) => ({
      type: "output",
      text: builtins.has(arg)
        ? `${arg}: /bin/browser-sh builtin`
        : `which: no ${arg} in (/usr/local/bin:/usr/bin:/bin)`,
    }))
  );
}

function typeCommand(args) {
  if (args.length === 0) {
    return result([{ type: "error", text: "type: missing operand" }]);
  }

  const builtins = new Set(COMMANDS);
  return result(
    args.map((arg) => {
      if (ALIASES[arg]) {
        return { type: "output", text: `${arg} is aliased to '${ALIASES[arg]}'` };
      }
      return {
        type: "output",
        text: builtins.has(arg)
          ? `${arg} is a shell builtin`
          : `${arg} not found`,
      };
    })
  );
}

function manCommand(args) {
  if (args.length === 0) {
    return result([
      { type: "output", text: "What manual page do you want?" },
      { type: "output", text: "For example: man ls" },
    ]);
  }

  const page = args[0];
  const docs = {
    ls: "LS(1)                          User Commands                          LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about files. Supported flags: -a, -l.",
    cat: "CAT(1)                         User Commands                         CAT(1)\n\nNAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Print file contents. Supports README.md, /etc/motd, /etc/hostname,\n       /etc/os-release, /etc/passwd, ~/.bashrc and ~/.profile.",
    cd: "CD(1)                          User Commands                          CD(1)\n\nNAME\n       cd - change the working directory\n\nSYNOPSIS\n       cd [DIR]\n\nDESCRIPTION\n       Change the current directory to DIR. Supported: ~, social, projects, ..",
    theme:
      "THEME(1)                       User Commands                       THEME(1)\n\nNAME\n       theme - change terminal color theme\n\nSYNOPSIS\n       theme [NAME]\n\nDESCRIPTION\n       Switch the terminal theme. Available: darcula, phosphor, amber, paperwhite.",
  };

  if (!docs[page]) {
    return result([
      { type: "error", text: `No manual entry for ${page}` },
    ]);
  }

  return result(
    docs[page].split("\n").map((text) => ({ type: "output", text }))
  );
}

function aliasCommand(args) {
  if (args.length === 0) {
    return result(
      Object.entries(ALIASES).map(([name, value]) => ({
        type: "output",
        text: `alias ${name}='${value}'`,
      }))
    );
  }

  const input = args.join(" ");
  const match = input.match(/^([a-zA-Z0-9_-]+)=(.+)$/);
  if (!match) {
    return result([
      { type: "error", text: "alias: usage: alias name='command'" },
    ]);
  }

  return result([
    { type: "output", text: `alias ${match[1]}='${match[2]}'` },
    {
      type: "output",
      text: "(session-only: aliases reset on reload)",
    },
  ]);
}

export function getCompletions(prefix, currentDir = "home") {
  const trimmed = prefix.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    return COMMANDS.filter((cmd) => cmd.startsWith(parts[0])).concat(
      Object.keys(ALIASES).filter((alias) => alias.startsWith(parts[0]))
    );
  }

  const command = parts[0].toLowerCase();
  const rest = parts[parts.length - 1] || "";

  if (["cd", "ls", "cat", "open"].includes(command)) {
    const names = listAllEntryNames(currentDir);
    const paths = [
      ...names,
      "~/social",
      "~/projects",
      "~/README.md",
      "~/.bashrc",
      "~/.profile",
      "/etc/motd",
      "/etc/hostname",
      "/etc/os-release",
      "/etc/passwd",
    ];
    return paths.filter((p) => p.startsWith(rest));
  }

  return [];
}

export function runCommand(command, context) {
  const { history, currentDir, theme, bootTime } = context;
  const normalized = command.trim().replace(/\s+/g, " ");
  const parts = normalized.split(/\s+/);
  const verb = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (ALIASES[verb]) {
    return runCommand(`${ALIASES[verb]} ${args.join(" ")}`.trim(), context);
  }

  switch (verb) {
    case "help":
      return supportedCommands();
    case "whoami":
      return result([{ type: "output", text: USER }]);
    case "hostname":
      return result([{ type: "output", text: HOSTNAME }]);
    case "id":
      return result([
        {
          type: "output",
          text: "uid=1000(denvit) gid=1000(denvit) groups=1000(denvit),27(sudo),100(users)",
        },
      ]);
    case "uname": {
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
    case "date":
      return result([{ type: "output", text: formatDeviceDate(new Date()) }]);
    case "uptime":
      return uptimeCommand(bootTime);
    case "pwd":
      return result([{ type: "output", text: getCwdPath(currentDir) }]);
    case "cd": {
      const target = args[0] || "~";
      const newDir = resolveDirectory(target, currentDir);
      if (!newDir) {
        return result([
          { type: "error", text: `cd: ${target}: No such file or directory` },
        ]);
      }
      return result([], { newDir });
    }
    case "env":
    case "printenv": {
      const lines = envLines.map((line) =>
        line.startsWith("PWD=") ? `PWD=${getCwdPath(currentDir)}` : line
      );
      return result(lines.map((text) => ({ type: "output", text })));
    }
    case "echo":
      return result([{ type: "output", text: args.join(" ") }]);
    case "ls":
      return listDirectory(args, currentDir);
    case "cat":
      return readLocalFile(args);
    case "readme":
      return result(
        readmeLines.map((line) => {
          if (typeof line === "string") return { type: "output", text: line };
          return { type: "output", segments: line };
        })
      );
    case "tree":
      return directoryTree(args, currentDir);
    case "open":
      return openKnownTarget(args);
    case "blog":
      return openKnownTarget(["blog"]);
    case "history":
      return commandHistoryOutput(history);
    case "clear":
      return result([], { clear: true });
    case "neofetch":
      return neofetch(theme);
    case "cowsay":
      return result(
        cowsay(args.join(" ")).map((text) => ({ type: "output", text }))
      );
    case "figlet":
      return result(
        figlet(args.join(" ")).map((text) => ({ type: "output", text }))
      );
    case "banner":
      return result(
        banner(args.join(" ")).map((text) => ({ type: "output", text }))
      );
    case "matrix":
      return result([{ type: "output", text: "Entering the Matrix..." }], {
        matrix: true,
      });
    case "sudo":
      return result([
        { type: "error", text: "sudo: you are not in the sudoers file." },
        {
          type: "output",
          text: "This incident will be reported to /dev/null.",
        },
      ]);
    case "reboot":
      return result([{ type: "output", text: "Rebooting system..." }], {
        reboot: true,
      });
    case "shutdown":
      return result(
        [
          { type: "output", text: "Shutdown scheduled for now." },
          { type: "output", text: "Use 'reboot' to start back up." },
        ],
        { shutdown: true }
      );
    case "theme":
      return themeCommand(args);
    case "which":
      return whichCommand(args);
    case "type":
      return typeCommand(args);
    case "man":
      return manCommand(args);
    case "alias":
      return aliasCommand(args);
    default:
      return result([
        {
          type: "error",
          text: `${verb}: command not found in this local sandbox`,
        },
        { type: "output", text: "Type help for supported commands." },
      ]);
  }
}
