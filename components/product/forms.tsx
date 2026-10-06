"use client";
import {useState} from "react";
import {contractSchema,reviewSchema} from "../../lib/validation";
import {calculate,money,preciseMoney,type Contract,type Review} from "../../lib/model";
export function Field({label,name,value,min=0,max=10000000,step="0.01",type="number",required=true}:{label:string;name:string;value:string|number;min?:number;max?:number;step?:string;type?:string;required?:boolean}){
 return <label className="field"><span>{label}</span><input name={name} type={type} defaultValue={value} min={min} max={max} step={step} required={required} maxLength={type==="text"?120:undefined}/></label>;
}
const errorText=(error:unknown)=>error instanceof Error?error.message:"Could not save. Please retry.";
export function ContractForm({contract,onSave}:{contract?:Contract;onSave:(c:Contract)=>Promise<void>}){
 const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 const c=contract??{id:"",name:"",type:"Office",price:0,hours:0,wage:0,burden:0,supplies:0,overhead:0,target:30,renewal:"",scope:""};
 return <form onSubmit={async e=>{e.preventDefault();setError("");const f=new FormData(e.currentTarget);const obj=Object.fromEntries(f);const result=contractSchema.safeParse({...obj,id:contract?.id??crypto.randomUUID(),...Object.fromEntries(["price","hours","wage","burden","supplies","overhead","target"].map(k=>[k,Number(f.get(k))]))});if(!result.success){setError(result.error.issues[0].message);return;}setBusy(true);try{await onSave(result.data);}catch(e){setError(errorText(e));}finally{setBusy(false);}}}>
 <p className="form-intro">Enter the agreed monthly scope and your own cost assumptions. Include paid travel in labor hours and owner labor at a realistic cost.</p>
 <div className="form-grid"><Field label="Contract / location name" name="name" value={c.name} type="text"/><label className="field"><span>Facility type</span><select name="type" defaultValue={c.type}>{["Office","Education","Warehouse","Community","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
 <Field label="Monthly price ($, before tax)" name="price" value={c.price}/><Field label="Planned paid hours / month" name="hours" value={c.hours} max={10000}/>
 <Field label="Blended hourly wage ($)" name="wage" value={c.wage} max={1000}/><Field label="Payroll burden (%)" name="burden" value={c.burden} max={200}/>
 <Field label="Monthly supplies / equipment ($)" name="supplies" value={c.supplies}/><Field label="Allocated overhead / month ($)" name="overhead" value={c.overhead}/>
 <Field label="Target contribution margin (%)" name="target" value={c.target} max={80}/><Field label="Next review date" name="renewal" value={c.renewal} type="date" required={false}/></div>
 <label className="field full-field"><span>Agreed scope and exclusions</span><textarea name="scope" defaultValue={c.scope} rows={3} maxLength={3000} placeholder="What is included, how often, and what needs a separate quote?"/></label>
 <p className="helper">Payroll burden covers your actual employment costs. Avoid counting the same expense again in overhead. Changes apply to future reviews; saved monthly snapshots stay unchanged.</p>
 {error&&<p role="alert" className="error-box">{error}</p>}<button className="button primary full-button" disabled={busy}>{busy?"Saving…":contract?"Save contract":"Create contract"}</button></form>;
}
export function ReviewForm({contract,review,month,onSave}:{contract:Contract;review?:Review;month:string;onSave:(r:Review)=>Promise<void>}){
 const [error,setError]=useState("");const [busy,setBusy]=useState(false);const c=review??contract;
 return <form onSubmit={async e=>{e.preventDefault();setError("");const f=new FormData(e.currentTarget);const numeric=["actualHours","actualRevenue","actualSupplies","actualOverhead","wage","burden"];const result=reviewSchema.safeParse({...c,month,notes:String(f.get("notes")??""),...Object.fromEntries(numeric.map(k=>[k,Number(f.get(k))]))});if(!result.success){setError(result.error.issues[0].message);return;}setBusy(true);try{await onSave(result.data);}catch(e){setError(errorText(e));}finally{setBusy(false);}}}>
 <p className="form-intro"><strong>{contract.name} · {month}</strong><br/>Record a complete month's costs. Use explicit zeros for costs that do not apply. Partial months are not comparable to a full monthly price.</p>
 <div className="form-grid"><Field label="Recorded revenue ($, before tax)" name="actualRevenue" value={review?.actualRevenue??""}/><Field label="Actual paid labor hours" name="actualHours" value={review?.actualHours??""} max={10000}/>
 <Field label="Actual supplies / equipment ($)" name="actualSupplies" value={review?.actualSupplies??""}/><Field label="Allocated overhead ($)" name="actualOverhead" value={review?.actualOverhead??""}/>
 <Field label="Actual blended hourly wage ($)" name="wage" value={c.wage} max={1000}/><Field label="Actual payroll burden (%)" name="burden" value={c.burden} max={200}/></div>
 <label className="field full-field"><span>What changed? Scope, staffing, access, or costs</span><textarea name="notes" defaultValue={review?.notes??""} rows={3} maxLength={3000}/></label>
 <label className="check-label"><input type="checkbox" required/>I have checked the full month's revenue and costs.</label>
 {error&&<p role="alert" className="error-box">{error}</p>}<button className="button primary full-button" disabled={busy}>{busy?"Saving…":"Save monthly review"}</button></form>;
}
export function CostBreakdown({contract,review}:{contract:Contract;review?:Review}){
 const m=calculate(contract,review);const whole=Math.max(m.revenue,m.cost,1);
 return <div className="cost-breakdown"><div className="cost-bar" aria-label="Cost composition"><span className="labor" style={{width:m.labor/whole*100+"%"}}/><span className="supplies" style={{width:m.supplies/whole*100+"%"}}/><span className="overhead" style={{width:m.overhead/whole*100+"%"}}/><span className="profit" style={{width:Math.max(0,m.contribution)/whole*100+"%"}}/></div><dl><div><dt>Labor + payroll burden</dt><dd>{preciseMoney(m.labor)}</dd></div><div><dt>Supplies + equipment</dt><dd>{preciseMoney(m.supplies)}</dd></div><div><dt>Allocated overhead</dt><dd>{preciseMoney(m.overhead)}</dd></div><div className="total"><dt>Operating contribution</dt><dd>{preciseMoney(m.contribution)}</dd></div></dl><p className="helper">{m.hours} paid hours × {preciseMoney(m.loadedRate)} loaded hourly rate. {review?"Recorded monthly result.":"Estimated from contract assumptions."}</p></div>;
}
