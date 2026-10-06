import {build} from "esbuild-wasm";
import {mkdir} from "node:fs/promises";
import {spawnSync} from "node:child_process";
await mkdir(".sites-runtime",{recursive:true});
await build({entryPoints:["tests/core.test.ts"],bundle:true,platform:"node",format:"esm",outfile:".sites-runtime/core.test.mjs",define:{__JS__:'""',__CSS__:'""',__ICON__:'""'}});
const result=spawnSync(process.execPath,["--test",".sites-runtime/core.test.mjs"],{stdio:"inherit"});process.exitCode=result.status??1;
