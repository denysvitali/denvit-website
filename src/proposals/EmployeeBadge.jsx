import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Terminal } from "lucide-react";
import "./employee-badge.css";

const employee = {
  company: "denv.it",
  companyTagline: "Software systems & security",
  name: "Denys Vitali",
  role: "Principal Engineer",
  department: "Platform & Security",
  employeeId: "DENV-0001",
  issued: "2024-03",
  expires: "2029-03",
  clearance: "L4",
  status: "ACTIVE",
};

function Barcode() {
  // Pseudo-random but stable pattern based on employee ID
  const seed = employee.employeeId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const bars = Array.from({ length: 42 }, (_, i) => {
    const v = (seed * (i + 3) * 1103515245 + 12345) % 7;
    return v < 1 ? 3 : v < 3 ? 2 : v < 5 ? 1 : 2;
  });
  return (
    <div className="badge-barcode" aria-hidden="true">
      {bars.map((w, i) => (
        <span key={i} style={{ width: `${w}px` }} />
      ))}
    </div>
  );
}

export default function EmployeeBadge() {
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
    const wrap = wrapRef.current;
    if (!card || !wrap) return;

    if (prefersReduced) {
      card.style.transform = "";
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
      return;
    }

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const px = Math.max(0, Math.min(100, ((dx + 1) / 2) * 100));
      const py = Math.max(0, Math.min(100, ((dy + 1) / 2) * 100));

      card.style.setProperty("--pointer-x", `${px}%`);
      card.style.setProperty("--pointer-y", `${py}%`);
      card.style.transform = `perspective(1200px) rotateX(${-dy * 5}deg) rotateY(${dx * 7}deg) translateZ(0)`;
    };

    const onLeave = () => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "30%");
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)";
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
      {/* Liquid-glass SVG filter pipeline */}
      <svg className="lg-svg-defs" aria-hidden="true">
        <defs>
          <filter
            id="liquid-glass-badge"
            x="-8%"
            y="-8%"
            width="116%"
            height="116%"
            filterUnits="objectBoundingBox"
            primitiveUnits="objectBoundingBox"
          >
            {/* 1. Base blur of the backdrop */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0.02"
              result="blur"
            />

            {/* 2. Procedural displacement (turbulence) */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9 1.2"
              numOctaves="2"
              seed="11"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1.6 -0.4"
              result="disp"
            />

            {/* 3. Refraction via displacement */}
            <feDisplacementMap
              in="blur"
              in2="disp"
              scale="0.035"
              xChannelSelector="R"
              yChannelSelector="G"
              result="refracted"
            />

            {/* 4. Saturation boost */}
            <feColorMatrix
              in="refracted"
              type="saturate"
              values="1.55"
              result="saturated"
            />

            {/* 5. Specular rim lighting */}
            <feSpecularLighting
              in="disp"
              surfaceScale="2.5"
              specularConstant="0.8"
              specularExponent="24"
              lightingColor="#ffffff"
              result="spec"
            >
              <fePointLight x="-0.35" y="-0.4" z="0.9" />
            </feSpecularLighting>

            {/* 6. Composite specular on refracted */}
            <feComposite
              in="spec"
              in2="saturated"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="0.6"
              k4="0"
              result="lit"
            />

            {/* 7. Final alpha tweak */}
            <feComponentTransfer in="lit" result="final">
              <feFuncA type="linear" slope="0.95" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <main className="badge-stage" aria-label="Denys Vitali employee badge">
        {/* Background scenery that the glass refracts */}
        <div className="badge-bg" aria-hidden="true">
          <div className="badge-bg__aurora" />
          <div className="badge-bg__grid" />
          <div className="badge-bg__orbs" />
          <div className="badge-bg__stripes" />
        </div>

        <header className="badge-topbar">
          <a className="badge-home" href="/" aria-label="Back to home">
            <Terminal size={16} aria-hidden="true" />
            <span>denv.it</span>
          </a>
          <span className="badge-pill">
            <ShieldCheck size={12} aria-hidden="true" />
            ACCESS · {employee.status}
          </span>
        </header>

        <div className="badge-wrap" ref={wrapRef}>
          <article
            ref={cardRef}
            className="badge"
            aria-labelledby="badge-name"
            data-reduced-transparency={prefersReducedTransparency}
          >
            {/* Stack of glass layers — each adds a physical optical effect */}
            <div className="badge-liquid" aria-hidden="true" />
            <div className="badge-depth" aria-hidden="true" />
            <div className="badge-holo" aria-hidden="true" />
            <div className="badge-glint" aria-hidden="true" />
            <div className="badge-rim" aria-hidden="true" />
            <div className="badge-grain" aria-hidden="true" />

            {/* Lanyard clip at top of badge */}
            <div className="badge-lanyard" aria-hidden="true">
              <span className="badge-lanyard__hole" />
            </div>

            {/* Card content — isolated so text stays readable above glass layers */}
            <div className="badge-content">
              <header className="badge-header">
                <p className="badge-company">
                  <span className="badge-company-mark" aria-hidden="true">
                    <Terminal size={10} />
                  </span>
                  <span className="badge-company-text">
                    {employee.company}
                    <small>{employee.companyTagline}</small>
                  </span>
                </p>
                <span className="badge-type">EMPLOYEE ID</span>
              </header>

              <div className="badge-body">
                <div className="badge-avatar" aria-hidden="true">
                  <span className="badge-avatar__shine" />
                  <span className="badge-avatar__initials">DV</span>
                </div>
                <div className="badge-id">
                  <h1 id="badge-name" className="badge-name">
                    {employee.name}
                  </h1>
                  <p className="badge-role">{employee.role}</p>
                  <p className="badge-dept">
                    <span className="badge-dept__label">DEPT</span>
                    <span className="badge-dept__value">
                      {employee.department}
                    </span>
                  </p>
                </div>
              </div>

              <footer className="badge-foot">
                <dl className="badge-meta">
                  <div className="badge-meta__row">
                    <dt>ID</dt>
                    <dd>{employee.employeeId}</dd>
                  </div>
                  <div className="badge-meta__row">
                    <dt>CLEAR</dt>
                    <dd className="badge-meta__value--accent">{employee.clearance}</dd>
                  </div>
                  <div className="badge-meta__row">
                    <dt>ISSUED</dt>
                    <dd>{employee.issued}</dd>
                  </div>
                  <div className="badge-meta__row">
                    <dt>EXPIRES</dt>
                    <dd>{employee.expires}</dd>
                  </div>
                </dl>
                <Barcode />
              </footer>
            </div>
          </article>
        </div>

        <p className="badge-hint">
          Property of denv.it · If found, return to security@lanyard
        </p>
      </main>
    </>
  );
}
