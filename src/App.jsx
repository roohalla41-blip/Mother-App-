import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, BookOpen, Boxes, CheckCircle2, Download,
  FileText, LayoutDashboard, LogIn, LogOut, Menu, MessageCircle,
  Newspaper, Search, ShieldCheck, Sparkles, X
} from "lucide-react";
import { isSupabaseConfigured, supabase, loadPublishedApps, loadPublicContent } from "./lib/supabase.js";

const demoApps = [
  { id:"sample-1", name:"حساب صراف", slug:"hisab-sarraf", tagline:"مدیریت حرفه‌ای حساب و عملیات صرافی", description:"سامانه مدیریت مشتریان، صندوق‌ها و عملیات مالی صرافی.", category:"مالی و حسابداری", price:"free", version:"1.0.1", status:"published", icon:"💱", is_popular:true, features:["مدیریت مشتریان","صندوق و گردش حساب","گزارش‌های مالی"] },
  { id:"sample-2", name:"ابزار مدیریت", slug:"management-tools", tagline:"ابزارهای کاربردی برای کسب‌وکار", description:"مجموعه ابزارهای مدیریت و سازمان‌دهی کارها.", category:"ابزار", price:"free", version:"1.0.0", status:"published", icon:"🧰", features:["مدیریت کارها","گزارش‌گیری"] },
  { id:"sample-3", name:"دستیار هوشمند", slug:"smart-assistant", tagline:"دستیار هوشمند محصولات مادر", description:"راهنمای استفاده از محصولات و پاسخ‌گویی به پرسش‌ها.", category:"هوش مصنوعی", price:"free", version:"به‌زودی", status:"coming_soon", icon:"✨", features:["راهنمای هوشمند"] }
];

function Header({ session, onSignOut }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" to="/"><span className="brand-mark"><Boxes size={23}/></span><span><b>مادر هاب</b><small>مرکز محصولات نرم‌افزاری</small></span></Link>
    <button className="mobile-menu" aria-label="باز کردن منو" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    <nav className={open ? "nav open" : "nav"}>
      <NavLink to="/" onClick={() => setOpen(false)}>خانه</NavLink>
      <NavLink to="/apps" onClick={() => setOpen(false)}>برنامه‌ها</NavLink>
      <NavLink to="/tutorials" onClick={() => setOpen(false)}>آموزش‌ها</NavLink>
      <NavLink to="/news" onClick={() => setOpen(false)}>اخبار</NavLink>
      <NavLink to="/support" onClick={() => setOpen(false)}>پشتیبانی</NavLink>
    </nav>
    {session ? <div className="header-actions"><Link className="btn btn-soft" to="/builder-panel"><LayoutDashboard size={17}/> پنل سازنده</Link><button className="icon-btn" title="خروج" onClick={onSignOut}><LogOut size={18}/></button></div>
      : <Link className="btn btn-primary login-link" to="/login"><LogIn size={17}/> ورود سازنده</Link>}
  </div></header>;
}

function AppCard({ app }) {
  return <article className="app-card">
    <div className="app-card-top"><div className="app-icon" style={{background:app.gradient || "linear-gradient(135deg,#e0e7ff,#dbeafe)"}}>{app.icon || "📦"}</div><div className="app-card-labels">{app.is_popular && <span className="pill pill-gold">محبوب</span>}<span className="pill">{app.category || "نرم‌افزار"}</span></div></div>
    <h3>{app.name}</h3><p>{app.tagline || app.description || "اطلاعات این محصول به‌زودی تکمیل می‌شود."}</p>
    <div className="feature-list">{(app.features || []).slice(0,3).map((f,i)=><span key={i}><CheckCircle2 size={14}/>{f}</span>)}</div>
    <div className="card-footer"><span className={app.status === "published" ? "status status-live" : "status"}>{app.status === "published" ? "منتشرشده" : app.status === "updating" ? "در حال به‌روزرسانی" : "به‌زودی"}</span><Link className="text-link" to={`/apps/${app.slug}`}>مشاهده <ArrowLeft size={15}/></Link></div>
  </article>;
}

