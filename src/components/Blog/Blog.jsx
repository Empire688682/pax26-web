"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGlobalContext } from "../Context";
import { posts, categories } from "../lib/posts";
import { categoryColor } from "../lib/postUtils";

/* ─── tiny helpers ─────────────────────────────────── */
const CategoryBadge = ({ label, color = "#3b82f6" }) => (
  <span
    style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      borderRadius: 99,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);



/* ─── Featured Card ────────────────────────────────── */
const FeaturedCard = ({ post, pax26 }) => (
  <Link href={`/blog/${post.slug}`} style={{ display: "block", textDecoration: "none" }}>
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${pax26.border}`,
        background: pax26.card,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: 340,
        transition: "transform 0.3s, box-shadow 0.3s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 20px 60px rgba(59,130,246,0.18)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={post.image}
          alt={post.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg,rgba(0,0,0,0.3) 0%,transparent 60%)",
          }}
        />
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <span
            style={{
              background: "#3b82f6",
              color: "#fff",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            ✦ Featured
          </span>
        </div>
      </div>

      {/* content */}
      <div
        style={{
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <CategoryBadge label={post.category} color={categoryColor(post.category)} />

        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: pax26.textPrimary,
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          {post.title}
        </h2>

        <p style={{ fontSize: 14, color: pax26.textSecondary, lineHeight: 1.65, margin: 0 }}>
          {post.excerpt}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 8,
          }}
        >
          <img
            src={post.authorAvatar}
            alt={post.author}
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: pax26.textPrimary }}>
              {post.author}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: pax26.textSecondary }}>
              {post.date} · {post.readTime}
            </p>
          </div>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: pax26.primary,
            fontSize: 14,
            fontWeight: 700,
            marginTop: 4,
          }}
        >
          Read Article →
        </span>
      </div>
    </div>
  </Link>
);

/* ─── Post Card ────────────────────────────────────── */
const PostCard = ({ post, pax26 }) => {
  const [hovered, setHovered] = useState(false);
  const color = categoryColor(post.category);

  return (
    <Link href={`/blog/${post.slug}`} style={{ display: "block", textDecoration: "none" }}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${hovered ? color + "55" : pax26.border}`,
          background: pax26.card,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.15)` : "none",
          cursor: "pointer",
          height: "100%",
        }}
      >
        {/* image */}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img
            src={post.image}
            alt={post.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.4s",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
            }}
          />
          <div style={{ position: "absolute", bottom: 12, left: 12 }}>
            <CategoryBadge label={post.category} color={color} />
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: pax26.textPrimary,
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {post.title}
          </h3>

          <p
            style={{
              fontSize: 13,
              color: pax26.textSecondary,
              lineHeight: 1.6,
              margin: 0,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>

          {/* tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  color: pax26.textSecondary,
                  background: `${pax26.primary}15`,
                  borderRadius: 99,
                  padding: "2px 8px",
                }}
              >
                #{t}
              </span>
            ))}
          </div>

          {/* footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${pax26.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src={post.authorAvatar}
                alt={post.author}
                style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: pax26.textPrimary }}>
                  {post.author}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: pax26.textSecondary }}>
                  {post.date}
                </p>
              </div>
            </div>
            <span style={{ fontSize: 11, color: pax26.textSecondary }}>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

/* ─── Main Blog Component ──────────────────────────── */
const Blog = () => {
  const { pax26 } = useGlobalContext();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const featured = posts.find((p) => p.featured);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q));
      return matchCat && matchSearch && !p.featured;
    });
  }, [activeCategory, search]);

  return (
    <section style={{ minHeight: "100vh", backgroundColor: pax26.secondaryBg, paddingBottom: 80 }}>
      {/* ── Hero Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${pax26.bg} 0%, ${pax26.secondaryBg} 100%)`,
          padding: "72px 24px 56px",
          borderBottom: `1px solid ${pax26.border}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: pax26.fxBlob1,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: pax26.fxBlob2,
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: pax26.primary,
              marginBottom: 12,
            }}
          >
            ✦ Pax26 Blog
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 900,
              color: pax26.textPrimary,
              lineHeight: 1.15,
              marginBottom: 16,
              maxWidth: 640,
            }}
          >
            Insights on AI, Automation &amp; Digital Services
          </h1>
          <p style={{ fontSize: 16, color: pax26.textSecondary, maxWidth: 560, lineHeight: 1.65 }}>
            Expert guides, real case studies, and practical tips to help your business grow with AI automation and Nigeria's best digital services.
          </p>

          {/* search */}
          <div style={{ marginTop: 32, maxWidth: 480, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: pax26.textSecondary,
                fontSize: 16,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                borderRadius: 12,
                border: `1px solid ${pax26.border}`,
                background: pax26.card,
                color: pax26.textPrimary,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 0" }}>
        {/* ── Category Filter ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 99,
                  border: `1px solid ${active ? pax26.primary : pax26.border}`,
                  background: active ? pax26.primary : "transparent",
                  color: active ? "#fff" : pax26.textSecondary,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Featured Post ── */}
        {featured && activeCategory === "All" && !search && (
          <div style={{ marginBottom: 48 }}>
            <FeaturedCard post={featured} pax26={pax26} />
          </div>
        )}

        {/* ── Results header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: pax26.textPrimary, margin: 0 }}>
            {activeCategory === "All" ? "Latest Articles" : activeCategory}
            <span
              style={{
                marginLeft: 10,
                fontSize: 13,
                fontWeight: 500,
                color: pax26.textSecondary,
              }}
            >
              ({filtered.length})
            </span>
          </h2>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: pax26.textSecondary,
            }}
          >
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No articles found</p>
            <p style={{ fontSize: 14 }}>Try a different search term or category.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 28,
            }}
          >
            {filtered.map((post) => (
              <PostCard key={post.slug} post={post} pax26={pax26} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;