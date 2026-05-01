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
        className="blog-layout-grid"
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          padding: "48px clamp(20px,4vw,40px)",
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

          {/* tags and share block */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 28,
              borderTop: `1px solid ${pax26.border}`,
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              justifyContent: "space-between",
            }}
          >
            {/* Tags */}
            <div>
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

            {/* Share */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: pax26.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Share this article
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  {
                    name: "Twitter",
                    color: "#1DA1F2",
                    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://pax26.com/blog/${post.slug}`,
                    icon: (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    )
                  },
                  {
                    name: "LinkedIn",
                    color: "#0A66C2",
                    url: `https://www.linkedin.com/shareArticle?mini=true&url=https://pax26.com/blog/${post.slug}&title=${encodeURIComponent(post.title)}`,
                    icon: (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )
                  },
                  {
                    name: "Facebook",
                    color: "#1877F2",
                    url: `https://www.facebook.com/sharer/sharer.php?u=https://pax26.com/blog/${post.slug}`,
                    icon: (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    )
                  },
                  {
                    name: "WhatsApp",
                    color: "#25D366",
                    url: `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " - https://pax26.com/blog/" + post.slug)}`,
                    icon: (
                      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 0C5.385 0 .001 5.384.001 12.033c0 2.122.553 4.195 1.603 6.015L.034 23.996l6.09-1.599c1.764.965 3.754 1.474 5.907 1.474 6.645 0 12.03-5.385 12.03-12.033C24.062 5.384 18.677 0 12.031 0zm0 21.905c-1.802 0-3.565-.484-5.111-1.4l-.367-.217-3.799.997.996-3.704-.239-.379c-.997-1.583-1.523-3.435-1.523-5.367 0-5.541 4.509-10.051 10.043-10.051 5.533 0 10.042 4.51 10.042 10.051 0 5.541-4.509 10.051-10.042 10.051zm5.518-7.558c-.302-.152-1.787-.883-2.064-.984-.277-.101-.478-.152-.68.151-.202.303-.781.984-.958 1.186-.176.202-.352.227-.654.076-.303-.152-1.275-.471-2.43-1.503-.898-.802-1.504-1.792-1.68-2.095-.176-.302-.019-.466.132-.617.136-.137.303-.354.454-.531.151-.177.202-.303.303-.505.1-.202.05-.38-.026-.531-.076-.152-.68-1.642-.931-2.247-.245-.591-.494-.51-.68-.52-.176-.008-.377-.01-.579-.01-.202 0-.529.076-.806.379-.277.303-1.059 1.035-1.059 2.525 0 1.49 1.084 2.93 1.235 3.132.151.202 2.135 3.258 5.174 4.568.722.311 1.285.497 1.724.636.726.23 1.386.197 1.905.12.583-.086 1.787-.73 2.039-1.435.252-.705.252-1.309.176-1.435-.075-.126-.277-.202-.579-.354z" />
                      </svg>
                    )
                  }
                ].map((network) => (
                  <a
                    key={network.name}
                    href={network.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: pax26.card,
                      border: `1px solid ${pax26.border}`,
                      color: network.color,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    title={`Share on ${network.name}`}
                  >
                    {network.icon}
                  </a>
                ))}
              </div>
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

        .blog-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
        }

        @media (min-width: 960px) {
          .blog-layout-grid {
            grid-template-columns: 1fr 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlogPostClient;