function Home({ apps }) {
  const featured = apps.filter(a => a.status === "published").slice(0,3);
  return <><section className="hero"><div className="container hero-grid"><div><span className="eyebrow"><Sparkles size={15}/> یک خانه برای محصولات دیجیتال</span><h1>محصولات کاربردی،<br/><em>در یک نقطه</em></h1><p>مادر هاب مرکز معرفی، انتشار، آموزش و دریافت نسخه‌های رسمی محصولات نرم‌افزاری است.</p><div className="hero-actions"><Link className="btn btn-primary" to="/apps">مشاهده برنامه‌ها <ArrowUpRight size={18}/></Link><Link className="btn btn-outline" to="/about">آشنایی با مادر هاب</Link></div><div className="hero-proof"><ShieldCheck size={17}/> نسخه‌ها و اطلاعیه‌ها از مرجع رسمی محصول</div></div><div className="hero-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="hero-cube"><Boxes size={76}/><span>HUB</span></div><div className="float-chip chip-one"> <Download size={16}/> دریافت نسخه‌ها</div><div className="float-chip chip-two"><BookOpen size={16}/> آموزش و راهنما</div></div></div></section>
  <section className="section container"><div className="section-heading"><div><span className="eyebrow">منتخب مادر هاب</span><h2>برنامه‌های منتشرشده</h2><p>محصولات رسمی و به‌روز را از اینجا پیدا کنید.</p></div><Link className="text-link" to="/apps">همه برنامه‌ها <ArrowLeft size={16}/></Link></div><div className="app-grid">{featured.length ? featured.map(a=><AppCard key={a.id} app={a}/>) : <Empty message="هنوز برنامه‌ای منتشر نشده است."/>}</div></section>
  <section className="section section-muted"><div className="container"><div className="section-heading"><div><span className="eyebrow">امکانات پلتفرم</span><h2>بیشتر از یک صفحه دانلود</h2></div></div><div className="benefit-grid"><Benefit icon={<Download/>} title="نسخه‌های رسمی" text="مدیریت نسخه‌های وب، اندروید و سایر خروجی‌ها در یک مرجع."/><Benefit icon={<BookOpen/>} title="آموزش و راهنما" text="راهنمای استفاده از محصولات و محتوای آموزشی."/><Benefit icon={<MessageCircle/>} title="پشتیبانی یکپارچه" text="ارسال درخواست و پیگیری ارتباط با سازنده."/><Benefit icon={<ShieldCheck/>} title="مدیریت متمرکز" text="پنل سازنده برای مدیریت محتوا و انتشار محصولات." /></div></div></section></>;
}
function Benefit({icon,title,text}) { return <div className="benefit"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>; }
function Empty({message}) { return <div className="empty-state"><Boxes size={30}/><p>{message}</p></div>; }

function AppsPage({apps}) {
  const [q,setQ] = useState(""); const [category,setCategory] = useState("همه");
  const categories = ["همه", ...new Set(apps.map(a=>a.category).filter(Boolean))];
  const filtered = apps.filter(a => (category==="همه" || a.category===category) && (a.name+" "+(a.tagline||"")+" "+(a.description||"")).toLowerCase().includes(q.toLowerCase()));
  return <main className="container page"><PageTitle eyebrow="کتابخانه محصولات" title="فهرست برنامه‌ها" subtitle="برنامه موردنظر خود را جست‌وجو و بررسی کنید."/><div className="toolbar"><label className="searchbox"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="جست‌وجوی نام یا توضیحات برنامه..."/></label><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div><div className="app-grid">{filtered.map(a=><AppCard key={a.id} app={a}/>)}</div>{!filtered.length && <Empty message="نتیجه‌ای برای جست‌وجوی شما پیدا نشد."/>}</main>;
}
function PageTitle({eyebrow,title,subtitle}) { return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>; }

function AppDetail({apps}) {
  const {slug} = useParamsCompat(); const app = apps.find(a=>a.slug===slug);
  if (!app) return <main className="container page"><Empty message="این برنامه پیدا نشد یا هنوز منتشر نشده است."/></main>;
  return <main className="container page"><Link to="/apps" className="back-link">← بازگشت به برنامه‌ها</Link><div className="detail-card"><div className="app-icon detail-icon">{app.icon || "📦"}</div><span className="eyebrow">{app.category || "نرم‌افزار"}</span><h1>{app.name}</h1><h3>{app.tagline}</h3><p>{app.description || app.full_description || "توضیحات تکمیلی این برنامه به‌زودی منتشر می‌شود."}</p><div className="detail-meta"><span>نسخه: {app.version || "—"}</span><span>وضعیت: {app.status === "published" ? "منتشرشده" : "در حال آماده‌سازی"}</span><span>{app.price === "paid" ? (app.price_label || "پولی") : "رایگان"}</span></div>{app.status === "published" && <Link className="btn btn-primary" to={`/apps/${app.slug}/download`}>صفحه دریافت نسخه‌ها <Download size={17}/></Link>}</div></main>;
}
function useParamsCompat(){ return requireParams(); }
function requireParams(){ return window.__motherHubParams || {}; }

