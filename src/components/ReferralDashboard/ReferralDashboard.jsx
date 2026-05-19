'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Copy, Check, Users, TrendingUp, Wallet, Clock,
  Gift, AlertCircle, ChevronRight, Sparkles, Lock,
  Unlock, ArrowUpRight, RefreshCw, Share2, Star
} from 'lucide-react';
import { useGlobalContext } from '../Context';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const fmt = (n) => `₦${(n || 0).toLocaleString('en-NG')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* ─── stat card ──────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub, pax26 }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ background: pax26?.card, border: `1px solid ${pax26?.border}` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, color }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: pax26?.textSecondary }}>{label}</p>
        {sub && <p className="text-[11px] mt-1 opacity-60" style={{ color: pax26?.textSecondary }}>{sub}</p>}
      </div>
      {/* glow */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 blur-2xl" style={{ background: color }} />
    </div>
  );
}

/* ─── transaction row ────────────────────────────────────────────────── */
function TxRow({ tx, pax26 }) {
  const isCredit = tx.direction === 'credit';
  return (
    <div
      className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors"
      style={{ background: pax26?.secondaryBg }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
          style={{
            background: isCredit ? '#22c55e18' : '#f8717118',
            color: isCredit ? '#22c55e' : '#f87171'
          }}
        >
          {isCredit ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-180" />}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: pax26?.textPrimary }}>
            {tx.description || tx.type?.replace(/_/g, ' ')}
          </p>
          <p className="text-[11px]" style={{ color: pax26?.textSecondary }}>
            {fmtDate(tx.createdAt)}
          </p>
        </div>
      </div>
      <span
        className="text-sm font-bold"
        style={{ color: isCredit ? '#22c55e' : '#f87171' }}
      >
        {isCredit ? '+' : '-'}{fmt(tx.amount)}
      </span>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */
export default function ReferralDashboard() {
  const { pax26, userData } = useGlobalContext();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const primary = pax26?.primary || '#3b82f6';

  /* ── fetch stats ────────────────────────────────────────────────── */
  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get('/api/referral/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error('Referral stats error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── copy code ──────────────────────────────────────────────────── */
  const copyCode = () => {
    if (!stats?.referralCode) return;
    const referralUrl = `${window.location.origin}/?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  /* ── withdraw ───────────────────────────────────────────────────── */
  const handleWithdraw = async () => {
    if (!stats?.canWithdraw) return;
    if (!window.confirm('Transfer your referral wallet balance to your main Pax26 wallet?')) return;

    setWithdrawing(true);
    try {
      const res = await axios.post('/api/wallet/withdraw');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStats(true);
      } else {
        toast.error(res.data.message || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setWithdrawing(false);
    }
  };

  /* ── share ──────────────────────────────────────────────────────── */
  const shareCode = async () => {
    if (!stats?.referralCode) return;
    const referralUrl = `${window.location.origin}/?ref=${stats.referralCode}`;
    const text = `Join me on Pax26 – Nigeria's smartest AI business automation platform! Use my referral link to sign up: ${referralUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join Pax26', text, url: referralUrl }); }
      catch (_) { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    }
  };

  /* ── loading skeleton ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl" style={{ background: pax26?.card }} />
        ))}
      </div>
    );
  }

  const isPaidUser = stats?.isPaidUser;
  const code = stats?.referralCode;
  const referralUrl = code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ref=${code}` : '';

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black" style={{ color: pax26?.textPrimary }}>
            Referral Program
          </h2>
          <p className="text-sm mt-1" style={{ color: pax26?.textSecondary }}>
            Earn up to ₦{(stats?.maxReward || 3000).toLocaleString()} per referral when they subscribe.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}
          disabled={refreshing}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Upgrade nudge for free users ────────────────────────── */}
      {!isPaidUser && (
        <div
          className="rounded-2xl p-5 flex items-start gap-4"
          style={{ background: `${primary}10`, border: `1px dashed ${primary}40` }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${primary}20`, color: primary }}>
            <Lock size={18} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: pax26?.textPrimary }}>
              Upgrade to unlock your referral code
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: pax26?.textSecondary }}>
              Referral codes are available for paid plan subscribers.
              Subscribe to a paid plan and start earning up to <strong>₦{(stats?.maxReward || 3000).toLocaleString()} per referral.</strong>
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              style={{ background: primary, color: '#fff' }}
            >
              View Plans <ChevronRight size={13} />
            </a>
          </div>
        </div>
      )}

      {/* ── Referral code card ───────────────────────────────────── */}
      {isPaidUser && code && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${primary}18 0%, ${primary}05 100%)`, border: `1px solid ${primary}30` }}
        >
          {/* decorative */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: primary }} />
          <div className="absolute right-8 top-4 opacity-20">
            <Sparkles size={40} style={{ color: primary }} />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Gift size={15} style={{ color: primary }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primary }}>
              Your Referral Code
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div
              className="flex-1 min-w-0 px-4 py-3 rounded-xl font-mono text-lg font-black tracking-widest select-all"
              style={{ background: pax26?.bg, color: pax26?.textPrimary, border: `1px solid ${pax26?.border}` }}
            >
              {code}
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background: copied ? '#22c55e' : primary,
                  color: '#fff',
                }}
                title="Copy referral link"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={shareCode}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: pax26?.secondaryBg, color: pax26?.textSecondary }}
                title="Share"
              >
                <Share2 size={15} />
              </button>
            </div>
          </div>

          <p className="text-[11px] mt-3 opacity-60" style={{ color: pax26?.textSecondary }}>
            Share your link — earn when they subscribe to any paid plan.
          </p>
        </div>
      )}

      {/* ── Reward tiers ────────────────────────────────────────── */}
      {isPaidUser && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
            Reward Tiers
          </p>
          <div className="grid grid-cols-3 gap-3">
            {stats?.planRewards && Object.entries(stats.planRewards).map(([plan, amt]) => (
              <div
                key={plan}
                className="rounded-xl p-3 text-center"
                style={{ background: pax26?.card, border: `1px solid ${pax26?.border}` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider capitalize mb-1"
                  style={{ color: pax26?.textSecondary, opacity: 0.7 }}>
                  {plan}
                </p>
                <p className="text-base font-black" style={{ color: primary }}>
                  ₦{amt.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Referrals"
          value={stats?.totalReferrals ?? 0}
          color="#3b82f6"
          sub="Signed up with your code"
          pax26={pax26}
        />
        <StatCard
          icon={TrendingUp}
          label="Successful"
          value={stats?.successfulReferrals ?? 0}
          color="#22c55e"
          sub="Became paying subscribers"
          pax26={pax26}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats?.pendingReferrals ?? 0}
          color="#f59e0b"
          sub="Awaiting subscription"
          pax26={pax26}
        />
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={fmt(stats?.referralWalletBalance)}
          color="#a855f7"
          sub="Referral earnings"
          pax26={pax26}
        />
      </div>

      {/* ── Wallet summary ───────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: pax26?.card, border: `1px solid ${pax26?.border}` }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
          Referral Wallet
        </p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[11px] mb-0.5" style={{ color: pax26?.textSecondary }}>Wallet Balance</p>
            <p className="text-2xl font-black" style={{ color: pax26?.textPrimary }}>
              {fmt(stats?.referralWalletBalance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] mb-0.5" style={{ color: pax26?.textSecondary }}>Total Earned</p>
            <p className="text-2xl font-black" style={{ color: '#22c55e' }}>
              {fmt(stats?.releasedReferralBonus)}
            </p>
          </div>
        </div>

        {/* Wallet uses */}
        <div
          className="rounded-xl p-4 mb-5 grid grid-cols-2 gap-2 text-xs"
          style={{ background: pax26?.secondaryBg }}
        >
          <p className="col-span-2 font-bold mb-1" style={{ color: pax26?.textSecondary }}>
            Your wallet can be used for:
          </p>
          {['Subscription renewal', 'Extra AI messages', 'Broadcast purchases', 'Future add-ons'].map(use => (
            <div key={use} className="flex items-center gap-1.5" style={{ color: pax26?.textSecondary }}>
              <Check size={11} className="text-green-400 flex-shrink-0" />
              {use}
            </div>
          ))}
        </div>

        {/* Withdrawal section */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
            Withdrawal Eligibility
          </p>

          {/* checks */}
          {[
            {
              label: 'Account verified',
              pass: stats?.isAccountVerified,
              note: stats?.isAccountVerified ? 'Verified ✓' : 'Please verify your account',
            },
            {
              label: 'Minimum balance (₦10,000)',
              pass: (stats?.referralWalletBalance || 0) >= 10000,
              note: `Current: ${fmt(stats?.referralWalletBalance)}`,
            },
            {
              label: '14-day holding period',
              pass: stats?.daysUntilWithdrawal === 0 || stats?.daysUntilWithdrawal === null,
              note: stats?.daysUntilWithdrawal > 0
                ? `${stats.daysUntilWithdrawal} day(s) remaining`
                : 'Cleared',
            },
          ].map(({ label, pass, note }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: pass ? '#22c55e20' : '#f8717120' }}
                >
                  {pass
                    ? <Check size={11} className="text-green-400" />
                    : <AlertCircle size={11} className="text-red-400" />
                  }
                </div>
                <span className="text-xs font-medium" style={{ color: pax26?.textPrimary }}>{label}</span>
              </div>
              <span className="text-[11px]" style={{ color: pax26?.textSecondary }}>{note}</span>
            </div>
          ))}

          <button
            onClick={handleWithdraw}
            disabled={!stats?.canWithdraw || withdrawing}
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: stats?.canWithdraw ? primary : pax26?.secondaryBg,
              color: stats?.canWithdraw ? '#fff' : pax26?.textSecondary,
            }}
          >
            {withdrawing ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : stats?.canWithdraw ? (
              <><Unlock size={15} /> Withdraw to Main Wallet</>
            ) : (
              <><Lock size={15} /> Withdrawal Locked</>
            )}
          </button>

          {stats?.withdrawalEligibleAt && stats.daysUntilWithdrawal > 0 && (
            <p className="text-center text-[11px]" style={{ color: pax26?.textSecondary }}>
              Eligible from {fmtDate(stats.withdrawalEligibleAt)}
            </p>
          )}
        </div>
      </div>

      {/* ── Recent transactions ──────────────────────────────────── */}
      {stats?.recentTransactions?.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: pax26?.card, border: `1px solid ${pax26?.border}` }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: pax26?.textSecondary, opacity: 0.6 }}>
            Recent Wallet Activity
          </p>
          <div className="space-y-2">
            {stats.recentTransactions.map((tx) => (
              <TxRow key={tx._id} tx={tx} pax26={pax26} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────── */}
      {isPaidUser && (stats?.totalReferrals === 0) && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: pax26?.card, border: `1px dashed ${pax26?.border}` }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${primary}15` }}>
            <Star size={24} style={{ color: primary }} />
          </div>
          <p className="font-bold text-sm" style={{ color: pax26?.textPrimary }}>Start Earning Today</p>
          <p className="text-xs mt-2 max-w-xs mx-auto leading-relaxed" style={{ color: pax26?.textSecondary }}>
            Share your referral code with friends and businesses. Earn up to ₦{(stats?.maxReward || 3000).toLocaleString()} each time someone you referred subscribes to a paid plan.
          </p>
          <button
            onClick={shareCode}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: primary, color: '#fff' }}
          >
            <Share2 size={14} /> Share Your Code
          </button>
        </div>
      )}
    </div>
  );
}
