import {emptyWorkspace} from "../lib/model";
import {saveSchema} from "../lib/validation";
declare const __JS__:string;declare const __CSS__:string;declare const __ICON__:string;
type Statement={bind(...args:unknown[]):Statement;first<T>():Promise<T|null>};
export type Env={DB?:{prepare(sql:string):Statement}};
const security={"X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin","Permissions-Policy":"camera=(), microphone=(), geolocation=()"};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{...security,"Cache-Control":"no-store"}});
function identity(request:Request){const id=request.headers.get("oai-authenticated-user-id");const email=request.headers.get("oai-authenticated-user-email");return id&&email?id:null;}
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Review your cleaning contract costs, spot margin drift, and prepare clear pricing discussions."><title>CleanMargin | Every contract counts</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>';
async function workspace(request:Request,env:Env){
 const owner=identity(request);if(!owner)return json({error:"Sign in to open your workspace."},401);
 if(!env.DB)return json({error:"Storage is temporarily unavailable. Your draft has not been saved."},503);
 const db=env.DB;
 if(request.method==="GET"){const row=await db.prepare("SELECT data, revision FROM workspaces WHERE owner = ?").bind(owner).first<{data:string;revision:number}>();return json(row?{data:JSON.parse(row.data),revision:row.revision}:{data:emptyWorkspace,revision:0});}
 if(request.method!=="PUT")return json({error:"Method not allowed."},405);
 if(request.headers.get("origin")!==new URL(request.url).origin)return json({error:"Request origin rejected."},403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return json({error:"JSON is required."},415);
 if(Number(request.headers.get("content-length")||0)>950000)return json({error:"Workspace is too large. Export your records and contact support."},413);
 const reader=request.body?.getReader();if(!reader)return json({error:"Missing body."},400);
 const chunks:Uint8Array[]=[];let length=0;
 while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>950000){await reader.cancel();return json({error:"Workspace is too large."},413);}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 let raw:unknown;try{raw=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:"Invalid JSON."},400);}
 const checked=saveSchema.safeParse(raw);if(!checked.success)return json({error:checked.error.issues[0]?.message||"Invalid input."},400);
 const {data,revision}=checked.data;const payload=JSON.stringify(data);const now=new Date().toISOString();
 const result=revision===0
 ?await db.prepare("INSERT INTO workspaces(owner, data, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(owner) DO NOTHING RETURNING revision").bind(owner,payload,now).first<{revision:number}>()
 :await db.prepare("UPDATE workspaces SET data = ?, revision = revision + 1, updated_at = ? WHERE owner = ? AND revision = ? RETURNING revision").bind(payload,now,owner,revision).first<{revision:number}>();
 if(!result)return json({error:"This workspace changed in another tab. Keep your draft, close the dialog, reload saved data, and reapply your changes."},409);
 return json({revision:result.revision});
}
export default {async fetch(request:Request,env:Env){
 try{const url=new URL(request.url);
 if(url.pathname==="/api/me"&&request.method==="GET")return json({signedIn:!!identity(request)});
 if(url.pathname==="/api/workspace")return await workspace(request,env);
 if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed",{status:405,headers:security});
 const assets:Record<string,[string,string]>={"/app.js":[__JS__,"text/javascript; charset=utf-8"],"/app.css":[__CSS__,"text/css; charset=utf-8"],"/favicon.svg":[__ICON__,"image/svg+xml"],"/":[html,"text/html; charset=utf-8"]};
 const asset=assets[url.pathname];if(!asset)return new Response("Not found",{status:404,headers:security});
 return new Response(request.method==="HEAD"?null:asset[0],{headers:{...security,"Content-Type":asset[1],"Cache-Control":"no-cache","Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'"}});
 }catch(error){console.error("Request failed",error instanceof Error?error.message:"unknown");return json({error:"Could not complete the request. Your draft is still open; please retry."},503);}
}};
