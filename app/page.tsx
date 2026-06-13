"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext, useReducer } from "react";

// ══════════════════════════════════════════════════════════════
// TICKER & LIVE NOTIFICATION DATA
// ══════════════════════════════════════════════════════════════
const TICKER_ITEMS=[
  "🔥 HOT: New bulk manufacturing demand just broadcasted from Ikeja, Lagos",
  "✅ VERIFIED: Trader in Onitsha, Anambra just closed an escrow milestone contract",
  "⚡ TRENDING: Custom fashion sourcing demands hitting peak volume in FCT, Abuja",
  "🛡 ESCROW: ₦48M logistics contract successfully secured via Zalorix Escrow in Rivers State",
  "📡 NEW: Premium solar panel supplier just listed in Kaduna — 500kW capacity available",
  "🎯 RADAR: 7 new verified buyer requests added across Kano, Enugu & Delta this hour",
  "🔒 SECURED: Cold-chain pharmaceutical distribution contract closed in Ibadan, Oyo",
  "⚡ LIVE: Bulk cashew export deal — AgroCI Exports broadcasting to Global Matrix",
  "🇳🇬 UPDATE: Port Harcourt logistics corridor reports 34% surge in B2B inquiries today",
  "✅ VERIFIED: New CAC-registered supplier onboarded in Benin City, Edo State",
  "🔥 HOT: Abuja Real Estate Consortium just expanded procurement to ₦130M ceiling",
  "📦 NEW LISTING: Computer Village reseller listed 200+ sealed iPhone 15 units — Lagos",
];

const LIVE_EVENTS=[
  {state:"Ekiti",hub:"Ado-Ekiti",summary:"Premium streetwear designer looking for a nationwide bulk logistics partner.",tag:"Logistics",urgency:"High",budget:{min:8000000,max:14000000}},
  {state:"Imo",hub:"Owerri",summary:"Agricultural cooperative seeking cold-chain storage and distribution for yam exports.",tag:"Agriculture",urgency:"Urgent",budget:{min:12000000,max:22000000}},
  {state:"Enugu",hub:"Enugu",summary:"Construction firm procuring 10,000 bags of cement and rebar for estate project.",tag:"Construction",urgency:"High",budget:{min:45000000,max:70000000}},
  {state:"Borno",hub:"Maiduguri",summary:"NGO procurement: 500 solar lanterns and 200 water purification units needed.",tag:"Energy",urgency:"Medium",budget:{min:6500000,max:11000000}},
  {state:"Kogi",hub:"Lokoja",summary:"Riverine logistics firm sourcing GPS-tracked speed boats for cargo transit.",tag:"Logistics",urgency:"Urgent",budget:{min:28000000,max:42000000}},
  {state:"Osun",hub:"Osogbo",summary:"Fashion label seeking bulk fabric (Ankara/adire) supplier for Q4 export line.",tag:"Apparel",urgency:"Medium",budget:{min:3200000,max:6000000}},
  {state:"Kebbi",hub:"Birnin Kebbi",summary:"Rice mill operator sourcing packaging materials — 50-ton monthly recurring order.",tag:"Manufacturing",urgency:"High",budget:{min:9000000,max:16000000}},
  {state:"Ogun",hub:"Abeokuta",summary:"EduTech startup procuring 120 Android tablets for student distribution programme.",tag:"Technology",urgency:"Medium",budget:{min:14000000,max:20000000}},
  {state:"Taraba",hub:"Jalingo",summary:"Agribusiness firm sourcing maize aggregators for a 100MT offtake deal.",tag:"Agriculture",urgency:"High",budget:{min:22000000,max:35000000}},
  {state:"Zamfara",hub:"Gusau",summary:"Mining consortium requires explosive supply chain logistics consultancy.",tag:"Industrial",urgency:"Urgent",budget:{min:55000000,max:90000000}},
];

