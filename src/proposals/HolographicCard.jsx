import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Code2,
  MessageCircle,
  Send,
} from "lucide-react";
import "./holographic-card.css";

const primaryLink = {
  title: "Blog",
  href: "https://blog.denv.it",
  label: "blog.denv.it",
};

const socialLinks = [
  {
    title: "GitHub",
    href: "https://github.com/denysvitali",
    label: "github.com/denysvitali",
    icon: Code2,
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/denysvitali",
    label: "linkedin.com/in/denysvitali",
    icon: BriefcaseBusiness,
  },
  {
    title: "Telegram",
    href: "https://t.me/denvit",
    label: "t.me/denvit",
    icon: Send,
  },
  {
    title: "Instagram",
    href: "https://instagram.com/denvit",
    label: "instagram.com/denvit",
    icon: Camera,
  },
  {
    title: "Twitter",
    href: "https://twitter.com/DenysVitali",
    label: "twitter.com/DenysVitali",
    icon: MessageCircle,
  },
];

export default function HolographicCard() {
  const cardRef = useRef(null);
  const wrapRef = useRef(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const onChange = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const card = cardRef.current;
      if (!card) return;
      card.style.transform = `perspective(900px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg)`;
    };

    const onLeave = () => {
      const card = cardRef.current;
      if (card) card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReduced]);

  return (
    <main className="holo-stage" aria-label="Holographic card page">
      <div className="holo-aurora" aria-hidden="true" />
      <div className="holo-wrap" ref={wrapRef}>
        <article
          ref={cardRef}
          className="holo-card"
          aria-labelledby="holo-name"
        >
          <div className="holo-card-glint" aria-hidden="true" />
          <header className="holo-header">
            <h1 id="holo-name">Denys Vitali</h1>
            <p className="holo-bio">
              Software systems, reverse engineering, Go, Kubernetes, security,
              and automation that solves real problems.
            </p>
          </header>

          <nav className="holo-nav" aria-label="Links">
            <MagneticBlogLink reduced={prefersReduced} />

            <ul className="holo-socials" role="list">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <MagneticSocialLink link={link} reduced={prefersReduced} />
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </div>
    </main>
  );
}

function MagneticBlogLink({ reduced }) {
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <a
      ref={ref}
      className="holo-blog"
      href={primaryLink.href}
      aria-label={primaryLink.label}
    >
      <span className="holo-blog-label">Blog</span>
      <span className="holo-blog-url">
        {primaryLink.label}
        <ArrowUpRight size={20} aria-hidden="true" />
      </span>
    </a>
  );
}

function MagneticSocialLink({ link, reduced }) {
  const ref = useRef(null);
  const Icon = link.icon;

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <a
      ref={ref}
      className="holo-social"
      href={link.href}
      aria-label={link.label}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{link.title}</span>
    </a>
  );
}
