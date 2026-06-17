export function normalizeLookup(value) {
  return String(value || "").trim().replace(/\/+$/, "").toLowerCase();
}

export function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "").toLowerCase();
}

export function getCwdPath(currentDir, cwd = "/home/denvit") {
  if (currentDir === "home") return cwd;
  if (currentDir === "etc") return "/etc";
  return `${cwd}/${currentDir}`;
}

export function getPrompt(currentDir, hostname = "denvit-web", cwd = "/home/denvit") {
  let path;
  if (currentDir === "home") path = "~";
  else if (currentDir === "etc") path = "/etc";
  else path = `~/${currentDir}`;
  return `denvit@${hostname}:${path}$`;
}

export function formatDeviceDate(date) {
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

export function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const s = seconds % 60;
  const m = minutes % 60;
  const h = hours % 24;

  const parts = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (h > 0) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
  parts.push(`${s} second${s === 1 ? "" : "s"}`);

  return parts.join(", ");
}

export function padCenter(text, width, fill = " ") {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  return fill.repeat(left) + text + fill.repeat(padding - left);
}

export function wrapText(text, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }

  if (current) lines.push(current.trim());
  return lines;
}

export function result(output, extras = {}) {
  return { output, ...extras };
}
