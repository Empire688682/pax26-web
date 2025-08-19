import React from 'react';

const dummyPosts = [
  {
    id: 1,
    title: 'How to Save Data in Nigeria 💡',
    excerpt: 'Data prices are crazy right now, but here’s how to beat the system and save some MBs daily...',
    date: 'April 10, 2025',
  },
  {
    id: 2,
    title: 'Why Monetrax is the Smartest Move This Year 🔥',
    excerpt: 'Forget paying full price — Monetrax helps you get data at discounted rates. Here’s why people are switching...',
    date: 'April 5, 2025',
  },
  {
    id: 3,
    title: 'Integrate Our API in 5 Mins',
    excerpt: 'Dev-friendly guide to getting started with Monetrax’s API for resellers and app developers.',
    date: 'March 29, 2025',
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Latest on the Blog</h1>
        <p className="text-gray-700 mb-10">Tips, updates, and stories from the Monetrax community.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPosts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
              <p className="text-xs text-gray-400">{post.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
