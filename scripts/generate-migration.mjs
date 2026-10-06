import {build} from "esbuild-wasm";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {pathToFileURL} from "node:url";
import path from "node:path";
const require=createRequire(import.meta.url);
const {generateSQLiteDrizzleJson,generateSQLiteMigration}=require("drizzle-kit/api");
await mkdir(".sites-runtime",{recursive:true});await mkdir("drizzle/meta",{recursive:true});
await build({entryPoints:["db/schema.ts"],bundle:false,platform:"node",format:"esm",outfile:".sites-runtime/schema.mjs"});
const schema=await import(pathToFileURL(path.resolve(".sites-runtime/schema.mjs")).href+"?v="+Date.now());
let journal;try{journal=JSON.parse(await readFile("drizzle/meta/_journal.json","utf8"));}catch{journal={version:"7",dialect:"sqlite",entries:[]};}
const last=journal.entries.at(-1);
const prev=last?JSON.parse(await readFile("drizzle/meta/"+String(last.idx).padStart(4,"0")+"_snapshot.json","utf8")):await generateSQLiteDrizzleJson({});
const next=await generateSQLiteDrizzleJson(schema,prev.id);
const statements=await generateSQLiteMigration(prev,next);
if(!statements.length){console.log("Schema unchanged.");process.exit(0);}
const idx=journal.entries.length;const prefix=String(idx).padStart(4,"0");const tag=prefix+"_workspaces";
await writeFile("drizzle/"+tag+".sql",statements.join("\n--> statement-breakpoint\n")+"\n");
await writeFile("drizzle/meta/"+prefix+"_snapshot.json",JSON.stringify(next,null,2));
journal.entries.push({idx,version:next.version,when:Date.now(),tag,breakpoints:true});
await writeFile("drizzle/meta/_journal.json",JSON.stringify(journal,null,2));console.log("Generated "+tag+" with "+statements.length+" schema statements.");
