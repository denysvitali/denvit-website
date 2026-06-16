import { useEffect, useState, useRef } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Code2,
  ExternalLink,
  MessageCircle,
  Plane,
  Send,
  Terminal,
} from "lucide-react";
import "./departures.css";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%&*";

const primaryLink = {
  title: "Blog",
  href: "https://blog.denv.it",
  label: "blog.denv.it",
  icon: ExternalLink,
};

const socialLinks = [
  {
    title: "GitHub",
    href: "https://github.com/denysvitali",
    label: "github.com/denysvitali",
    icon: Code2,
    platform: "DEV",
    time: "01",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/denysvitali",
    label: "linkedin.com/in/denysvitali",
    icon: BriefcaseBusiness,
    platform: "PRO",
    time: "02",
  },
  {
    title: "Telegram",
    href: "https://t.me/denvit",
    label: "t.me/denvit",
    icon: Send,
    platform: "CHT",
    time: "03",
  },
  {
    title: "Instagram",
    href: "https://instagram.com/denvit",
    label: "instagram.com/denvit",
    icon: Camera,
    platform: "VIS",
    time: "04",
  },
  {
    title: "Twitter",
    href: "https://twitter.com/DenysVitali",
    label: "twitter.com/DenysVitali",
    icon: MessageCircle,
    platform: "SNS",
    time: "05",
  },
];

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function randomCharFromSet(set) {
  return set[Math.floor(Math.random() * set.length)];
}

function charSetFor(ch) {
  if (UPPER.includes(ch)) return UPPER;
  if (LOWER.includes(ch)) return LOWER;
  if (DIGITS.includes(ch)) return DIGITS;
  return SPECIAL;
}

function buildCharSets(target) {
  return Array.from(target).map(charSetFor);
}

function useScrambleText(finalText, delay = 0) {
  const [display, setDisplay] = useState("");
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const charSetsRef = useRef(buildCharSets(finalText));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    charSetsRef.current = buildCharSets(finalText);
  }, [finalText]);

  useEffect(() => {
    if (reduced) {
      setDisplay(finalText);
      return;
    }

    let frame = 0;
    const totalFrames = 32;
    const hold = Math.max(0, Math.round(delay / 16));
    const charSets = charSetsRef.current;
    let raf;

    const tick = () => {
      frame++;
      if (frame <= hold) {
        setDisplay("");
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = (frame - hold) / totalFrames;
      if (progress >= 1) {
        setDisplay(finalText);
        return;
      }
      // Eased progress for more physical settle feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const revealed = Math.floor(eased * finalText.length);
      let out = finalText.slice(0, revealed);
      for (let i = revealed; i < finalText.length; i++) {
        // Use character-class-appropriate random chars
        out += randomCharFromSet(charSets[i] || CHARS);
      }
      setDisplay(out);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finalText, delay, reduced]);

  return display;
}

function BoardRow({ link, big = false, delay = 0 }) {
  const label = useScrambleText(link.title, delay);
  const detail = useScrambleText(link.label, delay + 120);
  const platform = useScrambleText(link.platform || "", delay + 80);
  const time = useScrambleText(link.time || "", delay + 160);
  const Icon = link.icon;

  return (
    <a
      href={link.href}
      className={big ? "db-row db-row--big" : "db-row"}
      aria-label={`Open ${link.title}: ${link.label}`}
      title={link.label}
    >
      <span className="db-row__icon" aria-hidden="true">
        <Icon size={big ? 22 : 16} />
      </span>
      <span className="db-row__label">{label}</span>
      <span className="db-row__detail">{detail}</span>
      {!big && (
        <>
          <span className="db-row__platform">{platform}</span>
          <span className="db-row__time">{time}</span>
        </>
      )}
      {big && (
        <span className="db-row__now">
          <Plane size={14} aria-hidden="true" />
          NOW BOARDING
        </span>
      )}
      <span className="db-row__arrow" aria-hidden="true">
        <ArrowUpRight size={big ? 20 : 14} />
      </span>
    </a>
  );
}

export default function DepartureBoard() {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setClock(`${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="departure-board">
      <header className="db-header">
        <a className="db-header__brand" href="/" aria-label="Go to homepage">
          <Terminal size={18} aria-hidden="true" />
          <span>denv.it</span>
        </a>
        <h1 className="db-header__title">DEPARTURES</h1>
      </header>

      <nav className="db-body" aria-label="Departures">
        <BoardRow link={primaryLink} big={true} delay={200} />
        {socialLinks.map((link, i) => (
          <BoardRow key={link.href} link={link} delay={400 + i * 180} />
        ))}
      </nav>

      <footer className="db-footer">
        <span className="db-footer__location">ZURICH</span>
        <span className="db-footer__clock">{clock}</span>
        <span className="db-footer__sep">·</span>
        <span className="db-footer__status">ONLINE</span>
        <span className="db-footer__blink" aria-hidden="true" />
      </footer>
    </main>
  );
}
