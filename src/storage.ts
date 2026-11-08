import {supabase,storageBucket} from "./supabase";
function client(){if(!supabase)throw new Error("تنظیمات Supabase کامل نیست.");return supabase.storage.from(storageBucket);}
export async function uploadFile(file:File,path:string){const {data,error}=await client().upload(path,file,{upsert:false,cacheControl:"3600"});if(error)throw new Error(error.message);return data.path;}
export async function removeFile(path:string){const {error}=await client().remove([path]);if(error)throw new Error(error.message);}
export async function createDownloadUrl(path:string,expiresIn=300){const {data,error}=await client().createSignedUrl(path,expiresIn);if(error)throw new Error(error.message);return data.signedUrl;}
export function publicFileUrl(path:string){if(!supabase)throw new Error("تنظیمات Supabase کامل نیست.");return supabase.storage.from(storageBucket).getPublicUrl(path).data.publicUrl;}
