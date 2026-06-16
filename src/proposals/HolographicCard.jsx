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
  const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
    setPrefersReduced(mqMotion.matches);
    setPrefersReducedTransparency(mqTransparency.matches);
    const onMotionChange = (e) => setPrefersReduced(e.matches);
    const onTransparencyChange = (e) => setPrefersReducedTransparency(e.matches);
    mqMotion.addEventListener("change", onMotionChange);
    mqTransparency.addEventListener("change", onTransparencyChange);
    return () => {
      mqMotion.removeEventListener("change", onMotionChange);
      mqTransparency.removeEventListener("change", onTransparencyChange);
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (prefersReduced) {
      card.style.transform = "";
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
      return;
    }

    const wrap = wrapRef.current;
    if (!wrap) return;

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const pointerX = Math.max(0, Math.min(100, ((dx + 1) / 2) * 100));
      const pointerY = Math.max(0, Math.min(100, ((dy + 1) / 2) * 100));

      card.style.setProperty("--pointer-x", `${pointerX}%`);
      card.style.setProperty("--pointer-y", `${pointerY}%`);
      card.style.transform = `perspective(1100px) rotateX(${-dy * 7}deg) rotateY(${dx * 8}deg) translateZ(0)`;
    };

    const onLeave = () => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "40%");
      card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointercancel", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointercancel", onLeave);
      onLeave();
    };
  }, [prefersReduced]);

  return (
    <>
      {/* Hidden SVG defining the liquid-glass filter pipeline */}
      <svg className="lg-svg-defs" aria-hidden="true">
        <defs>
          <filter
            id="liquid-glass"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            filterUnits="objectBoundingBox"
            primitiveUnits="objectBoundingBox"
          >
            {/* 1. Base blur of the backdrop */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0.025"
              result="blur"
            />

            {/* 2. Procedural displacement map using turbulence */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.6"
              numOctaves="3"
              seed="5"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="displacementMap"
            />

            {/* 3. Refraction distortion via displacement */}
            <feDisplacementMap
              in="blur"
              in2="displacementMap"
              scale="0.015"
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />

            {/* 4. Saturation boost for vibrancy */}
            <feColorMatrix
              in="refracted"
              type="saturate"
              values="1.6"
              result="saturated"
            />

            {/* 5. Specular lighting for glossy edge highlights */}
            <feSpecularLighting
              in="displacementMap"
              surfaceScale="2"
              specularConstant="0.9"
              specularExponent="28"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight x="-0.3" y="-0.3" z="0.8" />
            </feSpecularLighting>

            {/* 6. Composite specular on top of saturated refracted image */}
            <feComposite
              in="specular"
              in2="saturated"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0.55"
              k4="0"
              result="lit"
            />

            {/* 7. Brightness lift */}
            <feComponentTransfer in="lit" result="final">
              <feFuncA type="linear" slope="0.92" intercept="0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <main className="holo-stage" aria-label="Denys Vitali links">
        {/* Animated background layers */}
        <div className="holo-bg" aria-hidden="true">
          <div className="holo-bg__layer holo-bg__layer--aurora" />
          <div className="holo-bg__layer holo-bg__layer--mesh" />
          <div className="holo-bg__layer holo-bg__layer--orbs" />
          <div className="holo-bg__layer holo-bg__layer--ribbons" />
        </div>

        <div className="holo-scene" aria-hidden="true">
          <span className="holo-scene__panel holo-scene__panel--one" />
          <span className="holo-scene__panel holo-scene__panel--two" />
          <span className="holo-scene__panel holo-scene__panel--three" />
          <span className="holo-scene__ribbon holo-scene__ribbon--one" />
          <span className="holo-scene__ribbon holo-scene__ribbon--two" />
        </div>

        <div className="holo-wrap" ref={wrapRef}>
          <article
            ref={cardRef}
            className="holo-card"
            aria-labelledby="holo-name"
            data-reduced-transparency={prefersReducedTransparency}
          >
            {/* Liquid-glass filter layer */}
            <div className="holo-card-liquid" aria-hidden="true" />

            {/* Depth / inner bevel layer */}
            <div className="holo-card-depth" aria-hidden="true" />

            {/* Specular glint layer */}
            <div className="holo-card-glint" aria-hidden="true" />

            {/* Fresnel edge highlight */}
            <div className="holo-card-rim" aria-hidden="true" />

            {/* Content stays readable via isolation */}
            <div className="holo-card-content">
              <header className="holo-header">
                <p className="holo-kicker">denv.it</p>
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
            </div>
          </article>
        </div>
      </main>
    </>
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
      el.style.transform = `translate3d(${x * 0.12}px, ${y * 0.12}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      onLeave();
    };
  }, [reduced]);

  return (
    <a
      ref={ref}
      className="holo-blog"
      href={primaryLink.href}
      aria-label={`${primaryLink.title}: ${primaryLink.label}`}
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
      el.style.transform = `translate3d(${x * 0.16}px, ${y * 0.16}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      onLeave();
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
