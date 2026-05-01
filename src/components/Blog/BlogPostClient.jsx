"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useGlobalContext } from "../Context";
import { categoryColor } from "../lib/postUtils";

/* ── Related Post mini-card ──────────────────────── */
const RelatedCard = ({ post, pax26 }) => {
  const [hov, setHov] = useState(false);
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${hov ? pax26.primary + "55" : pax26.border}`,
          background: pax26.card,
          transition: "transform 0.25s, box-shadow 0.25s",
          transform: hov ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.14)" : "none",
          cursor: "pointer",
        }}
      >
        <div style={{ height: 140, overflow: "hidden" }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s",
              transform: hov ? "scale(1.07)" : "scale(1)",
            }}
          />
        </div>
        <div style={{ padding: "14px 16px 18px" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: categoryColor(post.category),
            }}
          >
            {post.category}
          </span>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: pax26.textPrimary,
              margin: "6px 0 4px",
              lineHeight: 1.4,
            }}
          >
            {post.title}
          </h4>
          <p style={{ fontSize: 12, color: pax26.textSecondary, margin: 0 }}>
            {post.readTime} · {post.date}
          </p>
        </div>
      </div>
    </Link>
  );
};

/* ── Main Client Component ───────────────────────── */
const BlogPostClient = ({ post, related }) => {
  const { pax26 } = useGlobalContext();
  const color = categoryColor(post.category);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: pax26.secondaryBg }}>

      {/* ── Hero ── */}
      <div style={{ position: "relative", height: "clamp(300px, 50vw, 480px)", overflow: "hidden" }}>
        <img
          src={post.image}
          alt={post.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)",
          }}
        />
        {/* title overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "32px clamp(20px,5vw,80px) 40px",
            maxWidth: 860,
          }}
        >
          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link
              href="/blog"
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Blog
            </Link>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>/</span>
            <span
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: `${color}`,
                borderRadius: 99,
                padding: "2px 10px",
              }}
            >
              {post.category}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 40px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.25,
              margin: 0,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            }}
          >
            {post.title}
          </h1>
        </div>
      </div>

      {/* ── Meta bar ── */}
      <div
        style={{
          background: pax26.card,
          borderBottom: `1px solid ${pax26.border}`,
          padding: "16px clamp(20px,5vw,80px)",
        }}
      >
        <div
          style={{
            maxWidth: 860,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src={post.authorAvatar}
              alt={post.author}
              style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `2px solid ${pax26.primary}` }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: pax26.textPrimary }}>
                {post.author}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: pax26.textSecondary }}>Author</p>
            </div>
          </div>

          <div style={{ width: 1, height: 36, background: pax26.border }} />

          <div>
            <p style={{ margin: 0, fontSize: 12, color: pax26.textSecondary }}>Published</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: pax26.textPrimary }}>{post.date}</p>
          </div>

          <div style={{ width: 1, height: 36, background: pax26.border }} />

          <div>
            <p style={{ margin: 0, fontSize: 12, color: pax26.textSecondary }}>Read time</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: pax26.textPrimary }}>{post.readTime}</p>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 99,
                border: `1px solid ${pax26.border}`,
                color: pax26.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                background: "transparent",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              ← All Articles
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body + Sidebar layout ── */}
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "48px clamp(20px,4vw,40px)",
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 48,
          alignItems: "start",
        }}
      >
        {/* ── Article Content ── */}
        <div>
          {/* excerpt callout */}
          <blockquote
            style={{
              margin: "0 0 36px",
              padding: "20px 24px",
              borderLeft: `4px solid ${pax26.primary}`,
              background: `${pax26.primary}12`,
              borderRadius: "0 12px 12px 0",
              color: pax26.textPrimary,
              fontSize: 16,
              fontStyle: "italic",
              lineHeight: 1.65,
            }}
          >
            {post.excerpt}
          </blockquote>

          {/* article html body */}
          <div
            style={{
              color: pax26.textPrimary,
              lineHeight: 1.85,
              fontSize: 16,
            }}
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* tags */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 28,
              borderTop: `1px solid ${pax26.border}`,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: pax26.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tags
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: "5px 14px",
                    borderRadius: 99,
                    border: `1px solid ${pax26.border}`,
                    color: pax26.textSecondary,
                    background: pax26.card,
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* author card */}
          <div
            style={{
              marginTop: 40,
              padding: "24px 28px",
              borderRadius: 16,
              border: `1px solid ${pax26.border}`,
              background: pax26.card,
              display: "flex",
              gap: 20,
              alignItems: "center",
            }}
          >
            <img
              src={post.authorAvatar}
              alt={post.author}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                objectFit: "cover",
                border: `3px solid ${pax26.primary}`,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: pax26.textPrimary }}>
                {post.author}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: pax26.textSecondary, lineHeight: 1.6 }}>
                Content writer &amp; AI automation specialist at Pax26. Passionate about helping Nigerian businesses scale with technology.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ position: "sticky", top: 100 }}>
          {/* CTA Card */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              background: `linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)`,
              padding: "28px 24px",
              color: "#fff",
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", margin: "0 0 10px" }}>
              Ready to automate?
            </p>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3 }}>
              Start your AI journey with Pax26
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Set up WhatsApp automation, lead follow-ups, and digital services in minutes.
            </p>
            <Link
              href="/"
              style={{
                display: "block",
                textAlign: "center",
                padding: "11px",
                borderRadius: 10,
                background: "#fff",
                color: "#1d4ed8",
                fontWeight: 800,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Get Started Free →
            </Link>
          </div>

          {/* Related posts */}
          {related && related.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: pax26.textSecondary,
                  marginBottom: 16,
                }}
              >
                Related Articles
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {related.map((rp) => (
                  <RelatedCard key={rp.slug} post={rp} pax26={pax26} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* global blog content styles */}
      <style>{`
        .blog-post-content h2 {
          font-size: 22px;
          font-weight: 800;
          margin: 40px 0 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid ${pax26.border};
          color: ${pax26.textPrimary};
        }
        .blog-post-content h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 28px 0 10px;
          color: ${pax26.textPrimary};
        }
        .blog-post-content p {
          margin: 0 0 20px;
          color: ${pax26.textSecondary};
        }
        .blog-post-content ul, .blog-post-content ol {
          margin: 0 0 20px 24px;
          color: ${pax26.textSecondary};
          line-height: 1.8;
        }
        .blog-post-content strong {
          color: ${pax26.textPrimary};
          font-weight: 700;
        }
        .blog-post-content a {
          color: ${pax26.primary};
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default BlogPostClient;
