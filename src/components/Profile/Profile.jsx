'use client';
import React, { useState, useEffect } from 'react';
import { LogOut, Camera, ShieldAlert, ShieldCheck, Bell, SunMoon, Pencil, User, Lock, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useGlobalContext } from '../Context';
import axios from "axios";
import uploadImage from '../utils/uplaodImage';
import PasswordReset from '../PasswordReset/PasswordReset';
import ThemeToggle from '../ThemeToogle/ThemeToogle';

// ─── Inline styles / design tokens ──────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --gold-dark: #8B6914;
    --navy: #0A0F1E;
    --navy-mid: #111827;
    --navy-light: #1C2740;
    --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(201,168,76,0.15);
    --text-primary: #F0EDE8;
    --text-muted: #8A8FA8;
    --red: #E05C5C;
    --green: #4CAF7D;
  }

  .profile-root {
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding: 48px 24px;
    position: relative;
  }

  .profile-grid {
    max-width: 960px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 768px) {
    .profile-grid { grid-template-columns: 1fr; }
  }

  /* ── Glass card ── */
  .glass-card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }
  .glass-card:hover {
    box-shadow: 0 0 40px rgba(201,168,76,0.06);
  }

  /* ── Left card ── */
  .left-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
  }

  .card-hero {
    width: 100%;
    padding: 40px 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid var(--glass-border);
    position: relative;
  }

  .avatar-ring {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: 16px;
  }

  .avatar-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: conic-gradient(var(--gold), var(--gold-light), var(--gold-dark), var(--gold));
    animation: spin 6s linear infinite;
    z-index: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .avatar-inner {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--navy-mid);
    z-index: 1;
  }

  .camera-btn {
    position: absolute;
    bottom: 0; right: 0;
    width: 30px; height: 30px;
    background: var(--gold);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    z-index: 2;
    border: 2px solid var(--navy);
    transition: transform 0.2s, background 0.2s;
  }
  .camera-btn:hover { transform: scale(1.1); background: var(--gold-light); }

  .user-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.02em;
    margin: 0 0 4px;
  }

  .user-email {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0 0 14px;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .badge-verified {
    background: rgba(76,175,125,0.12);
    border: 1px solid rgba(76,175,125,0.3);
    color: #4CAF7D;
  }
  .badge-unverified {
    background: rgba(224,92,92,0.1);
    border: 1px solid rgba(224,92,92,0.25);
    color: #E05C5C;
  }

  /* ── Save image row ── */
  .save-row {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .btn-save, .btn-cancel {
    padding: 5px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s, transform 0.1s;
  }
  .btn-save { background: var(--gold); color: var(--navy); }
  .btn-cancel { background: rgba(255,255,255,0.07); color: var(--text-muted); }
  .btn-save:hover, .btn-cancel:hover { opacity: 0.85; transform: translateY(-1px); }

  /* ── Card body ── */
  .card-body { padding: 20px 20px 24px; width: 100%; }

  /* ── Action buttons ── */
  .action-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 18px;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    margin-bottom: 10px;
    letter-spacing: 0.01em;
  }
  .action-btn:last-child { margin-bottom: 0; }

  .btn-logout {
    background: rgba(224,92,92,0.1);
    border: 1px solid rgba(224,92,92,0.2);
    color: #E05C5C;
  }
  .btn-logout:hover {
    background: rgba(224,92,92,0.18);
    border-color: rgba(224,92,92,0.4);
    transform: translateX(3px);
  }

  .btn-pin {
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.2);
    color: var(--gold-light);
  }
  .btn-pin:hover {
    background: rgba(201,168,76,0.15);
    border-color: rgba(201,168,76,0.35);
    transform: translateX(3px);
  }

  .btn-verify {
    background: rgba(201,168,76,0.12);
    border: 1px solid rgba(201,168,76,0.25);
    color: var(--gold);
    margin-top: 10px;
    font-size: 12px;
    padding: 9px 16px;
  }
  .btn-verify:hover {
    background: rgba(201,168,76,0.2);
    transform: translateX(3px);
  }

  .btn-icon-wrap {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05);
    flex-shrink: 0;
  }

  .btn-chevron { margin-left: auto; opacity: 0.4; }

  /* ── Right card ── */
  .right-card { padding: 0; }

  .section {
    padding: 28px 28px 24px;
    border-bottom: 1px solid var(--glass-border);
  }
  .section:last-child { border-bottom: none; }

  .section-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--glass-border), transparent);
  }

  /* ── Toggle row ── */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .toggle-row:last-child { border-bottom: none; }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-muted);
    font-size: 14px;
  }

  .toggle-icon-wrap {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.12);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold);
  }

  /* ── Custom toggle ── */
  .custom-toggle {
    position: relative;
    width: 44px; height: 24px;
  }
  .custom-toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    transition: 0.3s;
  }
  .toggle-slider::before {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: var(--text-muted);
    top: 3px; left: 3px;
    transition: 0.3s;
  }
  .custom-toggle input:checked + .toggle-slider {
    background: rgba(201,168,76,0.25);
    border-color: rgba(201,168,76,0.4);
  }
  .custom-toggle input:checked + .toggle-slider::before {
    background: var(--gold);
    transform: translateX(20px);
  }

  /* ── BVN form ── */
  .bvn-form {
    background: rgba(201,168,76,0.04);
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: 16px;
    padding: 20px;
    margin-top: 12px;
  }

  .bvn-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
  }

  .bvn-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 11px 14px;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .bvn-input:focus { border-color: var(--gold); }
  .bvn-input::placeholder { color: rgba(138,143,168,0.5); }

  .bvn-error { color: #E05C5C; font-size: 11px; margin-top: 5px; }

  .bvn-submit {
    width: 100%;
    margin-top: 14px;
    background: linear-gradient(135deg, var(--gold-dark), var(--gold));
    color: var(--navy);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    border: none;
    padding: 11px;
    border-radius: 10px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.03em;
  }
  .bvn-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .bvn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Fade-in animation ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .glass-card {
    animation: fadeUp 0.5s ease both;
  }
  .glass-card:nth-child(2) { animation-delay: 0.1s; }
`;

// ─── Component ───────────────────────────────────────────────────────────────
const Profile = () => {
  const [notify, setNotify] = useState(true);
  const { userData, router, fetchUser, pax26, logoutUser, setPinModal, transactionHistory, getUserRealTimeData } = useGlobalContext();
  const [userImage, setUserImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bvn, setBvn] = useState("");
  const [userBvn, setUserBvn] = useState(false);
  const [bvnLoading, setBvnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const submityBvn = async (e) => {
    e.preventDefault();
    if (bvn.length !== 11) { toast.error("BVN must be exactly 11 digits"); return; }
    setBvnLoading(true);
    try {
      const response = await axios.post(`/api/bvn`, { bvn });
      if (response.data?.success) {
        toast.success("BVN Submitted successfully ✅");
        await fetchUser();
        setUserBvn(false);
      } else { toast.error("Failed to verify BVN ❌"); }
    } catch (error) {
      toast.error("Error submitting BVN. Try again.");
    } finally { setBvnLoading(false); }
  };

  const updateUserProfileImg = async () => {
    setProcessing(true);
    const profileImage = await uploadImage(userImage);
    if (!profileImage) {
      toast.error("An error occurred, try again");
      setProcessing(false); setUserImage(null); return;
    }
    try {
      const response = await axios.post("/api/update-profileImage", { profileImage });
      if (response.data.success) { await fetchUser(); toast.success("Profile image updated!"); setUserImage(profileImage); }
    } catch { toast.error("Failed to update profile image."); }
    finally { setProcessing(false); setUserImage(null); }
  };

  useEffect(() => {
    getUserRealTimeData();
    if (transactionHistory) setLoading(false);
  }, []);

  const user = {
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.number || "",
    userVerified: userData?.userVerify,
  };

  const previewSrc = userImage
    ? window.URL.createObjectURL(userImage)
    : userData?.profileImage || "/profile-img.png";

  return (
    <>
      <style>{styles}</style>
      <div className="profile-root">
        <div className="profile-grid">

          {/* ─── LEFT CARD ─── */}
          <div className="glass-card left-card" style={{ background: pax26.bg }}>
            {/* Hero section — slightly elevated tint from card bg */}
            <div
              className="card-hero"
              style={{
                background: pax26.secondaryBg,
                borderBottom: `1px solid ${pax26.border || 'rgba(201,168,76,0.12)'}`,
              }}
            >
              <div className="avatar-ring">
                <div className="avatar-inner" style={{ background: pax26.bg }}>
                  <Image src={previewSrc} alt="Profile" fill style={{ objectFit: "cover" }} />
                </div>
                {!userImage && (
                  <label htmlFor="profileImage" className="camera-btn">
                    <Camera size={14} color="#0A0F1E" />
                  </label>
                )}
              </div>

              <input
                type="file" hidden id="profileImage" name="profileImage" accept="image/*"
                onChange={(e) => setUserImage(e.target.files[0])}
              />

              {userImage && (
                <div className="save-row">
                  <button className="btn-save" onClick={updateUserProfileImg} disabled={processing}>
                    {processing ? "Saving…" : <><Check size={12} style={{ display: 'inline', marginRight: 4 }} />Save</>}
                  </button>
                  <button className="btn-cancel" onClick={() => setUserImage(null)}>
                    <X size={12} style={{ display: 'inline', marginRight: 4 }} />Cancel
                  </button>
                </div>
              )}

              <h2 className="user-name" style={{ color: pax26.textPrimary }}>{user.name}</h2>
              <p className="user-email" style={{ color: pax26.textSecondary }}>{user.email}</p>

              {user.userVerified ? (
                <span className="badge badge-verified">
                  <ShieldCheck size={13} /> Verified Account
                </span>
              ) : (
                <span className="badge badge-unverified">
                  <ShieldAlert size={13} /> Unverified
                </span>
              )}

              {!user.userVerified && !userBvn && (
                <button className="action-btn btn-verify" onClick={() => router.push("/verify-user?action=verify")}>
                  <span className="btn-icon-wrap"><ShieldCheck size={14} color="#C9A84C" /></span>
                  Verify Account Now
                  <ChevronRight size={14} className="btn-chevron" />
                </button>
              )}
            </div>

            {/* BVN Form */}
            {userBvn && (
              <div style={{ padding: '0 20px 12px' }}>
                <form className="bvn-form" onSubmit={submityBvn}>
                  <label className="bvn-label" style={{ color: pax26.textSecondary }}>Bank Verification Number</label>
                  <input
                    className="bvn-input"
                    style={{ color: pax26.textPrimary, background: pax26.secondaryBg }}
                    type="text"
                    value={bvn}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 11) setBvn(v); }}
                    maxLength={11}
                    placeholder="Enter your 11-digit BVN"
                  />
                  {bvn && bvn.length < 11 && <p className="bvn-error">BVN must be 11 digits</p>}
                  <button className="bvn-submit" type="submit" disabled={bvnLoading}>
                    {bvnLoading ? "Verifying…" : "Submit BVN"}
                  </button>
                </form>
              </div>
            )}

            {/* Action buttons */}
            <div className="card-body">
              <button className="action-btn btn-pin" onClick={() => setPinModal(true)}>
                <span className="btn-icon-wrap"><Pencil size={15} color="#E8C97A" /></span>
                Set Transaction PIN
                <ChevronRight size={15} className="btn-chevron" />
              </button>

              <button className="action-btn btn-logout" onClick={logoutUser}>
                <span className="btn-icon-wrap"><LogOut size={15} color="#E05C5C" /></span>
                Sign Out
                <ChevronRight size={15} className="btn-chevron" />
              </button>
            </div>
          </div>

          {/* ─── RIGHT CARD ─── */}
          <div className="glass-card right-card" style={{ background: pax26.bg }}>
            {/* Settings */}
            <div
              className="section"
              style={{ borderBottom: `1px solid ${pax26.border || 'rgba(201,168,76,0.1)'}` }}
            >
              <h3 className="section-label" style={{ color: pax26.textPrimary }}>Preferences</h3>

              <div className="toggle-row" style={{ borderBottom: `1px solid ${pax26.border || 'rgba(255,255,255,0.04)'}` }}>
                <span className="toggle-label" style={{ color: pax26.textSecondary }}>
                  <span className="toggle-icon-wrap"><Bell size={16} /></span>
                  Push Notifications
                </span>
                <label className="custom-toggle">
                  <input type="checkbox" checked={notify} onChange={() => setNotify(!notify)} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="toggle-row" style={{ borderBottom: 'none' }}>
                <span className="toggle-label" style={{ color: pax26.textSecondary }}>
                  <span className="toggle-icon-wrap"><SunMoon size={16} /></span>
                  Theme Mode
                </span>
                <ThemeToggle />
              </div>
            </div>

            {/* Password */}
            <div className="section" style={{ borderBottom: 'none' }}>
              <h3 className="section-label" style={{ color: pax26.textPrimary }}>Security</h3>
              <PasswordReset />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;