function DownloadPage({apps}) {
  const slug = window.location.pathname.split("/")[2]; const app = apps.find(a=>a.slug===slug);
  return <main className="container page"><PageTitle eyebrow="دریافت محصول" title={app ? `دریافت ${app.name}` : "صفحه دریافت نسخه‌ها"} subtitle="فقط نسخه‌هایی که سازنده منتشر کرده است در این بخش نمایش داده می‌شود."/><div className="notice"><ShieldCheck/> لینک دانلود زمانی نمایش داده می‌شود که نسخه فعال در پنل سازنده ثبت شده باشد.</div>{app?.download_url && <a className="btn btn-primary" href={app.download_url} target="_blank" rel="noreferrer">دریافت فایل <Download size={17}/></a>}</main>;
}

function ContentPage({title,eyebrow,items,empty}) {
  return <main className="container page"><PageTitle eyebrow={eyebrow} title={title} subtitle="محتوای رسمی منتشرشده در مادر هاب."/><div className="content-grid">{items.map(item=><article className="content-card" key={item.id}><span className="pill">{item.category || item.type || "اطلاع‌رسانی"}</span><h3>{item.title}</h3><p>{item.excerpt || item.body?.slice(0,180)}</p><small>{item.publish_date || item.created_at?.slice(0,10) || ""}</small></article>)}</div>{!items.length && <Empty message={empty}/>}</main>;
}

function Login({onLogin}) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setBusy(true);setError("");const {error}=await onLogin(email,password);if(error)setError(error.message || "ورود انجام نشد.");setBusy(false);}
  return <main className="container page narrow"><div className="login-card"><span className="login-icon"><ShieldCheck size={27}/></span><PageTitle eyebrow="دسترسی مدیریت" title="ورود سازنده" subtitle="برای ورود به پنل مدیریت از حساب مجاز استفاده کنید."/><form onSubmit={submit} className="form"><label>ایمیل<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label><label>رمز عبور<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="رمز عبور"/></label>{error && <p className="error">{error}</p>}<button className="btn btn-primary full" disabled={busy || !isSupabaseConfigured}>{busy?"در حال ورود...":"ورود امن"}</button>{!isSupabaseConfigured && <p className="muted-note">ابتدا تنظیمات اتصال Supabase را در متغیرهای محیطی وارد کنید.</p>}</form></div></main>;
}

function BuilderPanel({apps,onRefresh}) {
  const [section,setSection]=useState("apps"); const [name,setName]=useState(""); const [slug,setSlug]=useState(""); const [tagline,setTagline]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function addApp(e){e.preventDefault();setBusy(true);setMessage("");const {error}=await supabase.from("apps").insert({name,slug,tagline,status:"draft",price:"free",features:[],use_cases:[],show_on_homepage:false,display_order:0});setBusy(false);if(error){setMessage(error.message);return;}setName("");setSlug("");setTagline("");setMessage("برنامه به‌صورت پیش‌نویس ایجاد شد.");onRefresh();}
  async function publish(id){const {error}=await supabase.from("apps").update({status:"published"}).eq("id",id);setMessage(error?error.message:"وضعیت انتشار به‌روزرسانی شد.");onRefresh();}
  return <main className="container page"><PageTitle eyebrow="مدیریت مادر هاب" title="پنل سازنده" subtitle="مدیریت محصولات و کنترل محتوای منتشرشده."/><div className="admin-layout"><aside className="admin-sidebar"><button className={section==="apps"?"active":""} onClick={()=>setSection("apps")}><Boxes/> برنامه‌ها</button><button className={section==="overview"?"active":""} onClick={()=>setSection("overview")}><LayoutDashboard/> نمای کلی</button><Link to="/"><ArrowLeft/> مشاهده سایت</Link></aside><section className="admin-main">{section==="overview"?<div className="stats-grid"><Stat label="کل برنامه‌ها" value={apps.length}/><Stat label="منتشرشده" value={apps.filter(a=>a.status==="published").length}/><Stat label="پیش‌نویس / آماده‌سازی" value={apps.filter(a=>a.status!=="published").length}/></div>:<><div className="admin-heading"><div><h2>مدیریت برنامه‌ها</h2><p>افزودن محصول جدید و کنترل وضعیت انتشار</p></div><span className="pill">{apps.length} محصول</span></div><form className="quick-form" onSubmit={addApp}><h3>افزودن برنامه</h3><div className="form-row"><input required value={name} onChange={e=>setName(e.target.value)} placeholder="نام برنامه"/><input required value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} placeholder="شناسه انگلیسی (slug)"/><input value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="شعار کوتاه"/></div><button className="btn btn-primary" disabled={busy}>{busy?"در حال ثبت...":"ایجاد پیش‌نویس"}</button></form><div className="admin-list">{apps.map(a=><div className="admin-row" key={a.id}><div><b>{a.name}</b><small>{a.slug} · {a.version || "بدون نسخه"}</small></div><span className="status">{a.status==="published"?"منتشرشده":"پیش‌نویس / آماده‌سازی"}</span>{a.status!=="published" && <button className="btn btn-soft small" onClick={()=>publish(a.id)}>انتشار</button>}</div>)}</div></>}{message&&<p className={message.includes("شد")?"success":"error"}>{message}</p>}</section></div></main>;
}
function Stat({label,value}){return <div className="stat-card"><small>{label}</small><strong>{value}</strong></div>;}

