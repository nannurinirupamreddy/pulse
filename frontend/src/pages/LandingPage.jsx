import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --bg: #F5F2EC;
    --bg2: #EEEBE3;
    --ink: #1A1816;
    --ink2: #4A4740;
    --ink3: #8C897F;
    --accent: #C4622D;
    --accent2: #E8A87C;
    --green: #2D6A4F;
    --green-light: #D8F3DC;
    --card: #FDFAF5;
    --border: rgba(26,24,22,0.1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  .pulse-root {
    background: var(--bg);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* NAV */
  .p-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 2.5rem;
    background: rgba(245,242,236,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .p-nav-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.4rem;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .p-nav-logo span { color: var(--accent); }
  .p-nav-links { display: flex; gap: 2rem; list-style: none; align-items: center; }
  .p-nav-links a {
    font-size: 0.875rem;
    color: var(--ink2);
    text-decoration: none;
    font-weight: 400;
    transition: color 0.2s;
  }
  .p-nav-links a:hover { color: var(--ink); }
  .p-nav-cta {
    background: var(--ink) !important;
    color: var(--bg) !important;
    padding: 0.5rem 1.25rem !important;
    border-radius: 100px !important;
    font-weight: 500 !important;
    transition: background 0.2s !important;
  }
  .p-nav-cta:hover { background: var(--accent) !important; color: #fff !important; }

  /* HERO */
  .p-hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding-top: 5rem;
    overflow: hidden;
  }
  .p-hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 6rem 3rem 6rem 5rem;
  }
  .p-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--green-light);
    color: var(--green);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.35rem 0.875rem;
    border-radius: 100px;
    margin-bottom: 1.75rem;
    width: fit-content;
  }
  .p-eyebrow-dot {
    width: 6px; height: 6px;
    background: var(--green);
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }
  .p-h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: var(--ink);
    margin-bottom: 1.5rem;
  }
  .p-h1 em { font-style: italic; color: var(--accent); }
  .p-hero-sub {
    font-size: 1.1rem;
    color: var(--ink2);
    max-width: 460px;
    line-height: 1.7;
    margin-bottom: 2.5rem;
    font-weight: 300;
  }
  .p-hero-actions {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
  }
  .p-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--ink);
    color: var(--bg);
    padding: 0.875rem 2rem;
    border-radius: 100px;
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.25s;
    border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .p-btn-primary:hover { background: var(--accent); transform: translateY(-1px); }
  .p-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--ink2);
    font-size: 0.875rem;
    text-decoration: none;
    font-weight: 400;
    transition: color 0.2s;
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .p-btn-ghost:hover { color: var(--ink); }
  .p-hero-trust {
    margin-top: 3rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--ink3);
  }
  .p-avatars { display: flex; }
  .p-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid var(--bg);
    margin-left: -8px;
    background: var(--bg2);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 500; color: var(--ink2);
  }
  .p-avatar:first-child { margin-left: 0; }

  /* HERO RIGHT */
  .p-hero-right {
    background: var(--bg2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6rem 3rem 6rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .p-hero-right::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(196,98,45,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .p-phone {
    width: 320px;
    background: var(--card);
    border-radius: 28px;
    border: 1px solid var(--border);
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(26,24,22,0.15);
    position: relative; z-index: 2;
    animation: float 4s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  .p-phone-header {
    background: var(--ink);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .p-pulse-icon {
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .p-phone-header-text p:first-child { font-size: 0.875rem; font-weight: 500; color: #fff; }
  .p-phone-header-text p:last-child { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
  .p-online-dot {
    width: 7px; height: 7px;
    background: #4CAF50;
    border-radius: 50%;
    margin-left: auto;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  .p-chat-area {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 380px;
  }
  .p-chat-date {
    text-align: center;
    font-size: 0.7rem;
    color: var(--ink3);
    padding: 0.25rem 0;
  }
  .p-bubble {
    max-width: 85%;
    padding: 0.625rem 0.875rem;
    border-radius: 14px;
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .p-bubble-coach {
    background: var(--bg2);
    color: var(--ink);
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }
  .p-bubble-user {
    background: var(--ink);
    color: #fff;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
  }
  .p-bubble-label {
    font-size: 0.65rem;
    color: var(--ink3);
    margin-bottom: 0.25rem;
  }
  .p-plan-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 0.75rem;
    align-self: flex-start;
    max-width: 92%;
  }
  .p-plan-card-title {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
  }
  .p-plan-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--ink);
    padding: 0.25rem 0;
  }
  .p-plan-item::before {
    content: '';
    width: 4px; height: 4px;
    background: var(--accent);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* SHARED SECTION */
  .p-section { padding: 6rem 5rem; }
  .p-section-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1rem;
  }
  .p-h2 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 3.5vw, 3rem);
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin-bottom: 1.25rem;
  }
  .p-h2 em { font-style: italic; color: var(--accent); }
  .p-section-sub {
    font-size: 1rem;
    color: var(--ink2);
    max-width: 500px;
    line-height: 1.7;
    font-weight: 300;
  }

  /* LOOP */
  .p-loop-section {
    background: var(--ink);
    color: #fff;
    padding: 6rem 5rem;
  }
  .p-loop-section .p-section-label { color: var(--accent2); }
  .p-loop-section .p-h2 { color: #fff; }
  .p-loop-section .p-section-sub { color: rgba(255,255,255,0.6); margin-top: 0.75rem; }
  .p-loop-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 4rem;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .p-loop-step {
    padding: 2rem;
    border-right: 1px solid rgba(255,255,255,0.08);
    position: relative;
    transition: background 0.3s;
  }
  .p-loop-step:last-child { border-right: none; }
  .p-loop-step:hover { background: rgba(255,255,255,0.04); }
  .p-loop-time {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent2);
    margin-bottom: 1rem;
    font-weight: 500;
  }
  .p-loop-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem;
    font-size: 1.1rem;
  }
  .p-loop-step h3 { font-size: 1.05rem; font-weight: 500; color: #fff; margin-bottom: 0.5rem; }
  .p-loop-step p { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.6; font-weight: 300; }
  .p-loop-arrow {
    position: absolute;
    right: -16px; top: 50%;
    transform: translateY(-50%);
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    z-index: 2; font-size: 0.75rem; color: #fff;
  }

  /* FEATURES */
  .p-features-section { background: var(--card); padding: 6rem 5rem; }
  .p-features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 3.5rem;
  }
  .p-feature-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    transition: transform 0.25s, box-shadow 0.25s;
  }
  .p-feature-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(26,24,22,0.08); }
  .p-feature-card-wide {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: center;
  }
  .p-feature-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: var(--card);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem;
    font-size: 1.2rem;
  }
  .p-feature-card h3 { font-size: 1.05rem; font-weight: 500; color: var(--ink); margin-bottom: 0.625rem; }
  .p-feature-card p { font-size: 0.875rem; color: var(--ink2); line-height: 1.65; font-weight: 300; }
  .p-feature-quote {
    background: var(--card);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 0 12px 12px 0;
    padding: 1.25rem;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: var(--ink2);
    line-height: 1.6;
    font-style: italic;
    font-family: 'DM Serif Display', serif;
  }
  .p-fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .p-fade-up.visible { opacity: 1; transform: translateY(0); }

  /* DOMAINS */
  .p-domains-section { background: var(--bg); padding: 6rem 5rem; }
  .p-domains-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 3rem; }
  .p-domain-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 100px;
    font-size: 0.875rem;
    color: var(--ink2);
    font-weight: 400;
    transition: all 0.2s;
    cursor: default;
  }
  .p-domain-tag:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
  .p-domain-tag span { font-size: 1rem; }
  .p-domain-v2 { opacity: 0.5; }

  /* MOAT */
  .p-moat-section {
    background: var(--accent);
    padding: 6rem 5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }
  .p-moat-section .p-h2 { color: #fff; }
  .p-moat-section .p-h2 em { color: #1A1816; }
  .p-moat-section .p-section-label { color: rgba(255,255,255,0.7); }
  .p-moat-section .p-moat-p { color: rgba(255,255,255,0.85); font-weight: 300; line-height: 1.75; font-size: 1.05rem; margin-top: 1rem; }
  .p-moat-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .p-moat-col {
    background: rgba(0,0,0,0.15);
    border-radius: 16px;
    padding: 1.5rem;
  }
  .p-moat-col-pulse { background: rgba(255,255,255,0.15); }
  .p-moat-col-label {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    margin-bottom: 1.25rem;
  }
  .p-moat-col-pulse .p-moat-col-label { color: rgba(255,255,255,0.9); }
  .p-moat-item {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    margin-bottom: 0.875rem;
    font-size: 0.82rem;
    color: rgba(255,255,255,0.65);
    line-height: 1.5;
  }
  .p-moat-col-pulse .p-moat-item { color: rgba(255,255,255,0.92); }

  /* CTA */
  .p-cta-section {
    background: var(--ink);
    padding: 8rem 5rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .p-cta-section::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(196,98,45,0.2) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  .p-cta-section .p-h2 { color: #fff; font-size: clamp(2rem, 4vw, 3.5rem); max-width: 700px; margin: 0 auto 1.5rem; position: relative; z-index: 2; }
  .p-cta-section .p-section-label { color: var(--accent2); position: relative; z-index: 2; }
  .p-cta-section .p-section-sub { color: rgba(255,255,255,0.55); margin: 0 auto; position: relative; z-index: 2; }
  .p-cta-input-wrap {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    max-width: 420px;
  }
  .p-cta-email {
    flex: 1;
    padding: 0.875rem 1.25rem;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 0.9rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
  }
  .p-cta-email::placeholder { color: rgba(255,255,255,0.4); }
  .p-cta-btn {
    white-space: nowrap;
    flex-shrink: 0;
    background: var(--accent) !important;
    color: #fff !important;
    font-size: 1rem;
    padding: 1rem 2rem;
  }
  .p-cta-btn:hover { background: var(--accent2) !important; color: var(--ink) !important; }
  .p-cta-note { color: rgba(255,255,255,0.35); font-size: 0.8rem; margin-top: 1.25rem; position: relative; z-index: 2; }

  /* FOOTER */
  .p-footer {
    background: var(--ink);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 2rem 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .p-footer p { font-size: 0.8rem; color: rgba(255,255,255,0.3); }

  @media (max-width: 900px) {
    .p-nav { padding: 1rem 1.5rem; }
    .p-nav-links { display: none; }
    .p-hero { grid-template-columns: 1fr; }
    .p-hero-left { padding: 5rem 1.5rem 3rem; }
    .p-hero-right { display: none; }
    .p-section, .p-loop-section, .p-moat-section, .p-cta-section,
    .p-features-section, .p-domains-section { padding: 4rem 1.5rem; }
    .p-footer { padding: 2rem 1.5rem; }
    .p-loop-grid { grid-template-columns: 1fr 1fr; }
    .p-features-grid { grid-template-columns: 1fr; }
    .p-feature-card-wide { grid-column: auto; grid-template-columns: 1fr; }
    .p-moat-section { grid-template-columns: 1fr; gap: 2.5rem; }
  }
`;

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

function Nav({ onSignIn, onSignUp }) {
  return (
    <nav className="p-nav">
      <div className="p-nav-logo">Pulse<span>.</span></div>
      <ul className="p-nav-links">
        <li><a href="#loop">How it works</a></li>
        {/* <li><a href="#features">Features</a></li> */}
        {/* <li><a href="#moat">Why Pulse</a></li> */}
        <li>
          <button type="button" className="p-btn-ghost" onClick={onSignIn}>
            Sign in
          </button>
        </li>
        <li>
          <button type="button" className="p-nav-cta" onClick={onSignUp}>
            Get started
          </button>
        </li>
      </ul>
    </nav>
  );
}

function PhoneMockup() {
  return (
    <div className="p-phone">
      <div className="p-phone-header">
        <div className="p-pulse-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div className="p-phone-header-text">
          <p>Pulse Coach</p>
          <p>Morning check-in</p>
        </div>
        <div className="p-online-dot" />
      </div>
      <div className="p-chat-area">
        <div className="p-chat-date">Today, 7:14 AM</div>
        <div>
          <div className="p-bubble-label">Pulse</div>
          <div className="p-bubble p-bubble-coach">Morning! How'd you sleep — and how's the knee feeling today?</div>
        </div>
        <div className="p-bubble p-bubble-user">Slept about 5.5 hrs. Knee is a bit stiff but not bad. Stressed about a big presentation today.</div>
        <div>
          <div className="p-bubble-label">Pulse</div>
          <div className="p-bubble p-bubble-coach">Got it. Rough night + a high-stakes day — let's not stack stress on stress. Here's what I'm thinking:</div>
        </div>
        <div className="p-plan-card">
          <div className="p-plan-card-title">Today's adapted plan</div>
          {["20 min walk, no running (knee + sleep)", "Box breathing before your presentation", "High protein lunch — avoid the crash", "Leg day moved to Thursday"].map((item, i) => (
            <div className="p-plan-item" key={i}>{item}</div>
          ))}
        </div>
        <div className="p-bubble p-bubble-user">Perfect. What about my 5K goal at this rate?</div>
        <div>
          <div className="p-bubble-label">Pulse</div>
          <div className="p-bubble p-bubble-coach">You're 6 days behind pace. Still doable — but Thursday's run matters. Want me to remind you?</div>
        </div>
      </div>
    </div>
  );
}

function Hero({ onSignIn, onSignUp }) {
  return (
    <section className="p-hero" style={{ padding: 0 }}>
      <div className="p-hero-left">
        <div className="p-eyebrow">
          <div className="p-eyebrow-dot" />
          Now Live
        </div>
        <h1 className="p-h1">
          The health coach<br />that <em>you</em> need
        </h1>
        <p className="p-hero-sub">
          Most health apps treat every session like the first. Pulse remembers your goals, your patterns, your excuses — and gets more valuable every single day.
        </p>
        <div className="p-hero-actions">
          <button type="button" className="p-btn-primary" onClick={onSignUp}>
            Signup
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          </button>
          <button type="button" className="p-btn-ghost" onClick={() => scrollTo("loop")}>
            See how it works
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 2v10M3 8l4 4 4-4" />
            </svg>
          </button>
        </div>
        <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--ink3)' }}>
          Already have an account?
          {' '}
          <button type="button" className="p-btn-ghost" style={{ display: 'inline', padding: 0 }} onClick={onSignIn}>
            Sign in
          </button>
        </p>
        {/* <div className="p-hero-trust">
          <div className="p-avatars">
            {[
              { initials: "KL", bg: "#DFE8F5", color: "#3A5A8A" },
              { initials: "MR", bg: "#F5E8DF", color: "#8A5A3A" },
              { initials: "JT", bg: "#E8F5DF", color: "#5A8A3A" },
              { initials: "AS", bg: "#F5DFF5", color: "#8A3A8A" },
              { initials: "+", bg: "var(--bg2)", color: "var(--ink2)" },
            ].map(({ initials, bg, color }, i) => (
              <div className="p-avatar" key={i} style={{ background: bg, color }}>{initials}</div>
            ))}
          </div>
          <span>340 people on the waitlist</span>
        </div> */}
      </div>
      <div className="p-hero-right">
        <PhoneMockup />
      </div>
    </section>
  );
}

function LoopSection() {
  const steps = [
    { time: "Morning", icon: "☀️", title: "Morning check-in", desc: "2-minute chat about sleep, energy, soreness, and mood. Takes less time than brewing coffee.", arrow: true },
    { time: "Instantly", icon: "⚡", title: "Today's adapted plan", desc: "Coach sees your check-in and rewrites the day. Slept 4 hours? Today is not leg day.", arrow: true },
    // { time: "During the day", icon: "🔔", title: "Proactive nudges", desc: "Water reminders, movement breaks, rest cues — timed to your actual schedule, not a generic timer.", arrow: true },
    { time: "Evening", icon: "🌙", title: "Evening debrief", desc: "What happened, what didn't. The coach logs it and uses it to be more accurate tomorrow.", arrow: false },
  ];
  return (
    <section className="p-loop-section" id="loop">
      <div className="p-section-label">The daily loop</div>
      <h2 className="p-h2">Two minutes in the morning.<br />Better day, every day.</h2>
      <p className="p-section-sub">A simple check-in ritual that compounds into something your old health app never could: a coach that knows your history.</p>
      <div className="p-loop-grid">
        {steps.map(({ time, icon, title, desc, arrow }, i) => (
          <div className="p-loop-step" key={i}>
            <div className="p-loop-time">{time}</div>
            <div className="p-loop-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{desc}</p>
            {arrow && <div className="p-loop-arrow">→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FadeCard({ children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.classList.add("visible");
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`p-feature-card p-fade-up${wide ? " p-feature-card-wide" : ""}`}>
      {children}
    </div>
  );
}

function WeeklyReviewCard() {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
      <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", fontWeight: 500, marginBottom: "1rem" }}>Week 12 review</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        {[
          { val: "4/5", label: "Workouts", color: "var(--green)" },
          { val: "68%", label: "Consistency", color: "var(--accent)" },
          { val: "7.1h", label: "Avg. sleep", color: "var(--ink)" },
        ].map(({ val, label, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 500, color, fontFamily: "'DM Serif Display', serif" }}>{val}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--ink3)" }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "var(--bg2)", borderRadius: 8, padding: "0.75rem", fontSize: "0.8rem", color: "var(--ink2)", lineHeight: 1.55 }}>
        <strong style={{ color: "var(--ink)", display: "block", marginBottom: "0.25rem" }}>Focus this week:</strong>
        You've skipped every Sunday run for 3 weeks. At this rate you won't hit your October 5K. Want to talk about it?
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="p-features-section" id="features">
      <div className="p-section-label">What makes Pulse different</div>
      <h2 className="p-h2">A coach, not a <em>chatbot</em></h2>
      <p className="p-section-sub">Every conversation is a continuation. Your history, patterns, and goals stay with you across every session.</p>
      <div className="p-features-grid">
        <FadeCard>
          <div className="p-feature-icon">🧠</div>
          <h3>Persistent memory</h3>
          <p>Remembers your goals, injuries, excuses, and what actually motivates you — not just in this conversation, but across every session you've ever had.</p>
        </FadeCard>
        <FadeCard>
          <div className="p-feature-icon">🎯</div>
          <h3>Honest accountability</h3>
          <p>It tracks your patterns, not just your intentions.</p>
          <div className="p-feature-quote">"You said the same thing about your knee last Tuesday and still trained. How did that work out?"</div>
        </FadeCard>
        <FadeCard wide>
          <div>
            <div className="p-feature-icon">📈</div>
            <h3>Weekly honest review</h3>
            <p>Every Sunday: what you planned vs. what actually happened, your consistency score, and one thing to focus on next week. No motivational fluff. No sugarcoating. Just the truth, delivered with care.</p>
          </div>
          <WeeklyReviewCard />
        </FadeCard>
        <FadeCard>
          <div className="p-feature-icon">🎭</div>
          <h3>Personality calibration</h3>
          <p>Over time it learns whether you respond better to tough love or encouragement, and shifts its tone. The longer you use it, the more it sounds like a coach who actually gets you.</p>
        </FadeCard>
        <FadeCard>
          <div className="p-feature-icon">🔄</div>
          <h3>Adaptive planning</h3>
          <p>If you slept 4 hours and have a stressful meeting, today is not leg day. The plan changes around your real life automatically — without you having to ask.</p>
        </FadeCard>
      </div>
    </section>
  );
}

function DomainsSection() {
  const domains = [
    { icon: "🏋️", label: "Workouts" },
    { icon: "😴", label: "Sleep" },
    { icon: "🥗", label: "Nutrition" },
    { icon: "🧘", label: "Stress" },
    { icon: "🔋", label: "Recovery" },
    { icon: "✅", label: "Habits" },
    // { icon: "⌚", label: "Wearable data", v2: true },
    // { icon: "📅", label: "Calendar sync", v2: true },
  ];
  return (
    <section className="p-domains-section">
      <div className="p-section-label">Coverage</div>
      <h2 className="p-h2">All of health,<br />one conversation</h2>
      <p className="p-section-sub"> you tell Pulse, Pulse responds. No integrations needed to start seeing results.</p>
      <div className="p-domains-grid">
        {domains.map(({ icon, label, v2 }) => (
          <div key={label} className={`p-domain-tag${v2 ? " p-domain-v2" : ""}`}>
            <span>{icon}</span> {label}{v2 && <span style={{ fontSize: "0.65rem", fontWeight: 500, background: "var(--bg2)", padding: "1px 5px", borderRadius: 4, color: "var(--ink3)", marginLeft: 4 }}>v2</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function MoatSection() {
  const others = ["Fresh start each session", "No pattern detection", "Generic advice", "Motivational theater", "Static plans"];
  const pulse = ["Remembers everything", "Spots your patterns", "Context-aware coaching", "Honest accountability", "Adapts to your real life"];
  return (
    <section className="p-moat-section" id="moat">
      <div>
        <div className="p-section-label">The difference</div>
        <h2 className="p-h2">Every other app<br />forgets you by <em>tomorrow</em></h2>
        <p className="p-moat-p">Every health app treats each session as isolated. Pulse treats every conversation as a continuation — it knows your history, your patterns, your relationship with your goals.</p>
        <p className="p-moat-p">The longer you use it, the more valuable it gets. That's not a feature. That's the moat.</p>
      </div>
      <div className="p-moat-comparison">
        <div className="p-moat-col">
          <div className="p-moat-col-label">Other apps</div>
          {others.map((t) => <div className="p-moat-item" key={t}><span>✗</span> {t}</div>)}
        </div>
        <div className="p-moat-col p-moat-col-pulse">
          <div className="p-moat-col-label">Pulse</div>
          {pulse.map((t) => <div className="p-moat-item" key={t}><span>✓</span> {t}</div>)}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <section className="p-cta-section" id="cta">
      <div className="p-section-label">SIGN UP</div>
      <h2 className="p-h2">Ready for a<br /><em>coach?</em></h2>
      <p className="p-section-sub">Sign up and join the people already using Pulse.</p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", position: "relative", zIndex: 2, marginTop: "2.5rem" }}>
        {/* {submitted ? (
          <div style={{ color: "var(--accent2)", fontSize: "1.1rem", fontFamily: "'DM Serif Display', serif" }}>You're on the list. We'll be in touch ✓</div>
        ) : (
          <div className="p-cta-input-wrap">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-cta-email"
            />
            <button
              className="p-btn-primary p-cta-btn"
              onClick={() => email && setSubmitted(true)}
            >
              Join waitlist
            </button>
          </div>
        )} */}
        <p className="p-cta-note">Free to join. No credit card required.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="p-footer">
      <div className="p-nav-logo" style={{ color: "rgba(255,255,255,0.6)" }}>Pulse<span style={{ color: "var(--accent)" }}>.</span></div>
      <p>Built with React · Express · Supabase · Gemini</p>
      <p style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 Pulse Health, Inc.</p>
    </footer>
  );
}

export default function LandingPage({ onSignIn = () => {}, onSignUp = () => {} }) {
  return (
    <>
      <style>{styles}</style>
      <div className="pulse-root">
        <Nav onSignIn={onSignIn} onSignUp={onSignUp} />
        <Hero onSignIn={onSignIn} onSignUp={onSignUp} />
        <LoopSection />
        {/* <FeaturesSection /> */}
        <DomainsSection />
        {/* <MoatSection /> */}
        <CTASection />
        <Footer />
      </div>
    </>
  );
}