"use client";
import {useState} from "react";
import {columns,csv,importReviews} from "../../lib/csv";
import {download} from "../../lib/reports";
import type {Workspace,Review} from "../../lib/model";
export default function Importer({data,month,onSave}:{data:Workspace;month:string;onSave:(reviews:Review[])=>Promise<void>}){
 const [rows,setRows]=useState<Review[]>([]);const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 const replacements=rows.filter(r=>data.reviews.some(old=>old.id===r.id&&old.month===r.month)).length;
 return <div><p className="form-intro">Import one row per contract and month. The template includes your contract IDs; fill every numeric field with actual values, including zeros. No customer file leaves your browser until you confirm the import.</p><button className="button secondary" onClick={()=>download("cleanmargin-cost-template.csv",csv([columns,...data.contracts.map(c=>[c.id,month,"","","","",c.wage,c.burden])]),"text/csv")}>Download your CSV template</button><label className="field full-field"><span>Completed CSV (up to 800 KB)</span><input type="file" accept=".csv,text/csv" onChange={async e=>{setRows([]);setError("");const file=e.target.files?.[0];if(!file)return;try{if(file.size>800000)throw new Error("File exceeds 800 KB.");setRows(importReviews(await file.text(),data));}catch(e){setError(e instanceof Error?e.message:"Could not read CSV.");}}}/></label>
 {rows.length>0&&<div className="import-preview"><h3>{rows.length} valid monthly reviews</h3><p>{replacements} existing reviews will be replaced. Contract assumptions stay unchanged.</p><ul>{rows.slice(0,6).map(r=><li key={r.id+r.month}>{r.name} · {r.month} · {r.actualHours} hours</li>)}</ul>{rows.length>6&&<p>And {rows.length-6} more.</p>}<label className="check-label"><input type="checkbox" id="import-confirm" form="import-form" required/>I checked that these are complete monthly results.</label><form id="import-form" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await onSave(rows);}catch(e){setError(e instanceof Error?e.message:"Import failed; please retry.");}finally{setBusy(false);}}}><button className="button primary full-button" disabled={busy}>{busy?"Saving…":"Confirm import"}</button></form></div>}
 {error&&<p role="alert" className="error-box">{error}</p>}</div>;
}
