import {createServer} from "node:http";
import {DatabaseSync} from "node:sqlite";
import {mkdir,readFile,readdir} from "node:fs/promises";
import {pathToFileURL} from "node:url";
import path from "node:path";
await mkdir(".sites-runtime",{recursive:true});
const db=new DatabaseSync(".sites-runtime/local.sqlite");
db.exec("CREATE TABLE IF NOT EXISTS _local_migrations(name TEXT PRIMARY KEY)");
for(const name of (await readdir("drizzle")).filter(n=>n.endsWith(".sql")).sort()){if(!db.prepare("SELECT name FROM _local_migrations WHERE name=?").get(name)){db.exec(await readFile("drizzle/"+name,"utf8"));db.prepare("INSERT INTO _local_migrations(name) VALUES(?)").run(name);}}
const DB={prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)??null;}};}};
const server=createServer(async(req,res)=>{
 try{
  const host=req.headers.host;if(host!=="127.0.0.1:5173"&&host!=="localhost:5173"){res.writeHead(403).end("Host rejected");return;}
  const url=new URL(req.url,"http://"+host);const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers)){if(!key.startsWith("oai-authenticated-user-")&&value)headers.set(key,Array.isArray(value)?value.join(", "):value);}
  // This simulated identity exists only in this loopback development adapter.
  const signedIn=(req.headers.cookie??"").split(";").map(x=>x.trim()).includes("cm_local=1");
  if(signedIn){headers.set("oai-authenticated-user-id","local-owner");headers.set("oai-authenticated-user-email","owner@local.test");}
  if(url.pathname==="/signin-with-chatgpt"||url.pathname==="/signout-with-chatgpt"){
   if(req.headers["sec-fetch-site"]==="cross-site"){res.writeHead(403).end();return;}
   res.writeHead(302,{Location:"/","Set-Cookie":"cm_local="+(url.pathname.startsWith("/signin")?"1":"0")+"; Path=/; HttpOnly; SameSite=Lax","Cache-Control":"no-store"}).end();return;
  }
  let chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1000000){res.writeHead(413).end();return;}chunks.push(chunk);}
  const request=new Request(url,{method:req.method,headers,...(["GET","HEAD"].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
  const worker=(await import(pathToFileURL(path.resolve("dist/server/index.js")).href+"?v="+Date.now())).default;
  const response=await worker.fetch(request,{DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e.message);res.writeHead(500).end("Preview unavailable");}
});
server.listen(5173,"127.0.0.1",()=>console.log("Local: http://127.0.0.1:5173"));
