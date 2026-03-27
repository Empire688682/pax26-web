'use client'

import React, { useState, useEffect, useRef } from 'react';

/* ── Sections data ──────────────────────────────────────────────── */
const SECTIONS = [
  {
    num: "01",
    title: "Introduction",
    body: "Welcome to PAX26 TECHNOLOGIES. These Terms and Conditions ("Terms") govern your access to and use of the PAX26 TECHNOLOGIES website, mobile application, APIs, and all related services ("Services"). By creating an account or using our platform, you agree to be legally bound by these Terms. If you do not agree, you must discontinue use of PAX26 TECHNOLOGIES immediately.",
  },
  {
    num: "02",
    title: "Account Registration",
    body: "To access certain features, you must create an account. You agree to provide accurate, current, and complete information at all times. You are responsible for safeguarding your login credentials and for all activities that occur under your account. PAX26 TECHNOLOGIES is not responsible for any losses caused by unauthorized access to your account.",
  },
  {
    num: "03",
    title: "Eligibility",
    body: "You must be at least 13 years old (or the minimum legal age in your country) to use PAX26 TECHNOLOGIES. By using our Services, you represent that you are legally capable of entering a binding agreement and that you are not prohibited from using financial or digital services.",
  },
  {
    num: "04",
    title: "Wallet, Payments & Transactions",
    body: "PAX26 TECHNOLOGIES provides a digital wallet system that allows users to fund their accounts and pay for services such as airtime, data, electricity, subscriptions, and digital products. Wallet balances are not bank deposits and do not earn interest. All payments are processed using third-party providers such as Flutterwave, Monnify, or similar gateways.\n\nYou authorize PAX26 TECHNOLOGIES to debit your wallet or chosen payment method for all transactions initiated by your account. Once a transaction is completed, it cannot be reversed except where required by law or explicitly stated.",
  },
  {
    num: "05",
    title: "Fees & Charges",
    body: "PAX26 TECHNOLOGIES may charge service fees, transaction fees, or network fees depending on the service. All applicable charges will be displayed before you complete a transaction. Fees are non-refundable.",
  },
  {
    num: "06",
    title: "Refunds & Failed Transactions",
    body: "Digital services such as airtime, data, electricity, and subscriptions are non-refundable once successfully delivered. If a transaction fails or is duplicated, PAX26 TECHNOLOGIES may reverse or credit the wallet at its discretion after verification.",
  },
  {
    num: "07",
    title: "User Conduct",
    body: "You agree not to use PAX26 TECHNOLOGIES for illegal, fraudulent, or abusive purposes including but not limited to:",
    list: [
      "Money laundering or fraud",
      "Using stolen payment methods",
      "Creating fake or multiple accounts",
      "Attempting to hack or manipulate the system",
      "Violating telecom, banking, or financial laws",
    ],
  },
  {
    num: "08",
    title: "KYC & Compliance",
    body: "PAX26 TECHNOLOGIES may request identity verification to comply with anti-fraud, AML, and regulatory requirements. You agree to provide accurate documents when requested. Failure to comply may result in account suspension or termination.",
  },
  {
    num: "09",
    title: "Third-Party Providers",
    body: "PAX26 TECHNOLOGIES relies on telecom companies, electricity providers, and payment gateways to deliver services. We are not responsible for delays, outages, pricing errors, or failures caused by these providers.",
  },
  {
    num: "10",
    title: "Intellectual Property",
    body: "All software, branding, logos, designs, and content belong to PAX26 TECHNOLOGIES. You may not copy, modify, or redistribute any part of the platform without written permission.",
  },
  {
    num: "11",
    title: "Privacy & Data",
    body: "By using PAX26 TECHNOLOGIES, you consent to the collection and processing of personal data including email, phone number, transaction history, and device information. Data is handled according to our Privacy Policy and applicable laws.",
  },
  {
    num: "12",
    title: "Disclaimers",
    body: 'PAX26 TECHNOLOGIES is provided on an "as is" and "as available" basis. We do not guarantee that the platform will be error-free, uninterrupted, or always available.',
  },
  {
    num: "13",
    title: "Limitation of Liability",
    body: "PAX26 TECHNOLOGIES shall not be liable for any indirect, incidental, or consequential damages including loss of funds, data, profits, or service interruptions.",
  },
  {
    num: "14",
    title: "Account Suspension & Termination",
    body: "PAX26 TECHNOLOGIES may suspend or terminate your account if you violate these Terms, engage in fraud, or if required by law. Remaining balances may be frozen during investigations.",
  },
  {
    num: "15",
    title: "Governing Law",
    body: "These Terms are governed by the laws of Nigeria. Any disputes shall be resolved in Nigerian courts.",
  },
  {
    num: "16",
    title: "Changes to Terms",
    body: "PAX26 TECHNOLOGIES may update these Terms at any time. Continued use of the platform means you accept the changes.",
  },
  {
    num: "17",
    title: "Contact",
    body: "For support or legal questions, contact us at ",
    email: "info@pax26.com",
  },
];

