const FIGLET_FONT = {
  A: [
    "  ##  ",
    " #  # ",
    "######",
    "#    #",
    "#    #",
  ],
  B: [
    "##### ",
    "#    #",
    "##### ",
    "#    #",
    "##### ",
  ],
  C: [
    " #####",
    "#     ",
    "#     ",
    "#     ",
    " #####",
  ],
  D: [
    "##### ",
    "#    #",
    "#    #",
    "#    #",
    "##### ",
  ],
  E: [
    "######",
    "#     ",
    "##### ",
    "#     ",
    "######",
  ],
  F: [
    "######",
    "#     ",
    "##### ",
    "#     ",
    "#     ",
  ],
  G: [
    " #####",
    "#     ",
    "#  ###",
    "#    #",
    " #####",
  ],
  H: [
    "#    #",
    "#    #",
    "######",
    "#    #",
    "#    #",
  ],
  I: [
    "######",
    "  ##  ",
    "  ##  ",
    "  ##  ",
    "######",
  ],
  J: [
    "     #",
    "     #",
    "     #",
    "#    #",
    " #### ",
  ],
  K: [
    "#    #",
    "#   # ",
    "####  ",
    "#   # ",
    "#    #",
  ],
  L: [
    "#     ",
    "#     ",
    "#     ",
    "#     ",
    "######",
  ],
  M: [
    "#    #",
    "##  ##",
    "# ## #",
    "#    #",
    "#    #",
  ],
  N: [
    "#    #",
    "##   #",
    "# #  #",
    "#  # #",
    "#   ##",
  ],
  O: [
    " #### ",
    "#    #",
    "#    #",
    "#    #",
    " #### ",
  ],
  P: [
    "##### ",
    "#    #",
    "##### ",
    "#     ",
    "#     ",
  ],
  Q: [
    " #### ",
    "#    #",
    "#  # #",
    "#   # ",
    " ### #",
  ],
  R: [
    "##### ",
    "#    #",
    "##### ",
    "#   # ",
    "#    #",
  ],
  S: [
    " #####",
    "#     ",
    " #####",
    "     #",
    "##### ",
  ],
  T: [
    "######",
    "  ##  ",
    "  ##  ",
    "  ##  ",
    "  ##  ",
  ],
  U: [
    "#    #",
    "#    #",
    "#    #",
    "#    #",
    " #### ",
  ],
  V: [
    "#    #",
    "#    #",
    "#    #",
    " #  # ",
    "  ##  ",
  ],
  W: [
    "#    #",
    "#    #",
    "# ## #",
    "##  ##",
    "#    #",
  ],
  X: [
    "#    #",
    " #  # ",
    "  ##  ",
    " #  # ",
    "#    #",
  ],
  Y: [
    "#    #",
    " #  # ",
    "  ##  ",
    "  ##  ",
    "  ##  ",
  ],
  Z: [
    "######",
    "    # ",
    "   #  ",
    "  #   ",
    "######",
  ],
  " ": [
    "      ",
    "      ",
    "      ",
    "      ",
    "      ",
  ],
  "!": [
    "  #   ",
    "  #   ",
    "  #   ",
    "      ",
    "  #   ",
  ],
  "?": [
    " #### ",
    "#    #",
    "   ## ",
    "  #   ",
    "  #   ",
  ],
  "0": [
    " #### ",
    "#   ##",
    "# #  #",
    "##   #",
    " #### ",
  ],
  "1": [
    "  ##  ",
    " # #  ",
    "   #  ",
    "   #  ",
    "######",
  ],
  "2": [
    " #### ",
    "#    #",
    "   ## ",
    " ##   ",
    "######",
  ],
  "3": [
    " #### ",
    "    # ",
    "  ### ",
    "    # ",
    " #### ",
  ],
  "4": [
    "   ## ",
    "  # # ",
    " ######",
    "    # ",
    "    # ",
  ],
  "5": [
    "######",
    "#     ",
    "##### ",
    "     #",
    "##### ",
  ],
  "6": [
    " #### ",
    "#     ",
    "##### ",
    "#    #",
    " #### ",
  ],
  "7": [
    "######",
    "    # ",
    "   #  ",
    "  #   ",
    " #    ",
  ],
  "8": [
    " #### ",
    "#    #",
    " #### ",
    "#    #",
    " #### ",
  ],
  "9": [
    " #### ",
    "#    #",
    " #####",
    "     #",
    " #### ",
  ],
  ".": [
    "      ",
    "      ",
    "      ",
    "      ",
    "  #   ",
  ],
  "-": [
    "      ",
    "      ",
    "######",
    "      ",
    "      ",
  ],
  "_": [
    "      ",
    "      ",
    "      ",
    "      ",
    "######",
  ],
};

export function figlet(text) {
  const normalized = String(text || "").toUpperCase().slice(0, 24);
  if (!normalized.trim()) return [""];

  const rows = ["", "", "", "", ""];
  for (const char of normalized) {
    const glyph = FIGLET_FONT[char] || FIGLET_FONT["?"];
    for (let i = 0; i < 5; i++) {
      rows[i] += glyph[i] || "";
    }
  }
  return rows;
}

export function cowBubble(lines, maxWidth = 40) {
  const width = Math.min(
    maxWidth,
    Math.max(...lines.map((line) => line.length), 0)
  );

  const top = " " + "_".repeat(width + 2);
  const bottom = " " + "-".repeat(width + 2);

  const padded = lines.map((line) =>
    line.length < width ? line + " ".repeat(width - line.length) : line
  );

  let middle;
  if (padded.length === 1) {
    middle = [`< ${padded[0]} >`];
  } else {
    middle = padded.map((line, i) => {
      const left = i === 0 ? "/" : i === padded.length - 1 ? "\\" : "|";
      const right = i === 0 ? "\\" : i === padded.length - 1 ? "/" : "|";
      return `${left} ${line} ${right}`;
    });
  }

  return [top, ...middle, bottom];
}

export function cowFeet() {
  return [
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ];
}

export function cowsay(text) {
  const lines = String(text || "moo")
    .split("\n")
    .flatMap((line) => {
      const chunks = [];
      for (let i = 0; i < line.length; i += 36) {
        chunks.push(line.slice(i, i + 36));
      }
      return chunks;
    });

  return [...cowBubble(lines), ...cowFeet()];
}

export function neofetchAscii() {
  return [
    "       _.---._",
    "     .'       '.",
    "    /   .   .   \\",
    "   |    \\___/    |",
    "    \\            /",
    "     '.        .'",
    "       `'---'`",
  ];
}

export function banner(text) {
  const rows = figlet(text);
  const border = "#".repeat(Math.max(...rows.map((r) => r.length), 0) + 4);
  return [border, ...rows.map((row) => `# ${row} #`), border];
}

export function matrixRainColumns(width, height) {
  return Array.from({ length: width }, () => ({
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    speed: 0.5 + Math.random() * 1.5,
    length: 5 + Math.floor(Math.random() * 15),
  }));
}
