"use client";
import { useEffect, useState } from "react";

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((note) => (note._id === id ? { ...note, isRead: true } : note))
    );
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch(`${apiUrl}/notifications/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);


  if (loadingNotifications) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🔔 Notifications</h1>
      <div className="space-y-4">
        {notifications.map((note) => (
          <div
            key={note._id}
            className={`rounded-2xl p-5 border border-white/10 shadow-md backdrop-blur-md transition-all ${note.isRead ? "bg-white/5" : "bg-white/10"
              }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <span className="text-xs text-gray-400">{new Date(note.date).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-300">{note.message}</p>
            {!note.isRead && (
              <button
                onClick={() => markAsRead(note._id)}
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
