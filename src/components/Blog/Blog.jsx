"use client";
import React from "react";
import Link from "next/link";
import { useGlobalContext } from "../Context";

const dummyPosts = [
  {
    id: 1,
    slug: "whatsapp-auto-guide",
    title: "Automate Your WhatsApp in Minutes 🤖",
    excerpt:
      "Learn how to set up WhatsApp automation for messaging, notifications, and customer follow-ups without coding.",
    date: "March 15, 2026",
  },
  {
    id: 2,
    slug: "follow-up-leads-strategy",
    title: "Boost Sales with Automated Lead Follow-Ups 📈",
    excerpt:
      "Discover how automated lead follow-ups can increase conversions and save you hours every week.",
    date: "March 10, 2026",
  },
  {
    id: 3,
    slug: "chatbot-for-business",
    title: "Create a Smart Chatbot for Your Business 💬",
    excerpt:
      "Step-by-step guide to building a chatbot that can answer FAQs, book appointments, and engage your users 24/7.",
    date: "March 5, 2026",
  },
  {
    id: 4,
    slug: "pax26-vtu-tips",
    title: "Save on VTU/Data Services with Pax26 💡",
    excerpt:
      "While AI automation is key, Pax26 still helps you save on VTU and data services — here’s how.",
    date: "March 1, 2026",
  },
];

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
          {dummyPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
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