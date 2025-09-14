"use client";
import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 text-red-600 rounded-full p-4">
            <AlertTriangle size={48} />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">Page Not Found</p>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-white/90 transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
