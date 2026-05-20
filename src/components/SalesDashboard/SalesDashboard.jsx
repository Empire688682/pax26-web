"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useGlobalContext } from "../Context";
import { 
  TrendingUp, ShoppingBag, DollarSign, Calendar, 
  ArrowUpRight, Download, Users, RefreshCw, BarChart2,
  Lock, AlertCircle, Percent, Receipt, CheckCircle, XCircle, ExternalLink
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
    backdrop-filter: blur(4px);
    background: rgba(15, 23, 42, 0.65);
  }
`;

export default function SalesDashboard() {
  const { pax26, userData } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const plan = userData?.paxAI?.plan || "free";
  const primary = pax26?.primary || "#4f46e5";
  const isDark = pax26?.bg === "#0f172a" || pax26?.bg === "#000000";

  // Check plan accessibility
  const hasAccess = plan !== "free";
  const isStarter = plan === "starter";
  const isBusiness = plan === "business";
  const isEnterprise = plan === "enterprise";

  useEffect(() => {
    if (hasAccess) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [startDate, endDate, hasAccess]);

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
      const res = await axios.patch(`/api/seller/orders/${orderId}`, { status });
      if (res.data.success) {
        toast.success(status === "confirmed" ? "Order confirmed" : "Order updated");
        fetchAnalytics();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const handleExport = async () => {
    if (isStarter) {
      toast.error("Upgrade to Business or Enterprise plan to export reports!");
      return;
    }
    try {
      window.open(`/api/seller/analytics?startDate=${startDate}&endDate=${endDate}&export=csv`, "_blank");
    } catch (error) {
      toast.error("Failed to export sales report");
    }
  };

  if (!hasAccess) {
    return (
      <div className="sd-root min-h-screen px-5 py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-4xl mx-auto text-center rounded-2xl p-10 mt-16" style={{ border: `1px solid ${pax26?.border}`, background: pax26?.secondaryBg }}>
          <Lock size={48} className="mx-auto mb-4" style={{ color: pax26?.textSecondary, opacity: 0.5 }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: pax26?.textPrimary }}>Sales Dashboard Locked</h2>
          <p className="text-sm mb-6" style={{ color: pax26?.textSecondary }}>Upgrade to Starter, Business, or Enterprise to unlock real-time sales tracking, charts, and exportable reports.</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const salesTrend = data?.salesTrend || [];

  return (
    <>
      <style>{CSS}</style>
      <div className="sd-root min-h-screen px-5 py-10" style={{ background: pax26?.bg }}>
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header & Date Range Select */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-800" style={{ borderColor: pax26?.border }}>
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: pax26?.textPrimary }}>Sales Analytics</h1>
              <p className="text-sm mt-1" style={{ color: pax26?.textSecondary }}>Monitor revenue, conversion rates, and recent orders</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
                <Calendar size={16} style={{ color: pax26?.textSecondary }} />
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-transparent text-sm focus:outline-none"
                  style={{ color: pax26?.textPrimary }}
                />
                <span className="text-xs" style={{ color: pax26?.textSecondary }}>to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-transparent text-sm focus:outline-none"
                  style={{ color: pax26?.textPrimary }}
                />
              </div>

              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: isStarter ? "rgba(255,255,255,0.05)" : primary, color: "#fff" }}
              >
                <Download size={16} />
                <span>Export Report</span>
                {isStarter && <Lock size={12} />}
              </button>

              <button 
                onClick={fetchAnalytics}
                className="p-2.5 rounded-xl"
                style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}`, color: pax26?.textSecondary }}
              >
                <RefreshCw size={16} className={loading ? "sd-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Today's Sales</span>
                <DollarSign size={16} style={{ color: "#22c55e" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>₦{metrics.todaySales?.toLocaleString() || 0}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Weekly Sales</span>
                <TrendingUp size={16} style={{ color: primary }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>₦{metrics.weeklySales?.toLocaleString() || 0}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Monthly Sales</span>
                <ShoppingBag size={16} style={{ color: "#eab308" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>₦{metrics.monthlySales?.toLocaleString() || 0}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Total Revenue</span>
                <BarChart2 size={16} style={{ color: "#38bdf8" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>₦{metrics.totalSales?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Detailed Advanced Metrics (Locked for Starter Plan) */}
          <div className="relative grid grid-cols-2 md:grid-cols-5 gap-4">
            {isStarter && (
              <div className="absolute inset-0 locked-overlay z-10 flex flex-col items-center justify-center rounded-2xl text-center p-4">
                <Lock size={28} className="text-white mb-2" />
                <h4 className="font-bold text-sm text-white">Full Analytics Locked</h4>
                <p className="text-xs text-gray-300 max-w-sm mt-1">Upgrade to Business or Enterprise plan to unlock advanced metrics like conversion rates, repeat buyers, charts, and top products.</p>
              </div>
            )}

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Total Orders</span>
                <ShoppingBag size={16} style={{ color: primary }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>{metrics.totalOrders || 0}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Conversion Rate</span>
                <Percent size={16} style={{ color: "#a78bfa" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>{metrics.conversionRate || 0}%</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Average Order</span>
                <Receipt size={16} style={{ color: "#fb7185" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>₦{Number(metrics.averageOrderValue || 0).toLocaleString()}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Repeat Customers</span>
                <Users size={16} style={{ color: "#22c55e" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>{metrics.repeatCustomers || 0}</p>
            </div>

            <div className="sd-card rounded-2xl p-5" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: pax26?.textSecondary }}>Paid Orders</span>
                <ArrowUpRight size={16} style={{ color: "#22c55e" }} />
              </div>
              <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>{metrics.successfulOrdersCount || 0}</p>
            </div>
          </div>

          {/* Sales Trend Chart (Locked for Starter Plan) */}
          <div className="relative rounded-2xl p-6" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
            {isStarter && (
              <div className="absolute inset-0 locked-overlay z-10 flex flex-col items-center justify-center rounded-2xl text-center p-4">
                <Lock size={32} className="text-white mb-2" />
                <h4 className="font-bold text-sm text-white">Trend Chart Locked</h4>
              </div>
            )}
            <h3 className="font-bold text-lg mb-6" style={{ color: pax26?.textPrimary }}>Sales Trend</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primary} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={primary} stopOpacity={0}/>
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

          {/* Recent Orders & Top Selling Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Recent Orders */}
            <div className="col-span-1 md:col-span-2 rounded-2xl overflow-hidden" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Recent Transactions</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ background: pax26?.bg, borderBottom: `1px solid ${pax26?.border}` }}>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Customer</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Total Price</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Receipt</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Actions</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: pax26?.border }}>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8" style={{ color: pax26?.textSecondary }}>No sales orders recorded</td>
                      </tr>
                    ) : (
                      recentOrders.map(order => (
                        <tr key={order._id} className="hover:bg-opacity-5 hover:bg-white transition-all">
                          <td className="px-6 py-4">
                            <p className="font-bold" style={{ color: pax26?.textPrimary }}>{order.customerName || "Customer"}</p>
                            <p className="text-[10px]" style={{ color: pax26?.textSecondary }}>{order.customerPhone}</p>
                          </td>
                          <td className="px-6 py-4 font-bold sd-mono" style={{ color: pax26?.textPrimary }}>
                            ₦{(order.totalPrice || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {order.paymentReceiptUrl ? (
                              <a
                                href={order.paymentReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold"
                                style={{ color: primary }}
                              >
                                <ExternalLink size={12} /> View
                              </a>
                            ) : (
                              <span className="text-[10px]" style={{ color: pax26?.textSecondary }}>—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase`}
                              style={{ 
                                background: order.status === "paid" || order.status === "confirmed" ? "rgba(34,197,94,0.15)" : order.status === "cancelled" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
                                color: order.status === "paid" || order.status === "confirmed" ? "#22c55e" : order.status === "cancelled" ? "#ef4444" : "#eab308"
                              }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {order.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOrderStatus(order._id, "confirmed")}
                                  disabled={!order.paymentReceiptUrl}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold disabled:opacity-40"
                                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                                  title={order.paymentReceiptUrl ? "Confirm order" : "Awaiting payment receipt"}
                                >
                                  <CheckCircle size={12} /> Confirm
                                </button>
                                <button
                                  onClick={() => handleOrderStatus(order._id, "cancelled")}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold"
                                  style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                                  title="Cancel order"
                                >
                                  <XCircle size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4" style={{ color: pax26?.textSecondary }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="relative col-span-1 rounded-2xl overflow-hidden" style={{ background: pax26?.secondaryBg, border: `1px solid ${pax26?.border}` }}>
              {isStarter && (
                <div className="absolute inset-0 locked-overlay z-10 flex flex-col items-center justify-center rounded-2xl text-center p-4">
                  <Lock size={32} className="text-white mb-2" />
                  <h4 className="font-bold text-sm text-white">Top Products Locked</h4>
                </div>
              )}
              <div className="px-6 py-4 border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="font-bold" style={{ color: pax26?.textPrimary }}>Top-Selling Products</h3>
              </div>

              <div className="p-4 space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-center py-8 text-xs" style={{ color: pax26?.textSecondary }}>No product sales recorded</p>
                ) : (
                  topProducts.map((p, idx) => (
                    <div key={p.id || idx} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: pax26?.border }}>
                      <div>
                        <p className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>{p.name || "Product"}</p>
                        <p className="text-[10px] sd-mono" style={{ color: pax26?.textSecondary }}>{p.count} units sold</p>
                      </div>
                      <p className="text-sm font-bold sd-mono" style={{ color: "#22c55e" }}>
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
    </>
  );
}
