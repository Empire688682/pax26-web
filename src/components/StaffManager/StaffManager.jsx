"use client";

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import PlanGate from "@/components/PlanGate/PlanGate";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  Mail,
  Phone,
  CheckCircle,
  Crown,
  RefreshCw,
  Sparkles,
  Lock,
  Plus
} from "lucide-react";

export default function StaffManager() {
  const { pax26, router } = useGlobalContext();
  const limits = usePlanLimits();

  const [staff, setStaff] = useState([]);
  const [limit, setLimit] = useState(0);
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("agent");

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/seller/staff");
      if (res.data?.success) {
        setStaff(res.data.data || []);
        setLimit(res.data.limit || 0);
        setUsed(res.data.used || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast.warning("Please enter name and email.");
    }

    setSaving(true);
    try {
      const res = await axios.post("/api/seller/staff", { name, email, phone, role });
      if (res.data?.success) {
        toast.success(res.data.message);
        setName("");
        setEmail("");
        setPhone("");
        setRole("agent");
        setShowModal(false);
        fetchStaff();
      } else {
        toast.error(res.data?.message || "Failed to add staff member.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add staff member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id, staffName) => {
    if (!confirm(`Remove "${staffName}" from your team inboxes?`)) return;
    try {
      const res = await axios.delete(`/api/seller/staff/${id}`);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchStaff();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove staff member.");
    }
  };

  const atLimit = limit > 0 && used >= limit;

  return (
    <PlanGate feature="multiStaff" requiredPlan="business" title="Multi-Staff Team Inboxes">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6" style={{ fontFamily: "Outfit, sans-serif" }}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5"
              style={{ color: pax26?.textPrimary, fontFamily: "Syne, sans-serif" }}>
              <Users size={28} className="text-blue-500" />
              Team <span style={{ color: pax26?.primary || "#3b82f6" }}>Inboxes & Staff</span>
            </h1>
            <p className="text-xs mt-1" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              Collaborate with team members to respond to WhatsApp customer conversations simultaneously.
            </p>
          </div>

          <button
            onClick={() => {
              if (atLimit) {
                router.push("/dashboard/billing");
              } else {
                setShowModal(true);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95 self-start sm:self-center"
            style={{
              background: atLimit
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : `linear-gradient(135deg, ${pax26?.primary || "#3b82f6"}, ${pax26?.primary || "#3b82f6"}cc)`
            }}
          >
            {atLimit ? <Crown size={14} /> : <UserPlus size={14} />}
            {atLimit ? "Upgrade to Add Staff" : "Add Staff Member"}
          </button>
        </div>

        {/* Usage Progress Bar */}
        <div className="rounded-2xl border p-5 flex flex-col gap-3"
          style={{
            background: pax26?.bg || "rgba(12, 20, 40, 0.72)",
            borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)"
          }}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold flex items-center gap-1.5" style={{ color: pax26?.textPrimary }}>
              <Shield size={14} className="text-blue-400" /> Team Inboxes Usage
            </span>
            <span className="font-mono font-bold" style={{ color: atLimit ? "#ef4444" : (pax26?.primary || "#3b82f6") }}>
              {used} / {limit} staff seats used
            </span>
          </div>

          <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: limit > 0 ? `${Math.min(100, (used / limit) * 100)}%` : "0%",
                background: atLimit ? "#ef4444" : (pax26?.primary || "#3b82f6")
              }}
            />
          </div>

          {atLimit && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
              <Crown size={12} /> You've reached your plan's {limit}-staff limit. Upgrade to Enterprise to add up to 10 staff members.
            </p>
          )}
        </div>

        {/* Staff List */}
        <div className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{
            background: pax26?.bg || "rgba(12, 20, 40, 0.72)",
            borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)"
          }}>
          <h3 className="text-sm font-bold pb-3 border-b flex items-center gap-2"
            style={{ color: pax26?.textPrimary, borderColor: pax26?.border }}>
            <Users size={16} /> Active Staff Members ({staff.length})
          </h3>

          {loading ? (
            <div className="flex flex-col gap-3 py-6">
              {[1, 2].map(i => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-gray-400">
                <Users size={28} />
              </div>
              <h4 className="text-sm font-bold" style={{ color: pax26?.textPrimary }}>No staff members added yet</h4>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                Invite team members so they can handle incoming customer WhatsApp chats simultaneously.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map((s) => (
                <div
                  key={s._id}
                  className="p-4 rounded-xl border flex items-center justify-between gap-3 transition-all hover:bg-white/[0.02]"
                  style={{ borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold truncate" style={{ color: pax26?.textPrimary }}>
                          {s.name}
                        </p>
                        <span className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                          s.role === "manager"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        }`}>
                          {s.role}
                        </span>
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
                        {s.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStaff(s._id, s.name)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove staff member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for adding staff */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl"
              style={{ background: pax26?.bg || "#0c1428", borderColor: pax26?.border || "rgba(255,255,255,0.1)" }}>
              
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="font-bold text-base flex items-center gap-2" style={{ color: pax26?.textPrimary }}>
                  <UserPlus size={18} className="text-blue-500" /> Invite Staff Member
                </h3>
                <button onClick={() => setShowModal(false)} className="text-xs opacity-50 hover:opacity-100" style={{ color: pax26?.textSecondary }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: pax26?.textSecondary }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: pax26?.textSecondary }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@yourbusiness.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: pax26?.textSecondary }}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: pax26?.textSecondary }}>
                    Inbox Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  >
                    <option value="agent" className="bg-[#0C1428]">Sales Agent (Handles Assigned Chats)</option>
                    <option value="manager" className="bg-[#0C1428]">Inbox Manager (Full Access)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border text-xs font-bold"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity"
                    style={{ background: pax26?.primary || "#3b82f6" }}
                  >
                    {saving ? "Adding..." : "Add Staff Member"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </PlanGate>
  );
}
