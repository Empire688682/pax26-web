"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useGlobalContext } from "../Context";
import {
  TrendingUp, ShoppingBag, DollarSign, Calendar,
  ArrowUpRight, Download, Users, RefreshCw, BarChart2,
  Lock, AlertCircle, Percent, Receipt, CheckCircle, XCircle, ExternalLink,
  ChevronRight, Clock, FileText, Package, Sparkles, Crown, Shield
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "react-toastify/dist/ReactToastify.css";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

  .sd-root { font-family: 'Syne', sans-serif; }
  .sd-mono { font-family: 'DM Mono', monospace; }
  
  .sd-card { transition: all 0.2s ease-in-out; }
  .sd-card:hover { transform: translateY(-2px); }
  
  .sd-spin { animation: sd-spin 1s linear infinite; }
  @keyframes sd-spin { to { transform: rotate(360deg); } }
  
  .locked-overlay {
    backdrop-filter: blur(8px);
    background: rgba(15, 23, 42, 0.78);
  }

  .sd-table-row {
    transition: background-color 0.15s ease-in-out;
  }
  .sd-table-row:hover {
    background-color: var(--sd-row-hover);
  }

  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.3);
    border-radius: 9999px;
  }
`;

export default function SalesDashboard() {
  const router = useRouter();
  const { pax26, userData } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const plan = userData?.paxAI?.plan || "free";
  const primary = pax26?.primary || "#4f46e5";
  const isDark = pax26?.bg === "#0f172a" || pax26?.bg === "#000000";

  const isFree = plan === "free";
  const isStarter = plan === "starter";

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/seller/analytics?startDate=${startDate}&endDate=${endDate}`);
      if (res.data.success) {
        setData(res.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load sales analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      setProcessingOrderId(orderId);
      setProcessingStatus(status);
      const res = await axios.patch(`/api/seller/orders/${orderId}`, { status });
      if (res.data.success) {
        const msg = status === "confirmed"
          ? (res.data.customerReceiptSent
            ? "Order confirmed! Branded receipt sent to customer via WhatsApp. 📲"
            : "Order confirmed successfully.")
          : "Order updated";
        toast.success(msg);
        fetchAnalytics();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setProcessingOrderId(null);
      setProcessingStatus(null);
    }
  };

  const handleExport = async () => {
    if (isFree || isStarter) {
      toast.info("Exporting CSV reports requires Business or Enterprise plan.");
      router.push("/dashboard/billing");
      return;
    }
    try {
      window.open(`/api/seller/analytics?startDate=${startDate}&endDate=${endDate}&export=csv`, "_blank");
    } catch (error) {
      toast.error("Failed to export sales report");
    }
  };

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const salesTrend = data?.salesTrend || [];

  // Row hover color — subtle in both modes
  const rowHoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.035)";

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "paid":
      case "confirmed":
        return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", label: "Confirmed" };
      case "cancelled":
        return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Cancelled" };
      default:
        return { bg: "rgba(234,179,8,0.15)", color: "#eab308", label: status || "Pending" };
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="sd-root min-h-screen px-3 sm:px-6 py-5 sm:py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

          {/* Header & Date Range Select */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b" style={{ borderColor: pax26?.border }}>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: pax26?.textPrimary }}>Sales Analytics & Orders</h1>
                {isFree && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Free Plan
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: pax26?.textSecondary }}>Verify customer payments, issue receipts, and track business revenue</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Date inputs */}
              <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-1.5 px-3 py-2 rounded-xl min-w-0" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <Calendar size={15} className="shrink-0" style={{ color: pax26?.textSecondary }} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm focus:outline-none min-w-0 w-28 sm:w-auto"
                  style={{ color: pax26?.textPrimary }}
                />
                <span className="text-[10px] sm:text-xs uppercase font-medium shrink-0" style={{ color: pax26?.textSecondary }}>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm focus:outline-none min-w-0 w-28 sm:w-auto"
                  style={{ color: pax26?.textPrimary }}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
                  style={{ background: (isFree || isStarter) ? "rgba(255,255,255,0.05)" : primary, color: "#fff" }}
                >
                  <Download size={15} />
                  <span>Export</span>
                  {(isFree || isStarter) && <Lock size={12} />}
                </button>

                <button
                  onClick={fetchAnalytics}
                  className="p-2 sm:p-2.5 rounded-xl transition-all"
                  style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}
                  title="Refresh Data"
                >
                  <RefreshCw size={15} className={loading ? "sd-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* TOP ANALYTICS SECTION (Revenue Cards, Advanced Metrics, Sales Trend Chart) */}
          <div className="relative space-y-5 sm:space-y-6">

            {/* FREE PLAN PERSUASIVE UPGRADE OVERLAY */}
            {isFree && (
              <div className="absolute inset-0 locked-overlay z-20 flex flex-col items-center justify-center rounded-3xl text-center p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg">
                  <Crown size={28} />
                </div>

                <div className="max-w-md space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "#ffffff" }}>
                    Unlock Revenue Analytics & Trend Charts
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Upgrade to Starter, Business, or Enterprise to unlock real-time revenue breakdowns, conversion rates, repeat buyers analytics, and visual sales trends.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] text-indigo-300 font-semibold py-1">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">💰 Revenue Breakdown</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">📈 Conversion Rate</span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">📊 Trend Charts</span>
                </div>

                <button
                  onClick={() => router.push("/dashboard/billing")}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white transition-all shadow-xl hover:scale-105 active:scale-100 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)"
                  }}
                >
                  <Sparkles size={16} />
                  <span>Upgrade Plan to Unlock Analytics</span>
                  <ChevronRight size={16} />
                </button>

                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ Recent Transactions & Payment Receipt verification below are 100% free!
                </p>
              </div>
            )}

            {/* Revenue Breakdown Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Today's Sales</span>
                  <DollarSign size={16} className="shrink-0 ml-1" style={{ color: "#22c55e" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }} title={`₦${(metrics.todaySales || 0).toLocaleString()}`}>
                  ₦{isFree ? "•••,•••" : (metrics.todaySales || 0).toLocaleString()}
                </p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Weekly Sales</span>
                  <TrendingUp size={16} className="shrink-0 ml-1" style={{ color: primary }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }} title={`₦${(metrics.weeklySales || 0).toLocaleString()}`}>
                  ₦{isFree ? "•••,•••" : (metrics.weeklySales || 0).toLocaleString()}
                </p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Monthly Sales</span>
                  <ShoppingBag size={16} className="shrink-0 ml-1" style={{ color: "#eab308" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }} title={`₦${(metrics.monthlySales || 0).toLocaleString()}`}>
                  ₦{isFree ? "•••,•••" : (metrics.monthlySales || 0).toLocaleString()}
                </p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Total Revenue</span>
                  <BarChart2 size={16} className="shrink-0 ml-1" style={{ color: "#38bdf8" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }} title={`₦${(metrics.totalSales || 0).toLocaleString()}`}>
                  ₦{isFree ? "•••,•••" : (metrics.totalSales || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Detailed Advanced Metrics */}
            <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {isStarter && (
                <div className="absolute inset-0 locked-overlay z-10 flex flex-col items-center justify-center rounded-2xl text-center p-4">
                  <Lock size={26} className="text-white mb-1.5" />
                  <h4 className="font-bold text-xs sm:text-sm text-white">Advanced Metrics Locked</h4>
                  <p className="text-[11px] sm:text-xs text-gray-300 max-w-sm mt-1">Upgrade to Business or Enterprise plan to unlock conversion rates, repeat buyers, and trend charts.</p>
                </div>
              )}

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Total Orders</span>
                  <ShoppingBag size={16} className="shrink-0 ml-1" style={{ color: primary }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }}>{isFree ? "••" : (metrics.totalOrders || 0)}</p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Conversion Rate</span>
                  <Percent size={16} className="shrink-0 ml-1" style={{ color: "#a78bfa" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }}>{isFree ? "••%" : `${metrics.conversionRate || 0}%`}</p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Average Order</span>
                  <Receipt size={16} className="shrink-0 ml-1" style={{ color: "#fb7185" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }}>
                  ₦{isFree ? "•••" : Number(metrics.averageOrderValue || 0).toLocaleString()}
                </p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Repeat Buyers</span>
                  <Users size={16} className="shrink-0 ml-1" style={{ color: "#22c55e" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }}>{isFree ? "••" : (metrics.repeatCustomers || 0)}</p>
              </div>

              <div className="sd-card rounded-2xl p-3.5 sm:p-5 overflow-hidden min-w-0 flex flex-col justify-between col-span-2 sm:col-span-1" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: pax26?.textSecondary }}>Paid Orders</span>
                  <ArrowUpRight size={16} className="shrink-0 ml-1" style={{ color: "#22c55e" }} />
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: pax26?.textPrimary }}>{isFree ? "••" : (metrics.successfulOrdersCount || 0)}</p>
              </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="relative rounded-2xl p-4 sm:p-6 overflow-hidden" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              {isStarter && (
                <div className="absolute inset-0 locked-overlay z-10 flex flex-col items-center justify-center rounded-2xl text-center p-4">
                  <Lock size={30} className="text-white mb-2" />
                  <h4 className="font-bold text-sm text-white">Trend Chart Locked</h4>
                </div>
              )}
              <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6" style={{ color: pax26?.textPrimary }}>Sales Trend</h3>
              <div className="h-56 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="date" stroke={pax26?.textSecondary} style={{ fontSize: 11 }} />
                    <YAxis stroke={pax26?.textSecondary} style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: pax26?.bg,
                        borderColor: pax26?.border,
                        borderRadius: 12,
                        color: pax26?.textPrimary
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={primary} fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Recent Orders & Top Selling Products (UNLOCKED FOR FREE USERS) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Orders */}
            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: pax26?.border }}>
                <div>
                  <h3 className="font-bold text-base sm:text-lg" style={{ color: pax26?.textPrimary }}>Recent Transactions</h3>
                  <p className="text-[11px]" style={{ color: pax26?.textSecondary }}>Verify payment receipts and send customer receipts</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0" style={{ background: pax26?.bg, color: pax26?.textSecondary }}>
                  {recentOrders.length} {recentOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>

              {/* MOBILE CARDS VIEW (< md) */}
              <div className="block md:hidden divide-y" style={{ divideColor: pax26?.border }}>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-10 px-4" style={{ color: pax26?.textSecondary }}>
                    <ShoppingBag className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="text-sm">No sales orders recorded</p>
                  </div>
                ) : (
                  recentOrders.map(order => {
                    const statusBadge = getStatusBadgeStyle(order.status);
                    return (
                      <div key={order._id} className="p-4 space-y-3" style={{ background: pax26?.secondaryBg }}>
                        {/* Header Row: Customer & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm" style={{ color: pax26?.textPrimary }}>
                                {order.customerName || "Customer"}
                              </span>
                              {order.orderCode && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  #{order.orderCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: pax26?.textSecondary }}>{order.customerPhone}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                            style={{ background: statusBadge.bg, color: statusBadge.color }}>
                            {statusBadge.label}
                          </span>
                        </div>

                        {/* Items preview */}
                        {order.items?.length > 0 && (
                          <div className="text-xs p-2.5 rounded-xl border flex items-start gap-2" style={{ background: pax26?.bg, borderColor: pax26?.border }}>
                            <Package size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-emerald-400 text-[11px]">
                                {order.items.length} {order.items.length === 1 ? "item" : "items"}
                              </p>
                              <p className="text-[11px] truncate opacity-90" style={{ color: pax26?.textSecondary }}>
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Price & Receipt Details */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div>
                            <span className="text-[10px] uppercase font-semibold block" style={{ color: pax26?.textSecondary }}>Total Amount</span>
                            <span className="text-lg font-black sd-mono" style={{ color: pax26?.textPrimary }}>
                              ₦{(order.totalPrice || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Pending Action Buttons */}
                        {order.status === "pending" && (
                          <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: pax26?.border }}>
                            <button
                              onClick={() => handleOrderStatus(order._id, "confirmed")}
                              disabled={processingOrderId === order._id}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                            >
                              {processingOrderId === order._id && processingStatus === "confirmed" ? (
                                <RefreshCw size={13} className="sd-spin" />
                              ) : (
                                <CheckCircle size={13} />
                              )}
                              <span>{processingOrderId === order._id && processingStatus === "confirmed" ? "Confirming..." : "Confirm Order"}</span>
                            </button>

                            <button
                              onClick={() => handleOrderStatus(order._id, "cancelled")}
                              disabled={processingOrderId === order._id}
                              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                            >
                              {processingOrderId === order._id && processingStatus === "cancelled" ? (
                                <RefreshCw size={13} className="sd-spin" />
                              ) : (
                                <XCircle size={13} />
                              )}
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}

                        {/* Date & Time Footer */}
                        <div className="flex items-center gap-1.5 text-[10px] pt-1" style={{ color: pax26?.textSecondary }}>
                          <Clock size={11} className="opacity-70" />
                          <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* DESKTOP TABLE VIEW (>= md) */}
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr style={{ background: pax26?.bg, borderBottom: `1px solid ${pax26?.border}` }}>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Total Price</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Receipt</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Status</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Actions</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: pax26?.border }}>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8" style={{ color: pax26?.textSecondary }}>No sales orders recorded</td>
                      </tr>
                    ) : (
                      recentOrders.map(order => (
                        <tr
                          key={order._id}
                          className="sd-table-row"
                          style={{ "--sd-row-hover": rowHoverBg }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold" style={{ color: pax26?.textPrimary }}>{order.customerName || "Customer"}</p>
                              {order.orderCode && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  #{order.orderCode}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px]" style={{ color: pax26?.textSecondary }}>{order.customerPhone}</p>
                            {order.items?.length > 0 && (
                              <p className="text-[9px] font-semibold text-emerald-400 mt-0.5 truncate max-w-xs">
                                📦 {order.items.length} {order.items.length === 1 ? "item" : "items"} ({order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")})
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold sd-mono whitespace-nowrap" style={{ color: pax26?.textPrimary }}>
                            ₦{(order.totalPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.paymentReceiptUrl ? (
                              <div className="flex flex-col gap-1 items-start">
                                <img
                                  src={order.paymentReceiptUrl}
                                  alt="Receipt thumbnail"
                                  className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  style={{ borderColor: pax26?.border }}
                                  onClick={() => {
                                    setSelectedReceiptImage(order.paymentReceiptUrl);
                                    setSelectedOrder(order);
                                  }}
                                />
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <a
                                    href={order.paymentReceiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold hover:underline"
                                    style={{ color: primary }}
                                  >
                                    <ExternalLink size={10} /> Link
                                  </a>
                                  <span className="text-[9px] font-semibold opacity-75" style={{ color: pax26?.textSecondary }}>
                                    🕒 {new Date(order.paymentReceiptSubmittedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px]" style={{ color: pax26?.textSecondary }}>No receipt</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase`}
                              style={{
                                background: order.status === "paid" || order.status === "confirmed" ? "rgba(34,197,94,0.15)" : order.status === "cancelled" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                                color: order.status === "paid" || order.status === "confirmed" ? "#22c55e" : order.status === "cancelled" ? "#ef4444" : "#eab308"
                              }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOrderStatus(order._id, "confirmed")}
                                  disabled={processingOrderId === order._id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                                  title="Confirm order"
                                >
                                  {processingOrderId === order._id && processingStatus === "confirmed" ? (
                                    <RefreshCw size={12} className="sd-spin" />
                                  ) : (
                                    <CheckCircle size={12} />
                                  )}
                                  {processingOrderId === order._id && processingStatus === "confirmed" ? "Saving..." : "Confirm"}
                                </button>
                                <button
                                  onClick={() => handleOrderStatus(order._id, "cancelled")}
                                  disabled={processingOrderId === order._id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                                  title="Cancel order"
                                >
                                  {processingOrderId === order._id && processingStatus === "cancelled" ? (
                                    <RefreshCw size={12} className="sd-spin" />
                                  ) : (
                                    <XCircle size={12} />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" style={{ color: pax26?.textSecondary }}>
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="text-[10px] opacity-75">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="relative col-span-1 rounded-2xl overflow-hidden shadow-sm" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="px-4 sm:px-6 py-4 border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="font-bold text-base sm:text-lg" style={{ color: pax26?.textPrimary }}>Top-Selling Products</h3>
              </div>

              <div className="p-4 space-y-3 sm:space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-center py-8 text-xs" style={{ color: pax26?.textSecondary }}>No product sales recorded</p>
                ) : (
                  topProducts.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center justify-between gap-3 py-2 border-b last:border-0 min-w-0" style={{ borderColor: pax26?.border }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold truncate" style={{ color: pax26?.textPrimary }}>{p.name || "Product"}</p>
                        <p className="text-[10px] sd-mono" style={{ color: pax26?.textSecondary }}>{p.count} units sold</p>
                      </div>
                      <p className="text-xs sm:text-sm font-bold sd-mono shrink-0" style={{ color: "#22c55e" }}>
                        ₦{(p.revenue || 0).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Receipt Image Modal */}
      {selectedReceiptImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm transition-all"
          onClick={() => { setSelectedReceiptImage(null); setSelectedOrder(null); }}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
            style={{ background: pax26?.secondaryBg || "#1e293b", borderColor: pax26?.border || "#334155" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b gap-3" style={{ borderColor: pax26?.border || "#334155" }}>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base sm:text-lg" style={{ color: pax26?.textPrimary || "#ffffff" }}>Payment Receipt</h3>
                {selectedOrder && (
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-xs leading-normal" style={{ color: pax26?.textSecondary || "#94a3b8" }}>
                      Order <strong>#{selectedOrder.orderCode || selectedOrder._id?.toString()?.slice(-6)}</strong> for <strong>{selectedOrder.customerName || "Customer"}</strong> ({selectedOrder.customerPhone}) - <span className="font-bold text-emerald-400">₦{selectedOrder.totalPrice?.toLocaleString()}</span>
                    </p>
                    {selectedOrder.items?.length > 0 && (
                      <div className="text-[11px] p-2 rounded-lg bg-black/30 border border-slate-700/50 mt-1 max-h-24 overflow-y-auto">
                        <p className="font-bold text-slate-300 mb-0.5">📦 Ordered Products:</p>
                        <ul className="space-y-0.5 text-slate-400">
                          {selectedOrder.items.map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between text-[10px]">
                              <span>• {item.quantity}x {item.name}</span>
                              <span className="font-mono text-emerald-400 font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedOrder.deliveryLocation && (
                      <p className="text-[11px] font-semibold text-sky-400 flex items-center gap-1 mt-0.5">
                        <span>📍 Delivery Address:</span>
                        <span className="truncate">{selectedOrder.deliveryLocation}</span>
                      </p>
                    )}
                    <p className="text-[10px] font-medium text-amber-400 flex items-center gap-1 mt-0.5">
                      <span>🕒 Receipt Received:</span>
                      <span className="font-bold">
                        {selectedOrder.paymentReceiptSubmittedAt
                          ? new Date(selectedOrder.paymentReceiptSubmittedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(selectedOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setSelectedReceiptImage(null); setSelectedOrder(null); }}
                className="p-1 rounded-lg hover:bg-white/10 transition-all shrink-0"
                style={{ color: pax26?.textSecondary || "#94a3b8" }}
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-black/40">
              <img
                src={selectedReceiptImage}
                alt="Payment Receipt Preview"
                className="max-h-[45vh] sm:max-h-[50vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>

            {/* Modal Footer */}
            {selectedOrder && selectedOrder.status === "pending" && (
              <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 border-t" style={{ borderColor: pax26?.border || "#334155" }}>
                <button
                  onClick={() => {
                    handleOrderStatus(selectedOrder._id, "cancelled");
                    setSelectedReceiptImage(null);
                    setSelectedOrder(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-opacity-25"
                  style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                >
                  Cancel Order
                </button>
                <button
                  onClick={() => {
                    handleOrderStatus(selectedOrder._id, "confirmed");
                    setSelectedReceiptImage(null);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-opacity-25"
                  style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}
                >
                  Confirm Payment & Send Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}