import type { Workspace, Review } from "./model";
import { reviewSchema } from "./validation";
export function parseCSV(text:string):string[][]{
 if(text.length>800000)throw new Error("CSV must be smaller than 800 KB.");
 const rows:string[][]=[];let row:string[]=[];let field="";let quoted=false;let ended=false;
 text=text.replace(/^\uFEFF/,"");
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;ended=true;}}else field+=c;}
  else if(c==='"'){if(field||ended)throw new Error("Unexpected quote in CSV.");quoted=true;}
  else if(c===','){row.push(field);field="";ended=false;}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field="";ended=false;}
  else{if(ended)throw new Error("Unexpected text after closing quote.");field+=c;}
 }
 if(quoted)throw new Error("Unclosed CSV quote.");
 row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export const columns=["contract_id","month","hours","revenue","supplies","overhead","wage","burden"];
export function importReviews(text:string,data:Workspace):Review[]{
 const rows=parseCSV(text);if(rows.length<2)throw new Error("Add at least one cost row.");
 const header=rows.shift()!.map(x=>x.trim().toLowerCase());
 if(header.length!==columns.length||new Set(header).size!==columns.length||columns.some(x=>!header.includes(x)))throw new Error("Use the eight columns in the downloadable template.");
 const seen=new Set<string>();
 return rows.map((row,i)=>{
  if(row.length!==header.length)throw new Error("Row "+(i+2)+": incorrect number of columns.");
  const value=Object.fromEntries(header.map((k,j)=>[k,row[j].trim()]));
  const contract=data.contracts.find(c=>c.id===value.contract_id);
  if(!contract)throw new Error("Row "+(i+2)+": unknown contract_id.");
  const nums=["hours","revenue","supplies","overhead","wage","burden"];
  for(const key of nums)if(!/^\d+(\.\d+)?$/.test(value[key]))throw new Error("Row "+(i+2)+": "+key+" must be a nonnegative number, including an explicit zero.");
  const old=data.reviews.find(r=>r.id===contract.id&&r.month===value.month);
  const result=reviewSchema.safeParse({...(old??contract),month:value.month,actualHours:Number(value.hours),actualRevenue:Number(value.revenue),actualSupplies:Number(value.supplies),actualOverhead:Number(value.overhead),wage:Number(value.wage),burden:Number(value.burden),notes:old?.notes??""});
  if(!result.success)throw new Error("Row "+(i+2)+": "+result.error.issues[0].message);
  const key=contract.id+":"+value.month;
  if(seen.has(key))throw new Error("Duplicate contract and month in row "+(i+2)+".");
  seen.add(key);return result.data;
 });
}
export function csvCell(value:unknown){let s=String(value??"");if(/^[\s]*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export function csv(rows:unknown[][]){return rows.map(r=>r.map(csvCell).join(",")).join("\r\n");}
