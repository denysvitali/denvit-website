import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Code2,
  GitBranch,
  GitCommit,
  MessageCircle,
  Send,
  Terminal,
} from "lucide-react";
import "./gitgraph.css";

const primaryLink = {
  title: "Blog",
  href: "https://blog.denv.it",
  label: "blog.denv.it",
  commit: "feat: add Japan trip report",
};

const socialLinks = [
  {
    title: "GitHub",
    href: "https://github.com/denysvitali",
    label: "github.com/denysvitali",
    icon: Code2,
    commit: "chore: push latest side project",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/denysvitali",
    label: "linkedin.com/in/denysvitali",
    icon: BriefcaseBusiness,
    commit: "chore: update LinkedIn",
  },
  {
    title: "Telegram",
    href: "https://t.me/denvit",
    label: "t.me/denvit",
    icon: Send,
    commit: "fix: reply to DMs faster",
  },
  {
    title: "Instagram",
    href: "https://instagram.com/denvit",
    label: "instagram.com/denvit",
    icon: Camera,
    commit: "feat: post film scans",
  },
  {
    title: "Twitter",
    href: "https://twitter.com/DenysVitali",
    label: "twitter.com/DenysVitali",
    icon: MessageCircle,
    commit: "refactor: hot take on Go generics",
  },
];

const BRANCH_COLOR = "#a78bfa";
const TRUNK_COLOR = "#22d3ee";
const NODE_R = 6;
const TRUNK_NODE_R = 10;
const GAP_Y = 72;
const TRUNK_X = 48;
const BRANCH_X = 160;
const MERGE_X = 96;

export default function GitGraph() {
  const [ready, setReady] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const tooltipId = useId();
  const svgRef = useRef(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const totalHeight = (socialLinks.length + 1) * GAP_Y + 48;

  const handleNodeEnter = (e, commit) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text: commit,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleNodeLeave = () => setTooltip(null);

  const trunkNodes = [
    { y: 24, r: TRUNK_NODE_R, commit: primaryLink.commit, href: primaryLink.href, label: primaryLink.title, isTrunk: true },
    ...socialLinks.map((link, i) => ({
      y: 24 + (i + 1) * GAP_Y,
      r: NODE_R,
      commit: link.commit,
      href: null,
      label: null,
      isTrunk: true,
    })),
  ];

  const branchNodes = socialLinks.map((link, i) => ({
    y: 24 + (i + 1) * GAP_Y,
    r: NODE_R,
    commit: link.commit,
    href: link.href,
    label: link.title,
    icon: link.icon,
    isTrunk: false,
  }));

  const lines = [];

  // Trunk vertical line
  lines.push({
    key: "trunk",
    d: `M ${TRUNK_X} 24 L ${TRUNK_X} ${totalHeight - 24}`,
    color: TRUNK_COLOR,
    dash: `${totalHeight}`,
  });

  // Branch lines + merge connectors
  socialLinks.forEach((_, i) => {
    const y = 24 + (i + 1) * GAP_Y;
    // Branch horizontal to merge point
    lines.push({
      key: `branch-h-${i}`,
      d: `M ${BRANCH_X} ${y} L ${MERGE_X} ${y}`,
      color: BRANCH_COLOR,
      dash: `${BRANCH_X - MERGE_X}`,
    });
    // Merge curve into trunk
    lines.push({
      key: `merge-${i}`,
      d: `M ${MERGE_X} ${y} Q ${TRUNK_X} ${y} ${TRUNK_X} ${y - GAP_Y / 2}`,
      color: BRANCH_COLOR,
      dash: `${MERGE_X - TRUNK_X + GAP_Y / 2}`,
    });
  });

  return (
    <main className="gitgraph-shell">
      <header className="gitgraph-topbar">
        <a className="gitgraph-brand" href="/" aria-label="Back to home">
          <Terminal size={18} aria-hidden="true" />
          <span>denv.it</span>
        </a>
        <nav aria-label="Primary">
          <a href="/about">About</a>
          <a href="/android/privacy">Privacy</a>
        </nav>
      </header>

      <section className="gitgraph-stage" aria-label="Git graph links">
        <div className="gitgraph-canvas">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${BRANCH_X + 48} ${totalHeight}`}
            className="gitgraph-svg"
            aria-hidden="true"
          >
            {lines.map((line) => (
              <path
                key={line.key}
                d={line.d}
                fill="none"
                stroke={line.color}
                strokeWidth={2}
                strokeLinecap="round"
                className={ready ? "gitgraph-line ready" : "gitgraph-line"}
                style={{
                  strokeDasharray: line.dash,
                  strokeDashoffset: ready ? 0 : line.dash,
                }}
              />
            ))}

            {trunkNodes.map((node, i) => (
              <g key={`t-${i}`}>
                <circle
                  cx={TRUNK_X}
                  cy={node.y}
                  r={node.r}
                  className={
                    ready
                      ? "gitgraph-node trunk ready"
                      : "gitgraph-node trunk"
                  }
                  style={{ transitionDelay: `${i * 80}ms` }}
                />
                {node.isTrunk && i === 0 && (
                  <circle
                    cx={TRUNK_X}
                    cy={node.y}
                    r={node.r + 6}
                    className="gitgraph-pulse"
                    aria-hidden="true"
                  />
                )}
              </g>
            ))}

            {branchNodes.map((node, i) => (
              <g key={`b-${i}`}>
                <circle
                  cx={BRANCH_X}
                  cy={node.y}
                  r={node.r}
                  className={
                    ready
                      ? "gitgraph-node branch ready"
                      : "gitgraph-node branch"
                  }
                  style={{ transitionDelay: `${(i + 1) * 80 + 200}ms` }}
                />
              </g>
            ))}
          </svg>

          <ul className="gitgraph-list" role="list">
            <li className="gitgraph-item trunk-item">
              <a
                href={primaryLink.href}
                className="gitgraph-link trunk-link"
                aria-label={`${primaryLink.title} — ${primaryLink.commit}`}
                onMouseEnter={(e) => handleNodeEnter(e, primaryLink.commit)}
                onMouseLeave={handleNodeLeave}
                onFocus={(e) => handleNodeEnter(e, primaryLink.commit)}
                onBlur={handleNodeLeave}
              >
                <GitCommit size={16} aria-hidden="true" />
                <strong>{primaryLink.title}</strong>
                <span className="gitgraph-url">
                  {primaryLink.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              </a>
            </li>

            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href} className="gitgraph-item branch-item">
                  <GitBranch size={14} aria-hidden="true" className="gitgraph-branch-icon" />
                  <a
                    href={link.href}
                    className="gitgraph-link branch-link"
                    aria-label={`${link.title} — ${link.commit}`}
                    onMouseEnter={(e) => handleNodeEnter(e, link.commit)}
                    onMouseLeave={handleNodeLeave}
                    onFocus={(e) => handleNodeEnter(e, link.commit)}
                    onBlur={handleNodeLeave}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{link.title}</span>
                    <span className="gitgraph-url">{link.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {tooltip && (
        <div
          className="gitgraph-tooltip"
          role="tooltip"
          id={tooltipId}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </main>
  );
}
