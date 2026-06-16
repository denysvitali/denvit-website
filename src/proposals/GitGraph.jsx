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
  icon: GitCommit,
  branch: "main",
  tag: "HEAD",
  hash: "b10g4f",
  commit: "feat(blog): publish field notes",
  description:
    "Long-form notes on systems, security, infrastructure, and useful automation.",
  color: "#b86b2c",
  primary: true,
};

const socialLinks = [
  {
    title: "GitHub",
    href: "https://github.com/denysvitali",
    label: "github.com/denysvitali",
    icon: Code2,
    branch: "links/github",
    tag: "remote",
    hash: "8c41d2",
    commit: "chore(github): push side projects",
    description: "Code, experiments, and public repositories.",
    color: "#2f6f4e",
  },
  {
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/denysvitali",
    label: "linkedin.com/in/denysvitali",
    icon: BriefcaseBusiness,
    branch: "links/linkedin",
    tag: "work",
    hash: "4d9a71",
    commit: "docs(work): update professional profile",
    description: "Professional profile and work history.",
    color: "#386fa4",
  },
  {
    title: "Telegram",
    href: "https://t.me/denvit",
    label: "t.me/denvit",
    icon: Send,
    branch: "links/telegram",
    tag: "chat",
    hash: "f23a9e",
    commit: "fix(chat): keep direct contact reachable",
    description: "Fastest route for direct messages.",
    color: "#2f7c86",
  },
  {
    title: "Instagram",
    href: "https://instagram.com/denvit",
    label: "instagram.com/denvit",
    icon: Camera,
    branch: "links/instagram",
    tag: "photo",
    hash: "7bb520",
    commit: "feat(photo): publish visual notes",
    description: "Photos, trips, and occasional snapshots.",
    color: "#9a4f7a",
  },
  {
    title: "Twitter",
    href: "https://twitter.com/DenysVitali",
    label: "twitter.com/DenysVitali",
    icon: MessageCircle,
    branch: "links/twitter",
    tag: "social",
    hash: "2e6d90",
    commit: "refactor(feed): keep short-form updates tidy",
    description: "Short updates and technical notes.",
    color: "#8f5f2a",
  },
];

const graphLinks = [primaryLink, ...socialLinks];

export default function GitGraph() {
  return (
    <main className="gitgraph-shell">
      <header className="gitgraph-topbar">
        <a className="gitgraph-brand" href="/" aria-label="Back to home">
          <Terminal size={19} aria-hidden="true" />
          <span>denv.it</span>
        </a>
        <nav className="gitgraph-topnav" aria-label="Primary">
          <a href="/about">About</a>
          <a href="/android/privacy">Privacy</a>
        </nav>
      </header>

      <section className="gitgraph-workspace" aria-labelledby="gitgraph-title">
        <div className="gitgraph-heading">
          <div>
            <p className="gitgraph-kicker">
              <GitBranch size={16} aria-hidden="true" />
              <span>denv.it/link-graph</span>
            </p>
            <h1 id="gitgraph-title">Denys Vitali</h1>
          </div>

          <div className="gitgraph-repo-meta" aria-label="Repository summary">
            <span>
              <GitCommit size={15} aria-hidden="true" />
              {graphLinks.length} commits
            </span>
            <span>HEAD -&gt; main</span>
          </div>
        </div>

        <nav className="gitgraph-board" aria-label="Denys Vitali links">
          <div className="gitgraph-board-head" aria-hidden="true">
            <span className="gitgraph-window-controls">
              <span />
              <span />
              <span />
            </span>
            <span className="gitgraph-board-title">git log --graph --decorate</span>
          </div>

          <ol className="gitgraph-log" role="list">
            {graphLinks.map((link, index) => (
              <GitGraphEntry key={link.href} link={link} index={index} />
            ))}
          </ol>
        </nav>
      </section>
    </main>
  );
}

function GitGraphEntry({ link, index }) {
  const Icon = link.icon;
  const style = {
    "--entry-color": link.color,
    "--entry-delay": `${index * 75}ms`,
  };

  return (
    <li
      className={
        link.primary ? "gitgraph-entry is-primary" : "gitgraph-entry is-branch"
      }
      style={style}
    >
      <div className="gitgraph-rail" aria-hidden="true">
        <span className="gitgraph-mainline" />
        {!link.primary && (
          <>
            <span className="gitgraph-junction" />
            <span className="gitgraph-branch-line" />
          </>
        )}
        {link.primary && <span className="gitgraph-head-ring" />}
        <span className="gitgraph-commit-dot">
          <GitCommit size={link.primary ? 18 : 15} aria-hidden="true" />
        </span>
      </div>

      <a
        className="gitgraph-entry-link"
        href={link.href}
        aria-label={`${link.title}: ${link.label}. ${link.commit}. ${link.branch}, ${link.tag}.`}
      >
        <span className="gitgraph-entry-main">
          <span className="gitgraph-entry-title">
            <Icon size={18} aria-hidden="true" />
            <strong>{link.title}</strong>
          </span>
          <span className="gitgraph-entry-url">
            {link.label}
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </span>

        <span className="gitgraph-entry-detail">
          <span className="gitgraph-message">{link.commit}</span>
          <span className="gitgraph-description">{link.description}</span>
        </span>

        <span className="gitgraph-entry-meta" aria-hidden="true">
          <span className="gitgraph-hash">{link.hash}</span>
          <span className="gitgraph-branch-name">
            <GitBranch size={13} aria-hidden="true" />
            {link.branch}
          </span>
          <span className="gitgraph-tag">{link.tag}</span>
        </span>
      </a>
    </li>
  );
}
