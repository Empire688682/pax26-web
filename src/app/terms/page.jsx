'use client'

import React, { useState, useEffect, useRef } from 'react';

/* ── Sections data ──────────────────────────────────────────────── */
const SECTIONS = [
  {
    num: "01",
    title: "Introduction",
    body: 'Welcome to PAX26 TECHNOLOGIES. These Terms and Conditions ("Terms") govern your access to and use of the PAX26 TECHNOLOGIES website, mobile application, APIs, and all related services ("Services"). By creating an account or using our platform, you agree to be legally bound by these Terms. If you do not agree, you must discontinue use of PAX26 TECHNOLOGIES immediately.',
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

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .tc-root { font-family: 'Syne', sans-serif; background: #f8fafc; min-height: 100vh; color: #111827; }
  .tc-mono { font-family: 'DM Mono', monospace; }

  @keyframes tc-slide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tc-glow  { 0%,100%{opacity:0.12} 50%{opacity:0.22} }

  .tc-s1 { animation: tc-slide 0.4s ease both; }
  .tc-s2 { animation: tc-slide 0.4s ease 0.08s both; }
  .tc-s3 { animation: tc-slide 0.4s ease 0.16s both; }
  .tc-glow { animation: tc-glow 4s ease-in-out infinite; }

  .tc-header {
    position: fixed; top:0; left:0; right:0; z-index:100;
    height:64px; padding:0 40px;
    display:flex; align-items:center; justify-content:space-between;
    background:rgba(248,250,252,0.92); backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(0,0,0,0.07);
    transition: box-shadow 0.2s ease;
  }
  .tc-header.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,0.06); }

  .tc-progress {
    position:fixed; top:0; left:0; height:2px; z-index:200;
    background:linear-gradient(90deg,#3b82f6,#60a5fa);
    transition:width 0.1s linear;
    box-shadow: 0 0 8px rgba(59,130,246,0.5);
  }

  .tc-back-btn {
    display:flex; align-items:center; gap:6px;
    font-family:'DM Mono',monospace; font-size:10px;
    letter-spacing:0.08em; text-transform:uppercase;
    color:rgba(0,0,0,0.4); text-decoration:none;
    padding:8px 14px; border-radius:10px;
    border:1px solid rgba(0,0,0,0.09);
    transition:all 0.15s ease;
  }
  .tc-back-btn:hover {
    color:#3b82f6; border-color:rgba(59,130,246,0.3);
    background:rgba(59,130,246,0.05);
  }

  .tc-sidebar {
    position:sticky; top:88px;
    max-height:calc(100vh - 108px);
    overflow-y:auto; padding-bottom:24px;
  }
  .tc-sidebar::-webkit-scrollbar { width:2px; }
  .tc-sidebar::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.08); border-radius:4px; }

  .tc-nav-btn {
    display:flex; align-items:center; gap:8px;
    width:100%; padding:6px 10px 6px 12px;
    background:none; border:none; border-left:1.5px solid transparent;
    text-align:left; cursor:pointer;
    font-family:'DM Mono',monospace;
    font-size:10px; letter-spacing:0.04em;
    color:rgba(0,0,0,0.38); line-height:1.4;
    border-radius:0 8px 8px 0;
    transition:all 0.15s ease;
  }
  .tc-nav-btn:hover { color:#111827; background:rgba(59,130,246,0.05); padding-left:14px; }
  .tc-nav-btn.active {
    color:#3b82f6; border-left-color:#3b82f6;
    background:rgba(59,130,246,0.07); padding-left:16px;
    font-weight:500;
  }

  .tc-card {
    background:#fff; border:1px solid rgba(0,0,0,0.07);
    border-radius:20px; overflow:hidden; margin-bottom:14px;
    transition:box-shadow 0.2s ease, transform 0.2s ease;
  }
  .tc-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.07); transform:translateY(-1px); }

  .tc-body-text {
    font-family:'Syne',sans-serif;
    font-size:0.9rem; line-height:1.85;
    color:rgba(0,0,0,0.58); font-weight:400;
  }

  .tc-list-row {
    display:flex; align-items:flex-start; gap:12px;
    padding:10px 0;
    border-bottom:1px solid rgba(0,0,0,0.05);
    font-family:'Syne',sans-serif;
    font-size:0.88rem; color:rgba(0,0,0,0.58); line-height:1.65;
  }
  .tc-list-row:last-child { border-bottom:none; }

  @media (max-width:768px) {
    .tc-sidebar-col { display:none !important; }
    .tc-header { padding:0 20px; }
    .tc-body-grid { grid-template-columns:1fr !important; }
    .tc-hero { padding:44px 20px 40px !important; }
    .tc-main-pad { padding:20px 20px 80px !important; }
  }
