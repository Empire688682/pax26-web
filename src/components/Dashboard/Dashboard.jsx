"use client";
import React, { useEffect, useState } from "react";
import {
  Bot, Phone, Wifi, Zap, Tv, ArrowRightLeft,
  Bell, ArrowRight, Eye, EyeOff, TrendingUp,
  MessageSquare, Users, Layers, ChevronRight, Crown, Sparkles,
} from "lucide-react";
import { useGlobalContext } from "../Context";
import WalletBalance from "../WalletBalance/WalletBalance";
import CashBackBalance from "../CashBackBalance/CashBackBalance";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.db { font-family:'Inter',sans-serif; }

@keyframes db-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
@keyframes db-exp{ from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

.db-s1{animation:db-in .45s cubic-bezier(.16,1,.3,1) both}
.db-s2{animation:db-in .45s cubic-bezier(.16,1,.3,1) .06s both}
.db-s3{animation:db-in .45s cubic-bezier(.16,1,.3,1) .12s both}
.db-s4{animation:db-in .45s cubic-bezier(.16,1,.3,1) .18s both}
.db-s5{animation:db-in .45s cubic-bezier(.16,1,.3,1) .24s both}
.db-s6{animation:db-in .45s cubic-bezier(.16,1,.3,1) .30s both}
.db-exp{animation:db-exp .28s cubic-bezier(.16,1,.3,1) both}

.db-card{border-radius:16px;transition:box-shadow .2s ease}
.db-card:hover{box-shadow:0 4px 24px rgba(0,0,0,.1)}

.db-svc{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:8px;padding:18px 8px;border:none;background:none;
  border-radius:14px;cursor:pointer;width:100%;
  transition:transform .18s ease,box-shadow .18s ease;
}
.db-svc:hover{transform:translateY(-3px)}

.db-tx{
  display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:12px 16px;border-radius:10px;cursor:pointer;
  transition:background .15s ease;
}
.db-tx:hover{background:rgba(0,0,0,.03)}

.db-btn{transition:opacity .15s ease,transform .15s ease;cursor:pointer}
.db-btn:hover{opacity:.85;transform:translateY(-1px)}

/* ── Grid layout ── */
.db-grid{
  display:grid;
  grid-template-columns:1fr 340px;
  gap:20px;
  align-items:start;
}
.db-bottom{
  display:grid;
  grid-template-columns:1fr 340px;
  gap:20px;
  align-items:start;
}
@media(max-width:900px){
  .db-grid,.db-bottom{grid-template-columns:1fr}
}
`;

function SvcCard({ title, link, icon, color, pax26, router }) {
  return (
    <button className="db-svc" onClick={() => router.push(link)}
      style={{ background: pax26?.bg, border: `1px solid ${pax26?.border}` }}>
      <div style={{ width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",
        justifyContent:"center",background:`${color}14`,color }}>
        {icon}
      </div>
      <span style={{ fontSize:11,fontWeight:600,color:pax26?.textPrimary }}>{title}</span>
    </button>
  );
}

function TxRow({ tx, onClick, pax26, primary }) {
  const s = tx.status;
  const col = s==="success"?"#22c55e":s==="pending"?"#f59e0b":"#ef4444";
  return (
    <div className="db-tx" onClick={onClick}>
      <div style={{ display:"flex",alignItems:"center",gap:12,minWidth:0 }}>
        <div style={{ width:36,height:36,borderRadius:10,flexShrink:0,display:"flex",
          alignItems:"center",justifyContent:"center",background:`${col}12`,color:col }}>
          <TrendingUp size={14}/>
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:13,fontWeight:600,color:pax26?.textPrimary,margin:"0 0 2px",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tx.description}</p>
          <p style={{ fontSize:10,color:pax26?.textSecondary,opacity:.5,margin:0,fontFamily:"monospace" }}>
            {new Date(tx.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0 }}>
        <p style={{ fontSize:13,fontWeight:700,color:col,margin:"0 0 2px" }}>₦{tx.amount?.toLocaleString()}</p>
        <p style={{ fontSize:10,color:pax26?.textSecondary,opacity:.5,margin:0,textTransform:"capitalize",fontFamily:"monospace" }}>{tx.type}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userData,pax26,router,transactionHistory,getUserRealTimeData,fetchUser } = useGlobalContext();
  const [showWallet,setShowWallet] = useState(false);
  const [showMore,setShowMore] = useState(false);

  useEffect(()=>{ getUserRealTimeData(); fetchUser(); },[]);

  const firstName = userData?.name?.split(" ")[0]||"User";
  const P  = pax26?.primary||"#3b82f6";
  const G  = "#22c55e";
  const T  = "#06b6d4";
  const Am = "#f59e0b";
  const Co = "#f97316";
  const Vi = "#a78bfa";

  const plan    = userData?.paxAI?.plan||"free";
  const isAiOn  = !!userData?.paxAI?.enabled;
  const used    = userData?.paxAI?.messagesUsedThisMonth??0;
  const quota   = userData?.paxAI?.maxMonthlyMessages??50;
  const pct     = Math.min((used/(quota||1))*100,100);
  const planCol = {free:pax26?.textSecondary,starter:T,business:Am,enterprise:Vi}[plan]??pax26?.textSecondary;

  return (
    <>
      <style>{CSS}</style>
      <div className="db" style={{ maxWidth:1200,margin:"0 auto",padding:"32px 24px 80px",display:"flex",flexDirection:"column",gap:20 }}>

        {/* HEADER */}
        <div className="db-s1" style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <p style={{ fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",
              color:pax26?.textSecondary,opacity:.4,margin:"0 0 4px" }}>Welcome back</p>
            <h1 style={{ fontSize:26,fontWeight:900,color:pax26?.textPrimary,margin:0 }}>{firstName} 👋</h1>
          </div>
          <button className="db-btn" onClick={()=>router.push("/notifications")}
            style={{ width:42,height:42,borderRadius:12,border:`1px solid ${pax26?.border}`,
              background:pax26?.bg,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Bell size={18} color={pax26?.textSecondary}/>
          </button>
        </div>

        {/* MAIN GRID: Hero | Right Sidebar */}
        <div className="db-grid db-s2">

          {/* LEFT — AI Hero */}
          <div onClick={()=>router.push("dashboard/automations")}
            style={{
              borderRadius:20,overflow:"hidden",cursor:"pointer",
              background:"linear-gradient(150deg,#08101e 0%,#0c1525 50%,#070e1b 100%)",
              border:`1px solid rgba(59,130,246,.2)`,
              boxShadow:`0 16px 48px rgba(59,130,246,.1)`,
              position:"relative",
            }}>

            {/* subtle radial glow — no animation */}
            <div style={{ position:"absolute",top:-100,right:-80,width:320,height:320,
              borderRadius:"50%",background:`${P}14`,filter:"blur(80px)",pointerEvents:"none" }}/>
            <div style={{ position:"absolute",bottom:-80,left:-40,width:240,height:240,
              borderRadius:"50%",background:`${T}0e`,filter:"blur(60px)",pointerEvents:"none" }}/>

            {/* top accent */}
            <div style={{ height:2,background:`linear-gradient(90deg,transparent,${P} 25%,${T} 75%,transparent)` }}/>

            <div style={{ position:"relative",zIndex:2,padding:"36px 36px 32px" }}>

              {/* eyebrow */}
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:24 }}>
                <div style={{ display:"flex",alignItems:"center",gap:7,padding:"5px 13px",
                  borderRadius:999,background:`rgba(255,255,255,.06)`,border:"1px solid rgba(255,255,255,.1)" }}>
                  <Bot size={12} color={P}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:P }}>
                    PaxAI Automation
                  </span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,padding:"5px 13px",
                  borderRadius:999,background:`${G}12`,border:`1px solid ${G}25` }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:G }}/>
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:G }}>
                    {isAiOn?"AI Active":"Ready to Launch"}
                  </span>
                </div>
              </div>

              {/* headline */}
              <h2 style={{ fontSize:36,fontWeight:900,lineHeight:1.1,color:"#fff",margin:"0 0 12px",maxWidth:460 }}>
                Your Business,{" "}
                <span style={{ color:P }}>On Autopilot.</span>
              </h2>
              <p style={{ fontSize:14,lineHeight:1.75,color:"rgba(255,255,255,.45)",margin:"0 0 32px",maxWidth:400 }}>
                Auto-reply WhatsApp messages, capture leads and serve customers 24/7 — completely hands-free with PaxAI.
              </p>

              {/* 3 stats */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32 }}>
                {[
                  { label:"Automations",  val:userData?.workflows||0,       icon:<Layers size={14}/>,       color:P },
                  { label:"Msgs Handled", val:userData?.messagesHandled||0, icon:<MessageSquare size={14}/>, color:T },
                  { label:"Contacts",     val:userData?.contacts||0,         icon:<Users size={14}/>,         color:G },
                ].map(c=>(
                  <div key={c.label} style={{ borderRadius:14,padding:"16px 18px",
                    background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:10,color:c.color }}>
                      {c.icon}
                      <span style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:1,
                        color:"rgba(255,255,255,.35)" }}>{c.label}</span>
                    </div>
                    <p style={{ fontSize:28,fontWeight:900,color:c.color,margin:0,lineHeight:1 }}>{c.val}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <button className="db-btn" style={{ display:"flex",alignItems:"center",gap:8,
                  padding:"12px 24px",borderRadius:12,border:"none",
                  background:P,color:"#fff",fontWeight:700,fontSize:14,
                  boxShadow:`0 8px 24px ${P}45` }}>
                  <Sparkles size={15}/> Open Automations <ArrowRight size={15}/>
                </button>
                <button className="db-btn" style={{ display:"flex",alignItems:"center",gap:8,
                  padding:"12px 20px",borderRadius:12,cursor:"pointer",
                  background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
                  color:"rgba(255,255,255,.6)",fontWeight:600,fontSize:14 }}>
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR — Plan + Wallet */}
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

            {/* Plan card */}
            <div className="db-card" style={{ background:pax26?.bg,border:`1px solid ${pax26?.border}`,overflow:"hidden" }}>
              <div style={{ height:2,background:`linear-gradient(90deg,${planCol},${planCol}44,transparent)` }}/>
              <div style={{ padding:"18px 20px" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,display:"flex",
                      alignItems:"center",justifyContent:"center",
                      background:`${planCol}14`,color:planCol }}>
                      <Crown size={16}/>
                    </div>
                    <div>
                      <p style={{ fontSize:11,fontWeight:600,letterSpacing:1.6,textTransform:"uppercase",
                        color:pax26?.textSecondary,opacity:.4,margin:"0 0 2px" }}>AI Plan</p>
                      <p style={{ fontSize:14,fontWeight:700,color:pax26?.textPrimary,margin:0,textTransform:"capitalize" }}>
                        {plan}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize:9,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",
                    padding:"3px 10px",borderRadius:999,
                    background:isAiOn?`${G}14`:"rgba(239,68,68,.1)",
                    color:isAiOn?G:"#ef4444",
                    border:`1px solid ${isAiOn?G+"28":"rgba(239,68,68,.22)"}` }}>
                    {isAiOn?"Active":"Inactive"}
                  </span>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontSize:11,color:pax26?.textSecondary,opacity:.5 }}>Messages used</span>
                    <span style={{ fontSize:11,fontWeight:600,color:pax26?.textSecondary }}>
                      {used.toLocaleString()} / {quota.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height:5,borderRadius:999,background:pax26?.border,overflow:"hidden" }}>
                    <div style={{ height:"100%",borderRadius:999,width:`${pct}%`,
                      background:pct>=90?"#ef4444":pct>=60?Am:planCol,transition:"width .6s ease" }}/>
                  </div>
                </div>
                <button className="db-btn"
                  onClick={()=>router.push(isAiOn?"/dashboard/billing":"/dashboard/automations/ai-business-dashboard")}
                  style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,
                    width:"100%",padding:"9px 0",marginTop:14,borderRadius:10,fontSize:12,fontWeight:700,
                    background:`${planCol}10`,color:planCol,border:`1px solid ${planCol}25` }}>
                  <Crown size={12}/> {isAiOn?"Manage Plan":"Activate AI"}
                </button>
              </div>
            </div>

            {/* Wallet card */}
            <div className="db-card" style={{ background:pax26?.bg,border:`1px solid ${pax26?.border}` }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px" }}>
                <div>
                  <p style={{ fontSize:11,fontWeight:600,letterSpacing:1.6,textTransform:"uppercase",
                    color:pax26?.textSecondary,opacity:.4,margin:"0 0 3px" }}>Wallet</p>
                  <p style={{ fontSize:14,fontWeight:700,color:pax26?.textPrimary,margin:0 }}>Balance &amp; Cashback</p>
                </div>
                <button className="db-btn" onClick={()=>setShowWallet(!showWallet)}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
                    borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",
                    background:showWallet?`${P}10`:pax26?.secondaryBg,
                    color:showWallet?P:pax26?.textSecondary,
                    border:`1px solid ${showWallet?P+"25":pax26?.border}` }}>
                  {showWallet?<EyeOff size={13}/>:<Eye size={13}/>}
                  {showWallet?"Hide":"View"}
                </button>
              </div>
              {showWallet&&(
                <div className="db-exp" style={{ padding:"0 20px 20px",borderTop:`1px solid ${pax26?.border}`,paddingTop:16 }}>
                  <WalletBalance showMore={showMore} setShowMore={setShowMore}/>
                  <div style={{ borderRadius:12,padding:"14px",background:pax26?.secondaryBg,marginTop:12 }}>
                    <p style={{ fontSize:10,fontWeight:600,letterSpacing:1.6,textTransform:"uppercase",
                      color:pax26?.textSecondary,opacity:.4,margin:"0 0 8px" }}>Cashback</p>
                    <CashBackBalance/>
                  </div>
                </div>
              )}
            </div>

            {/* VTU Services */}
            <div className="db-card" style={{ background:pax26?.bg,border:`1px solid ${pax26?.border}`,padding:"18px 20px" }}>
              <p style={{ fontSize:11,fontWeight:600,letterSpacing:1.6,textTransform:"uppercase",
                color:pax26?.textSecondary,opacity:.4,margin:"0 0 14px" }}>Services</p>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8 }} id="VTU">
                <SvcCard title="Airtime"     link="/dashboard/services/buy-airtime"     icon={<Phone size={18}/>}          color={G}  pax26={pax26} router={router}/>
                <SvcCard title="Data"        link="/dashboard/services/buy-data"        icon={<Wifi size={18}/>}           color={T}  pax26={pax26} router={router}/>
                <SvcCard title="Electricity" link="/dashboard/services/buy-electricity" icon={<Zap size={18}/>}            color={Am} pax26={pax26} router={router}/>
                <SvcCard title="TV"          link="/dashboard/services/buy-tv"          icon={<Tv size={18}/>}             color={Vi} pax26={pax26} router={router}/>
                <SvcCard title="Transfer"    link="/dashboard/services/transfer"        icon={<ArrowRightLeft size={18}/>} color={Co} pax26={pax26} router={router}/>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS — full width */}
        <div className="db-s6">
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:3,height:18,borderRadius:99,background:P }}/>
              <h2 style={{ fontSize:15,fontWeight:700,color:pax26?.textPrimary,margin:0 }}>Recent Activity</h2>
            </div>
            <button className="db-btn" onClick={()=>router.push("/transactions")}
              style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 14px",
                borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",
                color:P,background:`${P}0d`,border:`1px solid ${P}1e` }}>
              View all <ChevronRight size={13}/>
            </button>
          </div>
          <div className="db-card" style={{ background:pax26?.bg,border:`1px solid ${pax26?.border}`,overflow:"hidden" }}>
            {transactionHistory?.length?(
              <div style={{ padding:8 }}>
                {[...transactionHistory].reverse().slice(0,5).map(tx=>(
                  <TxRow key={tx._id} tx={tx} primary={P}
                    onClick={()=>router.push(`transaction-receipt/?id=${tx._id}`)}
                    pax26={pax26}/>
                ))}
              </div>
            ):(
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",padding:"60px 0",gap:10 }}>
                <div style={{ width:48,height:48,borderRadius:14,display:"flex",
                  alignItems:"center",justifyContent:"center",background:pax26?.secondaryBg }}>
                  <ArrowRightLeft size={20} color={pax26?.textSecondary} style={{ opacity:.25 }}/>
                </div>
                <p style={{ fontSize:13,fontWeight:500,color:pax26?.textSecondary,opacity:.35,margin:0 }}>
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}