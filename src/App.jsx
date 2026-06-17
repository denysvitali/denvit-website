import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Camera,
  Code2,
  MessageCircle,
  Send,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import TerminalHome from "./proposals/TerminalHome";
import DepartureBoard from "./proposals/DepartureBoard";
import GitGraph from "./proposals/GitGraph";
import EmployeeBadge from "./proposals/EmployeeBadge";

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
    title: "X",
    href: "https://x.com/DenysVitali",
    label: "x.com/DenysVitali",
    icon: MessageCircle,
  },
];

function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (href) => {
    window.history.pushState({}, "", href);
    setPath(window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (path === "/android/privacy") {
    return <PrivacyPage navigate={navigate} />;
  }

  if (path === "/about") {
    return <AboutPage navigate={navigate} />;
  }

  if (path === "/terminal") {
    return <TerminalHome />;
  }

  if (path === "/departures") {
    return <DepartureBoard />;
  }

  if (path === "/git") {
    return <GitGraph />;
  }

  if (path === "/card") {
    return <EmployeeBadge />;
  }

  return <HomePage navigate={navigate} />;
}

function HomePage({ navigate }) {
  return (
    <main className="site-shell">
      <BackgroundTexture />
      <header className="topbar">
        <button className="brand-mark" onClick={() => navigate("/")}>
          <Terminal size={19} aria-hidden="true" />
          <span>denv.it</span>
        </button>
        <nav className="topnav" aria-label="Primary">
          <button onClick={() => navigate("/about")}>About</button>
          <button onClick={() => navigate("/android/privacy")}>Privacy</button>
        </nav>
      </header>

      <section className="center-stage" aria-labelledby="home-title">
        <div className="identity">
          <p className="kicker">denv.it</p>
          <h1 id="home-title">Denys Vitali</h1>
          <p className="intro">
            Software systems, reverse engineering, Go, Kubernetes, security,
            and automation that solves real problems.
          </p>
        </div>

        <BlogPanel />

        <nav className="link-rail" aria-label="Social links">
          {socialLinks.map((link) => (
            <SocialLink key={link.href} link={link} />
          ))}
        </nav>
      </section>
    </main>
  );
}

function BlogPanel() {
  return (
    <div className="blog-panel-wrap">
      <a className="blog-panel" href={primaryLink.href}>
        <span className="panel-line" aria-hidden="true" />
        <small>/dev/random</small>
        <strong>Blog</strong>
        <span className="blog-url">
          {primaryLink.label}
          <ArrowUpRight size={22} aria-hidden="true" />
        </span>
        <p>Long-form notes on the systems I build, break, host, and automate.</p>
      </a>
    </div>
  );
}

function SocialLink({ link }) {
  const Icon = link.icon;

  return (
    <a href={link.href} aria-label={link.label}>
      <Icon size={18} aria-hidden="true" />
      <span>{link.title}</span>
    </a>
  );
}

function AboutPage({ navigate }) {
  return (
    <DocumentPage navigate={navigate} label="about" icon={Terminal}>
      <h1>Denys Vitali</h1>
      <p>
        I write about technology with a focus on reverse engineering, Go,
        Kubernetes, self-hosted infrastructure, open source, and practical
        automation.
      </p>
      <p>
        The blog is where the longer notes live: homelab architecture, security
        analysis, AI-assisted development workflows, and the occasional travel
        system that got built because it was useful.
      </p>
      <p>
        Start at <a href="https://blog.denv.it">blog.denv.it</a>.
      </p>
    </DocumentPage>
  );
}

function PrivacyPage({ navigate }) {
  return (
    <DocumentPage navigate={navigate} label="android" icon={ShieldCheck}>
      <h1>Privacy Policy</h1>
      <p>
        This privacy policy applies to all apps developed by Denys Vitali and
        published on the Google Play Store.
      </p>
      <h2>Data Collection</h2>
      <p>
        My apps do not collect any personal data from users. I do not use any
        tracking technologies or analytics services to monitor user activity.
      </p>
      <h2>Permissions</h2>
      <p>
        My apps may request certain permissions to provide functionality. These
        permissions are only used for their intended purpose and are not used to
        collect any personal data.
      </p>
      <h2>Changes to This Policy</h2>
      <p>
        I may update this privacy policy from time to time. Any changes will be
        posted on this page.
      </p>
      <h2>Contact Me</h2>
      <p>
        If you have any questions or concerns about this privacy policy, please
        contact me at <a href="mailto:privacy@denv.it">privacy@denv.it</a>.
      </p>
    </DocumentPage>
  );
}

function DocumentPage({ navigate, label, icon: Icon, children }) {
  return (
    <main className="document-page">
      <BackgroundTexture />
      <header className="topbar document-topbar">
        <button className="brand-mark" onClick={() => navigate("/")}>
          <Terminal size={19} aria-hidden="true" />
          <span>denv.it</span>
        </button>
        <a className="quiet-link" href={primaryLink.href}>
          Blog
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>

      <article className="document-card">
        <p className="document-kicker">
          <Icon size={18} aria-hidden="true" />
          {label}
        </p>
        {children}
      </article>
    </main>
  );
}

function BackgroundTexture() {
  return <div className="background-texture" aria-hidden="true" />;
}

export default App;
