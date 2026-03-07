import { getPostBySlug } from "@/components/lib/posts"
import React from "react"

// Dynamic metadata per blog post
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Blog Post Not Found – Pax26",
      description: "This blog post does not exist.",
    }
  }

  return {
    title: `${post.title} – Pax26 Blog`,
    description: post.excerpt,
    keywords: post.keywords || ["pax26 blog", "ai automation", "digital services"],
    alternates: {
      canonical: `https://pax26.com/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} – Pax26 Blog`,
      description: post.excerpt,
      url: `https://pax26.com/blog/${post.slug}`,
      siteName: "Pax26",
      images: [
        {
          url: post.image || "/Pax26_single_logo.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} – Pax26 Blog`,
      description: post.excerpt,
      images: [post.image || "/Pax26_single_logo.png"],
    },
  }
}

// Main page component
const BlogPostPage = async ({ params }) => {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return <div className="text-center min-h-[50vh] flex item-center justify-center mt-20 text-xl font-semibold">Blog Post Not Found</div>
  }

  return (
    <div className="bg-white">
        <div className="max-w-4xl min-h-[70vh] mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-6">{post.excerpt}</p>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg shadow-lg mb-6"
        />
      )}
      <div className="prose prose-lg">
        {/* Here you can render full post content */}
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          condimentum leo nec felis consectetur, non efficitur sem
          scelerisque. Replace this with your real post content.
        </p>
        <p>
          Each post can now have its own dynamic title, description, OG
          image, and keywords for SEO and social sharing.
        </p>
      </div>
    </div>
    </div>
  )
}

export default BlogPostPage