export default function TermsAndConditions() {
  const [active, setActive]   = useState("01");
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef({});

  /* track scroll for header */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* intersection observer — highlight active nav item */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.dataset.num);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (num) => {
    sectionRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink:    #0a0a0f;
          --paper:  #f5f3ee;
          --gold:   #c9a84c;
          --gold2:  #e8c96b;
          --muted:  #6b6b78;
          --rule:   rgba(0,0,0,0.1);
          --serif:  'Playfair Display', Georgia, serif;
          --mono:   'DM Mono', monospace;
          --sans:   'Outfit', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body { background: var(--paper); color: var(--ink); }

        /* scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--paper); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 4px; }

        @keyframes tc-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tc-line-grow {
          from { scaleX: 0; }
          to   { scaleX: 1; }
        }
        @keyframes tc-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes tc-float {
          0%,100% { transform: translateY(0);   }
          50%      { transform: translateY(-8px); }
        }

        .tc-hero-title {
          font-family: var(--serif);
          font-size: clamp(2.8rem, 6vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--ink);
          animation: tc-fade-up 0.8s ease both;
        }

        .tc-hero-sub {
          font-family: var(--mono);
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          animation: tc-fade-up 0.8s ease 0.15s both;
        }

        .tc-badge {
          font-family: var(--mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: var(--ink);
          color: var(--paper);
          padding: 4px 12px;
          border-radius: 2px;
        }

        .tc-nav-item {
          font-family: var(--mono);
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s ease, padding-left 0.2s ease;
          color: var(--muted);
          padding: 5px 0 5px 12px;
          border-left: 1.5px solid transparent;
          display: block;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tc-nav-item.active {
          color: var(--ink);
          border-left-color: var(--gold);
          padding-left: 16px;
        }
        .tc-nav-item:hover {
          color: var(--ink);
          padding-left: 14px;
        }

        .tc-section {
          animation: tc-fade-up 0.6s ease both;
        }

        .tc-section-num {
          font-family: var(--mono);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: var(--gold);
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }

        .tc-section-title {
          font-family: var(--serif);
          font-size: clamp(1.3rem, 2.5vw, 1.8rem);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .tc-section-body {
          font-family: var(--sans);
          font-size: 0.93rem;
          line-height: 1.85;
          color: #3a3a45;
          font-weight: 300;
        }

        .tc-rule {
          width: 40px;
          height: 1.5px;
          background: var(--gold);
          margin: 10px 0 16px;
          transform-origin: left;
        }

        .tc-list-item {
          font-family: var(--sans);
          font-size: 0.9rem;
          font-weight: 300;
          color: #3a3a45;
          line-height: 1.7;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid var(--rule);
        }
        .tc-list-item:last-child { border-bottom: none; }

        .tc-list-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
          margin-top: 8px;
        }

        .tc-grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        .tc-ornament {
          font-family: var(--serif);
          font-style: italic;
          font-size: 4rem;
          line-height: 1;
          color: var(--gold);
          opacity: 0.2;
          user-select: none;
          pointer-events: none;
        }

        /* sticky nav */
        .tc-sticky-nav {
          position: sticky;
          top: 96px;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }
        .tc-sticky-nav::-webkit-scrollbar { width: 2px; }
        .tc-sticky-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }

        /* header */
        .tc-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: background 0.3s ease, box-shadow 0.3s ease;
          padding: 16px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tc-header.scrolled {
          background: rgba(245,243,238,0.92);
          backdrop-filter: blur(12px);
          box-shadow: 0 1px 0 var(--rule);
        }

        .tc-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), var(--gold2));
          z-index: 200;
          transition: width 0.1s linear;
        }

        @media (max-width: 768px) {
          .tc-sidebar { display: none; }
          .tc-header { padding: 14px 20px; }
        }
      `}</style>

      {/* grain overlay */}
      <div className="tc-grain" />

      {/* scroll progress */}
      <ScrollProgress />

      {/* ── Fixed header ────────────────────────────── */}
      <header className={`tc-header ${scrolled ? "scrolled" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "6px",
            background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--gold)", letterSpacing: "0.05em" }}>
              P26
            </span>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)" }}>
            Legal
          </span>
        </div>
        <a href="/" style={{
          fontFamily: "var(--mono)", fontSize: "0.65rem", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--muted)", textDecoration: "none",
          transition: "color 0.2s ease",
        }}
          onMouseEnter={e => e.target.style.color = "var(--ink)"}
          onMouseLeave={e => e.target.style.color = "var(--muted)"}>
          ← Back to PAX26 TECHNOLOGIES
        </a>
      </header>

      <div style={{ paddingTop: "80px", minHeight: "100vh", background: "var(--paper)" }}>

        {/* ── Hero ────────────────────────────────────── */}
        <div style={{
          padding: "72px 40px 64px",
          borderBottom: "1px solid var(--rule)",
          position: "relative",
          overflow: "hidden",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>

          {/* background ornament */}
          <div className="tc-ornament" style={{
            position: "absolute", top: "20px", right: "40px",
            fontSize: "12rem", opacity: 0.06,
          }}>§</div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span className="tc-badge">PAX26 TECHNOLOGIES Technologies</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em" }}>
                Effective 2025
              </span>
            </div>

            <h1 className="tc-hero-title">
              Terms &<br />
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Conditions</span>
            </h1>

            <p className="tc-hero-sub" style={{ marginTop: "20px" }}>
              17 Sections · Last updated January 2025 · Governed by Nigerian Law
            </p>

            {/* decorative rule */}
            <div style={{
              marginTop: "36px",
              display: "flex", alignItems: "center", gap: "16px",
            }}>
              <div style={{ width: "60px", height: "1px", background: "var(--gold)" }} />
              <span style={{ fontFamily: "var(--sans)", fontSize: "0.85rem", fontWeight: 300, color: "var(--muted)" }}>
                Please read carefully before using our platform
              </span>
            </div>
          </div>
        </div>

        {/* ── Body: sidebar + content ──────────────────── */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "80px",
          alignItems: "start",
        }}>

          {/* ── Sidebar nav ────────────────────────────── */}
          <aside className="tc-sidebar tc-sticky-nav" style={{ paddingTop: "56px" }}>
            <p style={{
              fontFamily: "var(--mono)", fontSize: "0.6rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--muted)", marginBottom: "16px",
            }}>
              Contents
            </p>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {SECTIONS.map(s => (
                <button key={s.num}
                  className={`tc-nav-item ${active === s.num ? "active" : ""}`}
                  onClick={() => scrollTo(s.num)}
                  style={{ background: "none", border: "none", textAlign: "left" }}>
                  <span style={{ color: "var(--gold)", marginRight: "6px" }}>{s.num}</span>
                  {s.title}
                </button>
              ))}
            </nav>

            {/* bottom ornament */}
            <div style={{
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid var(--rule)",
            }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", color: "var(--muted)", letterSpacing: "0.08em", lineHeight: 1.6 }}>
                © 2025 PAX26 TECHNOLOGIES<br />All rights reserved
              </p>
            </div>
          </aside>

          {/* ── Sections content ────────────────────────── */}
          <main style={{ paddingTop: "56px", paddingBottom: "120px" }}>
            {SECTIONS.map((s, idx) => (
              <section
                key={s.num}
                ref={el => sectionRefs.current[s.num] = el}
                data-num={s.num}
                className="tc-section"
                style={{
                  paddingTop: idx === 0 ? "0" : "64px",
                  paddingBottom: "64px",
                  borderBottom: idx < SECTIONS.length - 1 ? "1px solid var(--rule)" : "none",
                  animationDelay: `${idx * 0.04}s`,
                }}>

                {/* section number + rule */}
                <span className="tc-section-num">{s.num} / {String(SECTIONS.length).padStart(2,"0")}</span>
                <div className="tc-rule" />

                {/* title */}
                <h2 className="tc-section-title">{s.title}</h2>

                {/* body */}
                {s.body.split("\n\n").map((para, pi) => (
                  <p key={pi} className="tc-section-body"
                    style={{ marginBottom: para !== s.body.split("\n\n").at(-1) ? "16px" : "0" }}>
                    {para}
                    {s.email && pi === s.body.split("\n\n").length - 1 && (
                      <a href={`mailto:${s.email}`}
                        style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid var(--gold)" }}>
                        {s.email}
                      </a>
                    )}
                  </p>
                ))}

                {/* list */}
                {s.list && (
                  <div style={{ marginTop: "20px", border: "1px solid var(--rule)", borderRadius: "8px", overflow: "hidden" }}>
                    {s.list.map((item, li) => (
                      <div key={li} className="tc-list-item" style={{ padding: "12px 16px" }}>
                        <div className="tc-list-dot" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* ── Footer signature ──────────────────────── */}
            <div style={{
              marginTop: "80px",
              padding: "40px",
              background: "var(--ink)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              textAlign: "center",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink)", fontWeight: 500 }}>P26</span>
              </div>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "1.2rem", color: "var(--paper)", opacity: 0.9 }}>
                PAX26 TECHNOLOGIES Technologies
              </p>
              <p style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "rgba(245,243,238,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Empowering businesses · Nigeria · 2025
              </p>
              <div style={{ width: "40px", height: "1px", background: "var(--gold)", opacity: 0.4 }} />
              <p style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "rgba(245,243,238,0.3)", letterSpacing: "0.08em" }}>
                © 2025 PAX26 TECHNOLOGIES. All rights reserved.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

/* ── Scroll progress bar ─────────────────────────────────────────── */
function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setWidth(Math.min(pct, 100));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="tc-progress" style={{ width: `${width}%` }} />;
}