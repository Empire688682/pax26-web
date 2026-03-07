"use client";
import React from "react";
import Link from "next/link";
import { useGlobalContext } from "../Context";
import { posts } from "../lib/posts";

const Blog = () => {
  const { pax26 } = useGlobalContext();

  return (
    <section
      className="min-h-screen px-6 py-16"
      style={{ backgroundColor: pax26.secondaryBg }}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">
            Pax26 Blog
          </h1>

          <p className="text-gray-500 max-w-2xl">
            Explore tips, updates, and insights from Pax26 on AI automation tools — WhatsApp auto, chatbots, follow-up leads — 
            plus helpful guidance on VTU and data services.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <article
                className="p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border"
                style={{ backgroundColor: pax26.bg }}
              >
                <p className="text-xs text-gray-500 mb-3">{post.date}</p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {post.excerpt}
                </p>

                <span className="text-blue-600 text-sm font-medium">
                  Read more →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;