`;

export default function TermsAndConditions() {
  const [active, setActive]     = useState("01");
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const sectionRefs             = useRef({});

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const el  = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(Math.min(pct, 100));
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.num); }),
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (num) =>
    sectionRefs.current[num]?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <style>{CSS}</style>

      {/* reading progress */}
      <div className="tc-progress" style={{ width: `${progress}%` }} />

      <div className="tc-root">

        {/* ── Header ──────────────────────────────────── */}
        <header className={`tc-header ${scrolled ? "scrolled" : ""}`}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              width:"32px", height:"32px", borderRadius:"9px",
              background:"#3b82f6", display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 14px rgba(59,130,246,0.4)",
            }}>
              <span className="tc-mono" style={{ fontSize:"10px", color:"#fff", fontWeight:500, letterSpacing:"0.03em" }}>P26</span>
            </div>
            <div>
              <p style={{ fontSize:"13px", fontWeight:800, color:"#111827", lineHeight:1 }}>PAX26 TECHNOLOGIES</p>
              <p className="tc-mono" style={{ fontSize:"9px", color:"rgba(0,0,0,0.35)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
                Legal Documents
              </p>
            </div>
          </div>
          <a href="/" className="tc-back-btn">← Back to Home</a>
        </header>

        <div style={{ paddingTop:"64px" }}>

          {/* ── Hero ────────────────────────────────────── */}
          <div className="tc-hero tc-s1" style={{
            padding:"64px 40px 56px",
            background:"#fff",
            borderBottom:"1px solid rgba(0,0,0,0.07)",
            position:"relative", overflow:"hidden",
          }}>
            {/* glow orb */}
            <div className="tc-glow" style={{
              position:"absolute", top:"-80px", right:"-60px",
              width:"360px", height:"360px", borderRadius:"50%",
              background:"#3b82f6", filter:"blur(90px)",
              opacity:0.07, pointerEvents:"none",
            }} />

            <div style={{ maxWidth:"1160px", margin:"0 auto", position:"relative", zIndex:1 }}>

              {/* badge row */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"28px", flexWrap:"wrap" }}>
                <span className="tc-mono" style={{
                  fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase",
                  background:"rgba(59,130,246,0.1)", color:"#3b82f6",
                  padding:"4px 14px", borderRadius:"20px",
                  border:"1px solid rgba(59,130,246,0.2)",
                }}>
                  PAX26 TECHNOLOGIES
                </span>
                <span className="tc-mono" style={{ fontSize:"10px", color:"rgba(0,0,0,0.28)" }}>·</span>
                <span className="tc-mono" style={{ fontSize:"10px", color:"rgba(0,0,0,0.35)", letterSpacing:"0.07em" }}>
                  Effective January 2025
                </span>
              </div>

              {/* headline */}
              <h1 style={{
                fontFamily:"'Syne',sans-serif",
                fontSize:"clamp(2rem,5vw,3.6rem)",
                fontWeight:800, lineHeight:1.08,
                letterSpacing:"-0.02em", color:"#111827",
                marginBottom:"18px",
              }}>
                Terms &amp;{" "}
                <span style={{ color:"#3b82f6" }}>Conditions</span>
              </h1>

              <p className="tc-mono" style={{
                fontSize:"11px", letterSpacing:"0.12em", textTransform:"uppercase",
                color:"rgba(0,0,0,0.35)", marginBottom:"32px",
              }}>
                17 Sections · Governed by Nigerian Law · Platform v2.0
              </p>

              {/* info chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                {[
                  { label:"Updated",      value:"Jan 2025"       },
                  { label:"Jurisdiction", value:"Nigeria"        },
                  { label:"Sections",     value:"17"             },
                  { label:"Support",      value:"info@pax26.com" },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display:"flex", alignItems:"center", gap:"8px",
                    padding:"8px 16px", borderRadius:"12px",
                    background:"#f8fafc", border:"1px solid rgba(0,0,0,0.07)",
                  }}>
                    <span className="tc-mono" style={{ fontSize:"9px", color:"rgba(0,0,0,0.32)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
                    <div style={{ width:"1px", height:"12px", background:"rgba(0,0,0,0.1)" }} />
                    <span className="tc-mono" style={{ fontSize:"10px", color:"#111827", fontWeight:500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Body ──────────────────────────────────── */}
          <div className="tc-body-grid tc-main-pad" style={{
            maxWidth:"1160px", margin:"0 auto",
            padding:"40px 40px 0",
            display:"grid",
            gridTemplateColumns:"200px 1fr",
            gap:"48px",
            alignItems:"start",
          }}>

            {/* Sidebar */}
            <aside className="tc-sidebar-col tc-sidebar tc-s2">
              <p className="tc-mono" style={{
                fontSize:"9px", letterSpacing:"0.18em", textTransform:"uppercase",
                color:"rgba(0,0,0,0.32)", marginBottom:"10px", paddingLeft:"12px",
              }}>
                Contents
              </p>
              <nav>
                {SECTIONS.map(s => (
                  <button key={s.num}
                    className={`tc-nav-btn ${active === s.num ? "active" : ""}`}
                    onClick={() => scrollTo(s.num)}>
                    <span className="tc-mono" style={{
                      fontSize:"9px", flexShrink:0,
                      color: active === s.num ? "#3b82f6" : "rgba(0,0,0,0.22)",
                      letterSpacing:"0.06em",
                    }}>
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                  </button>
                ))}
              </nav>
              <div style={{ marginTop:"20px", padding:"14px 12px", borderTop:"1px solid rgba(0,0,0,0.06)" }}>
                <p className="tc-mono" style={{
                  fontSize:"9px", color:"rgba(0,0,0,0.28)",
                  lineHeight:1.7, letterSpacing:"0.04em",
                }}>
                  © 2025 PAX26 TECHNOLOGIES<br />All rights reserved
                </p>
              </div>
            </aside>

            {/* Section cards */}
            <main className="tc-s3" style={{ paddingBottom:"80px" }}>
              {SECTIONS.map((s, idx) => (
                <div
                  key={s.num}
                  ref={el => sectionRefs.current[s.num] = el}
                  data-num={s.num}
                  className="tc-card"
                  style={{ animationDelay:`${idx * 0.025}s` }}>

                  {/* blue top strip */}
                  <div style={{
                    height:"3px",
                    background:"linear-gradient(90deg,#3b82f6,rgba(59,130,246,0.25),transparent)",
                  }} />

                  <div style={{ padding:"24px 28px 28px" }}>

                    {/* meta row */}
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                      <span className="tc-mono" style={{
                        fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase",
                        background:"rgba(59,130,246,0.08)", color:"#3b82f6",
                        padding:"3px 10px", borderRadius:"20px",
                        border:"1px solid rgba(59,130,246,0.15)",
                      }}>
                        {s.num}
                      </span>
                      <div style={{ flex:1, height:"1px", background:"rgba(0,0,0,0.06)" }} />
                      <span className="tc-mono" style={{ fontSize:"9px", color:"rgba(0,0,0,0.22)", letterSpacing:"0.04em" }}>
                        {s.num} / 17
                      </span>
                    </div>

                    {/* title */}
                    <h2 style={{
                      fontFamily:"'Syne',sans-serif",
                      fontSize:"clamp(1.05rem,2vw,1.3rem)",
                      fontWeight:700, color:"#111827",
                      lineHeight:1.25, marginBottom:"14px",
                    }}>
                      {s.title}
                    </h2>

                    {/* body */}
                    {s.body.split("\n\n").map((para, pi) => (
                      <p key={pi} className="tc-body-text"
                        style={{ marginBottom: pi < s.body.split("\n\n").length - 1 ? "14px" : s.list ? "14px" : 0 }}>
                        {para}
                        {s.email && pi === s.body.split("\n\n").length - 1 && (
                          <a href={`mailto:${s.email}`} style={{
                            color:"#3b82f6", textDecoration:"none",
                            fontWeight:600, borderBottom:"1px solid rgba(59,130,246,0.3)",
                          }}>
                            {s.email}
                          </a>
                        )}
                      </p>
                    ))}

                    {/* list */}
                    {s.list && (
                      <div style={{
                        background:"#f8fafc", borderRadius:"12px",
                        padding:"4px 16px", border:"1px solid rgba(0,0,0,0.06)",
                      }}>
                        {s.list.map((item, li) => (
                          <div key={li} className="tc-list-row">
                            <div style={{
                              width:"6px", height:"6px", borderRadius:"50%",
                              background:"#3b82f6", flexShrink:0, marginTop:"7px",
                            }} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}