import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {supabase} from "./supabase";

type Row = {id:string;title?:string;name?:string;slug?:string;excerpt?:string;short_bio?:string;category?:string;author?:string;publish_date?:string;display_name?:string;logo?:string;website_url?:string;app_slugs?:string[];type?:string;is_important?:boolean;body?:string};
const configs = {
  builders:{table:"builders",select:"id,display_name,slug,logo,short_bio,website_url,app_slugs,display_order",label:"سازندگان",empty:"هنوز سازندهٔ عمومی ثبت نشده است."},
  tutorials:{table:"tutorials",select:"id,title,slug,excerpt,category,author,publish_date,display_order",label:"آموزش‌ها",empty:"هنوز آموزش منتشر نشده است."},
  news:{table:"news",select:"id,title,slug,excerpt,category,author,publish_date,display_order",label:"اخبار",empty:"هنوز خبری منتشر نشده است."},
  announcements:{table:"announcements",select:"id,title,slug,excerpt,type,is_important,publish_date,display_order",label:"اعلان‌ها",empty:"هنوز اطلاعیه‌ای منتشر نشده است."}
} as const;
type Kind=keyof typeof configs;
export function ContentPage({kind}:{kind:Kind}){
 const cfg=configs[kind]; const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{let active=true;async function load(){if(!supabase){setLoading(false);return;}const {data,error}=await supabase.from(cfg.table).select(cfg.select).eq("status","published").order("display_order",{ascending:true});if(!active)return;if(error)setError(error.message);else setRows((data??[]) as Row[]);setLoading(false);}load();return()=>{active=false};},[cfg]);
 return <section className="container section"><div className="content-list">{loading?<div className="empty">در حال بارگذاری...</div>:error?<div className="notice warning">{error}</div>:!supabase?<div className="empty">برای نمایش محتوای واقعی، اتصال عمومی Supabase باید در تنظیمات محیطی سایت وارد شود.</div>:!rows.length?<div className="empty">{cfg.empty}</div>:rows.map(row=><article className="content-card content-item" key={row.id}><span className="eyebrow">{row.category||row.type||cfg.label}</span><h2>{row.display_name||row.title||row.name}</h2><p>{row.short_bio||row.excerpt||"برای اطلاعات بیشتر با این بخش همراه باشید."}</p>{row.is_important&&<span className="notice warning">اطلاعیه مهم</span>}{row.author&&<small className="muted">نویسنده: {row.author}</small>}{row.publish_date&&<small className="muted">تاریخ انتشار: {row.publish_date}</small>}{row.website_url&&<a className="text-link" href={row.website_url} target="_blank" rel="noreferrer">وب‌سایت سازنده</a>}</article>)}</div><div className="content-card" style={{marginTop:24}}><p className="muted">این صفحه مستقیماً از جدول مربوط به خودش در Supabase می‌خواند؛ هیچ واسطهٔ Base44 در مسیر دریافت اطلاعات استفاده نمی‌شود.</p><Link className="text-link" to="/">بازگشت به صفحهٔ اصلی</Link></div></section>
}
