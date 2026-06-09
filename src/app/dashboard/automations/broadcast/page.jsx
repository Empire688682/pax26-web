"use client";

import React, { useState, useEffect } from "react";
import { useGlobalContext } from "@/components/Context";
import { usePlanLimits } from "@/app/hooks/usePlanLimits";
import PlanGate from "@/components/PlanGate/PlanGate";
import BroadcastLimitBar from "@/components/BroadcastLimitBar/BroadcastLimitBar";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Send,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Lock
} from "lucide-react";

// Cookie helper to fetch UserToken on client side
const getCookie = (name) => {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
};

export default function BroadcastPage() {
  const { pax26, userData } = useGlobalContext();
  const limits = usePlanLimits();

  // Local State
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  // Selected contacts
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [tagFilter, setTagFilter] = useState("all");
  const [availableTags, setAvailableTags] = useState([]);

  // Campaign Composer State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("freeform"); // freeform or template
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [sending, setSending] = useState(false);

  // Scheduling State
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // Sample templates
  const templates = [
    { id: "welcome", label: "Welcome Follow-up (Official Template)", text: "Hello! Thanks for connecting with us. We'd love to help you get started with our products today." },
    { id: "reengage", label: "Customer Re-engagement", text: "Hey! It's been a while since we chatted. We have new offers running this week just for you!" },
    { id: "promo", label: "Promotional Broadcast", text: "Flash Sale Alert! ⚡ Get 20% off all services today only. Click the link to claim your voucher now." }
  ];

  // Fetch Contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get("/api/whatsapp/contacts");
        if (res.data?.success) {
          const fetched = res.data.data || [];
          setContacts(fetched);
          
          // Extract unique tags from all contacts
          const tags = new Set();
          fetched.forEach(c => {
            if (c.tags && Array.isArray(c.tags)) {
              c.tags.forEach(t => tags.add(t));
            }
          });
          setAvailableTags(Array.from(tags));
        }
      } catch (err) {
        console.error("Failed to load contacts:", err);
        toast.error("Could not load contact history.");
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts by tag
  const filteredContacts = contacts.filter(c => {
    if (tagFilter === "all") return true;
    return c.tags && c.tags.includes(tagFilter);
  });

  // Handle template selection
  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setSelectedTemplate(val);
    const tmpl = templates.find(t => t.id === val);
    if (tmpl) {
      setMessage(tmpl.text);
    }
  };

  // Toggle contact selection
  const toggleSelectContact = (phone) => {
    if (selectedContacts.includes(phone)) {
      setSelectedContacts(prev => prev.filter(p => p !== phone));
    } else {
      setSelectedContacts(prev => [...prev, phone]);
    }
  };

  // Select all filtered contacts
  const toggleSelectAll = () => {
    const filteredPhones = filteredContacts.map(c => c.phone);
    const allSelected = filteredPhones.every(p => selectedContacts.includes(p));

    if (allSelected) {
      // Unselect only the currently filtered ones
      setSelectedContacts(prev => prev.filter(p => !filteredPhones.includes(p)));
    } else {
      // Select all currently filtered ones
      setSelectedContacts(prev => {
        const next = [...prev];
        filteredPhones.forEach(p => {
          if (!next.includes(p)) next.push(p);
        });
        return next;
      });
    }
  };

  // Submit Broadcast / Schedule
  const handleSendBroadcast = async (isSchedule = false) => {
    if (!title.trim()) {
      return toast.warning("Please enter a campaign title.");
    }
    if (!message.trim()) {
      return toast.warning("Please compose a message.");
    }
    if (selectedContacts.length === 0) {
      return toast.warning("Please select at least one contact.");
    }
    if (isSchedule && !scheduleDate) {
      return toast.warning("Please select a date and time to schedule.");
    }

    setSending(true);
    try {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
      if (!adminUrl) {
        throw new Error("Admin backend connection not configured (NEXT_PUBLIC_ADMIN_URL is missing).");
      }

      const token = getCookie("UserToken");
      const endpoint = isSchedule 
        ? `${adminUrl}/broadcast/schedule` 
        : `${adminUrl}/broadcast/send`;

      const payload = {
        title,
        message,
        contacts: selectedContacts,
        ...(isSchedule && { scheduledAt: new Date(scheduleDate).toISOString() })
      };

      const res = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data?.success) {
        toast.success(res.data.message);
        // Clear inputs
        setTitle("");
        setMessage("");
        setSelectedContacts([]);
        setShowScheduler(false);
      } else {
        toast.error(res.data?.message || "Failed to submit broadcast.");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Connection failure to campaign engine.";
      toast.error(errMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <PlanGate feature="broadcast" requiredPlan="starter">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6" style={{ fontFamily: "Outfit, sans-serif" }}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2"
              style={{ color: pax26?.textPrimary, fontFamily: "Syne, sans-serif" }}>
              Broadcast <span style={{ color: pax26?.primary || "#3b82f6" }}>Automations</span>
            </h1>
            <p className="text-xs mt-1" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
              Send massive or segmented outbound WhatsApp notification alerts directly using interaction history.
            </p>
          </div>
        </div>

        {/* Limit progress bar */}
        <BroadcastLimitBar />

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Contact & Segmentation Gating */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Contacts Selector Box */}
            <div className="rounded-2xl border p-5 flex flex-col gap-4"
              style={{
                background: pax26?.bg || "rgba(12, 20, 40, 0.72)",
                borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)"
              }}>
              
              <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: pax26?.textPrimary }}>
                  <Users size={16} /> Contacts List
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-white/5" style={{ color: pax26?.textSecondary }}>
                  {selectedContacts.length} selected
                </span>
              </div>

              {/* Tag Segmentation Filter (Gated to Business+) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: pax26?.textSecondary }}>
                  Segment by tag
                </label>
                {limits.canSegment ? (
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="opacity-55" style={{ color: pax26?.textSecondary }} />
                    <select
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="bg-white/5 border rounded-xl py-1.5 px-3 text-xs w-full outline-none transition-colors focus:border-white/20"
                      style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                    >
                      <option value="all" className="bg-[#0C1428]">All Whitelisted Contacts</option>
                      {availableTags.map(tag => (
                        <option key={tag} value={tag} className="bg-[#0C1428]">{tag}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-xl border p-3 flex items-start gap-2.5"
                    style={{ background: "rgba(251, 146, 60, 0.04)", borderColor: "rgba(251, 146, 60, 0.2)" }}>
                    <Lock size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-orange-400 leading-tight">Audience Tag Segmentation locked</p>
                      <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                        Tag segmentation requires the <span className="font-bold text-orange-300">Business plan</span>. Showing all contacts.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contacts List with Checkboxes */}
              <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2">
                {loadingContacts ? (
                  <div className="flex flex-col gap-2 py-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
                    No contacts match this tag/filter.
                  </p>
                ) : (
                  <>
                    <button
                      onClick={toggleSelectAll}
                      className="text-left text-[10px] font-black text-[#3b82f6] border-b pb-2 mb-1 flex items-center gap-1.5"
                    >
                      {filteredContacts.map(c => c.phone).every(p => selectedContacts.includes(p)) ? "✕ Deselect All Filtered" : "✓ Select All Filtered"}
                    </button>
                    
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.phone}
                        onClick={() => toggleSelectContact(contact.phone)}
                        className="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-white/5"
                        style={{
                          borderColor: selectedContacts.includes(contact.phone) 
                            ? (pax26?.primary || "#3b82f6") 
                            : pax26?.border,
                          background: selectedContacts.includes(contact.phone) 
                            ? `${pax26?.primary}05` 
                            : "transparent"
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.phone)}
                            onChange={() => {}} // handled by div click
                            className="rounded accent-[#3b82f6] pointer-events-none"
                          />
                          <div>
                            <p className="text-xs font-bold" style={{ color: pax26?.textPrimary }}>
                              {contact.phone}
                            </p>
                            {contact.tags && contact.tags.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {contact.tags.map(t => (
                                  <span key={t} className="text-[8px] px-1.5 py-0.2 rounded bg-white/10" style={{ color: pax26?.textSecondary }}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {contact.lastMessageAt && (
                          <span className="text-[9px] opacity-40" style={{ color: pax26?.textSecondary }}>
                            Active {new Date(contact.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT: Composer */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="rounded-2xl border p-5 flex flex-col gap-4"
              style={{
                background: pax26?.bg || "rgba(12, 20, 40, 0.72)",
                borderColor: pax26?.border || "rgba(255, 255, 255, 0.08)"
              }}>
              
              <div className="pb-3 border-b" style={{ borderColor: pax26?.border }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: pax26?.textPrimary }}>
                  <MessageSquare size={16} /> Campaign Composer
                </h3>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: pax26?.textSecondary }}>
                  Campaign Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. June Product Promo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none transition-colors focus:border-white/20"
                  style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                />
              </div>

              {/* Message Type Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: pax26?.textSecondary }}>
                  Message Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMsgType("freeform")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      msgType === "freeform" ? "border-[#3b82f6] bg-[#3b82f6]10" : "opacity-60"
                    }`}
                    style={{ borderColor: msgType === "freeform" ? pax26?.primary : pax26?.border, color: pax26?.textPrimary }}
                  >
                    Free-form Msg (24hr Window)
                  </button>
                  <button
                    onClick={() => setMsgType("template")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      msgType === "template" ? "border-[#3b82f6] bg-[#3b82f6]10" : "opacity-60"
                    }`}
                    style={{ borderColor: msgType === "template" ? pax26?.primary : pax26?.border, color: pax26?.textPrimary }}
                  >
                    Outbound Template
                  </button>
                </div>
              </div>

              {/* Template dropdown if template selected */}
              {msgType === "template" && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: pax26?.textSecondary }}>
                    Select WhatsApp Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none transition-colors focus:border-white/20"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  >
                    <option value="" className="bg-[#0C1428]">-- Choose Template --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0C1428]">{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message Composer Area */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: pax26?.textSecondary }}>
                  Message Content
                </label>
                <textarea
                  rows={5}
                  placeholder={
                    msgType === "freeform" 
                      ? "Write your free-form message here... (Note: Outbound rules apply if contact is outside 24h window)"
                      : "Template text will load here..."
                  }
                  readOnly={msgType === "template"}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/5 border rounded-xl p-3 text-xs w-full outline-none transition-colors focus:border-white/20 resize-none leading-relaxed"
                  style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                />
              </div>

              {/* Scheduler Gating (Gated to Business+) */}
              {showScheduler && (
                <div className="p-4 rounded-xl border border-dashed flex flex-col gap-3"
                  style={{ borderColor: pax26?.border, background: "rgba(255,255,255,0.01)" }}>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: pax26?.textPrimary }}>
                      <Clock size={14} /> Schedule Launch
                    </p>
                    <button onClick={() => setShowScheduler(false)} className="text-[10px] opacity-40 hover:opacity-100" style={{ color: pax26?.textSecondary }}>
                      Cancel
                    </button>
                  </div>

                  {limits.canSchedule ? (
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-white/5 border rounded-xl py-2 px-3 text-xs w-full outline-none"
                      style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                    />
                  ) : (
                    <div className="p-3 rounded-lg border flex gap-2"
                      style={{ background: "rgba(201, 168, 76, 0.05)", borderColor: "rgba(201, 168, 76, 0.2)" }}>
                      <Lock size={14} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-[#C9A84C] leading-tight">Scheduling is Locked</p>
                        <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                          Launch scheduling requires the <span className="font-bold text-[#C9A84C]">Business plan</span> or higher. Upgrade your workspace to automate future campaigns.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                
                {/* Schedule Toggle / Trigger */}
                {!showScheduler && (
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ borderColor: pax26?.border, color: pax26?.textPrimary }}
                  >
                    <Calendar size={14} /> Schedule Later
                  </button>
                )}

                {/* Submit Trigger */}
                <button
                  onClick={() => handleSendBroadcast(showScheduler)}
                  disabled={sending}
                  className="flex-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-bold text-white transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${pax26?.primary || "#3b82f6"}, ${pax26?.primary || "#3b82f6"}cc)`,
                    boxShadow: `0 8px 20px ${(pax26?.primary || "#3b82f6")}30`
                  }}
                >
                  {sending ? (
                    "Processing campaign..."
                  ) : showScheduler ? (
                    <>
                      <Calendar size={14} /> Confirm Schedule Launch
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Dispatch Broadcast Now
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </PlanGate>
  );
}