// ══════════════════════════════════════════════════════════════
// TICKER COMPONENT
// ══════════════════════════════════════════════════════════════
function TickerRibbon(){
  const repeated=[...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS];
  return(
    <div style={{height:30,background:T.navBg,borderBottom:"1px solid #1a3d30",display:"flex",alignItems:"center",overflow:"hidden",position:"relative",flexShrink:0,zIndex:50}}>
      <style>{`
        @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-33.333%)}}
        .ticker-track{display:flex;animation:tickerScroll 90s linear infinite;width:max-content;will-change:transform;}
        .ticker-track:hover{animation-play-state:paused}
      `}</style>
      {/* Left fade */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:60,background:`linear-gradient(to right,${T.navBg},transparent)`,zIndex:2,pointerEvents:"none"}} />
      {/* Live badge */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,display:"flex",alignItems:"center",paddingLeft:10,zIndex:3,background:T.navBg,paddingRight:14,borderRight:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#7de0a8",boxShadow:"0 0 0 2px rgba(125,224,168,0.3)",animation:"pulse 1.8s ease-in-out infinite"}} />
          <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 2px rgba(125,224,168,0.3)}50%{box-shadow:0 0 0 5px rgba(125,224,168,0.08)}}`}</style>
          <span style={{fontSize:8,fontWeight:800,color:"#7de0a8",letterSpacing:"0.14em",whiteSpace:"nowrap"}}>LIVE</span>
        </div>
      </div>
      {/* Scrolling track */}
      <div style={{overflow:"hidden",flex:1,paddingLeft:70}}>
        <div className="ticker-track">
          {repeated.map((item,i)=>(
            <span key={i} style={{fontSize:10,color:"rgba(255,255,255,0.72)",whiteSpace:"nowrap",paddingRight:56,fontWeight:500,letterSpacing:"0.01em"}}>
              {item}
              <span style={{color:"rgba(255,255,255,0.2)",marginLeft:56,marginRight:0}}>◆</span>
            </span>
          ))}
        </div>
      </div>
      {/* Right fade */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:40,background:`linear-gradient(to left,${T.navBg},transparent)`,zIndex:2,pointerEvents:"none"}} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LIVE TOAST NOTIFICATION ENGINE
// ══════════════════════════════════════════════════════════════
function LiveToastStack({onViewRadar,onNewRequest}){
  const [toasts,setToasts]=useState([]);
  const timerRef=useRef();

  const fireEvent=useCallback(()=>{
    const ev=LIVE_EVENTS[Math.floor(Math.random()*LIVE_EVENTS.length)];
    const id=uid();
    const newReq={
      id,buyer:"Anonymous Verified Buyer",avatar:ev.state.slice(0,2).toUpperCase(),
      verified:"Phone Verified",badge2:"Escrow Ready",
      state:ev.state,hub:ev.hub,category:ev.tag,
      title:`Live Demand — ${ev.hub}, ${ev.state}`,
      desc:ev.summary,budget:ev.budget,currency:"₦",
      urgency:ev.urgency,posted:"just now",responses:0,tag:ev.tag,isNew:true,isLive:true,
    };
    onNewRequest(newReq);
    setToasts(prev=>{
      const next=[{id,event:ev,req:newReq,ts:Date.now()},...prev].slice(0,3);
      return next;
    });
  },[onNewRequest]);

  useEffect(()=>{
    // First fire after 12s, then every 45–60s
    const initial=setTimeout(()=>{
      fireEvent();
      timerRef.current=setInterval(fireEvent,Math.random()*15000+45000);
    },12000);
    return()=>{clearTimeout(initial);clearInterval(timerRef.current);};
  },[fireEvent]);

  const dismiss=useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  useEffect(()=>{
    if(!toasts.length)return;
    const t=setTimeout(()=>setToasts(p=>p.slice(0,-1)),8000);
    return()=>clearTimeout(t);
  },[toasts.length]);

  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:1100,display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
      <style>{`
        @keyframes toastSlide{from{opacity:0;transform:translateX(120%)}to{opacity:1;transform:translateX(0)}}
        @keyframes flashFade{0%{background:rgba(26,122,74,0.18)}100%{background:transparent}}
        .live-toast{animation:toastSlide 0.38s cubic-bezier(0.22,1,0.36,1) forwards}
        .new-item-flash{animation:flashFade 3s ease forwards}
      `}</style>
      {[...toasts].reverse().map((t,idx)=>{
        const urgColor=t.event.urgency==="Urgent"?T.red:t.event.urgency==="High"?T.gold:T.accent;
        return(
          <div key={t.id} className="live-toast" style={{width:320,background:"#fff",border:`1px solid ${T.cardBorder}`,borderRadius:14,overflow:"hidden",boxShadow:"0 8px 40px rgba(15,44,35,0.16)",opacity:idx===toasts.length-1?0.75:1,transition:"opacity 0.3s",}}>
            {/* Top accent */}
            <div style={{height:3,background:`linear-gradient(90deg,${T.accent},${T.emerald})`}} />
            <div style={{padding:"12px 14px 14px"}}>
              {/* Header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{position:"relative",width:8,height:8,flexShrink:0}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 0 3px rgba(34,197,94,0.2)",animation:"pulse 1.8s ease-in-out infinite"}} />
                  </div>
                  <span style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.1em"}}>NEW DEMAND HUB</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:9,fontWeight:700,color:urgColor,background:urgColor+"15",border:`1px solid ${urgColor}30`,borderRadius:99,padding:"2px 7px"}}>{t.event.urgency.toUpperCase()}</span>
                  <button onClick={()=>dismiss(t.id)} style={{background:"none",border:"none",color:T.mutedText,cursor:"pointer",fontSize:15,lineHeight:1,padding:"0 2px"}}>✕</button>
                </div>
              </div>
              {/* Location */}
              <div style={{fontSize:13,fontWeight:800,color:T.headText,marginBottom:4}}>🇳🇬 {t.event.hub}, {t.event.state}</div>
              {/* Summary */}
              <div style={{fontSize:11,color:T.bodyText,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{t.event.summary}</div>
              {/* Budget */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:9,borderTop:`1px solid ${T.divider}`}}>
                <div>
                  <div style={{fontSize:8,color:T.mutedText,letterSpacing:"0.07em",fontWeight:600,marginBottom:2}}>BUDGET</div>
                  <div style={{fontSize:12,fontWeight:800,color:T.headText}}>₦{t.event.budget.min.toLocaleString()} – ₦{t.event.budget.max.toLocaleString()}</div>
                </div>
                <button onClick={()=>{dismiss(t.id);onViewRadar();}} style={{background:T.navBg,border:"none",borderRadius:8,padding:"7px 13px",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,transition:"opacity 0.15s"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  🎯 View Live Radar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════
const T={navBg:"#0F2C23",navBorder:"#1a3d30",navActive:"#1a3d30",navText:"#a8c4b8",pageBg:"#F5F7F5",cardBg:"#FFFFFF",cardBorder:"#E4EBE7",topBarBg:"#FFFFFF",topBarBorder:"#E4EBE7",headText:"#0F2C23",bodyText:"#374840",mutedText:"#7A9E8E",accent:"#1a7a4a",accentLight:"#e8f5ee",accentBorder:"#b6dfc8",gold:"#b08d41",goldLight:"#fdf6e3",goldBorder:"#e6d08a",emerald:"#2e7d5b",red:"#c0392b",redLight:"#fdf0ee",badge1Bg:"#e6f4ed",badge1Text:"#1a7a4a",badge1Border:"#b6dfc8",badge2Bg:"#fdf6e3",badge2Text:"#b08d41",badge2Border:"#e6d08a",badge3Bg:"#eef1f8",badge3Text:"#3b5fa0",badge3Border:"#c5d0e8",badge4Bg:"#fdf0ee",badge4Text:"#c0392b",badge4Border:"#f0c0b8",inputBg:"#F8FAF9",inputBorder:"#D1DDD8",divider:"#EAF0EC"};
const inputSt={width:"100%",background:T.inputBg,border:`1px solid ${T.inputBorder}`,borderRadius:8,padding:"10px 13px",color:T.headText,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
const cardSt={background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:14};

// ══════════════════════════════════════════════════════════════
// NIGERIAN NODES
// ══════════════════════════════════════════════════════════════
const NIGERIAN_REGIONAL_NODES=[
  {state:"Abia",primaryHub:"Umuahia"},{state:"Adamawa",primaryHub:"Yola"},{state:"Akwa Ibom",primaryHub:"Uyo"},
  {state:"Anambra",primaryHub:"Awka"},{state:"Bauchi",primaryHub:"Bauchi"},{state:"Bayelsa",primaryHub:"Yenagoa"},
  {state:"Benue",primaryHub:"Makurdi"},{state:"Borno",primaryHub:"Maiduguri"},{state:"Cross River",primaryHub:"Calabar"},
  {state:"Delta",primaryHub:"Asaba"},{state:"Ebonyi",primaryHub:"Abakaliki"},{state:"Edo",primaryHub:"Benin City"},
  {state:"Ekiti",primaryHub:"Ado-Ekiti"},{state:"Enugu",primaryHub:"Enugu"},{state:"FCT",primaryHub:"Abuja"},
  {state:"Gombe",primaryHub:"Gombe"},{state:"Imo",primaryHub:"Owerri"},{state:"Jigawa",primaryHub:"Dutse"},
  {state:"Kaduna",primaryHub:"Kaduna"},{state:"Kano",primaryHub:"Kano"},{state:"Katsina",primaryHub:"Katsina"},
  {state:"Kebbi",primaryHub:"Birnin Kebbi"},{state:"Kogi",primaryHub:"Lokoja"},{state:"Kwara",primaryHub:"Ilorin"},
  {state:"Lagos",primaryHub:"Ikeja"},{state:"Nasarawa",primaryHub:"Lafia"},{state:"Niger",primaryHub:"Minna"},
  {state:"Ogun",primaryHub:"Abeokuta"},{state:"Ondo",primaryHub:"Akure"},{state:"Osun",primaryHub:"Osogbo"},
  {state:"Oyo",primaryHub:"Ibadan"},{state:"Plateau",primaryHub:"Jos"},{state:"Rivers",primaryHub:"Port Harcourt"},
  {state:"Sokoto",primaryHub:"Sokoto"},{state:"Taraba",primaryHub:"Jalingo"},{state:"Yobe",primaryHub:"Damaturu"},
  {state:"Zamfara",primaryHub:"Gusau"},
];
const NG_CITIES=NIGERIAN_REGIONAL_NODES.map(n=>n.primaryHub);
const cityToNGState=city=>NIGERIAN_REGIONAL_NODES.find(n=>n.primaryHub===city)?.state||null;

// ══════════════════════════════════════════════════════════════
// STATIC REFERENCE DATA
// ══════════════════════════════════════════════════════════════
const COUNTRIES=[
  {code:"NG",name:"Nigeria",currency:"₦",region:"Africa",cities:NG_CITIES},
  {code:"GH",name:"Ghana",currency:"₵",region:"Africa",cities:["Accra","Kumasi","Takoradi","Tamale"]},
  {code:"KE",name:"Kenya",currency:"KSh",region:"Africa",cities:["Nairobi","Mombasa","Kisumu","Nakuru"]},
  {code:"ZA",name:"South Africa",currency:"R",region:"Africa",cities:["Johannesburg","Cape Town","Durban","Pretoria"]},
  {code:"EG",name:"Egypt",currency:"E£",region:"Africa",cities:["Cairo","Alexandria","Giza","Aswan"]},
  {code:"RW",name:"Rwanda",currency:"RF",region:"Africa",cities:["Kigali","Butare","Gisenyi","Ruhengeri"]},
  {code:"CI",name:"Ivory Coast",currency:"CFA",region:"Africa",cities:["Abidjan","Bouaké","Daloa","Korhogo"]},
  {code:"ET",name:"Ethiopia",currency:"Br",region:"Africa",cities:["Addis Ababa","Dire Dawa","Mekelle","Gondar"]},
  {code:"TZ",name:"Tanzania",currency:"TSh",region:"Africa",cities:["Dar es Salaam","Dodoma","Mwanza","Zanzibar"]},
  {code:"SN",name:"Senegal",currency:"CFA",region:"Africa",cities:["Dakar","Thiès","Saint-Louis","Ziguinchor"]},
  {code:"GB",name:"United Kingdom",currency:"£",region:"Europe",cities:["London","Manchester","Birmingham","Edinburgh"]},
  {code:"US",name:"USA",currency:"$",region:"Americas",cities:["New York","San Francisco","Austin","Chicago"]},
  {code:"AE",name:"UAE",currency:"AED",region:"Middle East",cities:["Dubai","Abu Dhabi","Sharjah","Ajman"]},
  {code:"DE",name:"Germany",currency:"€",region:"Europe",cities:["Berlin","Munich","Hamburg","Frankfurt"]},
  {code:"SG",name:"Singapore",currency:"S$",region:"Asia",cities:["Singapore","Jurong","Tampines","Woodlands"]},
];
const FLAGS={NG:"🇳🇬",GH:"🇬🇭",KE:"🇰🇪",ZA:"🇿🇦",EG:"🇪🇬",RW:"🇷🇼",CI:"🇨🇮",ET:"🇪🇹",TZ:"🇹🇿",SN:"🇸🇳",GB:"🇬🇧",US:"🇺🇸",AE:"🇦🇪",DE:"🇩🇪",SG:"🇸🇬"};
const ROLES=["Standard Buyer","Individual Trader","Verified Local Business","Global Enterprise"];
const CATEGORIES=["Tech & Gadgets","Apparel & Textiles","Agriculture","Agri-Logistics","Clean Energy","Design Services","Software Agency","Marketing","Legal & Finance","Manufacturing","Creative Agency","Real Estate","Health & Wellness","Education & Training","Food & Beverage","Construction","Industrial Supply","Logistics"];
const TAG_COLORS={"Technology":"#1a7a4a","Apparel":"#b08d41","Logistics":"#3b5fa0","Agriculture":"#2e7d5b","Energy":"#5a8a1a","Design":"#7a4a9a","Marketing":"#c0392b","Finance":"#b07a20","Tech & Gadgets":"#1a7a4a","Apparel & Textiles":"#b08d41","Software Agency":"#1a7a4a","Creative Agency":"#7a4a9a","Clean Energy":"#5a8a1a","Legal & Finance":"#b07a20","Agri-Logistics":"#3b5fa0","Real Estate":"#b07a20","Health & Wellness":"#b08d41","Education & Training":"#7a4a9a","Food & Beverage":"#2e7d5b","Manufacturing":"#5a7a6a","Construction":"#8a6a2a","Industrial Supply":"#5a7a6a","Logistics":"#3b5fa0"};
const BADGE_STYLES={"Verified Provider":{bg:"#e6f4ed",color:"#1a7a4a",border:"#b6dfc8"},"Top Rated":{bg:"#fdf6e3",color:"#b08d41",border:"#e6d08a"},"Premium Tier":{bg:"#eef1f8",color:"#3b5fa0",border:"#c5d0e8"},"Featured":{bg:"#fdf0ee",color:"#c0392b",border:"#f0c0b8"}};
const AFRICAN_CODES=new Set(["NG","GH","KE","ZA","EG","RW","CI","ET","TZ","SN"]);
const SCOPE_LABELS={local:"Local Node Only",nation:"Nationwide Trade",global:"Global Matrix"};

// ══════════════════════════════════════════════════════════════
// HYDRATED MOCK DATA — Rich domestic NG + global records
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// FEATURED VENDOR REGISTRY — add more brands here
// ══════════════════════════════════════════════════════════════
const FEATURED_VENDORS = [
  {
    id: "ilawrenluxe",
    name: "iLAWRENLUXE",
    tagline: "Redefining contemporary luxury, premium aesthetics, and bespoke style curation across Nigeria.",
    badge: "Zalorix Black · Gold Verified",
    category: "Luxury Fashion & Consultancy",
    country: "NG",
    city: "Ikeja",
    state: "Lagos",
    instagram: "https://instagram.com/ilawren_luxe",
    verified: true,
    listingIds: ["ilx1","ilx2","ilx3"],
  },
];

const VENDOR_LISTINGS = [
  {
    id: "ilx1",
    vendorId: "ilawrenluxe",
    title: "iL Skull & Cans Trucker Cap",
    category: "Headwear",
    provider: "iLAWRENLUXE",
    country: "NG", city: "Ikeja", price: 7000,
    tag: "Apparel & Textiles", badge: "Gold Verified",
    likes: 0, region_type: "nation",
    desc: "White & black two-tone trucker cap. Bold skull-with-headphones graphic print. Mesh back panel, adjustable snapback. One size fits most. Ships nationwide.",
    image: "https://picsum.photos/seed/cap99/800/600",
    isFeatured: true,
  },
  {
    id: "ilx2",
    vendorId: "ilawrenluxe",
    title: "Textured Co-ord Set — Muscle Tank & Shorts",
    category: "Co-ord Sets",
    provider: "iLAWRENLUXE",
    country: "NG", city: "Ikeja", price: 22000,
    tag: "Apparel & Textiles", badge: "Gold Verified",
    likes: 0, region_type: "nation",
    desc: "All-white premium textured fabric co-ord. Structured sleeveless top with diagonal weave pattern + matching elastic-waist shorts. Clean, minimal, elevated street aesthetic. Sizes S–XXL.",
    image: "https://picsum.photos/seed/coord22/800/600",
    isFeatured: true,
  },
  {
    id: "ilx3",
    vendorId: "ilawrenluxe",
    title: "Ghost Graphic Muscle Tank — iL Signature",
    category: "Graphic Tops",
    provider: "iLAWRENLUXE",
    country: "NG", city: "Ikeja", price: 12000,
    tag: "Apparel & Textiles", badge: "Gold Verified",
    likes: 0, region_type: "nation",
    desc: "Heavyweight black muscle tank. Features the iLAWRENLUXE ghost mascot with drip-wave brushstroke detail. iL monogram logo on chest. Oversized drop-shoulder silhouette. Unisex sizing S–XXL.",
    image: "https://picsum.photos/seed/ghost12/800/600",
    isFeatured: true,
  },
];

// ── Featured Vendor Spotlight Component ──────────────────────
function FeaturedVendorSpotlight({ vendor, listings, onBuy, onChat, setNav }) {
  const [hovCard, setHovCard] = useState(null);
  const goldGrad = "linear-gradient(135deg,#b08d41,#e6c96e,#b08d41)";
  const goldText = "#b08d41";
  const goldLight = "#fdf6e3";
  const goldBorder = "#e6d08a";

  return (
    <div style={{ marginBottom: 28 }}>
      <style>{`.ilx-card{transition:transform 0.2s,box-shadow 0.2s}.ilx-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(15,44,35,0.13)!important}`}</style>

      {/* Brand header banner */}
      <div style={{ background: T.navBg, borderRadius: 16, overflow: "hidden", marginBottom: 14, position: "relative" }}>
        {/* Decorative gold shimmer bar */}
        <div style={{ height: 3, background: goldGrad }} />
        {/* Subtle orb */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(176,141,65,0.06)", pointerEvents: "none" }} />
        <div style={{ padding: "22px 28px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {/* Avatar / monogram */}
          <div style={{ width: 64, height: 64, borderRadius: 16, background: goldGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 20px rgba(176,141,65,0.35)" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: T.navBg, letterSpacing: "-0.02em" }}>iL</span>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            {/* Gold verified badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(176,141,65,0.12)", border: "1px solid rgba(176,141,65,0.3)", borderRadius: 99, padding: "3px 11px", marginBottom: 8 }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 0l1.2 3.5H10L7.1 5.7l1.1 3.5L5 7.3l-3.2 1.9 1.1-3.5L0 3.5h3.8z" fill="#e6c96e" /></svg>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#e6c96e", letterSpacing: "0.12em" }}>{vendor.badge.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.01em", marginBottom: 5 }}>{vendor.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, maxWidth: 540 }}>{vendor.tagline}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            {/* Instagram link */}
            <a href={vendor.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9, padding: "8px 14px", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
              {/* Instagram SVG icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="rgba(255,255,255,0.8)" stroke="none" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>@ilawren_luxe</span>
            </a>
            <button onClick={() => setNav("messages")} style={{ background: goldGrad, border: "none", borderRadius: 9, padding: "8px 14px", color: T.navBg, cursor: "pointer", fontSize: 11, fontWeight: 800, letterSpacing: "0.01em" }}>
              Negotiate via Chat Node →
            </button>
          </div>
        </div>
      </div>

      {/* Listing cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {listings.map((l, i) => (
          <div key={l.id} className="ilx-card" style={{ background: T.cardBg, border: `1px solid ${goldBorder}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}
            onMouseEnter={() => setHovCard(i)} onMouseLeave={() => setHovCard(null)}>
            {/* Product image */}
            {l.image && (
              <div style={{ position: "relative", width: "100%", height: 200, overflow: "hidden" }}>
                <img
                  src={l.image}
                  alt={l.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.4s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
                {/* Gold shimmer overlay on hover */}
                <div style={{ position: "absolute", inset: 0, background: hovCard === i ? "rgba(176,141,65,0.08)" : "transparent", transition: "background 0.3s", pointerEvents: "none" }} />
                {/* Gold top accent bar over image */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: goldGrad }} />
                {/* Price chip */}
                <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(15,44,35,0.88)", backdropFilter: "blur(4px)", border: `1px solid ${goldBorder}`, borderRadius: 8, padding: "4px 10px" }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#e6c96e", letterSpacing: "-0.01em" }}>₦{l.price.toLocaleString()}</span>
                </div>
              </div>
            )}
            {/* No image fallback: gold bar */}
            {!l.image && <div style={{ height: 3, background: goldGrad }} />}
            <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: goldText, background: goldLight, border: `1px solid ${goldBorder}`, padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>{l.category.toUpperCase()}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: T.navBg, background: goldGrad, padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>✦ GOLD VERIFIED</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.headText, lineHeight: 1.35, marginBottom: 5 }}>{l.title}</div>
                <div style={{ fontSize: 11, color: T.mutedText, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.desc}</div>
              </div>
              <div style={{ fontSize: 11, color: T.mutedText, display: "flex", alignItems: "center", gap: 5 }}>
                <span>🇳🇬</span><span>{l.city}, {l.country === "NG" ? "Nigeria" : l.country}</span>
              </div>
              {/* CTAs */}
              <div style={{ display: "flex", gap: 7, marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${T.divider}` }}>
                <button onClick={() => onBuy(l)} style={{ flex: 1, background: T.navBg, border: "none", borderRadius: 8, padding: "8px 0", color: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}>
                  🔒 Initiate Secure<br />Escrow Order
                </button>
                <button onClick={() => onChat(l.id)} style={{ flex: 1, background: goldLight, border: `1px solid ${goldBorder}`, borderRadius: 8, padding: "8px 0", color: goldText, cursor: "pointer", fontSize: 10, fontWeight: 700, lineHeight: 1.3, textAlign: "center" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5edd5"}
                  onMouseLeave={e => e.currentTarget.style.background = goldLight}>
                  💬 Negotiate via<br />Chat Node
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEED_LISTINGS=[
  // iLAWRENLUXE flagship listings
  ...VENDOR_LISTINGS,
  // Lagos — Computer Village tech corridor
  {id:"l1",title:"iPhone 15 Pro Max — Bulk Supply (10+ units)",category:"Tech & Gadgets",provider:"CV TechStore Lagos",country:"NG",city:"Ikeja",price:980000,tag:"Technology",badge:"Verified Provider",likes:412,region_type:"local",desc:"Authorised reseller of Apple products at Computer Village, Ikeja. Bulk pricing available. All units sealed with 1-year warranty."},
  {id:"l2",title:"HP & Dell Laptop Refurbishment Hub",category:"Tech & Gadgets",provider:"SwiftPC Ikeja",country:"NG",city:"Ikeja",price:185000,tag:"Technology",badge:"Top Rated",likes:287,region_type:"local",desc:"Grade-A refurbished HP EliteBook and Dell Latitude laptops. 90-day hardware warranty. Corporate procurement welcome."},
  {id:"l3",title:"CCTV & Security Systems Installation",category:"Tech & Gadgets",provider:"SecureVision NG",country:"NG",city:"Ikeja",price:320000,tag:"Technology",badge:"Verified Provider",likes:198,region_type:"local",desc:"Supply and installation of Hikvision and Dahua CCTV systems for homes, offices, and warehouses across Lagos."},
  // Abuja — fashion & textiles
  {id:"l4",title:"Bespoke Corporate Wear — 50 Piece MOQ",category:"Apparel & Textiles",provider:"Threads & Co. Abuja",country:"NG",city:"Abuja",price:2800000,tag:"Apparel",badge:"Verified Provider",likes:334,region_type:"local",desc:"Premium corporate uniforms and branded business wear. Embroidery and logo printing included. 21-day turnaround."},
  {id:"l5",title:"Aso-Ebi Fabric Wholesale — Wax & Lace",category:"Apparel & Textiles",provider:"FabricZone Abuja",country:"NG",city:"Abuja",price:450000,tag:"Apparel",badge:"Top Rated",likes:521,region_type:"local",desc:"Ankara, Swiss lace and atiku fabric at wholesale prices. Minimum 100 yards per order. Delivered nationwide."},
  // Port Harcourt — logistics & transport
  {id:"l6",title:"Haulage Services — 30-Ton Fleet Available",category:"Logistics",provider:"Delta Haulage PH",country:"NG",city:"Port Harcourt",price:1200000,tag:"Logistics",badge:"Verified Provider",likes:176,region_type:"local",desc:"30-ton trucks available for bulk goods movement across South-South and South-East Nigeria. GPS tracked, insured cargo."},
  {id:"l7",title:"Offshore Crew Boat Charter — Rivers",category:"Logistics",provider:"Rigline Marine NG",country:"NG",city:"Port Harcourt",price:4500000,tag:"Logistics",badge:"Premium Tier",likes:89,region_type:"local",desc:"Licensed offshore crew boat charter for oil & gas personnel. NIMASA certified. Available from Bonny Island terminal."},
  {id:"l8",title:"Last-Mile Delivery Network — PH & Environs",category:"Agri-Logistics",provider:"SwiftDrop Rivers",country:"NG",city:"Port Harcourt",price:85000,tag:"Logistics",badge:"Featured",likes:263,region_type:"local",desc:"Same-day and next-day last-mile delivery across Port Harcourt, Eleme, Obio-Akpor. B2B dispatch contracts available."},
  // Kano — agriculture & textiles
  {id:"l9",title:"Grade A Groundnut Oil — 500L Drum Export",category:"Agriculture",provider:"Arewa AgroExports",country:"NG",city:"Kano",price:3200000,tag:"Agriculture",badge:"Verified Provider",likes:445,region_type:"local",desc:"Premium cold-pressed groundnut oil processed in Kano. Export-ready packaging. NAFDAC certified. Minimum 500 litres."},
  {id:"l10",title:"Adire & Tie-Dye Fabric — Artisan Collection",category:"Apparel & Textiles",provider:"Kantin Kwari Direct",country:"NG",city:"Kano",price:180000,tag:"Apparel",badge:"Top Rated",likes:312,region_type:"local",desc:"Authentic hand-dyed adire and tie-dye fabrics from Kano's Kantin Kwari market. Wholesale orders from 200 yards."},
  // Enugu — construction & real estate
  {id:"l11",title:"Reinforced Concrete Hollow Blocks — Factory Direct",category:"Construction",provider:"Enugu Block Works",country:"NG",city:"Enugu",price:680000,tag:"Construction",badge:"Verified Provider",likes:201,region_type:"local",desc:"9-inch and 6-inch hollow blocks at factory prices. Minimum 5,000 units per order. Delivery to Enugu and Anambra."},
  {id:"l12",title:"Architectural Design & BOQ Services",category:"Real Estate",provider:"BuildRight Enugu",country:"NG",city:"Enugu",price:850000,tag:"Construction",badge:"Featured",likes:157,region_type:"local"},
  // Global listings
  {id:"l13",title:"Luxury Brand Identity Suite",category:"Design Services",provider:"Arkiv Studio",country:"DE",city:"Berlin",price:4200,tag:"Design",badge:"Verified Provider",likes:398,region_type:"local"},
  {id:"l14",title:"AI-Powered Data Pipeline",category:"Tech & Gadgets",provider:"NexaCore Ltd",country:"GB",city:"London",price:8500,tag:"Technology",badge:"Top Rated",likes:214,region_type:"local"},
  {id:"l15",title:"360° Digital Marketing Campaign",category:"Marketing",provider:"Pulse Agency",country:"AE",city:"Dubai",price:26400,tag:"Marketing",badge:"Top Rated",likes:541,region_type:"local"},
  {id:"l16",title:"Cold-Chain Logistics Services",category:"Agri-Logistics",provider:"FreshRoute Africa",country:"KE",city:"Nairobi",price:95000,tag:"Logistics",badge:"Verified Provider",likes:489,region_type:"local"},
  {id:"l17",title:"Tailored Kente Cloth Collections",category:"Apparel & Textiles",provider:"Nana Fabrics",country:"GH",city:"Accra",price:8500,tag:"Apparel",badge:"Top Rated",likes:214,region_type:"local"},
  {id:"l18",title:"Premium Cashew Export – B2B",category:"Agriculture",provider:"AgroCI Exports",country:"CI",city:"Abidjan",price:750000,tag:"Agriculture",badge:"Verified Provider",likes:203,region_type:"local"},
  {id:"l19",title:"SaaS Product Development",category:"Software Agency",provider:"Kigali Digital Lab",country:"RW",city:"Kigali",price:18000,tag:"Technology",badge:"Top Rated",likes:134,region_type:"local"},
  {id:"l20",title:"FinTech Compliance Consulting",category:"Legal & Finance",provider:"Meridian Advisors",country:"SG",city:"Singapore",price:12000,tag:"Finance",badge:"Premium Tier",likes:97,region_type:"local"},
];

const SEED_FEED=[
  {id:"f1",type:"New Listing",actor:"CV TechStore Lagos",text:"just listed bulk iPhone 15 Pro Max units at Computer Village — sealed, warranty included.",time:"4m ago",tag:"Technology",isNew:true},
  {id:"f2",type:"Verified Update",actor:"Delta Haulage PH",text:"expanded fleet capacity — 30-ton haulage now available to South-East corridor.",time:"11m ago",tag:"Logistics"},
  {id:"f3",type:"Trending",actor:"FabricZone Abuja",text:"Aso-Ebi wholesale listing is trending across FCT and Nasarawa this week.",time:"22m ago",tag:"Apparel"},
  {id:"f4",type:"New Listing",actor:"Arewa AgroExports",text:"posted export-grade groundnut oil — 500L drum minimum, NAFDAC certified.",time:"38m ago",tag:"Agriculture"},
  {id:"f5",type:"Verified Update",actor:"Arkiv Studio",text:"upgraded service tier — Luxury Brand Identity Suite now includes NFT-ready brand assets.",time:"1h ago",tag:"Design"},
  {id:"f6",type:"New Listing",actor:"Rigline Marine NG",text:"listed offshore crew boat charter from Bonny Island — NIMASA certified, B2B only.",time:"2h ago",tag:"Logistics"},
  {id:"f7",type:"Trending",actor:"AgroCI Exports",text:"Premium Cashew Export is the #1 trending listing across West Africa this week.",time:"3h ago",tag:"Agriculture"},
];

const SEED_BUYER_REQUESTS=[
  {id:"br1",buyer:"Conoil Producing Ltd",avatar:"CP",verified:"Escrow Ready",badge2:"CAC Verified",state:"Rivers",hub:"Port Harcourt",category:"Industrial Supply",title:"Urgent: 500 units industrial safety equipment",desc:"EN-ISO certified hard hats, safety boots (sizes 40–46), high-vis jackets and gloves. Must meet NUPENG standards. Preferred suppliers within Rivers or Delta.",budget:{min:4500000,max:7200000},currency:"₦",urgency:"Urgent",posted:"12m ago",responses:3,tag:"Industrial"},
  {id:"br2",buyer:"Greenfield Farms Cooperative",avatar:"GF",verified:"Phone Verified",badge2:"Escrow Ready",state:"Benue",hub:"Makurdi",category:"Agriculture",title:"Bulk soybean offtake — 40 metric tons",desc:"40MT soybean offtake deal. Moisture content below 13%. Collection: Makurdi warehouse. Escrow payment on delivery.",budget:{min:8000000,max:12000000},currency:"₦",urgency:"High",posted:"1h ago",responses:7,tag:"Agriculture"},
  {id:"br3",buyer:"Nextgen Logistics NG",avatar:"NL",verified:"Escrow Ready",badge2:"Verified Business",state:"Kaduna",hub:"Kaduna",category:"Logistics",title:"Fleet of 8 refrigerated trucks — 3-month contract",desc:"FMCG cold-chain distribution across North-West. GPS-tracked, NAFDAC-compliant. Base: Kaduna. Routes to Sokoto and Katsina.",budget:{min:18000000,max:24000000},currency:"₦",urgency:"High",posted:"2h ago",responses:12,tag:"Logistics"},
  {id:"br4",buyer:"Landmark University Edu Trust",avatar:"LU",verified:"CAC Verified",badge2:"Phone Verified",state:"Kwara",hub:"Ilorin",category:"Tech & Gadgets",title:"Procurement: 200 laptops for student lab expansion",desc:"200 units 8GB/512GB SSD laptops (Win 11 Pro). Lenovo ThinkPad or HP EliteBook. 1-year local warranty + onsite support.",budget:{min:36000000,max:45000000},currency:"₦",urgency:"Medium",posted:"3h ago",responses:5,tag:"Technology"},
  {id:"br5",buyer:"Abuja Real Estate Consortium",avatar:"AR",verified:"Escrow Ready",badge2:"CAC Verified",state:"FCT",hub:"Abuja",category:"Construction",title:"Building materials — 48-unit residential estate",desc:"Bulk cement, rebar (12mm & 16mm), hollow blocks and PVC pipes. Lokogoma delivery. VAT invoice required.",budget:{min:95000000,max:130000000},currency:"₦",urgency:"High",posted:"4h ago",responses:21,tag:"Construction"},
  {id:"br6",buyer:"Oilfield Services West Africa",avatar:"OS",verified:"Phone Verified",badge2:"Escrow Ready",state:"Akwa Ibom",hub:"Uyo",category:"Industrial Supply",title:"API 5L grade pipes — 200 metres minimum",desc:"API 5L-certified steel pipes (6-inch diameter) for subsea pipeline repair. Mill certificates required. Delivery: Eket terminal.",budget:{min:22000000,max:35000000},currency:"₦",urgency:"Urgent",posted:"5h ago",responses:9,tag:"Industrial"},
  {id:"br7",buyer:"Kantin Kwari Textiles Hub",avatar:"KK",verified:"Phone Verified",badge2:"Phone Verified",state:"Kano",hub:"Kano",category:"Apparel & Textiles",title:"Wholesale Ankara & lace — monthly recurring order",desc:"5,000–8,000 yards Ankara and Swiss lace monthly. Direct importers or manufacturers preferred. 30-day credit terms.",budget:{min:3500000,max:6000000},currency:"₦",urgency:"Medium",posted:"6h ago",responses:14,tag:"Apparel"},
  {id:"br8",buyer:"Niger Delta Power Holdings",avatar:"ND",verified:"Escrow Ready",badge2:"CAC Verified",state:"Delta",hub:"Asaba",category:"Clean Energy",title:"Solar panel supply — 500kW off-grid installation",desc:"Tier-1 solar panels (400W+), inverters and battery banks for Warri project. NSERC compliance + commissioning team required.",budget:{min:65000000,max:90000000},currency:"₦",urgency:"High",posted:"8h ago",responses:4,tag:"Energy"},
  {id:"br9",buyer:"Eko Atlantic Hospitality Group",avatar:"EA",verified:"Escrow Ready",badge2:"CAC Verified",state:"Lagos",hub:"Ikeja",category:"Food & Beverage",title:"Premium food supply contract — 5-star hotel group",desc:"Fresh produce, proteins and imported beverages for 5-hotel group. Weekly recurring order. Cold-chain delivery to VI and Ikoyi.",budget:{min:12000000,max:18000000},currency:"₦",urgency:"Medium",posted:"Yesterday",responses:19,tag:"Agriculture"},
  {id:"br10",buyer:"PharmaLink Nigeria",avatar:"PL",verified:"CAC Verified",badge2:"Escrow Ready",state:"Oyo",hub:"Ibadan",category:"Health & Wellness",title:"Cold-chain pharma distribution partner",desc:"NAFDAC-registered partner for vaccines and insulin across Oyo, Osun and Ekiti. Temperature monitoring + chain-of-custody reporting.",budget:{min:9500000,max:15000000},currency:"₦",urgency:"High",posted:"Yesterday",responses:6,tag:"Logistics"},
];

const SEED_CONVERSATIONS=[
  {id:"c1",contact:"TechHub Lagos",avatar:"TL",country:"NG",lastMsg:"We can offer 10% discount for orders above 100 units.",time:"3m ago",unread:2,listing:"Premium Smartphones Bulk Supply",messages:[{from:"them",text:"Hello! Thanks for your inquiry about our smartphone supply.",time:"10:22 AM"},{from:"me",text:"Hi, what's the minimum order quantity?",time:"10:24 AM"},{from:"them",text:"Minimum is 50 units. We offer tiered pricing.",time:"10:25 AM"},{from:"me",text:"Can you do 80 units with express shipping?",time:"10:28 AM"},{from:"them",text:"We can offer 10% discount for orders above 100 units.",time:"10:31 AM"}]},
  {id:"c2",contact:"Arkiv Studio",avatar:"AS",country:"DE",lastMsg:"The brand identity package includes 3 revision rounds.",time:"1h ago",unread:1,listing:"Luxury Brand Identity Suite",messages:[{from:"them",text:"Thank you for your interest in our brand identity service!",time:"Yesterday"},{from:"me",text:"What's included in the full suite?",time:"Yesterday"},{from:"them",text:"The brand identity package includes 3 revision rounds.",time:"1h ago"}]},
  {id:"c3",contact:"Delta Haulage PH",avatar:"DH",country:"NG",lastMsg:"We can dispatch from Port Harcourt within 24 hours.",time:"2h ago",unread:0,listing:"Haulage Services — 30-Ton Fleet",messages:[{from:"me",text:"Do you cover Enugu routes from PH?",time:"Yesterday"},{from:"them",text:"Yes, we service PH–Enugu–Aba corridor daily.",time:"Yesterday"},{from:"them",text:"We can dispatch from Port Harcourt within 24 hours.",time:"2h ago"}]},
  {id:"c4",contact:"FabricZone Abuja",avatar:"FA",country:"NG",lastMsg:"Sample swatches available for pickup at Wuse 2.",time:"3h ago",unread:1,listing:"Aso-Ebi Fabric Wholesale",messages:[{from:"me",text:"Can I see fabric samples before placing a bulk order?",time:"Today"},{from:"them",text:"Sample swatches available for pickup at Wuse 2.",time:"3h ago"}]},
  {id:"c5",contact:"Arewa AgroExports",avatar:"AA",country:"NG",lastMsg:"Minimum is 500 litres. We can arrange Kano–Lagos freight.",time:"Yesterday",unread:0,listing:"Groundnut Oil Export",messages:[{from:"me",text:"What's your minimum order and can you handle delivery?",time:"Yesterday"},{from:"them",text:"Minimum is 500 litres. We can arrange Kano–Lagos freight.",time:"Yesterday"}]},
];

const SEED_TRANSACTIONS=[
  {id:"t1",type:"escrow_release",label:"Escrow Released — Smartphone Deal",amount:450000,currency:"₦",country:"NG",date:"Today, 2:14 PM",status:"completed",dir:"in"},
  {id:"t2",type:"purchase",label:"Paid — Luxury Brand Identity Suite",amount:4200,currency:"€",country:"DE",date:"Today, 11:30 AM",status:"completed",dir:"out"},
  {id:"t3",type:"deposit",label:"Wallet Top-up via Bank Transfer",amount:200000,currency:"₦",country:"NG",date:"Yesterday",status:"completed",dir:"in"},
  {id:"t4",type:"escrow_hold",label:"Escrow Held — Haulage Contract",amount:1200000,currency:"₦",country:"NG",date:"2 days ago",status:"held",dir:"out"},
  {id:"t5",type:"deposit",label:"Payment Received — Groundnut Oil Order",amount:3200000,currency:"₦",country:"NG",date:"3 days ago",status:"completed",dir:"in"},
  {id:"t6",type:"withdrawal",label:"Withdrawal to GTBank ****4521",amount:500000,currency:"₦",country:"NG",date:"4 days ago",status:"completed",dir:"out"},
  {id:"t7",type:"purchase",label:"Paid — Digital Marketing Campaign",amount:26400,currency:"AED",country:"AE",date:"5 days ago",status:"completed",dir:"out"},
];

const INIT_BANKS=[
  {id:"b1",name:"GTBank",number:"****4521",type:"Commercial",country:"NG",primary:true},
  {id:"b2",name:"Access Bank",number:"****8834",type:"Commercial",country:"NG",primary:false},
  {id:"b3",name:"Zenith Bank",number:"****2210",type:"Commercial",country:"NG",primary:false},
];

// ══════════════════════════════════════════════════════════════
// GLOBAL STATE — Context + Reducer
// ══════════════════════════════════════════════════════════════
const ZalorixCtx=createContext(null);

function ls(k,fb){try{const v=localStorage.getItem("zx11_"+k);return v?JSON.parse(v):fb;}catch{return fb;}}
function ss(k,v){try{localStorage.setItem("zx11_"+k,JSON.stringify(v));}catch{}}
function uid(){return Date.now()+Math.random().toString(36).slice(2,7);}
function fmt(p,cc){const c=COUNTRIES.find(x=>x.code===cc);return(c?.currency||"$")+Number(p).toLocaleString();}

const initialState={
  user:ls("user",null),
  listings:ls("listings",SEED_LISTINGS),
  feed:ls("feed",SEED_FEED),
  buyerRequests:ls("buyerRequests",SEED_BUYER_REQUESTS),
  conversations:ls("conversations",SEED_CONVERSATIONS),
  orders:ls("orders",[]),
  liked:ls("liked",{}),
  saved:ls("saved",{}),
  banks:ls("banks",INIT_BANKS),
  activeNav:ls("activeNav","feed"),
  region:"global",
  search:"",
  toast:null,
};

function reducer(state,action){
  switch(action.type){
    case"SET_USER":return{...state,user:action.payload};
    case"SET_NAV":return{...state,activeNav:action.payload};
    case"SET_REGION":return{...state,region:action.payload};
    case"SET_SEARCH":return{...state,search:action.payload};
    case"SET_TOAST":return{...state,toast:action.payload};
    case"TOGGLE_LIKE":return{...state,liked:{...state.liked,[action.id]:!state.liked[action.id]}};
    case"TOGGLE_SAVE":return{...state,saved:{...state.saved,[action.id]:!state.saved[action.id]}};
    case"ADD_LISTING":return{...state,listings:[action.payload,...state.listings]};
    case"UPDATE_LISTING":return{...state,listings:state.listings.map(l=>l.id===action.payload.id?{...l,...action.payload}:l)};
    case"DELETE_LISTING":return{...state,listings:state.listings.filter(l=>l.id!==action.id)};
    case"PREPEND_FEED":return{...state,feed:[action.payload,...state.feed]};
    case"ADD_BUYER_REQUEST":return{...state,buyerRequests:[action.payload,...state.buyerRequests]};
    case"ADD_ORDER":return{...state,orders:[action.payload,...state.orders]};
    case"UPDATE_ORDER":return{...state,orders:state.orders.map(o=>o.id===action.payload.id?action.payload:o)};
    case"SET_BANKS":return{...state,banks:action.payload};
    case"ADD_CONVERSATION":return{...state,conversations:[action.payload,...state.conversations]};
    case"UPDATE_CONVERSATION":return{...state,conversations:state.conversations.map(c=>c.id===action.payload.id?action.payload:c)};
    default:return state;
  }
}

function ZalorixProvider({children}){
  const [state,dispatch]=useReducer(reducer,initialState);
  // Persist key slices
  useEffect(()=>ss("user",state.user),[state.user]);
  useEffect(()=>ss("listings",state.listings),[state.listings]);
  useEffect(()=>ss("feed",state.feed),[state.feed]);
  useEffect(()=>ss("buyerRequests",state.buyerRequests),[state.buyerRequests]);
  useEffect(()=>ss("conversations",state.conversations),[state.conversations]);
  useEffect(()=>ss("orders",state.orders),[state.orders]);
  useEffect(()=>ss("liked",state.liked),[state.liked]);
  useEffect(()=>ss("saved",state.saved),[state.saved]);
  useEffect(()=>ss("banks",state.banks),[state.banks]);
  useEffect(()=>ss("activeNav",state.activeNav),[state.activeNav]);

  const actions={
    setUser:u=>dispatch({type:"SET_USER",payload:u}),
    setNav:n=>dispatch({type:"SET_NAV",payload:n}),
    setRegion:r=>dispatch({type:"SET_REGION",payload:r}),
    setSearch:s=>dispatch({type:"SET_SEARCH",payload:s}),
    setToast:t=>{dispatch({type:"SET_TOAST",payload:t});if(t)setTimeout(()=>dispatch({type:"SET_TOAST",payload:null}),3400);},
    toggleLike:id=>dispatch({type:"TOGGLE_LIKE",id}),
    toggleSave:id=>dispatch({type:"TOGGLE_SAVE",id}),
    addListing:l=>{dispatch({type:"ADD_LISTING",payload:l});dispatch({type:"PREPEND_FEED",payload:{id:uid(),type:"New Listing",actor:l.provider,text:`just broadcast "${l.title}" — now live on the ${SCOPE_LABELS[l.scope]||"Global Matrix"}.`,time:"just now",tag:l.tag,isNew:true}});},
    updateListing:l=>dispatch({type:"UPDATE_LISTING",payload:l}),
    deleteListing:id=>dispatch({type:"DELETE_LISTING",id}),
    addBuyerRequest:r=>dispatch({type:"ADD_BUYER_REQUEST",payload:r}),
    addOrder:o=>dispatch({type:"ADD_ORDER",payload:{...o,id:uid()}}),
    updateOrder:o=>dispatch({type:"UPDATE_ORDER",payload:o}),
    setBanks:b=>dispatch({type:"SET_BANKS",payload:b}),
    addConversation:c=>dispatch({type:"ADD_CONVERSATION",payload:c}),
    updateConversation:c=>dispatch({type:"UPDATE_CONVERSATION",payload:c}),
  };
  return <ZalorixCtx.Provider value={{state,...actions}}>{children}</ZalorixCtx.Provider>;
}
const useZalorix=()=>useContext(ZalorixCtx);

// ══════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ══════════════════════════════════════════════════════════════
function Pill({bg,color,border,children,sm}){return <span style={{fontSize:sm?8:9,fontWeight:700,letterSpacing:"0.07em",background:bg,color,border:`1px solid ${border}`,padding:sm?"2px 7px":"3px 9px",borderRadius:99,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>{children}</span>;}
function Toast({msg}){return <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:T.navBg,borderRadius:12,padding:"13px 24px",color:"#fff",fontSize:13,fontWeight:600,zIndex:9999,boxShadow:"0 8px 32px rgba(15,44,35,0.25)",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:9,pointerEvents:"none"}}><span style={{color:"#7de0a8"}}>✦</span>{msg}</div>;}

// ══════════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════════
const NAV=[{icon:"⚡",label:"Live Feed",id:"feed"},{icon:"🌐",label:"Global Explorer",id:"explorer"},{icon:"🎯",label:"Trade Radar",id:"radar"},{icon:"📡",label:"My Broadcasts",id:"broadcasts"},{icon:"💬",label:"Messages",id:"messages"},{icon:"📊",label:"Business Insights",id:"insights"},{icon:"📈",label:"Listing Insights",id:"listing_insights"},{icon:"💰",label:"Wallet & Payouts",id:"wallet"},{icon:"✦",label:"About Zalorix",id:"about"}];

// ══════════════════════════════════════════════════════════════
// FEED VIEW
// ══════════════════════════════════════════════════════════════
function FeedView(){
  const {state,setNav,toggleLike,setToast}=useZalorix();
  const {feed,user}=state;
  const [fl,setFl]=useState({});
  const tagColor=tag=>TAG_COLORS[tag]||T.accent;

  // Resolve vendor data for spotlight
  const vendor=FEATURED_VENDORS[0];
  const vendorListings=VENDOR_LISTINGS.filter(l=>l.vendorId===vendor.id);

  // Inline buy/chat handlers (mirrored from ExplorerView)
  const [checkoutTarget,setCheckoutTarget]=useState(null);
  const [chatTarget,setChatTarget]=useState(null);

  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{marginBottom:22,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div><div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:3}}>Live Trade Feed</div><div style={{fontSize:12,color:T.mutedText}}>Real-time updates from verified businesses · Nigeria & beyond</div></div>
        {user&&<button onClick={()=>setNav("broadcasts")} style={{background:T.navBg,border:"none",borderRadius:9,padding:"9px 18px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}><span>✦</span>+ Broadcast</button>}
      </div>

      {/* ── iLAWRENLUXE FEATURED SPOTLIGHT ── */}
      <FeaturedVendorSpotlight
        vendor={vendor}
        listings={vendorListings}
        onBuy={l=>setCheckoutTarget(l)}
        onChat={id=>setChatTarget(id)}
        setNav={setNav}
      />

      {/* Inline checkout/chat modals triggered from spotlight */}
      {checkoutTarget&&user&&<CheckoutModal listing={checkoutTarget} onClose={()=>setCheckoutTarget(null)} />}
      {chatTarget&&<InlineChatPanel listingId={chatTarget} onClose={()=>setChatTarget(null)} />}

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{flex:1,height:1,background:T.divider}} />
        <span style={{fontSize:10,fontWeight:700,color:T.mutedText,letterSpacing:"0.1em",whiteSpace:"nowrap"}}>LATEST FROM THE NETWORK</span>
        <div style={{flex:1,height:1,background:T.divider}} />
      </div>
      {feed.map(f=>{const c=tagColor(f.tag);return(
        <div key={f.id} style={{...cardSt,padding:18,marginBottom:12,background:f.isNew?T.accentLight:T.cardBg,borderColor:f.isNew?T.accentBorder:T.cardBorder,transition:"box-shadow 0.2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 18px rgba(15,44,35,0.07)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",color:c,background:c+"18",border:`1px solid ${c}30`,padding:"3px 9px",borderRadius:99}}>{f.type.toUpperCase()}</span>
            <div style={{display:"flex",alignItems:"center",gap:8}}>{f.isNew&&<Pill bg={T.accentLight} color={T.accent} border={T.accentBorder}>LIVE</Pill>}<span style={{fontSize:11,color:T.mutedText}}>{f.time}</span></div>
          </div>
          <div style={{fontSize:14,color:T.bodyText,lineHeight:1.65}}><span style={{color:T.accent,fontWeight:700}}>{f.actor}</span> {f.text}</div>
          <div style={{display:"flex",gap:14,marginTop:12}}>
            <button onClick={()=>setFl(p=>({...p,[f.id]:!p[f.id]}))} style={{background:"none",border:"none",color:fl[f.id]?T.red:T.mutedText,cursor:"pointer",fontSize:13,padding:0}}>{fl[f.id]?"❤️":"🤍"} Like</button>
            <button style={{background:"none",border:"none",color:T.mutedText,cursor:"pointer",fontSize:13,padding:0}}>↗ Share</button>
          </div>
        </div>
      );})}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// EXPLORER VIEW
// ══════════════════════════════════════════════════════════════
function ExplorerView({onBuy,onChat}){
  const {state,setRegion,toggleLike,toggleSave,setNav}=useZalorix();
  const {listings,region,search,user,liked,saved}=state;
  const userCC=user?COUNTRIES.find(c=>c.code===user.country):null;
  const filtered=listings.filter(l=>{
    const ms=!search||[l.title,l.provider,l.category].some(s=>s?.toLowerCase().includes(search.toLowerCase()));
    if(!ms)return false;
    if(region==="global")return true;
    if(region==="nation")return user?l.country===user.country:true;
    if(region==="local")return!user?true:l.country!==user.country?false:l.city===user.city;
    return true;
  });
  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:3}}>Zalorix Explorer</div>
          {user&&region!=="global"&&<div style={{fontSize:12,color:T.mutedText}}>{region==="nation"?`${userCC?.name}${user.country==="NG"?" — all 36 states + FCT":""}`:user.country==="NG"?`${cityToNGState(user.city)} State (${user.city})`:`${user.city}`}{!filtered.length&&<span style={{color:T.red,marginLeft:8}}>— No listings yet.</span>}</div>}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["global","🌐 Global"],["nation","🏳 Nationwide"],["local","📍 Local"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setRegion(id)} style={{background:region===id?T.navBg:T.cardBg,border:`1px solid ${region===id?T.navBg:T.cardBorder}`,borderRadius:8,padding:"7px 14px",color:region===id?"#fff":T.bodyText,cursor:"pointer",fontSize:12,fontWeight:region===id?700:400,transition:"all 0.15s"}}>
              {lbl}{(id==="nation"||id==="local")&&!user&&<span style={{color:T.mutedText,marginLeft:4,fontSize:10}}>🔒</span>}
            </button>
          ))}
        </div>
      </div>
      {!user&&region!=="global"&&<div style={{fontSize:12,color:T.gold,background:T.goldLight,border:`1px solid ${T.goldBorder}`,borderRadius:9,padding:"9px 14px",marginBottom:16}}>Sign up to unlock node-based filtering by your country and city.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:14}}>
        {filtered.map(l=>{
          const bs=BADGE_STYLES[l.badge]||BADGE_STYLES["Verified Provider"];
          const tc=TAG_COLORS[l.tag]||T.accent;
          return(
            <div key={l.id} style={{...cardSt,overflow:"hidden",display:"flex",flexDirection:"column",transition:"box-shadow 0.2s,transform 0.15s",borderColor:l.isNew?T.accentBorder:T.cardBorder}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(15,44,35,0.1)";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
              {l.image?<img src={l.image} alt="" style={{width:"100%",height:110,objectFit:"cover",display:"block"}} />:<div style={{height:4,background:`linear-gradient(90deg,${tc},${tc}50)`}} />}
              <div style={{padding:16,display:"flex",flexDirection:"column",gap:8,flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:6}}>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:tc,background:tc+"15",padding:"3px 8px",borderRadius:99,whiteSpace:"nowrap"}}>{(l.tag||l.category||"").toUpperCase()}</span>
                  <Pill bg={bs.bg} color={bs.color} border={bs.border}>{l.badge}</Pill>
                </div>
                <div><div style={{fontSize:13,fontWeight:700,color:T.headText,lineHeight:1.4,marginBottom:2}}>{l.title}</div>{l.desc?<div style={{fontSize:11,color:T.mutedText,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{l.desc}</div>:<div style={{fontSize:11,color:T.mutedText}}>{l.category}</div>}</div>
                <div style={{fontSize:11,color:T.mutedText,display:"flex",gap:4,alignItems:"center"}}><span>{FLAGS[l.country]}</span><span>{COUNTRIES.find(c=>c.code===l.country)?.name}</span><span>·</span><span>{l.city}</span></div>
                <div style={{fontSize:11,color:T.mutedText}}>{l.provider}</div>
                <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{fmt(l.price,l.country)}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={()=>toggleLike(l.id)} style={{flex:1,background:liked[l.id]?"#fdf0ee":"transparent",border:`1px solid ${liked[l.id]?"#f0c0b8":T.cardBorder}`,borderRadius:7,padding:"6px 0",color:liked[l.id]?T.red:T.mutedText,cursor:"pointer",fontSize:10,fontWeight:liked[l.id]?700:400,transition:"all 0.15s"}}>{liked[l.id]?"❤️":"🤍"} {l.likes+(liked[l.id]?1:0)}</button>
                  <button onClick={()=>toggleSave(l.id)} style={{background:saved[l.id]?T.goldLight:"transparent",border:`1px solid ${saved[l.id]?T.goldBorder:T.cardBorder}`,borderRadius:7,padding:"6px 10px",color:saved[l.id]?T.gold:T.mutedText,cursor:"pointer",fontSize:11,transition:"all 0.15s"}}>{saved[l.id]?"🔖":"📌"}</button>
                  <button onClick={()=>onChat(l.id)} style={{flex:1,background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:7,padding:"6px 0",color:T.bodyText,cursor:"pointer",fontSize:10,fontWeight:600}} onMouseEnter={e=>{e.currentTarget.style.background=T.accentLight;e.currentTarget.style.color=T.accent;}} onMouseLeave={e=>{e.currentTarget.style.background=T.inputBg;e.currentTarget.style.color=T.bodyText;}}>💬</button>
                  <button onClick={()=>onBuy(l)} style={{flex:1,background:T.navBg,border:"none",borderRadius:7,padding:"6px 0",color:"#fff",cursor:"pointer",fontSize:10,fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>🔒 Buy</button>
                </div>
              </div>
            </div>
          );
        })}
        {!filtered.length&&<div style={{color:T.mutedText,fontSize:13,padding:24,gridColumn:"1/-1",textAlign:"center"}}>No listings match this node. Try Global Matrix.</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TRADE RADAR VIEW
// ══════════════════════════════════════════════════════════════
function TradeRadarView(){
  const zalorix=useZalorix(); console.log("ZALORIX:", zalorix); const {state,setNav,addConversation,setToast,addBuyerRequest}=zalorix;
  const {buyerRequests,listings,user}=state;
  const [stateFilter,setStateFilter]=useState("All States");
  const [catFilter,setCatFilter]=useState("All Categories");
  const [stateOpen,setStateOpen]=useState(false);
  const [pitchModal,setPitchModal]=useState(null);
  const [pitchListing,setPitchListing]=useState("");
  const [pitchNote,setPitchNote]=useState("");
  const [pitchSent,setPitchSent]=useState(false);
  const [showPost,setShowPost]=useState(false);
  const [newReq,setNewReq]=useState({title:"",desc:"",category:"Agriculture",state:"Lagos",urgency:"High",budgetMin:"",budgetMax:""});
  const stateRef=useRef();

  useEffect(()=>{const h=e=>{if(stateRef.current&&!stateRef.current.contains(e.target))setStateOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);

  const allCats=["All Categories",...new Set(buyerRequests.map(r=>r.tag||r.category))];
  const filtered=buyerRequests.filter(r=>(stateFilter==="All States"||r.state===stateFilter)&&(catFilter==="All Categories"||(r.tag||r.category)===catFilter));
  const URGENCY_STYLE={Urgent:{bg:"#fdf0ee",color:"#c0392b",border:"#f0c0b8"},High:{bg:"#fdf6e3",color:"#b08d41",border:"#e6d08a"},Medium:{bg:"#e6f4ed",color:"#1a7a4a",border:"#b6dfc8"}};
  const VERIFY_STYLE={"Escrow Ready":{bg:"#e6f4ed",color:"#1a7a4a",border:"#b6dfc8",icon:"🛡"},"Phone Verified":{bg:"#eef1f8",color:"#3b5fa0",border:"#c5d0e8",icon:"📱"},"CAC Verified":{bg:"#fdf6e3",color:"#b08d41",border:"#e6d08a",icon:"✦"},"Verified Business":{bg:"#e6f4ed",color:"#1a7a4a",border:"#b6dfc8",icon:"✓"}};

  const handlePitch=()=>{
    const conv={id:uid(),contact:pitchModal.buyer,avatar:pitchModal.avatar,country:"NG",lastMsg:pitchNote,time:"just now",unread:0,listing:pitchModal.title,messages:[{from:"me",text:pitchNote,time:"just now"}]};
    addConversation(conv);setPitchSent(true);
    setTimeout(()=>{setPitchModal(null);setPitchSent(false);setPitchListing("");setPitchNote("");setNav("messages");},1600);
  };

  const handlePostRequest=()=>{
    if(!newReq.title||!newReq.budgetMin||!newReq.budgetMax)return;
    const node=NIGERIAN_REGIONAL_NODES.find(n=>n.state===newReq.state);
    addBuyerRequest({id:uid(),buyer:user?.name||"Anonymous Buyer",avatar:(user?.name||"AB").slice(0,2).toUpperCase(),verified:"Phone Verified",badge2:"Escrow Ready",state:newReq.state,hub:node?.primaryHub||newReq.state,category:newReq.category,title:newReq.title,desc:newReq.desc,budget:{min:Number(newReq.budgetMin),max:Number(newReq.budgetMax)},currency:"₦",urgency:newReq.urgency,posted:"just now",responses:0,tag:newReq.category,isNew:true});
    setShowPost(false);setNewReq({title:"",desc:"",category:"Agriculture",state:"Lagos",urgency:"High",budgetMin:"",budgetMax:""});
    setToast("Sourcing request posted to Trade Radar!");
  };

  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{marginBottom:20,display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{fontSize:20,fontWeight:800,color:T.headText}}>Trade Radar</div>
            <span style={{fontSize:9,fontWeight:800,letterSpacing:"0.1em",background:T.navBg,color:"#7de0a8",border:"1px solid #1a3d30",padding:"3px 9px",borderRadius:99}}>LIVE SOURCING</span>
          </div>
          <div style={{fontSize:12,color:T.mutedText}}>Active buyer requests · {filtered.length} open opportunities</div>
        </div>
        {user&&<button onClick={()=>setShowPost(true)} style={{background:T.navBg,border:"none",borderRadius:9,padding:"9px 18px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Post Sourcing Request</button>}
      </div>

      {/* Filter bar */}
      <div style={{...cardSt,padding:"14px 18px",marginBottom:18,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}} ref={stateRef}>
          <button onClick={()=>setStateOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,background:stateFilter!=="All States"?T.accentLight:T.inputBg,border:`1px solid ${stateFilter!=="All States"?T.accentBorder:T.inputBorder}`,borderRadius:9,padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:stateFilter!=="All States"?700:400,color:stateFilter!=="All States"?T.accent:T.bodyText}}>
            <span>📍 {stateFilter==="All States"?<span style={{color:T.mutedText}}>Filter by State</span>:stateFilter}</span>
            <span style={{color:T.mutedText,fontSize:10}}>{stateOpen?"▲":"▼"}</span>
          </button>
          {stateOpen&&(
            <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:12,zIndex:200,boxShadow:"0 12px 40px rgba(15,44,35,0.14)",maxHeight:300,overflowY:"auto",padding:8}}>
              {["All States",...NIGERIAN_REGIONAL_NODES.map(n=>n.state)].map(s=>{
                const node=NIGERIAN_REGIONAL_NODES.find(n=>n.state===s);
                const cnt=buyerRequests.filter(r=>r.state===s).length;
                return(
                  <button key={s} onClick={()=>{setStateFilter(s);setStateOpen(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"8px 12px",background:stateFilter===s?T.accentLight:"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>{if(stateFilter!==s)e.currentTarget.style.background=T.pageBg;}} onMouseLeave={e=>{e.currentTarget.style.background=stateFilter===s?T.accentLight:"transparent";}}>
                    <div><div style={{fontSize:12,fontWeight:stateFilter===s?700:400,color:stateFilter===s?T.accent:T.headText}}>{s==="All States"?"🌐 All States":s}</div>{node&&<div style={{fontSize:10,color:T.mutedText}}>Hub: {node.primaryHub}</div>}</div>
                    {cnt>0&&<span style={{fontSize:9,fontWeight:700,color:T.accent,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:99,padding:"2px 7px"}}>{cnt}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {allCats.slice(0,5).map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"7px 12px",background:catFilter===c?T.navBg:T.cardBg,border:`1px solid ${catFilter===c?T.navBg:T.cardBorder}`,borderRadius:8,color:catFilter===c?"#fff":T.bodyText,cursor:"pointer",fontSize:11,fontWeight:catFilter===c?700:400,whiteSpace:"nowrap"}}>{c}</button>
          ))}
        </div>
        {(stateFilter!=="All States"||catFilter!=="All Categories")&&<button onClick={()=>{setStateFilter("All States");setCatFilter("All Categories");}} style={{padding:"7px 12px",background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:8,color:T.red,cursor:"pointer",fontSize:11,fontWeight:600}}>✕ Clear</button>}
      </div>

      {filtered.map(r=>{
        const urg=URGENCY_STYLE[r.urgency]||URGENCY_STYLE.Medium;
        const tc=TAG_COLORS[r.tag]||T.accent;
        const vs=VERIFY_STYLE[r.verified]||VERIFY_STYLE["Phone Verified"];
        const vs2=VERIFY_STYLE[r.badge2]||VERIFY_STYLE["Phone Verified"];
        return(
          <div key={r.id} style={{...cardSt,overflow:"hidden",marginBottom:14,transition:"box-shadow 0.2s,transform 0.15s"}} className={r.isLive?"new-item-flash":""} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(15,44,35,0.1)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
            {r.isLive&&<div style={{background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`,padding:"4px 22px",display:"flex",alignItems:"center",gap:6}}><div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 0 3px rgba(34,197,94,0.2)",animation:"pulse 1.8s ease-in-out infinite"}} /><span style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.1em"}}>LIVE — JUST POSTED</span></div>}
            <div style={{padding:"18px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
                  <div style={{width:44,height:44,borderRadius:12,background:T.navBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>{r.avatar}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:800,color:T.headText,marginBottom:3,lineHeight:1.3}}>{r.title}</div>
                    <div style={{fontSize:11,color:T.mutedText}}>{r.buyer} · 🇳🇬 {r.hub}, {r.state}</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.07em",background:urg.bg,color:urg.color,border:`1px solid ${urg.border}`,padding:"3px 10px",borderRadius:99}}>{r.urgency.toUpperCase()}</span>
                  <span style={{fontSize:10,color:T.mutedText}}>{r.posted}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",background:vs.bg,color:vs.color,border:`1px solid ${vs.border}`,padding:"3px 8px",borderRadius:99,display:"inline-flex",alignItems:"center",gap:4}}><span>{vs.icon}</span>{r.verified}</span>
                <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",background:vs2.bg,color:vs2.color,border:`1px solid ${vs2.border}`,padding:"3px 8px",borderRadius:99,display:"inline-flex",alignItems:"center",gap:4}}><span>{vs2.icon}</span>{r.badge2}</span>
                <span style={{fontSize:9,fontWeight:700,color:tc,background:tc+"15",border:`1px solid ${tc}30`,padding:"3px 8px",borderRadius:99}}>{r.category?.toUpperCase()}</span>
              </div>
              <div style={{fontSize:13,color:T.bodyText,lineHeight:1.65,marginBottom:14}}>{r.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",paddingTop:12,borderTop:`1px solid ${T.divider}`}}>
                <div><div style={{fontSize:9,color:T.mutedText,marginBottom:3,letterSpacing:"0.06em",fontWeight:600}}>BUDGET RANGE</div><div style={{fontSize:15,fontWeight:800,color:T.headText}}>{r.currency}{r.budget.min.toLocaleString()} – {r.currency}{r.budget.max.toLocaleString()}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:11,color:T.mutedText}}><span style={{fontWeight:700,color:T.headText}}>{r.responses}</span> sellers responded</div>
                  <button onClick={()=>setPitchModal(r)} style={{background:T.navBg,border:"none",borderRadius:9,padding:"9px 18px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>🎯 Pitch Offer</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {!filtered.length&&<div style={{...cardSt,padding:40,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>🎯</div><div style={{fontSize:15,fontWeight:700,color:T.mutedText}}>No buyer requests in this filter</div></div>}

      {/* Post Request Modal */}
      {showPost&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={()=>setShowPost(false)}>
          <div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:28,width:500,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(15,44,35,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:700,color:T.headText}}>Post Sourcing Request</div>
              <button onClick={()=>setShowPost(false)} style={{background:T.pageBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,color:T.mutedText,cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            {[["What are you sourcing?","title","text","e.g. 500 units industrial safety helmets"],["Describe your requirement","desc","text","Include specs, quantity, delivery terms…"]].map(([lbl,key,type,ph])=>(
              <div key={key} style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>{lbl.toUpperCase()}</label>
                {key==="desc"?<textarea value={newReq[key]} onChange={e=>setNewReq(p=>({...p,[key]:e.target.value}))} placeholder={ph} rows={3} style={{...inputSt,resize:"none"}} />:<input value={newReq[key]} onChange={e=>setNewReq(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={inputSt} />}
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>CATEGORY</label><select value={newReq.category} onChange={e=>setNewReq(p=>({...p,category:e.target.value}))} style={{...inputSt,cursor:"pointer"}}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>STATE</label>
                <div style={{position:"relative"}}><select value={newReq.state} onChange={e=>setNewReq(p=>({...p,state:e.target.value}))} style={{...inputSt,cursor:"pointer",paddingRight:32,appearance:"none",WebkitAppearance:"none"}}>{NIGERIAN_REGIONAL_NODES.map(n=><option key={n.state} value={n.state}>{n.state} — {n.primaryHub}</option>)}</select><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,pointerEvents:"none",fontSize:11}}>▾</span></div>
              </div>
            </div>
            <div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>URGENCY</label><div style={{display:"flex",gap:8}}>{["Urgent","High","Medium"].map(u=><button key={u} onClick={()=>setNewReq(p=>({...p,urgency:u}))} style={{flex:1,padding:"8px",background:newReq.urgency===u?T.accentLight:"transparent",border:`1px solid ${newReq.urgency===u?T.accentBorder:T.cardBorder}`,borderRadius:8,color:newReq.urgency===u?T.accent:T.bodyText,cursor:"pointer",fontSize:12,fontWeight:newReq.urgency===u?700:400}}>{u}</button>)}</div></div>
            <div style={{marginBottom:20}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>BUDGET RANGE (₦)</label><div style={{display:"flex",gap:8,alignItems:"center"}}><input type="number" value={newReq.budgetMin} onChange={e=>setNewReq(p=>({...p,budgetMin:e.target.value}))} placeholder="Min" style={{...inputSt,flex:1}} /><span style={{color:T.mutedText,fontSize:13}}>—</span><input type="number" value={newReq.budgetMax} onChange={e=>setNewReq(p=>({...p,budgetMax:e.target.value}))} placeholder="Max" style={{...inputSt,flex:1}} /></div></div>
            <button onClick={handlePostRequest} disabled={!newReq.title||!newReq.budgetMin||!newReq.budgetMax} style={{width:"100%",background:newReq.title&&newReq.budgetMin&&newReq.budgetMax?T.navBg:"#c8d8d0",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Post Sourcing Request →</button>
          </div>
        </div>
      )}

      {/* Pitch modal */}
      {pitchModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={()=>setPitchModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:32,width:500,maxWidth:"96vw",boxShadow:"0 20px 60px rgba(15,44,35,0.22)",position:"relative"}}>
            {pitchSent&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.97)",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,zIndex:10}}><div style={{fontSize:42}}>🎯</div><div style={{fontSize:15,fontWeight:800,color:T.accent}}>Pitch Sent!</div><div style={{fontSize:12,color:T.mutedText}}>Opening negotiation thread in Messages…</div></div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div><div style={{fontSize:10,color:T.mutedText,letterSpacing:"0.1em",marginBottom:4}}>CONNECT WITH BUYER</div><div style={{fontSize:15,fontWeight:700,color:T.headText,marginBottom:2}}>{pitchModal.buyer}</div><div style={{fontSize:11,color:T.mutedText}}>🇳🇬 {pitchModal.hub}, {pitchModal.state}</div></div>
              <button onClick={()=>setPitchModal(null)} style={{background:T.pageBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,color:T.mutedText,cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"12px 16px",marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:T.accent,marginBottom:4}}>{pitchModal.title}</div>
              <div style={{fontSize:12,fontWeight:800,color:T.headText}}>Budget: {pitchModal.currency}{pitchModal.budget.min.toLocaleString()} – {pitchModal.currency}{pitchModal.budget.max.toLocaleString()}</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:7,letterSpacing:"0.07em",fontWeight:600}}>ATTACH LISTING (Optional)</label>
              <div style={{position:"relative"}}><select value={pitchListing} onChange={e=>setPitchListing(e.target.value)} style={{...inputSt,cursor:"pointer",paddingRight:32,appearance:"none",WebkitAppearance:"none"}}><option value="">— Select one of your broadcasts —</option>{listings.slice(0,8).map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,pointerEvents:"none",fontSize:11}}>▾</span></div>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:7,letterSpacing:"0.07em",fontWeight:600}}>INTRODUCTION NOTE *</label>
              <textarea value={pitchNote} onChange={e=>setPitchNote(e.target.value)} placeholder={`Hi ${pitchModal.buyer.split(" ")[0]}, I can fulfil your ${pitchModal.category?.toLowerCase()} requirement…`} rows={4} style={{...inputSt,resize:"none",lineHeight:1.6}} />
            </div>
            <button onClick={handlePitch} disabled={!pitchNote.trim()} style={{width:"100%",background:pitchNote.trim()?T.navBg:"#c8d8d0",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,cursor:pitchNote.trim()?"pointer":"not-allowed"}}>🎯 Send Pitch — Open Negotiation Thread</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MESSAGES VIEW
// ══════════════════════════════════════════════════════════════
function MessagesView(){
  const {state,updateConversation}=useZalorix();
  const {conversations,user}=state;
  const [active,setActive]=useState(conversations[0]?.id);
  const [reply,setReply]=useState("");
  const [search,setSearch]=useState("");
  const msgEnd=useRef();
  const conv=conversations.find(c=>c.id===active);
  useEffect(()=>msgEnd.current?.scrollIntoView({behavior:"smooth"}),[conv?.messages?.length]);

  const send=()=>{
    if(!reply.trim()||!conv)return;
    const updated={...conv,lastMsg:reply,time:"just now",unread:0,messages:[...conv.messages,{from:"me",text:reply,time:"just now"}]};
    updateConversation(updated);setReply("");
    setTimeout(()=>updateConversation({...updated,messages:[...updated.messages,{from:"them",text:"Thanks! We'll follow up shortly.",time:"just now"}]}),1200);
  };
  const filtered=conversations.filter(c=>c.contact.toLowerCase().includes(search.toLowerCase())||c.listing?.toLowerCase().includes(search.toLowerCase()));

  if(!user)return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{fontSize:36}}>💬</div><div style={{fontSize:16,fontWeight:700,color:T.mutedText}}>Sign in to view messages</div></div>;

  return(
    <div style={{flex:1,display:"flex",gap:14,minWidth:0,height:"100%"}}>
      <div style={{width:280,background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:14,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>
        <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${T.divider}`}}>
          <div style={{fontSize:14,fontWeight:800,color:T.headText,marginBottom:9}}>Messages</div>
          <div style={{position:"relative"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...inputSt,padding:"7px 10px 7px 32px",fontSize:12}} /><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,fontSize:12}}>🔍</span></div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{setActive(c.id);updateConversation({...c,unread:0});}} style={{padding:"12px 14px",borderBottom:`1px solid ${T.divider}`,cursor:"pointer",background:active===c.id?T.accentLight:"transparent",transition:"background 0.15s"}} onMouseEnter={e=>{if(active!==c.id)e.currentTarget.style.background=T.pageBg;}} onMouseLeave={e=>{e.currentTarget.style.background=active===c.id?T.accentLight:"transparent";}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:active===c.id?T.navBg:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:active===c.id?"#fff":T.accent,flexShrink:0,border:`1px solid ${active===c.id?T.navBg:T.accentBorder}`}}>{c.avatar}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.headText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.contact}</span>
                    <span style={{fontSize:9,color:T.mutedText,flexShrink:0,marginLeft:4}}>{c.time}</span>
                  </div>
                  <div style={{fontSize:11,color:T.mutedText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMsg}</div>
                </div>
                {c.unread>0&&<div style={{width:17,height:17,borderRadius:"50%",background:T.accent,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.unread}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:14,overflow:"hidden"}}>
        {conv?<>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.divider}`,background:T.navBg,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",border:"1px solid rgba(255,255,255,0.2)"}}>{conv.avatar}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{conv.contact} <span style={{opacity:0.6}}>{FLAGS[conv.country]||""}</span></div><div style={{fontSize:10,color:T.navText,marginTop:1}}>Re: {conv.listing}</div></div>
            <button style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"5px 12px",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600}}>🔒 Make Offer</button>
          </div>
          <div style={{padding:"7px 18px",background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`,fontSize:11,color:T.accent,display:"flex",alignItems:"center",gap:6}}>
            <span>📦</span><span style={{fontWeight:600}}>Listing:</span>{conv.listing}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10,background:T.pageBg}}>
            {conv.messages.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start",alignItems:"flex-end",gap:7}}>
                {m.from==="them"&&<div style={{width:26,height:26,borderRadius:"50%",background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:T.accent,flexShrink:0,border:`1px solid ${T.accentBorder}`}}>{conv.avatar}</div>}
                <div>
                  <div style={{maxWidth:320,padding:"9px 13px",borderRadius:m.from==="me"?"14px 14px 3px 14px":"14px 14px 14px 3px",background:m.from==="me"?T.navBg:T.cardBg,color:m.from==="me"?"#fff":T.bodyText,fontSize:12,lineHeight:1.55,border:m.from==="me"?"none":`1px solid ${T.cardBorder}`}}>{m.text}</div>
                  <div style={{fontSize:9,color:T.mutedText,marginTop:3,textAlign:m.from==="me"?"right":"left"}}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={msgEnd} />
          </div>
          <div style={{padding:"10px 14px",borderTop:`1px solid ${T.divider}`,background:T.cardBg,display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Write a message… (Enter to send)" rows={2} style={{...inputSt,flex:1,resize:"none",lineHeight:1.5}} />
            <button onClick={send} style={{background:T.navBg,border:"none",borderRadius:9,padding:"10px 16px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>↑</button>
          </div>
        </>:<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:T.mutedText,fontSize:13}}>Select a conversation</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BROADCASTS MANAGER
// ══════════════════════════════════════════════════════════════
function BroadcastsView(){
  const {state,updateListing,deleteListing,setNav,setToast}=useZalorix();
  const {listings,user}=state;
  const [editing,setEditing]=useState(null);
  const [paused,setPaused]=useState({});
  const [confirmDel,setConfirmDel]=useState(null);
  const [selB,setSelB]=useState(null);
  const myListings=user?listings.filter(l=>l.provider===user.name||l.provider===user.business||l.isOwned):listings.slice(0,5);

  const saveEdit=()=>{updateListing(editing);setEditing(null);setToast("Broadcast updated!");};

  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
        <div><div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:3}}>My Broadcasts</div><div style={{fontSize:12,color:T.mutedText}}>{myListings.length} listing{myListings.length!==1?"s":""} · Manage, edit or pause</div></div>
        <button onClick={()=>setNav("broadcasts_new")} style={{background:T.navBg,border:"none",borderRadius:9,padding:"9px 18px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>✦ + New Broadcast</button>
      </div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        {[["📡",myListings.length,"Total Listings","Active on network"],["❤️",myListings.reduce((a,l)=>a+l.likes,0),"Total Likes","↑ +12% this week"],["👁","42,800","Est. Reach","All nodes"],["💬","147","Inquiries","↑ +8 today"]].map(([ic,v,lbl,sub])=>(
          <div key={lbl} style={{...cardSt,padding:"16px 20px",flex:1,minWidth:130}}><div style={{fontSize:17,marginBottom:8}}>{ic}</div><div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:2}}>{v}</div><div style={{fontSize:10,color:T.mutedText,letterSpacing:"0.05em",textTransform:"uppercase"}}>{lbl}</div><div style={{fontSize:10,fontWeight:600,color:T.emerald,marginTop:3}}>{sub}</div></div>
        ))}
      </div>
      {!myListings.length?<div style={{...cardSt,padding:48,textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>📡</div><div style={{fontSize:16,fontWeight:700,color:T.mutedText,marginBottom:16}}>No broadcasts yet</div><button onClick={()=>setNav("broadcasts_new")} style={{background:T.navBg,border:"none",borderRadius:9,padding:"10px 24px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>✦ Create First Broadcast</button></div>:
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {myListings.map(l=>{
          const bs=BADGE_STYLES[l.badge]||BADGE_STYLES["Verified Provider"];
          const tc=TAG_COLORS[l.tag]||T.accent;
          const isPaused=paused[l.id];
          const isSel=selB===l.id;
          return(
            <div key={l.id} style={{...cardSt,overflow:"hidden",opacity:isPaused?0.6:1,transition:"box-shadow 0.2s,opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 18px rgba(15,44,35,0.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <div style={{display:"flex",alignItems:"stretch"}}>
                <div style={{width:5,background:isPaused?T.cardBorder:tc,flexShrink:0,borderRadius:"14px 0 0 14px"}} />
                <div style={{flex:1,padding:"16px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:200}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:tc,background:tc+"15",padding:"3px 8px",borderRadius:99}}>{(l.tag||"").toUpperCase()}</span>
                        <Pill bg={bs.bg} color={bs.color} border={bs.border}>{l.badge}</Pill>
                        {isPaused&&<Pill bg={T.goldLight} color={T.gold} border={T.goldBorder}>PAUSED</Pill>}
                        {l.isNew&&<Pill bg={T.accentLight} color={T.accent} border={T.accentBorder}>LIVE</Pill>}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:T.headText,marginBottom:3}}>{l.title}</div>
                      <div style={{fontSize:11,color:T.mutedText}}>{FLAGS[l.country]||""} {l.city} · {l.category}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <div style={{textAlign:"right",marginRight:6}}><div style={{fontSize:15,fontWeight:800,color:T.accent}}>{fmt(l.price,l.country)}</div><div style={{fontSize:10,color:T.mutedText}}>❤️ {l.likes}</div></div>
                      <button onClick={()=>setEditing({...l})} style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 12px",color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600}}>✏️ Edit</button>
                      <button onClick={()=>setPaused(p=>({...p,[l.id]:!p[l.id]}))} style={{background:isPaused?T.accentLight:T.goldLight,border:`1px solid ${isPaused?T.accentBorder:T.goldBorder}`,borderRadius:8,padding:"6px 12px",color:isPaused?T.accent:T.gold,cursor:"pointer",fontSize:11,fontWeight:600}}>{isPaused?"▶ Resume":"⏸ Pause"}</button>
                      <button onClick={()=>setConfirmDel(l.id)} style={{background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:8,padding:"6px 10px",color:T.red,cursor:"pointer",fontSize:11}}>🗑</button>
                    </div>
                  </div>
                  <div onClick={()=>setSelB(isSel?null:l.id)} style={{display:"flex",gap:20,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.divider}`,cursor:"pointer"}}>
                    {[["👁 Views",Math.floor(l.likes*42).toLocaleString()],["💬 Inquiries",Math.floor(l.likes*0.15)],["📍 Reach",SCOPE_LABELS[l.region_type]||"Global"],["📅 Posted",l.isNew?"Just now":"3 days ago"]].map(([k,v])=>(
                      <div key={k}><div style={{fontSize:9,color:T.mutedText,marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:700,color:T.headText}}>{v}</div></div>
                    ))}
                    <div style={{marginLeft:"auto",fontSize:10,color:T.mutedText,alignSelf:"center"}}>{isSel?"▲":"▼"}</div>
                  </div>
                  {isSel&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.divider}`}}>
                    <div style={{fontSize:9,color:T.mutedText,marginBottom:7,letterSpacing:"0.06em",fontWeight:600}}>TRAFFIC DISTRIBUTION</div>
                    {[["Lagos, NG",62],["Abuja, NG",22],["London, UK",16]].map(([loc,pct])=>(
                      <div key={loc} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                        <div style={{fontSize:11,color:T.bodyText,minWidth:130}}>{loc}</div>
                        <div style={{flex:1,height:4,borderRadius:99,background:T.divider,overflow:"hidden",maxWidth:160}}><div style={{width:`${pct}%`,height:"100%",background:T.accent,borderRadius:99}} /></div>
                        <div style={{fontSize:11,fontWeight:700,color:T.accent,minWidth:28}}>{pct}%</div>
                      </div>
                    ))}
                  </div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>}
      {confirmDel&&<div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(3px)"}} onClick={()=>setConfirmDel(null)}><div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:32,width:360,textAlign:"center",boxShadow:"0 20px 60px rgba(15,44,35,0.18)"}}><div style={{fontSize:32,marginBottom:12}}>🗑️</div><div style={{fontSize:15,fontWeight:700,color:T.headText,marginBottom:8}}>Delete Broadcast?</div><div style={{fontSize:13,color:T.mutedText,marginBottom:22}}>This will permanently remove the listing. Cannot be undone.</div><div style={{display:"flex",gap:10}}><button onClick={()=>setConfirmDel(null)} style={{flex:1,background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"11px",color:T.bodyText,cursor:"pointer",fontSize:13,fontWeight:600}}>Cancel</button><button onClick={()=>{deleteListing(confirmDel);setConfirmDel(null);setToast("Broadcast removed.");}} style={{flex:1,background:T.red,border:"none",borderRadius:10,padding:"11px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>Delete</button></div></div></div>}
      {editing&&<div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(3px)"}} onClick={()=>setEditing(null)}><div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:28,width:460,maxWidth:"96vw",boxShadow:"0 20px 60px rgba(15,44,35,0.18)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><div style={{fontSize:14,fontWeight:700,color:T.headText}}>Edit Broadcast</div><button onClick={()=>setEditing(null)} style={{background:T.pageBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,color:T.mutedText,cursor:"pointer",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>{[["Title","title"],["Description","desc"]].map(([lbl,k])=><div key={k} style={{marginBottom:12}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>{lbl.toUpperCase()}</label><input value={editing[k]||""} onChange={e=>setEditing(p=>({...p,[k]:e.target.value}))} style={inputSt} /></div>)}<div style={{marginBottom:16}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>PRICE</label><div style={{display:"flex",gap:8}}><span style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"9px 13px",color:T.accent,fontWeight:800,fontSize:13,flexShrink:0}}>{COUNTRIES.find(c=>c.code===editing.country)?.currency||"₦"}</span><input type="number" value={editing.price||""} onChange={e=>setEditing(p=>({...p,price:Number(e.target.value)}))} style={{...inputSt,flex:1}} /></div></div><div style={{display:"flex",gap:10}}><button onClick={()=>setEditing(null)} style={{flex:1,background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"11px",color:T.bodyText,cursor:"pointer",fontSize:13,fontWeight:600}}>Cancel</button><button onClick={saveEdit} style={{flex:1,background:T.navBg,border:"none",borderRadius:10,padding:"11px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>Save Changes</button></div></div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// LISTING ANALYTICS DATA
// ══════════════════════════════════════════════════════════════
const LISTING_ANALYTICS = {
  "ilx1": {
    impressions:   { value: 18420, growth: "+22.4%", pos: true },
    engagements:   { value: 3210,  growth: "+14.2%", pos: true },
    conversions:   { value: 184,   growth: "+9.7%",  pos: true },
    ctr:           { value: "17.4%", growth: "+2.1%", pos: true },
    escrowOrders:  { value: 47,    growth: "+31.0%", pos: true },
    chatNodes:     { value: 137,   growth: "+18.5%", pos: true },
    weekly: [1240,1890,2100,1740,2840,3100,3210],
    geo: [
      { state:"Lagos",    pct:52 },
      { state:"Abuja FCT",pct:21 },
      { state:"Rivers",   pct:11 },
      { state:"Oyo",      pct:9  },
      { state:"Kano",     pct:7  },
    ],
  },
  "ilx2": {
    impressions:   { value: 24870, growth: "+34.8%", pos: true },
    engagements:   { value: 5140,  growth: "+28.3%", pos: true },
    conversions:   { value: 312,   growth: "+19.2%", pos: true },
    ctr:           { value: "20.7%", growth: "+4.4%", pos: true },
    escrowOrders:  { value: 89,    growth: "+42.0%", pos: true },
    chatNodes:     { value: 223,   growth: "+26.1%", pos: true },
    weekly: [1800,2400,2900,3200,4100,4700,5140],
    geo: [
      { state:"Lagos",    pct:48 },
      { state:"Abuja FCT",pct:26 },
      { state:"Delta",    pct:12 },
      { state:"Kaduna",   pct:8  },
      { state:"Enugu",    pct:6  },
    ],
  },
  "ilx3": {
    impressions:   { value: 31200, growth: "+41.6%", pos: true },
    engagements:   { value: 7840,  growth: "+33.9%", pos: true },
    conversions:   { value: 498,   growth: "+27.4%", pos: true },
    ctr:           { value: "25.1%", growth: "+5.8%", pos: true },
    escrowOrders:  { value: 134,   growth: "+55.0%", pos: true },
    chatNodes:     { value: 364,   growth: "+38.2%", pos: true },
    weekly: [2100,3400,4200,5100,6200,7300,7840],
    geo: [
      { state:"Lagos",    pct:61 },
      { state:"Abuja FCT",pct:18 },
      { state:"Rivers",   pct:9  },
      { state:"Ogun",     pct:7  },
      { state:"Anambra",  pct:5  },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// LISTING INSIGHTS PANEL
// ══════════════════════════════════════════════════════════════
function ListingInsightsPanel() {
  const vendorListings = VENDOR_LISTINGS;
  const [selectedId, setSelectedId] = useState("ilx1");
  const [dropOpen, setDropOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const dropRef = useRef();

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectListing = id => {
    setSelectedId(id);
    setDropOpen(false);
    setAnimKey(k => k + 1);
  };

  const listing = vendorListings.find(l => l.id === selectedId);
  const data    = LISTING_ANALYTICS[selectedId];
  const maxWeek = Math.max(...data.weekly);
  const goldGrad = "linear-gradient(135deg,#b08d41,#e6c96e,#b08d41)";
  const goldText = "#b08d41";
  const goldLight = "#fdf6e3";
  const goldBorder = "#e6d08a";

  const MetricCard = ({ icon, label, value, growth, pos, wide }) => (
    <div style={{ ...cardSt, padding: "18px 20px", flex: wide ? 2 : 1, minWidth: 130,
      transition: "box-shadow 0.2s", animation: `fadeUp 0.45s ease forwards` }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(15,44,35,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLight,
          border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16 }}>{icon}</div>
        <span style={{ fontSize: 10, fontWeight: 700, color: pos ? T.accent : T.red,
          background: pos ? T.accentLight : T.redLight,
          border: `1px solid ${pos ? T.accentBorder : T.badge4Border}`,
          padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
          {growth}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: T.headText, letterSpacing: "-0.03em", marginBottom: 3 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 10, color: T.mutedText, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, minWidth: 0, paddingBottom: 40 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .insight-bar{transition:width 0.7s cubic-bezier(0.22,1,0.36,1)}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.headText }}>Listing Insights</div>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", background: T.navBg,
              color: "#7de0a8", border: "1px solid #1a3d30", padding: "3px 9px", borderRadius: 99 }}>iLAWRENLUXE</span>
          </div>
          <div style={{ fontSize: 12, color: T.mutedText }}>Performance analytics for your active broadcasts · Last 7 days</div>
        </div>

        {/* Listing selector dropdown */}
        <div style={{ position: "relative", minWidth: 280 }} ref={dropRef}>
          <button onClick={() => setDropOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 10, background: T.cardBg,
            border: `1px solid ${dropOpen ? T.accentBorder : T.cardBorder}`, borderRadius: 10,
            padding: "10px 14px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              {listing?.image && <img src={listing.image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.headText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing?.title}</div>
                <div style={{ fontSize: 10, color: T.mutedText }}>₦{listing?.price.toLocaleString()}</div>
              </div>
            </div>
            <span style={{ color: T.mutedText, fontSize: 11, flexShrink: 0 }}>{dropOpen ? "▲" : "▼"}</span>
          </button>
          {dropOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.cardBg,
              border: `1px solid ${T.cardBorder}`, borderRadius: 12, zIndex: 200,
              boxShadow: "0 12px 40px rgba(15,44,35,0.14)", overflow: "hidden" }}>
              {vendorListings.map(l => (
                <button key={l.id} onClick={() => selectListing(l.id)} style={{ display: "flex", alignItems: "center",
                  gap: 10, width: "100%", padding: "11px 14px",
                  background: selectedId === l.id ? T.accentLight : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.12s" }}
                  onMouseEnter={e => { if (selectedId !== l.id) e.currentTarget.style.background = T.pageBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selectedId === l.id ? T.accentLight : "transparent"; }}>
                  {l.image && <img src={l.image} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: selectedId === l.id ? 700 : 400,
                      color: selectedId === l.id ? T.accent : T.headText,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                    <div style={{ fontSize: 10, color: T.mutedText }}>₦{l.price.toLocaleString()} · {l.category}</div>
                  </div>
                  {selectedId === l.id && <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* iLAWRENLUXE gold badge row */}
      <div key={`badge-${animKey}`} style={{ background: T.navBg, borderRadius: 12, padding: "12px 20px",
        marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10, animation: "fadeUp 0.35s ease forwards" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: goldGrad, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.navBg }}>iL</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{listing?.title}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>
              🇳🇬 {listing?.city}, Nigeria · {listing?.category}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 0 3px rgba(34,197,94,0.2)", animation: "pulse 1.8s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#7de0a8" }}>LISTING ACTIVE</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#e6c96e" }}>₦{listing?.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Metric cards */}
      <div key={`metrics-${animKey}`} style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <MetricCard icon="👁" label="Total Impressions"   value={data.impressions.value} growth={data.impressions.growth} pos={data.impressions.pos} />
        <MetricCard icon="⚡" label="Active Engagements"  value={data.engagements.value} growth={data.engagements.growth} pos={data.engagements.pos} />
        <MetricCard icon="💬" label="Chat Nodes Opened"   value={data.chatNodes.value}   growth={data.chatNodes.growth}   pos={data.chatNodes.pos} />
        <MetricCard icon="🔒" label="Escrow Orders"       value={data.escrowOrders.value} growth={data.escrowOrders.growth} pos={data.escrowOrders.pos} />
      </div>
      <div key={`metrics2-${animKey}`} style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <MetricCard icon="🎯" label="Lead Conversions"   value={data.conversions.value} growth={data.conversions.growth} pos={data.conversions.pos} wide />
        <MetricCard icon="📈" label="Click-Through Rate" value={data.ctr.value}         growth={data.ctr.growth}         pos={data.ctr.pos}         wide />
      </div>

      {/* Bottom row: weekly chart + geo heatmap */}
      <div key={`charts-${animKey}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Weekly impressions mini-chart */}
        <div style={{ ...cardSt, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.headText, marginBottom: 2 }}>Weekly Impression Trend</div>
              <div style={{ fontSize: 10, color: T.mutedText }}>Daily view counts over last 7 days</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.accent, background: T.accentLight,
              border: `1px solid ${T.accentBorder}`, padding: "2px 9px", borderRadius: 99 }}>
              {data.impressions.growth}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 110 }}>
            {data.weekly.map((v, i) => {
              const h = Math.round((v / maxWeek) * 100);
              const days = ["M","T","W","T","F","S","S"];
              const isLast = i === data.weekly.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  {isLast && (
                    <div style={{ fontSize: 8, fontWeight: 700, color: T.accent, whiteSpace: "nowrap",
                      background: T.accentLight, border: `1px solid ${T.accentBorder}`,
                      borderRadius: 4, padding: "2px 5px" }}>{v.toLocaleString()}</div>
                  )}
                  {!isLast && <div style={{ height: 16 }} />}
                  <div style={{ width: "100%", height: h, borderRadius: "4px 4px 2px 2px",
                    background: isLast ? T.navBg : `${T.navBg}40`,
                    transition: "height 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
                  <div style={{ fontSize: 9, color: isLast ? T.headText : T.mutedText,
                    fontWeight: isLast ? 700 : 400 }}>{days[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional demand heatmap */}
        <div style={{ ...cardSt, padding: "20px 22px" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.headText, marginBottom: 2 }}>Regional Demand Mapping</div>
            <div style={{ fontSize: 10, color: T.mutedText }}>Top 5 states engaging with this listing</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {data.geo.map((g, i) => (
              <div key={g.state}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: T.navBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: "#7de0a8", flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.headText }}>🇳🇬 {g.state}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: T.accent }}>{g.pct}%</span>
                </div>
                {/* Animated bar */}
                <div style={{ height: 7, borderRadius: 99, background: T.divider, overflow: "hidden" }}>
                  <div className="insight-bar" style={{ height: "100%", borderRadius: 99,
                    width: `${g.pct}%`,
                    background: i === 0 ? T.navBg
                      : i === 1 ? `${T.navBg}cc`
                      : i === 2 ? `${T.navBg}99`
                      : i === 3 ? `${T.navBg}66`
                      : `${T.navBg}44`,
                  }} />
                </div>
              </div>
            ))}
          </div>
          {/* Total reach note */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.divider}`,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.mutedText }}>Total Nigeria Reach</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: T.headText }}>
              {data.impressions.value.toLocaleString()} impressions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
const IMP7D=[{day:"Mon",val:2840},{day:"Tue",val:3210},{day:"Wed",val:2990},{day:"Thu",val:4120},{day:"Fri",val:5340},{day:"Sat",val:4780},{day:"Sun",val:6020}];
const TOP_B=[{title:"iPhone 15 Pro Max Bulk",views:14200,likes:412,inquiries:47,geo:[{loc:"Lagos, NG",pct:72},{loc:"Abuja, NG",pct:18},{loc:"London, UK",pct:10}],tag:"Technology",trend:"+22%"},{title:"Luxury Brand Identity Suite",views:9870,likes:398,inquiries:31,geo:[{loc:"Berlin, DE",pct:42},{loc:"Dubai, AE",pct:35},{loc:"New York, US",pct:23}],tag:"Design",trend:"+18%"},{title:"Aso-Ebi Fabric Wholesale",views:7430,likes:521,inquiries:44,geo:[{loc:"Abuja, NG",pct:68},{loc:"Lagos, NG",pct:22},{loc:"Kano, NG",pct:10}],tag:"Apparel",trend:"+29%"}];
const AUD=[{label:"Global Matrix",pct:54,color:T.accent},{label:"Nationwide",pct:31,color:T.emerald},{label:"Local Nodes",pct:15,color:"#5aaF82"}];
const TRAF=[{label:"Direct Search",pct:41,color:T.accent},{label:"Feed Discovery",pct:33,color:T.emerald},{label:"Shared Links",pct:16,color:T.gold},{label:"Explorer Grid",pct:10,color:"#5a8a1a"}];
function InsightsView(){
  const [hov,setHov]=useState(null);const [selB,setSelB]=useState(0);const maxI=Math.max(...IMP7D.map(d=>d.val));
  const mc=(ic,lbl,val,sub,pos=true)=><div style={{...cardSt,padding:"18px 20px",flex:1,minWidth:140,transition:"box-shadow 0.2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(15,44,35,0.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}><div style={{fontSize:17,marginBottom:8}}>{ic}</div><div style={{fontSize:22,fontWeight:800,color:T.headText,letterSpacing:"-0.02em",marginBottom:3}}>{val}</div><div style={{fontSize:10,color:T.mutedText,marginBottom:7,letterSpacing:"0.05em",textTransform:"uppercase"}}>{lbl}</div><div style={{fontSize:11,fontWeight:600,color:pos?T.accent:T.red}}>{sub}</div></div>;
  return(
    <div style={{flex:1,minWidth:0,paddingBottom:32}}>
      <div style={{marginBottom:22}}><div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:3}}>Business Insights</div><div style={{fontSize:12,color:T.mutedText}}>Performance analytics · Last 7 days</div></div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>{mc("📡","Broadcast Reach","84,200","↑ +28.4%",true)}{mc("⚡","Daily Interactions","1,340","↑ +14.7%",true)}{mc("💬","Conversion Rate","8.3%","↓ −1.2%",false)}{mc("🌍","Trade Nodes","23","↑ +3 new",true)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={{...cardSt,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><div style={{fontSize:13,fontWeight:700,color:T.headText}}>Daily Impression Traffic</div><div style={{fontSize:10,color:T.mutedText,marginTop:2}}>Views across all broadcasts</div></div>
            <Pill bg={T.accentLight} color={T.accent} border={T.accentBorder}>↑ +22%</Pill>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:110}}>
            {IMP7D.map((d,i)=>{const h=Math.round((d.val/maxI)*100),isH=hov===i;return(
              <div key={d.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
                {isH?<div style={{fontSize:8,fontWeight:700,color:T.accent,whiteSpace:"nowrap",background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:4,padding:"2px 5px"}}>{d.val.toLocaleString()}</div>:<div style={{height:16}}/>}
                <div style={{width:"100%",height:h,borderRadius:"3px 3px 2px 2px",background:isH?T.accent:`${T.accent}40`,transition:"all 0.18s"}} />
                <div style={{fontSize:9,color:isH?T.accent:T.mutedText,fontWeight:isH?700:400}}>{d.day}</div>
              </div>
            );})}
          </div>
        </div>
        <div style={{...cardSt,padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.headText,marginBottom:3}}>Audience Distribution</div>
          <div style={{fontSize:10,color:T.mutedText,marginBottom:12}}>Global vs. Nationwide vs. Local</div>
          <div style={{display:"flex",height:7,borderRadius:99,overflow:"hidden",marginBottom:14}}>{AUD.map(s=><div key={s.label} style={{width:`${s.pct}%`,background:s.color}} />)}</div>
          {AUD.map(s=><div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:s.color}} /><span style={{fontSize:12,color:T.bodyText}}>{s.label}</span></div><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:70,height:4,borderRadius:99,background:T.divider,overflow:"hidden"}}><div style={{width:`${s.pct}%`,height:"100%",background:s.color,borderRadius:99}} /></div><span style={{fontSize:12,fontWeight:700,color:T.headText,minWidth:26,textAlign:"right"}}>{s.pct}%</span></div></div>)}
          <div style={{borderTop:`1px solid ${T.divider}`,paddingTop:10,marginTop:4}}>
            <div style={{fontSize:9,color:T.mutedText,marginBottom:8,letterSpacing:"0.06em"}}>TRAFFIC SOURCES</div>
            {TRAF.map(s=><div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:5,height:5,borderRadius:2,background:s.color}} /><span style={{fontSize:11,color:T.bodyText}}>{s.label}</span></div><span style={{fontSize:11,fontWeight:600,color:T.headText}}>{s.pct}%</span></div>)}
          </div>
        </div>
      </div>
      <div style={{...cardSt,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.divider}`,display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:700,color:T.headText}}>Top Performing Broadcasts</div><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.06em",alignSelf:"center"}}>LAST 7 DAYS</div></div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 80px 60px 60px 80px",padding:"7px 20px",borderBottom:`1px solid ${T.divider}`}}>{["BROADCAST","VIEWS","LIKES","INQUIRIES","TREND"].map(h=><div key={h} style={{fontSize:9,color:T.mutedText,fontWeight:700,letterSpacing:"0.08em"}}>{h}</div>)}</div>
        {TOP_B.map((b,i)=>{const isSel=selB===i;return(
          <div key={b.title}>
            <div onClick={()=>setSelB(isSel?-1:i)} style={{display:"grid",gridTemplateColumns:"2fr 80px 60px 60px 80px",padding:"11px 20px",borderBottom:`1px solid ${T.divider}`,cursor:"pointer",background:isSel?T.accentLight:"transparent",transition:"background 0.15s"}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background=T.pageBg;}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?T.accentLight:"transparent";}}>
              <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}><div style={{width:3,height:26,borderRadius:2,background:TAG_COLORS[b.tag]||T.accent,flexShrink:0}} /><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:T.headText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.title}</div><div style={{fontSize:10,color:T.mutedText}}>{b.tag}</div></div></div>
              <div style={{display:"flex",alignItems:"center",fontSize:12,fontWeight:600,color:T.bodyText}}>{b.views.toLocaleString()}</div>
              <div style={{display:"flex",alignItems:"center",fontSize:12,color:T.mutedText}}>{b.likes}</div>
              <div style={{display:"flex",alignItems:"center",fontSize:12,color:T.mutedText}}>{b.inquiries}</div>
              <div style={{display:"flex",alignItems:"center"}}><Pill bg={T.accentLight} color={T.accent} border={T.accentBorder}>{b.trend}</Pill></div>
            </div>
            {isSel&&<div style={{padding:"9px 20px 12px 50px",background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`}}>
              {b.geo.map(g=><div key={g.loc} style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}><div style={{fontSize:11,color:T.bodyText,minWidth:140}}>{g.loc}</div><div style={{flex:1,height:4,borderRadius:99,background:T.divider,overflow:"hidden",maxWidth:160}}><div style={{width:`${g.pct}%`,height:"100%",background:T.accent,borderRadius:99}} /></div><div style={{fontSize:11,fontWeight:700,color:T.accent,minWidth:28}}>{g.pct}%</div></div>)}
            </div>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WALLET VIEW (condensed, full-featured)
// ══════════════════════════════════════════════════════════════
function WalletView(){
  const {state,setBanks,setToast}=useZalorix();
  const {user,banks}=state;
  const [tab,setTab]=useState("overview");
  const [showW,setShowW]=useState(false);const [showT,setShowT]=useState(false);const [showBM,setShowBM]=useState(false);
  const [wAmt,setWAmt]=useState("");const [wBank,setWBank]=useState("b1");const [tAmt,setTAmt]=useState("");const [tMethod,setTMethod]=useState("bank");
  const [processing,setProcessing]=useState("");const [done,setDone]=useState("");
  const [showAddBank,setShowAddBank]=useState(false);const [newBank,setNewBank]=useState({name:"",number:"",type:"Commercial",country:"NG"});
  const txns=SEED_TRANSACTIONS;
  const bal={NGN:1240000,USD:2400,EUR:4200,GBP:0};
  const primary=user?.country==="NG"?"NGN":user?.country==="DE"?"EUR":user?.country==="GB"?"GBP":"USD";
  const sym={NGN:"₦",USD:"$",EUR:"€",GBP:"£"}[primary]||"$";
  const proceed=(type)=>{setProcessing(type);setTimeout(()=>{setDone(type);setProcessing("");setTimeout(()=>{setShowW(false);setShowT(false);setDone("");setWAmt("");setTAmt("");setToast(type==="withdraw"?"Withdrawal initiated!":"Wallet funded!");},1800);},2000);};
  const ModalWrap=({onClose,children})=><div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:28,width:440,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(15,44,35,0.22)",position:"relative"}}>{children}</div></div>;
  const Hdr=({title,onClose})=><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{fontSize:15,fontWeight:700,color:T.headText}}>{title}</div><button onClick={onClose} style={{background:T.pageBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,color:T.mutedText,cursor:"pointer",width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>;
  const Overlay=({label,icon,sub})=><div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.95)",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,zIndex:10}}>{processing?<div style={{width:38,height:38,border:`3px solid ${T.accentBorder}`,borderTop:`3px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />:<div style={{fontSize:38}}>{icon}</div>}<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontSize:13,fontWeight:700,color:T.accent}}>{processing?label:sub}</div></div>;

  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
        <div><div style={{fontSize:20,fontWeight:800,color:T.headText,marginBottom:3}}>Wallet & Payouts</div><div style={{fontSize:12,color:T.mutedText}}>Manage balances, top-ups, withdrawals, and linked accounts</div></div>
        <button onClick={()=>setShowBM(true)} style={{background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:9,padding:"8px 14px",color:T.bodyText,cursor:"pointer",fontSize:12,fontWeight:600}}>🏦 Manage Banks</button>
      </div>
      <div style={{background:T.navBg,borderRadius:16,padding:"26px 30px",marginBottom:18,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}} />
        <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.12em",marginBottom:5}}>PRIMARY BALANCE</div>
        <div style={{fontSize:36,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:3}}>{sym}{bal[primary]?.toLocaleString()}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:18}}>{primary} · {banks.find(b=>b.primary)?.name} {banks.find(b=>b.primary)?.number}</div>
        <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
          {[["↗ Withdraw",()=>setShowW(true)],["↙ Top Up",()=>setShowT(true)],["🏦 Banks",()=>setShowBM(true)]].map(([l,fn])=>(
            <button key={l} onClick={fn} style={{background:"rgba(255,255,255,0.11)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:9,padding:"8px 16px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.11)"}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        {[["₦","NGN","Nigerian Naira",bal.NGN],["$","USD","US Dollar",bal.USD],["€","EUR","Euro",bal.EUR],["£","GBP","British Pound",bal.GBP]].map(([s,code,name,v])=>(
          <div key={code} style={{...cardSt,padding:"14px 18px",flex:1,minWidth:120}}><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.06em",fontWeight:700,marginBottom:5,display:"flex",justifyContent:"space-between"}}>{code}{v>0&&<div style={{width:5,height:5,borderRadius:"50%",background:T.accent}} />}</div><div style={{fontSize:17,fontWeight:800,color:v>0?T.headText:T.mutedText}}>{s}{v.toLocaleString()}</div><div style={{fontSize:10,color:T.mutedText,marginTop:1}}>{name}</div></div>
        ))}
      </div>
      <div style={{background:T.goldLight,border:`1px solid ${T.goldBorder}`,borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:18}}>⏳</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:T.gold}}>Funds in Active Escrow</div><div style={{fontSize:11,color:T.bodyText,marginTop:1}}>₦1,200,000 held · 1 active transaction · Expected release in 3–5 days</div></div></div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>{["overview","in","out"].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"7px 16px",background:tab===t?T.navBg:"transparent",border:`1px solid ${tab===t?T.navBg:T.cardBorder}`,borderRadius:8,color:tab===t?"#fff":T.bodyText,cursor:"pointer",fontSize:12,fontWeight:tab===t?700:400}}>{{overview:"All",in:"Received",out:"Sent"}[t]}</button>)}</div>
      <div style={{...cardSt,overflow:"hidden"}}>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${T.divider}`,display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:700,color:T.headText}}>Transaction History</div><button style={{background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:7,padding:"4px 10px",color:T.mutedText,cursor:"pointer",fontSize:11}}>↓ CSV</button></div>
        {txns.filter(t=>tab==="overview"||(tab==="in"&&t.dir==="in")||(tab==="out"&&t.dir==="out")).map((t,i,arr)=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",borderBottom:i<arr.length-1?`1px solid ${T.divider}`:"none",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.pageBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:36,height:36,borderRadius:"50%",background:t.dir==="in"?T.accentLight:T.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,border:`1px solid ${t.dir==="in"?T.accentBorder:T.goldBorder}`}}>{{escrow_release:"💸",purchase:"🔒",deposit:"↙",withdrawal:"↗",escrow_hold:"⏳"}[t.type]||"💳"}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:T.headText,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.label}</div><div style={{fontSize:10,color:T.mutedText,marginTop:1}}>{t.date}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:13,fontWeight:800,color:t.dir==="in"?T.accent:T.headText}}>{t.dir==="in"?"+":"-"}{t.currency}{Number(t.amount).toLocaleString()}</div><div style={{marginTop:2}}>{t.status==="completed"?<Pill bg={T.accentLight} color={T.accent} border={T.accentBorder} sm>Completed</Pill>:<Pill bg={T.goldLight} color={T.gold} border={T.goldBorder} sm>In Escrow</Pill>}</div></div>
          </div>
        ))}
      </div>

      {showW&&<ModalWrap onClose={()=>{setShowW(false);setDone("");}}>{(processing==="withdraw"||done==="withdraw")&&<Overlay label="Processing withdrawal…" icon="✅" sub="Withdrawal Initiated!" />}<Hdr title="Withdraw Funds" onClose={()=>{setShowW(false);setDone("");}} /><div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"11px 14px",marginBottom:16,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.bodyText}}>Available</span><span style={{fontSize:13,fontWeight:800,color:T.accent}}>₦{bal.NGN.toLocaleString()}</span></div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>AMOUNT (₦)</label><input type="number" value={wAmt} onChange={e=>setWAmt(e.target.value)} placeholder="Enter amount" style={inputSt} /></div><div style={{marginBottom:16}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:7,letterSpacing:"0.07em",fontWeight:600}}>DESTINATION</label>{banks.map(b=><button key={b.id} onClick={()=>setWBank(b.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 13px",background:wBank===b.id?T.accentLight:T.inputBg,border:`1px solid ${wBank===b.id?T.accentBorder:T.cardBorder}`,borderRadius:9,cursor:"pointer",textAlign:"left",marginBottom:6}}><span style={{fontSize:15}}>🏦</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:wBank===b.id?T.accent:T.headText}}>{b.name} {b.number}</div><div style={{fontSize:10,color:T.mutedText}}>{b.primary?"Primary":b.type}</div></div>{wBank===b.id&&<div style={{width:10,height:10,borderRadius:"50%",background:T.accent}} />}</button>)}</div>{wAmt&&Number(wAmt)>0&&<div style={{background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:10,padding:"11px 14px",marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:T.mutedText}}>Fee (0.5%)</span><span style={{fontSize:12,color:T.headText}}>₦{Math.round(wAmt*0.005).toLocaleString()}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,fontWeight:700,color:T.headText}}>You receive</span><span style={{fontSize:13,fontWeight:800,color:T.accent}}>₦{Math.round(wAmt*0.995).toLocaleString()}</span></div></div>}<button onClick={()=>proceed("withdraw")} disabled={!wAmt||Number(wAmt)<=0} style={{width:"100%",background:wAmt&&Number(wAmt)>0?T.navBg:"#c8d8d0",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>↗ Initiate Withdrawal</button></ModalWrap>}

      {showT&&<ModalWrap onClose={()=>{setShowT(false);setDone("");}}>{(processing==="topup"||done==="topup")&&<Overlay label="Processing top-up…" icon="🎉" sub="Wallet Funded!" />}<Hdr title="Top Up Wallet" onClose={()=>{setShowT(false);setDone("");}} /><div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:7,letterSpacing:"0.07em",fontWeight:600}}>FUNDING METHOD</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{[{id:"bank",ic:"🏦",l:"Bank Transfer",s:"Free"},{id:"ussd",ic:"📱",l:"USSD",s:"Free"},{id:"card",ic:"💳",l:"Card",s:"1.5%"},{id:"crypto",ic:"₿",l:"Crypto",s:"Net fee"}].map(m=><button key={m.id} onClick={()=>setTMethod(m.id)} style={{padding:"11px",background:tMethod===m.id?T.accentLight:T.inputBg,border:`1px solid ${tMethod===m.id?T.accentBorder:T.cardBorder}`,borderRadius:9,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}><div style={{fontSize:16,marginBottom:5}}>{m.ic}</div><div style={{fontSize:11,fontWeight:700,color:tMethod===m.id?T.accent:T.headText}}>{m.l}</div><div style={{fontSize:9,color:T.mutedText,marginTop:2}}>Fee: {m.s}</div></button>)}</div></div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>AMOUNT (₦)</label><input type="number" value={tAmt} onChange={e=>setTAmt(e.target.value)} placeholder="Enter amount" style={inputSt} /><div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}>{["5000","10000","25000","50000","100000"].map(q=><button key={q} onClick={()=>setTAmt(q)} style={{padding:"4px 9px",background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:6,cursor:"pointer",fontSize:11,color:T.bodyText,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=T.accentLight;e.currentTarget.style.color=T.accent;}} onMouseLeave={e=>{e.currentTarget.style.background=T.cardBg;e.currentTarget.style.color=T.bodyText;}}>₦{Number(q).toLocaleString()}</button>)}</div></div>{tMethod==="bank"&&<div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.07em",fontWeight:600,marginBottom:8}}>TRANSFER TO</div>{[["Bank","Zalorix Trust Bank"],["Account","0123456789"],["Name","Zalorix Global Ltd"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:T.mutedText}}>{k}</span><span style={{fontSize:11,fontWeight:700,color:T.headText}}>{v}</span></div>)}</div>}{tMethod==="ussd"&&<div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.07em",fontWeight:600,marginBottom:6}}>DIAL</div><div style={{fontSize:22,fontWeight:900,color:T.headText}}>*737*50*{tAmt||"AMOUNT"}#</div></div>}<button onClick={()=>proceed("topup")} disabled={!tAmt||Number(tAmt)<=0} style={{width:"100%",background:tAmt&&Number(tAmt)>0?T.navBg:"#c8d8d0",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>↙ Confirm Top Up · ₦{Number(tAmt||0).toLocaleString()}</button></ModalWrap>}

      {showBM&&<div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}} onClick={()=>setShowBM(false)}><div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:28,width:520,maxWidth:"96vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(15,44,35,0.22)"}}><Hdr title="Linked Bank Accounts" onClose={()=>setShowBM(false)} /><div style={{marginBottom:16}}>{banks.map(b=><div key={b.id} style={{...cardSt,padding:"14px 16px",marginBottom:9,display:"flex",alignItems:"center",gap:12,borderColor:b.primary?T.accentBorder:T.cardBorder,background:b.primary?T.accentLight:T.cardBg}}><div style={{width:38,height:38,borderRadius:9,background:b.primary?T.navBg:T.inputBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏦</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}><span style={{fontSize:13,fontWeight:700,color:T.headText}}>{b.name} {b.number}</span>{b.primary&&<Pill bg={T.accentLight} color={T.accent} border={T.accentBorder}>PRIMARY</Pill>}</div><div style={{fontSize:11,color:T.mutedText}}>{b.type} · {FLAGS[b.country]||""} {COUNTRIES.find(c=>c.code===b.country)?.name}</div></div><div style={{display:"flex",gap:7}}>{!b.primary&&<button onClick={()=>setBanks(banks.map(x=>({...x,primary:x.id===b.id})))} style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:7,padding:"5px 10px",color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600}}>Set Primary</button>}{!b.primary&&<button onClick={()=>setBanks(banks.filter(x=>x.id!==b.id))} style={{background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:7,padding:"5px 8px",color:T.red,cursor:"pointer",fontSize:11}}>🗑</button>}</div></div>)}</div>{!showAddBank?<button onClick={()=>setShowAddBank(true)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px",background:"transparent",border:`1.5px dashed ${T.cardBorder}`,borderRadius:11,cursor:"pointer",color:T.mutedText,fontSize:12,fontWeight:600,justifyContent:"center",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;e.currentTarget.style.background=T.accentLight;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.cardBorder;e.currentTarget.style.color=T.mutedText;e.currentTarget.style.background="transparent";}}>➕ Add New Bank Account</button>:<div style={{...cardSt,padding:"16px 18px",background:T.pageBg}}><div style={{fontSize:13,fontWeight:700,color:T.headText,marginBottom:14}}>Add Account</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{[["Bank Name","name","e.g. First Bank"],["Account Number","number","e.g. ****1234"]].map(([l,k,ph])=><div key={k}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>{l.toUpperCase()}</label><input value={newBank[k]} onChange={e=>setNewBank(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inputSt} /></div>)}</div><div style={{marginBottom:14}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>COUNTRY</label><select value={newBank.country} onChange={e=>setNewBank(p=>({...p,country:e.target.value}))} style={{...inputSt,cursor:"pointer"}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{FLAGS[c.code]||""} {c.name}</option>)}</select></div><div style={{display:"flex",gap:8}}><button onClick={()=>setShowAddBank(false)} style={{flex:1,background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:9,padding:"9px",color:T.bodyText,cursor:"pointer",fontSize:12,fontWeight:600}}>Cancel</button><button onClick={()=>{if(!newBank.name||!newBank.number)return;setBanks([...banks,{...newBank,id:uid(),primary:false}]);setNewBank({name:"",number:"",type:"Commercial",country:"NG"});setShowAddBank(false);setToast("Bank account added!");}} style={{flex:1,background:T.navBg,border:"none",borderRadius:9,padding:"9px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>Add Account</button></div></div>}</div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TRUST STANDARD (modular)
// ══════════════════════════════════════════════════════════════
function TrustStandard(){
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [hov,setHov]=useState(null);
  const PILLARS=[
    {icon:<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" stroke="#1a7a4a" strokeWidth="1.5"/><circle cx="20" cy="15" r="5" fill="#e8f5ee" stroke="#1a7a4a" strokeWidth="1.5"/><path d="M9 32c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><path d="M26 10l2 2 4-4" stroke="#1a7a4a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,badge:"KYV VERIFIED",title:"Multi-Tiered Know Your Vendor Verification",body:"Every trader seeking nationwide reach clears a layered identity stack: phone + BVN/NIN validation for individuals, CAC registration cross-checks for corporates. No ghost accounts. Pure accountability.",check:["Phone + BVN/NIN validation","CAC corporate registration check","Real-time identity status flags","Nationwide traceable profile ledger"]},
    {icon:<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" stroke="#1a7a4a" strokeWidth="1.5"/><rect x="11" y="17" width="18" height="13" rx="2.5" fill="#e8f5ee" stroke="#1a7a4a" strokeWidth="1.5"/><path d="M15 17v-3a5 5 0 0110 0v3" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="23.5" r="2" fill="#1a7a4a"/><line x1="20" y1="25.5" x2="20" y2="27.5" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/></svg>,badge:"ESCROW PROTECTED",title:"The Escrow-Backed Trade Matrix",body:"When a buyer initiates an order across any of the 36 states, funds lock in our secure escrow gateway. Capital releases only on logistics confirmation or buyer milestone approval. Disputes trigger arbitration hold.",check:["Funds locked on order initiation","Milestone + delivery confirmation release","Built-in dispute arbitration layer","Full escrow transaction audit trail"]},
    {icon:<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" stroke="#1a7a4a" strokeWidth="1.5"/><rect x="12" y="11" width="16" height="18" rx="2.5" fill="#e8f5ee" stroke="#1a7a4a" strokeWidth="1.5"/><line x1="16" y1="17" x2="24" y2="17" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="21" x2="24" y2="21" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><line x1="16" y1="25" x2="20" y2="25" stroke="#1a7a4a" strokeWidth="1.5" strokeLinecap="round"/><circle cx="28" cy="28" r="5" fill="#0F2C23"/><path d="M26 28l1.5 1.5L30 26" stroke="#7de0a8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,badge:"TAMPER-PROOF LOGS",title:"Anti-Scam Sourcing Logs & Peer Transparency",body:"Every Trade Radar pitch and escrow interaction generates an unalterable ledger token tied permanently to the sender's profile. These tokens form the backbone of our peer rating system — one that cannot be purchased or gamed.",check:["Immutable interaction ledger tokens","Zero-manipulation peer rating system","Full pitch & response audit history","Bad actor visibility flags across network"]},
  ];
  const RULES=[{section:"Verification Framework",items:["All users must complete phone OTP before posting any listing or buyer request.","Individual traders require BVN or NIN validation via NIBSS systems.","Corporate accounts must submit a valid CAC number verified against public records.","Re-verification triggers automatically on anomalous activity patterns."]},{section:"Escrow & Payment Rules",items:["All transactions above ₦100,000 must use the Zalorix Escrow gateway.","Escrow funds are held in a segregated, ring-fenced account.","Release triggers: (a) buyer milestone approval, or (b) logistics confirmation.","Disputes must be raised within 72 hours of delivery confirmation."]},{section:"Trade Radar Conduct",items:["Buyer requests must include a verifiable purpose and realistic budget range.","Sellers may not submit duplicate pitches across more than 3 requests per 24 hours.","All pitch interactions are logged immutably against the sender's profile.","Confirmed scam attempts result in immediate suspension and permanent blacklist."]},{section:"Review Integrity",items:["Ratings derive exclusively from verified, completed escrow transactions.","Any attempt to purchase or inflate peer ratings results in immediate suspension.","Activity ledger tokens are cryptographically signed and unalterable retroactively.","Anonymity is structurally prohibited — every interaction ties to a verified identity."]}];
  return(
    <>
      <style>{`.trust-pillar{transition:transform 0.2s,box-shadow 0.2s}.trust-pillar:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(15,44,35,0.1)!important}@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{marginBottom:60}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:99,padding:"5px 14px",marginBottom:14}}><div style={{width:5,height:5,borderRadius:"50%",background:T.accent}} /><span style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.12em"}}>THE ZALORIX TRUST STANDARD</span></div>
          <h2 style={{fontSize:"clamp(22px,3.5vw,36px)",fontWeight:900,color:T.headText,letterSpacing:"-0.02em",lineHeight:1.15,marginBottom:12}}>Security isn't a feature.<br/>It's the foundation.</h2>
          <p style={{fontSize:14,color:T.mutedText,maxWidth:480,margin:"0 auto",lineHeight:1.75}}>Three structural mechanisms work on every transaction, every pitch, and every connection — without exception.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:18}}>
          {PILLARS.map((p,i)=>(
            <div key={p.badge} className="trust-pillar" style={{...cardSt,padding:"26px 22px",position:"relative",overflow:"hidden",cursor:"default",borderColor:hov===i?T.accentBorder:T.cardBorder}} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${T.accent},${T.emerald})`}} />
              <div style={{marginBottom:14}}>{p.icon}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:99,padding:"2px 9px",marginBottom:10}}><div style={{width:4,height:4,borderRadius:"50%",background:T.accent}} /><span style={{fontSize:8,fontWeight:800,color:T.accent,letterSpacing:"0.1em"}}>{p.badge}</span></div>
              <h3 style={{fontSize:14,fontWeight:800,color:T.headText,lineHeight:1.3,marginBottom:10}}>{p.title}</h3>
              <p style={{fontSize:11,color:T.bodyText,lineHeight:1.75,marginBottom:14,display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.body}</p>
              <div style={{display:"flex",flexDirection:"column",gap:6,paddingTop:12,borderTop:`1px solid ${T.divider}`}}>
                {p.check.map(c=><div key={c} style={{display:"flex",alignItems:"flex-start",gap:7}}><svg width="13" height="13" viewBox="0 0 13 13" style={{flexShrink:0,marginTop:1}}><circle cx="6.5" cy="6.5" r="6.5" fill={T.accentLight}/><path d="M3.5 6.5l2 2 4-4" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:11,color:T.bodyText,lineHeight:1.5}}>{c}</span></div>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{background:T.navBg,borderRadius:13,padding:"22px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-30,top:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}} />
          <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:260,position:"relative",zIndex:1}}>
            <div style={{width:42,height:42,borderRadius:9,background:"rgba(125,224,168,0.12)",border:"1px solid rgba(125,224,168,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 5.5v5.5C3 15.75 6.5 19.75 11 21c4.5-1.25 8-5.25 8-10V5.5L11 2Z" fill="rgba(125,224,168,0.15)" stroke="#7de0a8" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 11l2.5 2.5 5-5" stroke="#7de0a8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div><div style={{fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.4,marginBottom:2}}>No anonymous listings. No unverified requests. Pure accountability across all 36 states.</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Every interaction on this network is tied to a verified legal identity — without exception.</div></div>
          </div>
          <button onClick={()=>setDrawerOpen(true)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:9,padding:"9px 16px",color:"rgba(255,255,255,0.8)",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,position:"relative",zIndex:1,transition:"background 0.15s",display:"flex",alignItems:"center",gap:6}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>📋 Read Market Safety Rules</button>
        </div>
      </div>
      {drawerOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"stretch",justifyContent:"flex-end"}} onClick={()=>setDrawerOpen(false)}>
          <div style={{position:"absolute",inset:0,background:"rgba(15,44,35,0.5)",backdropFilter:"blur(3px)"}} />
          <div onClick={e=>e.stopPropagation()} style={{width:540,maxWidth:"96vw",background:T.cardBg,borderLeft:`1px solid ${T.cardBorder}`,display:"flex",flexDirection:"column",animation:"drawerIn 0.24s ease",position:"relative",zIndex:1,boxShadow:"-12px 0 48px rgba(15,44,35,0.18)"}}>
            <div style={{padding:"22px 26px 18px",borderBottom:`1px solid ${T.divider}`,background:T.navBg,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.4)",letterSpacing:"0.12em",marginBottom:5}}>COMPLIANCE & LEGAL</div><div style={{fontSize:15,fontWeight:800,color:"#fff"}}>Market Safety Rules & Verification Framework</div></div>
                <button onClick={()=>setDrawerOpen(false)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,color:"#fff",cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}><div style={{width:5,height:5,borderRadius:"50%",background:"#7de0a8"}} /><span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Effective across all 36 states · June 2025</span></div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"22px 26px 28px"}}>
              <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:9,padding:"11px 14px",marginBottom:22,fontSize:11,color:T.accent,lineHeight:1.6}}>These rules are binding on all users. Violation may result in immediate suspension, escrow fund freeze, and permanent network blacklisting. Applies uniformly across every state node.</div>
              {RULES.map((s,si)=>(
                <div key={s.section} style={{marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:12}}><div style={{width:22,height:22,borderRadius:6,background:T.navBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#7de0a8",flexShrink:0}}>{si+1}</div><div style={{fontSize:13,fontWeight:800,color:T.headText}}>{s.section}</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:7,paddingLeft:31}}>
                    {s.items.map((item,ii)=><div key={ii} style={{display:"flex",alignItems:"flex-start",gap:9,padding:"9px 12px",background:T.pageBg,border:`1px solid ${T.divider}`,borderRadius:8}}><svg width="13" height="13" viewBox="0 0 13 13" style={{flexShrink:0,marginTop:1}}><circle cx="6.5" cy="6.5" r="6.5" fill={T.accentLight}/><path d="M3.5 6.5l2 2 4-4" stroke={T.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:12,color:T.bodyText,lineHeight:1.65}}>{item}</span></div>)}
                  </div>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${T.divider}`,paddingTop:18,fontSize:11,color:T.mutedText,lineHeight:1.7}}>Contact <span style={{color:T.accent,fontWeight:600}}>trust@zalorix.ng</span> for compliance enquiries. Zalorix may amend these rules with 14-day notice.</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// ABOUT VIEW
