import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeContext";
import { getZenaiMarkDataUrl } from "@/branding/zenaiMark";
import { NeonLinesBackground } from "@/components/landing/NeonLinesBackground";

export function LandingPage() {
  const { themeId } = useTheme();

  return (
    <div className="landing-page">
      <NeonLinesBackground />
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <img alt="ZenAI" src={getZenaiMarkDataUrl(themeId)} className="landing-brand-icon" />
            <span>ZenAI</span>
          </Link>
          <div className="landing-nav-links">
            <a className="landing-nav-link landing-nav-link--active" href="#">Features</a>
            <a
              className="landing-nav-link"
              href="#pricing"
              onClick={(ev) => {
                ev.preventDefault();
                const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
                const el = document.getElementById("pricing");
                if (!el) return;
                el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
              }}
            >
              Pricing
            </a>
          </div>
          <div className="landing-nav-actions">
            <Link to="/register" className="landing-nav-cta">
              Get Started
            </Link>
            <div className="landing-theme-toggle">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-glow" />
          <div className="landing-hero-pattern">
            <div className="landing-hero-blob landing-hero-blob--1" />
            <div className="landing-hero-blob landing-hero-blob--2" />
          </div>
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Experience the Future of <br />
              <span className="landing-hero-gradient">Intelligence</span>
            </h1>
            <p className="landing-hero-subtitle">
              Step into a digital sanctuary designed for deep focus and seamless AI collaboration. ZenAI harmonizes technical precision with human-centric design.
            </p>
            <div className="landing-hero-cta">
              <Link to="/register" className="landing-btn landing-btn--primary">
                Enter the Sanctuary
              </Link>
              <a
                className="landing-btn landing-btn--secondary"
                href="https://github.com/SESASAN/ZenAi"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Documentation
              </a>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-features-header">
            <span className="landing-features-eyebrow">Core Architecture</span>
            <h2 className="landing-features-title">Atmospheric Engineering</h2>
          </div>
          <div className="landing-features-grid">
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <h3 className="landing-feature-title">Atmospheric Intelligence</h3>
              <p>A deep focus environment that adapts its UI density to your cognitive load, reducing friction during complex tasks.</p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h3 className="landing-feature-title">Neural Versatility</h3>
              <p>Seamlessly pivot between specialized LLM cores tailored for creative writing, technical logic, or emotional resonance.</p>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <span className="material-symbols-outlined">history_edu</span>
              </div>
              <h3 className="landing-feature-title">Intelligent Archiving</h3>
              <p>Chronological chat history indexed with semantic search, allowing you to recall precise moments in your collaboration history.</p>
            </div>
          </div>
        </section>

        <section className="landing-pricing">
          <div className="landing-pricing-inner">
            <div className="landing-pricing-header">
              <h2>Choose Your Path</h2>
              <p>Simple, transparent pricing for individual pioneers and elite teams.</p>
            </div>
            <div className="landing-pricing-grid">
              <div className="landing-pricing-card">
                <div className="landing-pricing-card-header">
                  <h3>Standard</h3>
                  <div className="landing-pricing-price">
                    <span>$0</span>
                    <span>/forever</span>
                  </div>
                </div>
                <ul className="landing-pricing-list">
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    Access to Zen-1 Core
                  </li>
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    1GB Secure Storage
                  </li>
                  <li>
                    <span className="material-symbols-outlined">check_circle</span>
                    Atmospheric UI Themes
                  </li>
                </ul>
                <Link to="/register" className="landing-pricing-btn">Get Started</Link>
              </div>
              <div className="landing-pricing-card landing-pricing-card--featured">
                <div className="landing-pricing-badge">Most Popular</div>
                <div className="landing-pricing-card-header">
                  <h3>ZenAI Ultra</h3>
                  <div className="landing-pricing-price">
                    <span>$24</span>
                    <span>/month</span>
                  </div>
                </div>
                <ul className="landing-pricing-list">
                  <li>
                    <span className="material-symbols-outlined material-symbols-outlined--filled">check_circle</span>
                    Priority Zen-Pro Access
                  </li>
                  <li>
                    <span className="material-symbols-outlined material-symbols-outlined--filled">check_circle</span>
                    Unlimited Neural Switching
                  </li>
                  <li>
                    <span className="material-symbols-outlined material-symbols-outlined--filled">check_circle</span>
                    Early Access to Beta Models
                  </li>
                  <li>
                    <span className="material-symbols-outlined material-symbols-outlined--filled">check_circle</span>
                    High-Priority Latency
                  </li>
                </ul>
                <Link to="/register" className="landing-pricing-btn landing-pricing-btn--primary">Upgrade to Ultra</Link>
              </div>
            </div>

            <p className="landing-pricing-disclaimer">
              Pricing is illustrative only — ZenAI doesn’t offer real pricing plans yet; this section is a UI demo that won’t be used.
            </p>
          </div>
          <div id="pricing" className="landing-anchor" />
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-top">
            <Link to="/" className="landing-footer-brand">
              <img alt="ZenAI" src={getZenaiMarkDataUrl(themeId)} className="landing-footer-icon" />
              <span>ZenAI</span>
            </Link>
            <div className="landing-footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Support</a>
              <a href="#">Status</a>
            </div>
          </div>

          <p className="landing-footer-legal">
            © {new Date().getFullYear()} ZenAI Digital Sanctuary. All rights reserved. Created by{" "}
            <a
              className="landing-footer-credit-link"
              href="https://sesasan.is-a.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              SESASAN
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
