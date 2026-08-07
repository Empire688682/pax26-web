"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useGlobalContext } from "../Context";
import { Bell, MessageCircle, Settings, Check, RefreshCw, XCircle, ShoppingCart, CheckCircle, ExternalLink } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
  .sn-root { font-family: 'Syne', sans-serif; }
  .sn-mono { font-family: 'DM Mono', monospace; }
  .sn-card { transition: transform 0.2s, box-shadow 0.2s; }
  .sn-card:hover { transform: translateY(-2px); }
  .sn-toggle { transition: all 0.3s ease; }
  .sn-spin { animation: sn-spin 1s linear infinite; }
  @keyframes sn-spin { to { transform: rotate(360deg); } }
`;

export default function SalesNotificationDashboard() {
  const { pax26, userData } = useGlobalContext();

  // Orders from the same analytics API as SalesDashboard — single source of truth
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings from seller profile
  const [settings, setSettings] = useState({ enabled: true, channel: "in-app" });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const plan = userData?.paxAI?.plan || "free";
  const primary = pax26?.primary || "#4f46e5";

  // Fetch orders using the same analytics API as the sales dashboard
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [analyticsRes, profileRes] = await Promise.all([
        axios.get("/api/seller/analytics").catch(() => null),
        axios.get("/api/seller/profile").catch(() => null),
      ]);

      if (analyticsRes?.data?.success) {
        setOrders(analyticsRes.data.recentOrders || []);
        setMetrics(analyticsRes.data.metrics || {});
      }

      // Load notification settings from seller profile
      if (profileRes?.data?.success) {
        const p = profileRes.data.profile;
        setSettings({
          enabled: p.salesNotificationsEnabled ?? true,
          channel: p.salesNotificationChannel || "in-app",
        });
      }
    } catch (err) {
      console.error("SalesNotificationDashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateSettings = async (newSettings) => {
    setSettingsLoading(true);
    try {
      const res = await axios.patch("/api/seller/notifications/settings", newSettings);
      if (res.data.success) {
        setSettings(res.data.settings);
        toast.success("Settings updated");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    setProcessingOrderId(orderId);
    setProcessingStatus(status);
    try {
      const res = await axios.patch(`/api/seller/orders/${orderId}`, { status });
      if (res.data.success) {
        const msg = status === "confirmed"
          ? (res.data.customerReceiptSent
              ? "Order confirmed! Branded receipt sent to customer via WhatsApp. 📲"
              : "Order confirmed ✓")
          : "Order cancelled";
        toast.success(msg);
        fetchOrders();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setProcessingOrderId(null);
      setProcessingStatus(null);
    }
  };

  const pendingOrders = orders.filter(o => o.status === "pending" && o.paymentReceiptUrl);
  const confirmedOrders = orders.filter(o => ["confirmed", "paid", "delivered"].includes(o.status));

  return (
    <>
      <style>{CSS}</style>
      <div className="sn-root min-h-screen px-5 py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: pax26?.textPrimary }}>Sales Alerts</h1>
              <p className="text-sm mt-1" style={{ color: pax26?.textSecondary }}>Orders awaiting your confirmation + notification settings</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${primary}15`, color: primary }}>
              <Bell size={18} />
              <span className="font-bold">{pendingOrders.length} Pending</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Settings Sidebar */}
            <div className="col-span-1 space-y-4">
              <div className="rounded-2xl p-6" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={20} style={{ color: primary }} />
                  <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Alert Settings</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: pax26?.textSecondary }}>Enable Alerts</span>
                    <button
                      onClick={() => updateSettings({ ...settings, enabled: !settings.enabled })}
                      disabled={settingsLoading}
                      className="w-12 h-6 rounded-full relative sn-toggle"
                      style={{ background: settings.enabled ? primary : pax26?.border }}
                    >
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white sn-toggle"
                        style={{ left: settings.enabled ? "26px" : "4px" }} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: pax26?.textSecondary }}>Delivery Channel</label>
                    <select
                      value={settings.channel}
                      onChange={e => updateSettings({ ...settings, channel: e.target.value })}
                      disabled={settingsLoading || !settings.enabled}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, color: pax26?.textPrimary }}
                    >
                      <option value="in-app">In-App Only</option>
                      {plan !== "starter" && <option value="whatsapp">WhatsApp Only</option>}
                      {plan !== "starter" && <option value="both">In-App + WhatsApp</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="rounded-2xl p-5 space-y-3" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: pax26?.textSecondary }}>Quick Stats</p>
                {[
                  { label: "Pending Review", value: pendingOrders.length, color: "#f59e0b" },
                  { label: "Confirmed Today", value: confirmedOrders.filter(o => new Date(o.createdAt) > new Date(Date.now() - 86400000)).length, color: "#22c55e" },
                  { label: "Total Revenue", value: `₦${(metrics.totalSales || 0).toLocaleString()}`, color: primary },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: pax26?.textSecondary }}>{label}</span>
                    <span className="text-sm font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders list */}
            <div className="col-span-2">
              <div className="rounded-2xl overflow-hidden" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: pax26?.border }}>
                  <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>
                    {pendingOrders.length > 0 ? `${pendingOrders.length} order${pendingOrders.length > 1 ? "s" : ""} awaiting confirmation` : "Recent Sales"}
                  </h3>
                  <button onClick={fetchOrders} style={{ color: pax26?.textSecondary }}>
                    <RefreshCw size={15} className={loading ? "sn-spin" : ""} />
                  </button>
                </div>

                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center p-10">
                      <RefreshCw className="sn-spin" style={{ color: primary }} />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center p-10">
                      <Bell size={32} className="mx-auto mb-3" style={{ color: pax26?.textSecondary, opacity: 0.3 }} />
                      <p style={{ color: pax26?.textSecondary }}>No orders yet</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order._id} className="sn-card rounded-xl p-4"
                        style={{ background: order.status === "pending" && order.paymentReceiptUrl ? `${primary}08` : pax26?.bg, border: `1px solid ${order.status === "pending" && order.paymentReceiptUrl ? `${primary}30` : pax26?.border}` }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${primary}15`, color: primary }}>
                            <ShoppingCart size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-bold text-sm truncate" style={{ color: pax26?.textPrimary }}>
                                {order.customerName || order.customerPhone}
                              </p>
                              <span className="text-sm font-bold sn-mono flex-shrink-0" style={{ color: "#22c55e" }}>
                                ₦{(order.totalPrice || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase`}
                                style={{
                                  background: ["confirmed","paid","delivered"].includes(order.status) ? "rgba(34,197,94,0.15)" : order.status === "cancelled" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                                  color: ["confirmed","paid","delivered"].includes(order.status) ? "#22c55e" : order.status === "cancelled" ? "#ef4444" : "#eab308"
                                }}>
                                {order.status}
                              </span>
                              <span className="sn-mono text-[10px]" style={{ color: pax26?.textSecondary }}>
                                {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {/* Receipt + actions */}
                            {order.paymentReceiptUrl && (
                              <div className="flex items-center gap-3 mt-2">
                                <img src={order.paymentReceiptUrl} alt="Receipt" className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80"
                                  style={{ borderColor: pax26?.border }}
                                  onClick={() => { setSelectedReceipt(order.paymentReceiptUrl); setSelectedOrder(order); }} />
                                {order.status === "pending" && (
                                  <div className="flex gap-2">
                                    <button onClick={() => handleOrderStatus(order._id, "confirmed")} disabled={processingOrderId === order._id}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                                      {processingOrderId === order._id && processingStatus === "confirmed" ? <RefreshCw size={12} className="sn-spin" /> : <CheckCircle size={12} />}
                                      Confirm
                                    </button>
                                    <button onClick={() => handleOrderStatus(order._id, "cancelled")} disabled={processingOrderId === order._id}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                                      <XCircle size={12} /> Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Receipt modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={() => { setSelectedReceipt(null); setSelectedOrder(null); }}>
          <div className="relative max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl border flex flex-col"
            style={{ background: pax26?.secondaryBg, borderColor: pax26?.border }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: pax26?.border }}>
              <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Payment Receipt</h3>
              <button onClick={() => { setSelectedReceipt(null); setSelectedOrder(null); }} style={{ color: pax26?.textSecondary }}>
                <XCircle size={22} />
              </button>
            </div>
            <div className="p-6 flex justify-center bg-black bg-opacity-40">
              <img src={selectedReceipt} alt="Receipt" className="max-h-[50vh] max-w-full object-contain rounded-lg" />
            </div>
            {selectedOrder?.status === "pending" && (
              <div className="flex gap-3 justify-end px-6 py-4 border-t" style={{ borderColor: pax26?.border }}>
                <button onClick={() => { handleOrderStatus(selectedOrder._id, "cancelled"); setSelectedReceipt(null); setSelectedOrder(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Cancel Order</button>
                <button onClick={() => { handleOrderStatus(selectedOrder._id, "confirmed"); setSelectedReceipt(null); setSelectedOrder(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>Confirm Payment</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .sn-root { font-family: 'Syne', sans-serif; }
  .sn-mono { font-family: 'DM Mono', monospace; }
  
  .sn-card { transition: transform 0.2s, box-shadow 0.2s; }
  .sn-card:hover { transform: translateY(-2px); }
  
  .sn-toggle { transition: all 0.3s ease; }
  .sn-spin { animation: sn-spin 1s linear infinite; }
  @keyframes sn-spin { to { transform: rotate(360deg); } }
`;

export default function SalesNotificationDashboard() {
  const { pax26, userData } = useGlobalContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    enabled: false,
    channel: "in-app"
  });

  const plan = userData?.paxAI?.plan || "free";
  const canUseNotifications = plan !== "free";
  const primary = pax26?.primary || "#4f46e5";

  useEffect(() => {
    if (canUseNotifications) {
      fetchNotifications();
      // Fetch initial settings from user profile if available, else API
      fetchProfileSettings();
    } else {
      setLoading(false);
    }
  }, [canUseNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/seller/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileSettings = async () => {
    try {
      const res = await axios.get("/api/user/profile");
      const profile = res.data?.profile;
      if (res.data.success && profile?.businessProfile) {
        setSettings({
          enabled: profile.businessProfile.salesNotificationsEnabled || false,
          channel: profile.businessProfile.salesNotificationChannel || "in-app"
        });
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setSettingsLoading(true);
      const res = await axios.patch("/api/seller/notifications/settings", newSettings);
      if (res.data.success) {
        setSettings(res.data.settings);
        toast.success("Settings updated");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch("/api/seller/notifications", {});
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  if (!canUseNotifications) {
    return (
      <div className="sn-root min-h-screen px-5 py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-4xl mx-auto text-center rounded-2xl p-10" style={{ border: `1px solid ${pax26?.border}`, background: pax26?.secondaryBg }}>
          <Bell size={48} className="mx-auto mb-4" style={{ color: pax26?.textSecondary, opacity: 0.5 }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: pax26?.textPrimary }}>Sales Notifications Unlocked in Premium</h2>
          <p className="text-sm mb-6" style={{ color: pax26?.textSecondary }}>Upgrade to Starter, Business, or Enterprise to receive real-time sales alerts via In-App and WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="sn-root min-h-screen px-5 py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: pax26?.textPrimary }}>Sales Alerts</h1>
              <p className="text-sm mt-1" style={{ color: pax26?.textSecondary }}>Manage your real-time sales notifications</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${primary}15`, color: primary }}>
              <Bell size={18} />
              <span className="font-bold">{unreadCount} Unread</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Settings Sidebar */}
            <div className="col-span-1 space-y-6">
              <div className="rounded-2xl p-6" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center gap-3 mb-6">
                  <Settings size={20} style={{ color: primary }} />
                  <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Notification Settings</h3>
                </div>

                <div className="space-y-5">
                  {/* Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: pax26?.textSecondary }}>Enable Alerts</span>
                    <button 
                      onClick={() => updateSettings({ ...settings, enabled: !settings.enabled })}
                      disabled={settingsLoading}
                      className="w-12 h-6 rounded-full relative sn-toggle"
                      style={{ background: settings.enabled ? primary : pax26?.border }}
                    >
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white sn-toggle"
                        style={{ left: settings.enabled ? "26px" : "4px" }} />
                    </button>
                  </div>

                  {/* Channel Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: pax26?.textSecondary }}>Delivery Channel</label>
                    <select 
                      value={settings.channel}
                      onChange={(e) => updateSettings({ ...settings, channel: e.target.value })}
                      disabled={settingsLoading || !settings.enabled}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}`, color: pax26?.textPrimary }}
                    >
                      <option value="in-app">In-App Only (All Plans)</option>
                      {plan !== "starter" && <option value="whatsapp">WhatsApp Only</option>}
                      {plan !== "starter" && <option value="both">In-App + WhatsApp</option>}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification History */}
            <div className="col-span-1 md:col-span-2">
              <div className="rounded-2xl overflow-hidden" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: pax26?.border }}>
                  <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Recent Sales</h3>
                  <button onClick={markAllRead} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: pax26?.bg, color: pax26?.textSecondary }}>
                    Mark all as read
                  </button>
                </div>

                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center p-10"><RefreshCw className="sn-spin" style={{ color: primary }} /></div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center p-10">
                      <Bell size={32} className="mx-auto mb-3" style={{ color: pax26?.textSecondary, opacity: 0.3 }} />
                      <p style={{ color: pax26?.textSecondary }}>No sales notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id} className="sn-card rounded-xl p-4 flex items-start gap-4" 
                        style={{ background: notif.read ? pax26?.bg : `${primary}08`, border: `1px solid ${notif.read ? pax26?.border : `${primary}30`}` }}>
                        
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${primary}15`, color: primary }}>
                          <ShoppingCart size={18} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm" style={{ color: pax26?.textPrimary }}>
                              {notif.customerName}
                            </h4>
                            <span className="sn-mono text-xs font-bold" style={{ color: "#22c55e" }}>
                              +₦{notif.amountPaid?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs mb-2" style={{ color: pax26?.textSecondary }}>
                            Purchased <span className="font-semibold text-white">{notif.productName}</span>
                          </p>
                          <div className="flex items-center gap-3 sn-mono text-[10px]" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                            <span>{new Date(notif.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span className="uppercase">{notif.channel}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
