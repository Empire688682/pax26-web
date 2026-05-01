import { getPostBySlug, getRelatedPosts } from "@/components/lib/posts";
import BlogPostClient from "@/components/Blog/BlogPostClient";
import React from "react";

/* ── Dynamic per-post metadata ─────────────────── */
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Blog Post Not Found – Pax26",
      description: "This blog post does not exist.",
    };
  }
  return {
    title: `${post.title} – Pax26 Blog`,
    description: post.excerpt,
    keywords: post.keywords || ["pax26 blog", "ai automation", "digital services"],
    alternates: { canonical: `https://pax26.com/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} – Pax26 Blog`,
      description: post.excerpt,
      url: `https://pax26.com/blog/${post.slug}`,
      siteName: "Pax26",
      images: [{ url: post.image || "/Pax26_single_logo.png", width: 1200, height: 630, alt: post.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} – Pax26 Blog`,
      description: post.excerpt,
      images: [post.image || "/Pax26_single_logo.png"],
    },
  };
}

/* ── Page component ────────────────────────────── */
const BlogPostPage = async ({ params }) => {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <p style={{ fontSize: 48 }}>📭</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Post Not Found</h1>
        <p style={{ color: "#64748b" }}>This blog post doesn&apos;t exist or may have been removed.</p>
        <a
          href="/blog"
          style={{
            marginTop: 8,
            padding: "10px 24px",
            borderRadius: 99,
            background: "#3b82f6",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Back to Blog
        </a>
      </div>
    );
  }

  const related = getRelatedPosts(post.slug, post.category, 3);

  return <BlogPostClient post={post} related={related} />;
};

export default BlogPostPage;