// ══════════════════════════════════════════════════════════════
function AboutView(){
  const {state,setNav,setAuthModal}=useZalorix();
  const {user}=state;
  const [started,setStarted]=useState(false);
  const ref=useRef();
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStarted(true)},{threshold:0.3});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[]);
  function useCountUp(target,duration=2000){const [val,setVal]=useState(0);useEffect(()=>{if(!started)return;let st=null;const step=ts=>{if(!st)st=ts;const p=Math.min((ts-st)/duration,1);const e=1-Math.pow(1-p,3);setVal(Math.floor(e*target));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);},[target,duration,started]);return val;}
  const c1=useCountUp(37,1800),c2=useCountUp(12400,2200),c3=useCountUp(3800,2000),c4=useCountUp(98,1600);
  const PILLARS=[{ic:"🛡",title:"Verified Buyers Only",body:"Every buyer clears identity verification before posting a sourcing request. Phone, BVN/NIN, and CAC checks ensure you're pitching to real decision-makers with real budgets — not tyre-kickers burning your time.",n:1},{ic:"🎯",title:"36-State Sourcing Intelligence",body:"Our Trade Radar maps active demand across every state and the FCT in real time. Whether procurement is happening in Port Harcourt's oil belt or Abuja's construction sector — you see it the moment it's posted, filtered precisely to your node.",n:2},{ic:"🔒",title:"Escrow-Secured Transactions",body:"Every deal closed on Zalorix is protected by our in-platform escrow layer. Funds are held, verified, and released only upon confirmed delivery — giving both parties the confidence to transact at scale without fear of fraud.",n:3}];
  return(
    <div style={{flex:1,minWidth:0,overflowY:"auto",background:T.pageBg}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}.about-fade{animation:fadeUp 0.65s ease forwards}.pc:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(15,44,35,0.1)!important}`}</style>
      {/* Hero */}
      <div style={{background:T.navBg,padding:"64px 48px 72px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:280,height:280,borderRadius:"50%",background:"rgba(255,255,255,0.025)",pointerEvents:"none"}} />
        <div style={{maxWidth:860,margin:"0 auto",position:"relative",zIndex:1}}>
          <div className="about-fade" style={{animationDelay:"0ms"}}><div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:99,padding:"5px 14px",marginBottom:24}}><div style={{width:6,height:6,borderRadius:"50%",background:"#7de0a8",boxShadow:"0 0 0 3px rgba(125,224,168,0.25)"}} /><span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.7)",letterSpacing:"0.14em"}}>NIGERIA'S ELITE TRADE NETWORK</span></div></div>
          <div className="about-fade" style={{animationDelay:"80ms"}}><h1 style={{fontSize:"clamp(30px,5vw,54px)",fontWeight:900,color:"#fff",lineHeight:1.1,letterSpacing:"-0.03em",marginBottom:20,maxWidth:640}}>Built for the Serious<br/><span style={{background:"linear-gradient(90deg,#7de0a8,#38d9a9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Nigerian Trader.</span></h1></div>
          <div className="about-fade" style={{animationDelay:"160ms"}}><p style={{fontSize:17,color:"rgba(255,255,255,0.6)",lineHeight:1.75,maxWidth:580,marginBottom:32}}>Zalorix is Nigeria's interactive commerce ecosystem — engineered to connect verified buyers with premium sellers across all 36 states and the FCT. Not a classifieds board. Not a marketplace. A living trade network.</p></div>
          <div className="about-fade" style={{animationDelay:"240ms",display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>user?setNav("radar"):setAuthModal("signup")} style={{background:"#fff",border:"none",borderRadius:10,padding:"12px 26px",color:T.navBg,fontSize:13,fontWeight:800,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.92"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{user?"Open Trade Radar →":"Join the Network →"}</button>
            <button onClick={()=>setNav("explorer")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"12px 26px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>Explore Listings</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:920,margin:"0 auto",padding:"0 32px 72px"}}>
        {/* Problem */}
        <div style={{paddingTop:56,marginBottom:56}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:44,alignItems:"center"}}>
            <div><div style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.14em",marginBottom:10}}>THE PROBLEM</div><h2 style={{fontSize:"clamp(22px,3.5vw,34px)",fontWeight:900,color:T.headText,lineHeight:1.15,letterSpacing:"-0.02em",marginBottom:16}}>Why standard platforms fail Nigerian businesses.</h2><p style={{fontSize:14,color:T.bodyText,lineHeight:1.8,marginBottom:16}}>The Nigerian B2B market moves fast — procurement windows open and close in days. Yet the platforms sellers rely on were built for a different economy: slow, passive, and blind to local commercial realities.</p><p style={{fontSize:14,color:T.bodyText,lineHeight:1.8}}>The result? Sellers drown in unqualified leads. Buyers post everywhere and get nothing back. High-value transactions never close because the infrastructure simply doesn't exist.</p></div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {["Unverified buyers waste weeks of your pipeline.","Generic classifieds have zero local market intelligence.","Payments outside escrow expose sellers to fraud.","No platform speaks the language of Nigerian B2B."].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,...cardSt,padding:"12px 16px",transition:"box-shadow 0.2s"}} onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(15,44,35,0.08)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}><div style={{width:22,height:22,borderRadius:6,background:T.redLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.red,flexShrink:0}}>✗</div><div style={{fontSize:13,color:T.bodyText,fontWeight:500,lineHeight:1.5}}>{p}</div></div>
              ))}
              <div style={{display:"flex",alignItems:"flex-start",gap:12,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:12,padding:"12px 16px"}}><div style={{width:22,height:22,borderRadius:6,background:T.navBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#7de0a8",flexShrink:0}}>✓</div><div style={{fontSize:13,color:T.accent,fontWeight:700,lineHeight:1.5}}>Zalorix was built to eliminate every one of these failures.</div></div>
            </div>
          </div>
        </div>
        {/* Metrics */}
        <div ref={ref} style={{background:T.navBg,borderRadius:18,padding:"40px 36px",marginBottom:56,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}} />
          <div style={{textAlign:"center",marginBottom:32,position:"relative",zIndex:1}}><div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.4)",letterSpacing:"0.14em",marginBottom:6}}>PLATFORM METRICS</div><div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>A network already at work.</div></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,position:"relative",zIndex:1}}>
            {[[c1,"States + FCT","Active geographic nodes","🗺"],[c2.toLocaleString(),"Verified Nodes","Sellers & buyers on network","🛡"],[c3.toLocaleString(),"Daily Demands","Live buyer requests daily","⚡"],[c4+"%","Escrow Success","Closed without dispute","🔒"]].map(([v,l,s,ic])=>(
              <div key={l} style={{textAlign:"center",padding:"18px 10px",background:"rgba(255,255,255,0.06)",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)"}}>
                <div style={{fontSize:20,marginBottom:6}}>{ic}</div>
                <div style={{fontSize:"clamp(26px,3vw,38px)",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",lineHeight:1,marginBottom:5}}>{v}</div>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.85)",marginBottom:3}}>{l}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",lineHeight:1.4}}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Pillars */}
        <div style={{marginBottom:56}}>
          <div style={{textAlign:"center",marginBottom:36}}><div style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.14em",marginBottom:9}}>HOW ZALORIX WORKS</div><h2 style={{fontSize:"clamp(22px,3.5vw,34px)",fontWeight:900,color:T.headText,letterSpacing:"-0.02em",lineHeight:1.15,marginBottom:12}}>Three pillars. Zero compromise.</h2><p style={{fontSize:14,color:T.mutedText,maxWidth:440,margin:"0 auto",lineHeight:1.75}}>Every feature was engineered around a single principle: Nigerian commerce deserves infrastructure built specifically for it.</p></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {PILLARS.map(p=>(
              <div key={p.title} className="pc" style={{...cardSt,padding:"26px 22px",position:"relative",overflow:"hidden",transition:"transform 0.2s,box-shadow 0.2s"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${T.accent},${T.emerald})`}} />
                <div style={{width:46,height:46,borderRadius:12,background:T.navBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16}}>{p.ic}</div>
                <div style={{fontSize:9,fontWeight:800,color:T.accent,letterSpacing:"0.1em",marginBottom:7}}>PILLAR {p.n}</div>
                <h3 style={{fontSize:15,fontWeight:800,color:T.headText,marginBottom:10,lineHeight:1.3}}>{p.title}</h3>
                <p style={{fontSize:12,color:T.bodyText,lineHeight:1.75}}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Trust Standard */}
        <TrustStandard />
        {/* CTA */}
        <div style={{background:T.navBg,borderRadius:18,padding:"48px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-50,right:-50,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}} />
          <div style={{position:"relative",zIndex:1}}>
            <div style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.4)",letterSpacing:"0.14em",marginBottom:12}}>READY TO TRADE</div>
            <h2 style={{fontSize:"clamp(22px,4vw,40px)",fontWeight:900,color:"#fff",letterSpacing:"-0.025em",lineHeight:1.1,marginBottom:14,maxWidth:480,margin:"0 auto 14px"}}>Ready to dominate<br/>your state's market?</h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.7,maxWidth:420,margin:"0 auto 32px"}}>Over 12,000 verified businesses are already active. Your next buyer is posting right now on the Trade Radar.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>user?setNav("radar"):setAuthModal("signup")} style={{background:"#fff",border:"none",borderRadius:10,padding:"13px 28px",color:T.navBg,fontSize:13,fontWeight:800,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity="0.92"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{user?"Open Trade Radar":"Join the Network — Free"}</button>
              <button onClick={()=>user?setNav("broadcasts"):setAuthModal("signup")} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"13px 28px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>{user?"Create a Broadcast":"Post a Listing"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BROADCAST DRAWER
// ══════════════════════════════════════════════════════════════
function BroadcastDrawer({onClose}){
  const {state,addListing,setNav,setToast}=useZalorix();
  const {user}=state;
  const country=COUNTRIES.find(c=>c.code===user?.country);
  const [f,setF]=useState({title:"",desc:"",type:"Product",category:"Tech & Gadgets",price:"",currency:country?.currency||"₦",scope:"global",image:null});
  const [err,setErr]=useState(""),drag=useState(false)[0];const fileRef=useRef();
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const handleDrop=useCallback(e=>{e.preventDefault();const file=e.dataTransfer?.files?.[0]||e.target?.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>set("image",ev.target.result);r.readAsDataURL(file);},[]);
  const submit=()=>{
    if(!f.title.trim()||!f.price||!f.category){setErr("Fill in Title, Category, and Price.");return;}
    if(isNaN(Number(f.price))||Number(f.price)<=0){setErr("Enter a valid price.");return;}
    addListing({id:uid(),title:f.title.trim(),desc:f.desc.trim(),category:f.category,provider:user?.business||user?.name||"My Business",country:user?.country||"NG",city:user?.city||"Ikeja",price:Number(f.price),tag:f.category,badge:user?.role==="Global Enterprise"?"Premium Tier":user?.role==="Verified Local Business"?"Verified Provider":"Featured",likes:0,region_type:f.scope,image:f.image,scope:f.scope,isNew:true,isOwned:true});
    setToast("Broadcast propagated to the Global Matrix successfully!");
    setNav("broadcasts");onClose();
  };
  const lbl=(t,req=true)=><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:5,letterSpacing:"0.07em",fontWeight:600}}>{t.toUpperCase()}{req&&<span style={{color:T.red,marginLeft:2}}>*</span>}</label>;
  return(
    <div style={{position:"fixed",inset:0,zIndex:997,display:"flex",alignItems:"stretch",justifyContent:"flex-end"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:480,maxWidth:"96vw",background:T.cardBg,borderLeft:`1px solid ${T.cardBorder}`,display:"flex",flexDirection:"column",overflowY:"auto",animation:"slideIn 0.22s ease",boxShadow:"-8px 0 40px rgba(15,44,35,0.12)"}}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        <div style={{padding:"22px 24px 18px",borderBottom:`1px solid ${T.divider}`,background:T.navBg,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>New Broadcast</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:2}}>Propagate your listing to the network</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:15,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{flex:1,padding:"20px 22px",overflowY:"auto",background:T.pageBg}}>
          <div style={{marginBottom:14}}>{lbl("Listing Type")}<div style={{display:"flex",gap:8}}>{["Product","Service"].map(t=><button key={t} onClick={()=>set("type",t)} style={{flex:1,background:f.type===t?T.accentLight:T.cardBg,border:`1px solid ${f.type===t?T.accentBorder:T.cardBorder}`,borderRadius:8,padding:"9px",color:f.type===t?T.accent:T.mutedText,cursor:"pointer",fontSize:12,fontWeight:f.type===t?700:400}}>{t==="Product"?"📦 Product":"🛠 Service"}</button>)}</div></div>
          {[[lbl("Listing Title"),"title","text","e.g. Premium Grade A Cocoa Export"],[lbl("Description",false),"desc","text","Describe your product or service…"]].map(([l,k,type,ph])=>(
            <div key={k} style={{marginBottom:14}}>{l}{k==="desc"?<textarea value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} rows={3} style={{...inputSt,resize:"vertical"}} />:<input type={type} value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={inputSt} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.inputBorder} />}</div>
          ))}
          <div style={{marginBottom:14}}>{lbl("Category")}<select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inputSt,cursor:"pointer"}}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div style={{marginBottom:14}}>{lbl("Price")}<div style={{display:"flex",gap:8}}><select value={f.currency} onChange={e=>set("currency",e.target.value)} style={{...inputSt,width:80,flexShrink:0,fontWeight:700,color:T.accent,cursor:"pointer"}}>{[...new Set(COUNTRIES.map(c=>c.currency))].map(cur=><option key={cur} value={cur}>{cur}</option>)}</select><input type="number" value={f.price} onChange={e=>set("price",e.target.value)} placeholder="0" style={{...inputSt,flex:1}} /></div></div>
          <div style={{marginBottom:16}}>{lbl("Distribution Scope")}
            {[["local","📍 Local Node Only",`Only visible in ${user?.city||"your city"}`],["nation","🏳 Nationwide Trade",`Visible across ${country?.name||"your country"}`],["global","🌐 Global Matrix","Visible to all traders worldwide"]].map(([id,l2,sub])=>(
              <button key={id} onClick={()=>set("scope",id)} style={{display:"flex",alignItems:"center",gap:11,background:f.scope===id?T.accentLight:T.cardBg,border:`1px solid ${f.scope===id?T.accentBorder:T.cardBorder}`,borderRadius:9,padding:"10px 14px",cursor:"pointer",textAlign:"left",marginBottom:6,width:"100%",transition:"all 0.15s"}}>
                <div style={{width:13,height:13,borderRadius:"50%",border:`2px solid ${f.scope===id?T.accent:T.inputBorder}`,background:f.scope===id?T.accent:"transparent",flexShrink:0}} />
                <div><div style={{fontSize:12,fontWeight:600,color:f.scope===id?T.accent:T.headText}}>{l2}</div><div style={{fontSize:10,color:T.mutedText,marginTop:1}}>{sub}</div></div>
              </button>
            ))}
          </div>
          <div style={{marginBottom:18}}>{lbl("Media / Image",false)}{f.image?<div style={{position:"relative",borderRadius:9,overflow:"hidden",border:`1px solid ${T.cardBorder}`}}><img src={f.image} alt="" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}} /><button onClick={()=>set("image",null)} style={{position:"absolute",top:7,right:7,background:"rgba(15,44,35,0.7)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",padding:"3px 8px",fontSize:11}}>✕</button></div>:<div onDragOver={e=>{e.preventDefault();}} onDrop={handleDrop} onClick={()=>fileRef.current?.click()} style={{border:`1.5px dashed ${T.cardBorder}`,borderRadius:9,padding:"24px 18px",textAlign:"center",cursor:"pointer",background:T.cardBg,transition:"all 0.2s"}}><div style={{fontSize:22,marginBottom:7}}>🖼</div><div style={{fontSize:12,color:T.bodyText}}>Drag & drop or <span style={{color:T.accent,textDecoration:"underline"}}>browse</span></div><input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleDrop({dataTransfer:null,target:e.target})} /></div>}</div>
          {err&&<div style={{fontSize:12,color:T.red,background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:8,padding:"8px 12px",marginBottom:12}}>{err}</div>}
          <button onClick={submit} style={{width:"100%",background:T.navBg,border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>✦ Publish Broadcast</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AUTH MODAL
// ══════════════════════════════════════════════════════════════
function AuthModal({mode,setMode}){
  const {setUser}=useZalorix();
  const [form,setForm]=useState({name:"",business:"",email:"",password:"",country:"NG",city:"",role:"Standard Buyer"});
  const [err,setErr]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v,...(k==="country"?{city:""}:{})}));
  const cities=COUNTRIES.find(c=>c.code===form.country)?.cities||[];
  const submit=()=>{
    if(mode==="signup"){if(!form.name||!form.email||!form.password||!form.city){setErr("Fill all required fields.");return;}}
    else{if(!form.email||!form.password){setErr("Enter email and password.");return;}}
    setUser({name:form.name||form.email.split("@")[0],business:form.business,email:form.email,country:form.country,city:form.city||cities[0]||"",role:form.role});
    setMode(null);
  };
  const inp=(lbl,key,type="text",ph="",req=true)=><div style={{marginBottom:13}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>{lbl.toUpperCase()}{req&&<span style={{color:T.red,marginLeft:2}}>*</span>}</label><input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={ph} style={inputSt} /></div>;
  return(
    <div onClick={()=>setMode(null)} style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:998,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:32,width:430,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(15,44,35,0.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div><div style={{fontSize:18,fontWeight:800,color:T.headText}}>ZALORIX</div><div style={{fontSize:13,fontWeight:600,color:T.bodyText,marginTop:2}}>{mode==="signup"?"Create your account":"Welcome back"}</div></div>
          <button onClick={()=>setMode(null)} style={{background:T.pageBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,color:T.mutedText,cursor:"pointer",width:29,height:29,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>✕</button>
        </div>
        {mode==="signup"&&<>{inp("Full Name","name","text","e.g. Amara Osei")}{inp("Business Name","business","text","Optional",false)}</>}
        {inp("Email","email","email","you@example.com")}{inp("Password","password","password","Min. 8 characters")}
        {mode==="signup"&&<>
          <div style={{marginBottom:13}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>COUNTRY *</label><div style={{position:"relative"}}><select value={form.country} onChange={e=>set("country",e.target.value)} style={{...inputSt,cursor:"pointer",paddingRight:32,appearance:"none",WebkitAppearance:"none"}}>{["Africa","Europe","Americas","Asia","Middle East"].map(reg=><optgroup key={reg} label={`── ${reg} ──`}>{COUNTRIES.filter(c=>c.region===reg).map(c=><option key={c.code} value={c.code}>{FLAGS[c.code]||""} {c.name} ({c.currency})</option>)}</optgroup>)}</select><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,pointerEvents:"none",fontSize:11}}>▾</span></div></div>
          {form.country==="NG"?<div style={{marginBottom:13}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>STATE / REGIONAL NODE *</label><div style={{position:"relative"}}><select value={form.city} onChange={e=>set("city",e.target.value)} style={{...inputSt,cursor:"pointer",paddingRight:32,appearance:"none",WebkitAppearance:"none"}}><option value="">Select your state</option>{NIGERIAN_REGIONAL_NODES.map(n=><option key={n.state} value={n.primaryHub}>{n.state} — {n.primaryHub}</option>)}</select><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,pointerEvents:"none",fontSize:11}}>▾</span></div>{form.city&&<div style={{marginTop:6,display:"flex",alignItems:"center",gap:7,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:7,padding:"6px 11px"}}><span>📍</span><div><div style={{fontSize:11,fontWeight:700,color:T.accent}}>{cityToNGState(form.city)} State</div><div style={{fontSize:10,color:T.mutedText}}>Hub: {form.city}</div></div></div>}</div>:<div style={{marginBottom:13}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:4,letterSpacing:"0.07em",fontWeight:600}}>CITY *</label><div style={{position:"relative"}}><select value={form.city} onChange={e=>set("city",e.target.value)} style={{...inputSt,cursor:"pointer",paddingRight:32,appearance:"none",WebkitAppearance:"none"}}><option value="">Select city</option>{cities.map(c=><option key={c} value={c}>{c}</option>)}</select><span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:T.mutedText,pointerEvents:"none",fontSize:11}}>▾</span></div></div>}
          <div style={{marginBottom:18}}><label style={{display:"block",fontSize:10,color:T.mutedText,marginBottom:6,letterSpacing:"0.07em",fontWeight:600}}>ACCOUNT TYPE *</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>{ROLES.map(r=><button key={r} onClick={()=>set("role",r)} style={{background:form.role===r?T.accentLight:T.inputBg,border:`1px solid ${form.role===r?T.accentBorder:T.cardBorder}`,borderRadius:8,padding:"8px 6px",color:form.role===r?T.accent:T.bodyText,cursor:"pointer",fontSize:11,fontWeight:form.role===r?700:400,textAlign:"center",lineHeight:1.4,transition:"all 0.15s"}}>{r}</button>)}</div></div>
        </>}
        {err&&<div style={{fontSize:12,color:T.red,background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:8,padding:"7px 12px",marginBottom:12}}>{err}</div>}
        <button onClick={submit} style={{width:"100%",background:T.navBg,border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:12}}>{mode==="signup"?"Create Account & Enter Network":"Sign In"}</button>
        <div style={{textAlign:"center",fontSize:12,color:T.mutedText}}>{mode==="signup"?<>Have an account? <span onClick={()=>setMode("login")} style={{color:T.accent,cursor:"pointer",fontWeight:600}}>Sign in</span></>:<>No account? <span onClick={()=>setMode("signup")} style={{color:T.accent,cursor:"pointer",fontWeight:600}}>Join Zalorix</span></>}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CHECKOUT + ESCROW