export default function App() {
  const [session,setSession]=useState(null); const [apps,setApps]=useState(demoApps); const [tutorials,setTutorials]=useState([]); const [news,setNews]=useState([]); const [announcements,setAnnouncements]=useState([]);
  const [loading,setLoading]=useState(isSupabaseConfigured); const navigate=useNavigate();
  async function refreshApps(){if(!supabase)return;try{const {data,error}=await supabase.from("apps").select("*").order("display_order",{ascending:true});if(error)throw error;setApps(data ?? []);}catch(e){console.error("Loading apps failed",e);}}
  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    Promise.all([loadPublishedApps(),loadPublicContent("tutorials"),loadPublicContent("news"),loadPublicContent("announcements")])
      .then(([a,t,n,an])=>{setApps(a);setTutorials(t);setNews(n);setAnnouncements(an);})
      .catch(e=>console.error("Public content load failed",e))
      .finally(()=>setLoading(false));
    return ()=>subscription.unsubscribe();
  },[]);
  async function login(email,password){if(!supabase)return {error:new Error("اتصال Supabase تنظیم نشده است.")};return await supabase.auth.signInWithPassword({email,password});}
  async function signOut(){await supabase?.auth.signOut();setSession(null);navigate("/");}
  const authorized = Boolean(session?.user?.app_metadata?.role==="builder" || session?.user?.app_metadata?.role==="admin");
  return <><Header session={authorized} onSignOut={signOut}/>{loading&&<div className="loading-bar"/>}<Routes>
    <Route path="/" element={<Home apps={apps}/>}/>
    <Route path="/apps" element={<AppsPage apps={apps}/>}/>
    <Route path="/apps/:slug" element={<AppDetail apps={apps}/>}/>
    <Route path="/apps/:slug/download" element={<DownloadPage apps={apps}/>}/>
    <Route path="/tutorials" element={<ContentPage title="آموزش‌ها" eyebrow="یادگیری و راهنما" items={tutorials} empty="هنوز آموزشی منتشر نشده است."/>}/>
    <Route path="/news" element={<ContentPage title="اخبار و به‌روزرسانی‌ها" eyebrow="تازه‌های مادر هاب" items={news} empty="هنوز خبری منتشر نشده است."/>}/>
    <Route path="/announcements" element={<ContentPage title="اعلان‌ها" eyebrow="اطلاع‌رسانی" items={announcements} empty="اعلانی ثبت نشده است."/>}/>
    <Route path="/about" element={<main className="container page"><PageTitle eyebrow="درباره ما" title="مادر هاب چیست؟" subtitle="مرکز معرفی، انتشار و دریافت محصولات نرم‌افزاری."/></main>}/>
    <Route path="/support" element={<main className="container page"><PageTitle eyebrow="ارتباط با ما" title="پشتیبانی" subtitle="برای پشتیبانی، از مسیر رسمی محصول موردنظر اقدام کنید."/></main>}/>
    <Route path="/privacy" element={<main className="container page"><PageTitle eyebrow="قوانین" title="حریم خصوصی" subtitle="سیاست حفظ و پردازش اطلاعات در حال تکمیل است."/></main>}/>
    <Route path="/terms" element={<main className="container page"><PageTitle eyebrow="قوانین" title="شرایط استفاده" subtitle="شرایط استفاده از خدمات مادر هاب در حال تکمیل است."/></main>}/>
    <Route path="/login" element={<Login onLogin={login}/>}/>
    <Route path="/builder-panel" element={authorized?<BuilderPanel apps={apps} onRefresh={refreshApps}/>:<Login onLogin={login}/>}/>
    <Route path="*" element={<main className="container page"><Empty message="صفحه موردنظر پیدا نشد."/></main>}/>
  </Routes><footer className="footer"><div className="container footer-inner"><div className="brand"><span className="brand-mark"><Boxes size={20}/></span><span><b>مادر هاب</b><small>مرکز محصولات نرم‌افزاری</small></span></div><span>© {new Date().getFullYear()} مادر هاب</span><div className="footer-links"><Link to="/privacy">حریم خصوصی</Link><Link to="/terms">شرایط استفاده</Link><Link to="/announcements">اعلان‌ها</Link></div></div></footer></>;
}