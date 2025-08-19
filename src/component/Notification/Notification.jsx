"use client";
import { useState } from "react";

export default function Notification() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "🚨 Maintenance Notice",
      message: "We’ll be performing a short maintenance on April 25th at 2:00 AM. Please bear with us.",
      date: "April 18, 2025",
      isRead: false,
    },
    {
      id: 2,
      title: "📢 New Feature Alert",
      message: "You can now buy electricity tokens directly from your Monetrax wallet. Try it out!",
      date: "April 16, 2025",
      isRead: false,
    },
    {
      id: 3,
      title: "✅ Airtime Cashback",
      message: "Get 4.5% cashback on every airtime purchase when you upgrade your account!",
      date: "April 12, 2025",
      isRead: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((note) => (note.id === id ? { ...note, isRead: true } : note))
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🔔 Notifications</h1>
      <div className="space-y-4">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`rounded-2xl p-5 border border-white/10 shadow-md backdrop-blur-md transition-all ${
              note.isRead ? "bg-white/5" : "bg-white/10"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <span className="text-xs text-gray-400">{note.date}</span>
            </div>
            <p className="text-sm text-gray-300">{note.message}</p>
            {!note.isRead && (
              <button
                onClick={() => markAsRead(note.id)}
                className="mt-2 text-blue-400 hover:underline text-sm"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