// ══════════════════════════════════════════════════════════════
const ESCROW_STEPS=[{id:0,icon:"🔒",label:"Funds Held in Escrow",sub:"Payment secured. Vendor notified.",color:T.accent},{id:1,icon:"🚀",label:"Vendor Dispatched",sub:"Provider has begun fulfilling your order.",color:T.emerald},{id:2,icon:"✅",label:"Buyer Confirms Delivery",sub:"Review delivery and release or raise dispute.",color:T.gold},{id:3,icon:"💸",label:"Funds Released to Wallet",sub:"Transaction complete. Vendor wallet credited.",color:"#2e7d5b"}];
const PM=[{id:"card",label:"Global Card",icon:"💳",sub:"Visa · Mastercard · Amex",group:"global"},{id:"ussd_ng",label:"Bank Transfer/USSD",icon:"🏦",sub:"Nigeria · All major banks",group:"africa"},{id:"momo",label:"Mobile Money",icon:"📱",sub:"MTN · M-Pesa",group:"africa"},{id:"wallet",label:"Zalorix Wallet",icon:"⚡",sub:"Instant · No fee",group:"zalorix"}];

function CheckoutModal({listing,onClose}){
  const {addOrder,setToast}=useZalorix();
  const [method,setMethod]=useState("card");const [step,setStep]=useState("review");
  const cross=listing.country!=="NG";const fee=Math.round(listing.price*0.01);const crossFee=cross?Math.round(listing.price*0.015):0;const total=listing.price+fee+crossFee;
  const pay=()=>{setStep("processing");setTimeout(()=>{setStep("done");setTimeout(()=>{addOrder({listing,total,escrowStep:0});setToast("Funds secured in Escrow!");onClose();},1200);},2000);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{...cardSt,width:480,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",position:"relative",boxShadow:"0 20px 60px rgba(15,44,35,0.18)"}}>
        {step==="processing"&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.95)",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,gap:14}}><div style={{width:40,height:40,border:`3px solid ${T.accentBorder}`,borderTop:`3px solid ${T.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontSize:13,fontWeight:600,color:T.accent}}>Securing funds in escrow…</div></div>}
        {step==="done"&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.97)",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,gap:10}}><div style={{fontSize:42}}>🔒</div><div style={{fontSize:14,fontWeight:700,color:T.accent}}>Funds Secured in Escrow</div></div>}
        <div style={{padding:"22px 24px 18px",borderBottom:`1px solid ${T.divider}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.12em",marginBottom:3}}>SECURE CHECKOUT</div><div style={{fontSize:14,fontWeight:700,color:T.headText}}>{listing.title}</div><div style={{fontSize:11,color:T.mutedText,marginTop:1}}>{listing.provider} · {FLAGS[listing.country]||""} {listing.city}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.mutedText,cursor:"pointer",fontSize:19}}>✕</button>
        </div>
        <div style={{padding:"18px 24px 24px"}}>
          <div style={{background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:11,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.08em",marginBottom:10}}>ORDER SUMMARY</div>
            {[["Base Price",fmt(listing.price,listing.country)],cross&&["Cross-Border Fee (1.5%)",fmt(crossFee,listing.country)],["Escrow Protection (1%)",fmt(fee,listing.country)]].filter(Boolean).map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:12,color:T.bodyText}}>{l}</span><span style={{fontSize:12,color:T.headText,fontWeight:500}}>{v}</span></div>)}
            <div style={{borderTop:`1px solid ${T.divider}`,paddingTop:9,marginTop:4,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700,color:T.headText}}>Total Due</span><span style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmt(total,listing.country)}</span></div>
          </div>
          <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:9,padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:16}}>🛡️</span><div><div style={{fontSize:11,fontWeight:700,color:T.accent}}>Zalorix Escrow Protection Active</div><div style={{fontSize:10,color:T.mutedText,marginTop:1}}>Funds held until delivery confirmed. Dispute protection included.</div></div></div>
          <div style={{marginBottom:14}}><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.08em",marginBottom:8}}>PAYMENT METHOD</div>{PM.map(m=><button key={m.id} onClick={()=>setMethod(m.id)} style={{display:"flex",alignItems:"center",gap:11,width:"100%",padding:"10px 13px",background:method===m.id?T.accentLight:T.inputBg,border:`1px solid ${method===m.id?T.accentBorder:T.cardBorder}`,borderRadius:9,cursor:"pointer",textAlign:"left",marginBottom:5,transition:"all 0.15s"}}><span style={{fontSize:17,flexShrink:0}}>{m.icon}</span><div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:method===m.id?T.accent:T.headText}}>{m.label}</div><div style={{fontSize:10,color:T.mutedText,marginTop:1}}>{m.sub}</div></div><div style={{width:12,height:12,borderRadius:"50%",border:`2px solid ${method===m.id?T.accent:T.inputBorder}`,background:method===m.id?T.accent:"transparent",flexShrink:0}} /></button>)}</div>
          <button onClick={pay} style={{width:"100%",background:T.navBg,border:"none",borderRadius:11,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>🔒 Pay & Secure in Escrow · {fmt(total,listing.country)}</button>
        </div>
      </div>
    </div>
  );
}

function EscrowTracker({order,onClose}){
  const {updateOrder}=useZalorix();
  const step=order.escrowStep||0;
  const advance=(dir)=>updateOrder({...order,escrowStep:Math.max(0,Math.min(3,step+dir))});
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,44,35,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{...cardSt,padding:32,width:480,maxWidth:"96vw",boxShadow:"0 20px 60px rgba(15,44,35,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div><div style={{fontSize:9,color:T.mutedText,letterSpacing:"0.1em",marginBottom:3}}>ESCROW TRANSACTION</div><div style={{fontSize:15,fontWeight:700,color:T.headText,marginBottom:2}}>{order.listing.title}</div><div style={{fontSize:11,color:T.mutedText}}>{order.listing.provider}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.mutedText,cursor:"pointer",fontSize:19}}>✕</button>
        </div>
        <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:9,padding:"11px 14px",marginBottom:24,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.bodyText}}>Secured Amount</span><span style={{fontSize:17,fontWeight:800,color:T.headText}}>{fmt(order.total,order.listing.country)}</span></div>
        <div style={{position:"relative",paddingLeft:30,marginBottom:24}}>
          <div style={{position:"absolute",left:10,top:11,bottom:11,width:2,background:T.divider,borderRadius:2}} />
          <div style={{position:"absolute",left:10,top:11,width:2,height:`${(step/3)*100}%`,background:`linear-gradient(180deg,${T.accent},#2e7d5b)`,borderRadius:2,transition:"height 0.6s ease"}} />
          {ESCROW_STEPS.map((s,i)=>{const done=i<step,active=i===step;return(
            <div key={s.id} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:i<3?22:0,position:"relative"}}>
              <div style={{position:"absolute",left:-30,top:0,width:20,height:20,borderRadius:"50%",border:`2px solid ${done||active?s.color:T.divider}`,background:done?T.accentLight:active?s.color+"22":T.cardBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,zIndex:1,flexShrink:0}}>
                {done?<span style={{color:T.accent,fontSize:11,fontWeight:700}}>✓</span>:<span style={{opacity:active?1:0.3}}>{s.icon}</span>}
              </div>
              <div><div style={{fontSize:13,fontWeight:active||done?600:400,color:active?s.color:done?T.mutedText:T.cardBorder}}>{s.label}</div>{active&&<div style={{fontSize:11,color:T.mutedText,marginTop:2}}>{s.sub}</div>}</div>
            </div>
          );})}
        </div>
        {step<3?<div style={{display:"flex",gap:9}}>{step===2&&<button onClick={()=>advance(-1)} style={{flex:1,background:T.redLight,border:`1px solid ${T.badge4Border}`,borderRadius:9,padding:"11px",color:T.red,cursor:"pointer",fontSize:12,fontWeight:600}}>🚩 Raise Dispute</button>}<button onClick={()=>advance(1)} style={{flex:1,background:T.navBg,border:"none",borderRadius:9,padding:"11px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700}}>{step===0?"Notify Vendor →":step===1?"Confirm Receipt →":"✓ Release Funds"}</button></div>:<div style={{textAlign:"center",background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:11,padding:"14px"}}><div style={{fontSize:18,marginBottom:5}}>🎉</div><div style={{fontSize:13,fontWeight:700,color:T.accent}}>Transaction Complete</div><div style={{fontSize:11,color:T.mutedText,marginTop:3}}>Funds released to vendor wallet.</div></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INLINE CHAT PANEL
// ══════════════════════════════════════════════════════════════
function InlineChatPanel({listingId,onClose}){
  const {state,updateConversation,addConversation}=useZalorix();
  const {listings,conversations}=state;
  const listing=listings.find(l=>l.id===listingId);
  const [msg,setMsg]=useState("");
  const convId="chat_"+listingId;
  const conv=conversations.find(c=>c.id===convId);
  const msgs=conv?.messages||[];
  const send=()=>{
    if(!msg.trim()||!listing)return;
    const newMsg={from:"me",text:msg,time:"just now"};
    if(conv){updateConversation({...conv,messages:[...conv.messages,newMsg],lastMsg:msg,time:"just now"});}
    else{addConversation({id:convId,contact:listing.provider,avatar:(listing.provider||"").slice(0,2).toUpperCase(),country:listing.country,lastMsg:msg,time:"just now",unread:0,listing:listing.title,messages:[newMsg]});}
    setMsg("");
    setTimeout(()=>{const reply={from:"them",text:"Thanks for your inquiry! Our team will respond within 2 business hours.",time:"just now"};const updated=conversations.find(c=>c.id===convId);if(updated)updateConversation({...updated,messages:[...updated.messages,newMsg,reply]});},1000);
  };
  if(!listing)return null;
  return(
    <div style={{width:308,background:T.cardBg,borderLeft:`1px solid ${T.cardBorder}`,display:"flex",flexDirection:"column",flexShrink:0,boxShadow:"-4px 0 20px rgba(15,44,35,0.06)"}}>
      <div style={{padding:"13px 14px 10px",borderBottom:`1px solid ${T.divider}`,background:T.navBg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Negotiation Terminal</div><div style={{fontSize:9,color:T.navText,marginTop:1}}>{listing.provider}</div></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",fontSize:14,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{padding:"9px 13px",background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`}}><div style={{fontSize:11,fontWeight:700,color:T.accent}}>{listing.title}</div><div style={{fontSize:9,color:T.mutedText,marginTop:1}}>{FLAGS[listing.country]||""} {listing.city} · {fmt(listing.price,listing.country)}</div></div>
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:9,background:T.pageBg}}>
        {!msgs.length&&<div style={{fontSize:11,color:T.mutedText,textAlign:"center",marginTop:16}}>Send a message to start negotiating</div>}
        {msgs.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start"}}><div style={{maxWidth:"78%",padding:"8px 12px",borderRadius:m.from==="me"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.from==="me"?T.navBg:T.cardBg,color:m.from==="me"?"#fff":T.bodyText,fontSize:12,lineHeight:1.5,border:m.from==="me"?"none":`1px solid ${T.cardBorder}`}}>{m.text}</div></div>)}
      </div>
      <div style={{padding:10,borderTop:`1px solid ${T.divider}`,display:"flex",gap:7,background:T.cardBg}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your inquiry…" style={{...inputSt,flex:1,fontSize:12}} />
        <button onClick={send} style={{background:T.navBg,border:"none",borderRadius:8,padding:"7px 12px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>↑</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
function AppInner(){
  const {state,setNav,setSearch,setToast,setUser}=useZalorix();
  const {user,activeNav,search,toast,orders}=state;
  const [authMode,setAuthMode]=useState(null);
  const [showBroadcast,setShowBroadcast]=useState(false);
  const [chatId,setChatId]=useState(null);
  const [checkoutListing,setCheckoutListing]=useState(null);
  const [activeOrder,setActiveOrder]=useState(null);
  const [notifOpen,setNotifOpen]=useState(false);

  const userCC=user?COUNTRIES.find(c=>c.code===user.country):null;
  const unread=state.conversations.reduce((a,c)=>a+(c.unread||0),0);

  // expose setAuthModal to context consumers via a workaround
  const setAuthModal=useCallback(mode=>setAuthMode(mode),[]);

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.pageBg,color:T.headText,fontFamily:"'Inter',system-ui,sans-serif",fontSize:14,overflow:"hidden"}}>
      <TickerRibbon />
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      {/* SIDEBAR */}
      <div style={{width:226,background:T.navBg,borderRight:`1px solid ${T.navBorder}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"24px 20px 18px",borderBottom:`1px solid ${T.navBorder}`}}>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:"0.02em",color:"#fff"}}>ZALORIX</div>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"0.18em",marginTop:3}}>GLOBAL TRADE NETWORK</div>
        </div>
        <nav style={{flex:1,padding:"12px 10px",overflowY:"auto"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setNav(n.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",background:activeNav===n.id?T.navActive:"transparent",border:"none",borderRadius:8,color:activeNav===n.id?"#fff":T.navText,cursor:"pointer",fontSize:13,fontWeight:activeNav===n.id?600:400,marginBottom:2,transition:"all 0.15s",textAlign:"left",position:"relative"}}>
              <span style={{fontSize:14,opacity:activeNav===n.id?1:0.7}}>{n.icon}</span>{n.label}
              {n.id==="messages"&&unread>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"#fff",borderRadius:99,fontSize:9,padding:"1px 5px",fontWeight:800}}>{unread}</span>}
            </button>
          ))}
        </nav>
        {orders.length>0&&<div style={{padding:"0 10px 8px"}}><button onClick={()=>setActiveOrder(orders[0])} style={{width:"100%",background:"rgba(26,122,74,0.2)",border:"1px solid rgba(26,122,74,0.35)",borderRadius:9,padding:"8px 12px",color:"#7de0a8",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>🔒 {orders.length} Active Escrow{orders.length>1?"s":""}</button></div>}
        {user&&<div style={{padding:"0 10px 10px"}}><button onClick={()=>setShowBroadcast(true)} style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.17)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}><span>✦</span>+ Broadcast Ad</button></div>}
        <div style={{padding:"12px 18px",borderTop:`1px solid ${T.navBorder}`}}>
          {user?<div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{user.name.slice(0,2).toUpperCase()}</div><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div><div style={{fontSize:9,color:T.navText,marginTop:1}}>{user.role}</div></div></div>:<div style={{display:"flex",flexDirection:"column",gap:6}}><button onClick={()=>setAuthMode("login")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"7px",color:"rgba(255,255,255,0.8)",cursor:"pointer",fontSize:12}}>Sign In</button><button onClick={()=>setAuthMode("signup")} style={{background:"rgba(255,255,255,0.95)",border:"none",borderRadius:8,padding:"7px",color:T.navBg,cursor:"pointer",fontSize:12,fontWeight:700}}>Join Zalorix</button></div>}
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Top bar */}
        <div style={{height:60,background:T.topBarBg,borderBottom:`1px solid ${T.topBarBorder}`,display:"flex",alignItems:"center",padding:"0 22px",gap:12,flexShrink:0}}>
          <div style={{flex:1,position:"relative",maxWidth:440}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings, providers, categories…" style={{...inputSt,padding:"7px 13px 7px 36px"}} /><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.mutedText,fontSize:14}}>🔍</span></div>
          {user&&<div style={{display:"flex",alignItems:"center",gap:5,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"5px 11px",fontSize:12}}><span style={{color:T.accent,fontWeight:800}}>{userCC?.currency}</span><span style={{color:T.mutedText,fontSize:10}}>{user.country}</span></div>}
          {user&&<button onClick={()=>setShowBroadcast(true)} style={{background:T.navBg,border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:11}}>✦</span>Post</button>}
          <div style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(o=>!o)} style={{background:T.inputBg,border:`1px solid ${T.cardBorder}`,borderRadius:8,padding:"7px 13px",color:T.headText,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:5}}>🔔<span style={{background:T.red,color:"#fff",borderRadius:99,fontSize:9,padding:"1px 5px",fontWeight:700}}>3</span></button>
            {notifOpen&&<div style={{position:"absolute",right:0,top:44,width:290,background:T.cardBg,border:`1px solid ${T.cardBorder}`,borderRadius:11,zIndex:100,padding:10,boxShadow:"0 8px 32px rgba(15,44,35,0.12)"}}>{["3 new offers on your broadcast","Vendor responded to your inquiry","New match in Global Explorer"].map((n,i)=><div key={i} style={{padding:"8px 11px",borderRadius:7,marginBottom:5,background:T.inputBg,fontSize:12,color:T.bodyText,borderLeft:`3px solid ${T.accent}`}}>{n}</div>)}</div>}
          </div>
          {user?<div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>{FLAGS[user.country]||"🌐"}</span><div style={{width:32,height:32,borderRadius:"50%",background:T.navBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",cursor:"pointer",border:`2px solid ${T.accentBorder}`}} onClick={()=>setUser(null)} title="Sign out">{user.name.slice(0,2).toUpperCase()}</div></div>:<button onClick={()=>setAuthMode("signup")} style={{background:T.navBg,border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Join Now</button>}
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:activeNav==="about"?"hidden":"auto",padding:activeNav==="about"?0:22,display:"flex",gap:18}}>
          {activeNav==="feed"&&<FeedView />}
          {activeNav==="explorer"&&<ExplorerView onBuy={l=>user?setCheckoutListing(l):setAuthMode("signup")} onChat={id=>setChatId(id)} />}
          {activeNav==="radar"&&<TradeRadarView />}
          {activeNav==="broadcasts"&&<BroadcastsView />}
          {activeNav==="messages"&&<MessagesView />}
          {activeNav==="insights"&&<InsightsView />}
          {activeNav==="listing_insights"&&<ListingInsightsPanel />}
          {activeNav==="wallet"&&<WalletView />}
          {activeNav==="about"&&<AboutView />}
        </div>
      </div>

      {/* INLINE CHAT */}
      {chatId&&activeNav!=="messages"&&<InlineChatPanel listingId={chatId} onClose={()=>setChatId(null)} />}

      {/* OVERLAYS */}
      {checkoutListing&&user&&<CheckoutModal listing={checkoutListing} onClose={()=>setCheckoutListing(null)} />}
      {activeOrder&&<EscrowTracker order={activeOrder} onClose={()=>setActiveOrder(null)} />}
      {showBroadcast&&user&&<BroadcastDrawer onClose={()=>setShowBroadcast(false)} />}
      {authMode&&<AuthModal mode={authMode} setMode={setAuthMode} />}
      {toast&&<Toast msg={toast} />}
      <LiveToastStack onViewRadar={()=>setNav("radar")} onNewRequest={(req)=> {console.log("New request:", req); }}/>
      </div>
    </div>
  );
}

// Provide setAuthModal via a small bridge for AboutView
const AuthModalCtx=createContext(()=>{});
function AboutViewBridged(){
  const setAuthModal=useContext(AuthModalCtx);
  const {state,setNav}=useZalorix();
  return <AboutView setNav={setNav} user={state.user} setAuthModal={setAuthModal} />;
}

export default function App(){
  return(
    <ZalorixProvider>
      <AppInner />
    </ZalorixProvider>
  );
}