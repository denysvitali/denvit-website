export const BLOG_URL = "https://blog.denv.it";
export const CWD = "/home/denvit";
export const HOSTNAME = "denvit-web";
export const USER = "denvit";

export const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const socialLinks = [
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
    command: "x",
    label: "X",
    href: "https://x.com/DenysVitali",
    aliases: ["twitter", "tw"],
  },
];

export const openTargets = [
  {
    command: "blog",
    label: "blog",
    href: BLOG_URL,
    aliases: ["weblog", BLOG_URL],
  },
  ...socialLinks,
];

export const envLines = [
  "HOME=/home/denvit",
  "HOSTNAME=denvit-web",
  "LANG=C.UTF-8",
  "PATH=/usr/local/bin:/usr/bin:/bin",
  "PWD=/home/denvit",
  "SHELL=/bin/browser-sh",
  "TERM=xterm-256color",
  "USER=denvit",
  "EDITOR=vim",
  "PAGER=less",
];

export const themes = {
  darcula: {
    name: "darcula",
    label: "Darcula",
    "--term-bg": "#2b2b2b",
    "--term-bg-elevated": "#313335",
    "--term-fg": "#a9b7c6",
    "--term-muted": "#808080",
    "--term-orange": "#cc7832",
    "--term-green": "#6a8759",
    "--term-yellow": "#ffc66d",
    "--term-blue": "#589df6",
    "--term-blue-hover": "#287bde",
    "--term-purple": "#9876aa",
    "--term-red": "#ff6b68",
    "--term-selection": "#214283",
    "--term-border": "#555555",
    "--term-cursor": "#bbbbbb",
    "--term-glow": "rgba(88, 157, 246, 0.08)",
    "--term-frame": "#3c3f41",
  },
  phosphor: {
    name: "phosphor",
    label: "Phosphor",
    "--term-bg": "#0a120a",
    "--term-bg-elevated": "#142214",
    "--term-fg": "#33ff33",
    "--term-muted": "#1a801a",
    "--term-orange": "#55ff55",
    "--term-green": "#33ff33",
    "--term-yellow": "#88ff88",
    "--term-blue": "#66ff66",
    "--term-blue-hover": "#aaffaa",
    "--term-purple": "#44ff44",
    "--term-red": "#ff5555",
    "--term-selection": "#116611",
    "--term-border": "#225522",
    "--term-cursor": "#33ff33",
    "--term-glow": "rgba(51, 255, 51, 0.12)",
    "--term-frame": "#142b14",
  },
  amber: {
    name: "amber",
    label: "Amber",
    "--term-bg": "#1a1205",
    "--term-bg-elevated": "#2a1f0a",
    "--term-fg": "#ffb000",
    "--term-muted": "#996600",
    "--term-orange": "#ffcc00",
    "--term-green": "#ffb000",
    "--term-yellow": "#ffcc33",
    "--term-blue": "#ffcc00",
    "--term-blue-hover": "#ffe066",
    "--term-purple": "#ffaa00",
    "--term-red": "#ff6633",
    "--term-selection": "#664400",
    "--term-border": "#805500",
    "--term-cursor": "#ffb000",
    "--term-glow": "rgba(255, 176, 0, 0.12)",
    "--term-frame": "#2a1f0a",
  },
  paperwhite: {
    name: "paperwhite",
    label: "Paperwhite",
    "--term-bg": "#f5f2e8",
    "--term-bg-elevated": "#ebe7da",
    "--term-fg": "#2d2d2d",
    "--term-muted": "#8a8275",
    "--term-orange": "#8b4513",
    "--term-green": "#2e7d32",
    "--term-yellow": "#b08d00",
    "--term-blue": "#1565c0",
    "--term-blue-hover": "#0d47a1",
    "--term-purple": "#6a1b9a",
    "--term-red": "#c62828",
    "--term-selection": "#c5cae9",
    "--term-border": "#d1cdbf",
    "--term-cursor": "#2d2d2d",
    "--term-glow": "rgba(21, 101, 192, 0.06)",
    "--term-frame": "#e0dcd0",
  },
};

export const defaultTheme = "darcula";
