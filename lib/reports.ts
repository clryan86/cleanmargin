import { calculate,preciseMoney,type Contract,type Review,type Workspace } from "./model";
export const escapeHTML=(text:unknown)=>String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
export function download(name:string,text:string,type="text/plain"){
 const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function documentHTML(title:string,body:string){
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>'+escapeHTML(title)+'</title><style>body{font:16px/1.6 Arial,sans-serif;color:#192d2a;max-width:900px;margin:50px auto;padding:25px}h1{font-size:32px}h2{font-size:21px;margin-top:35px}p{white-space:pre-wrap}table{border-collapse:collapse;width:100%}td,th{padding:12px 8px;text-align:left;border-bottom:1px solid #ddd}.label{color:#567063;font-size:13px;letter-spacing:2px}.note{color:#5b6e63;font-size:14px}.price{font-size:36px;color:#175c49}@media print{body{margin:0}}</style><body><div class="label">CLEANMARGIN</div>'+body+'</body></html>';
}
export function monthlyReport(data:Workspace,month:string){
 const reviews=data.reviews.filter(r=>r.month===month);
 let revenue=0,contribution=0;
 const lines=reviews.map(r=>{const m=calculate(r,r);revenue+=m.revenue;contribution+=m.contribution;return '<tr><td>'+escapeHTML(r.name)+'</td><td>'+preciseMoney(m.revenue)+'</td><td>'+preciseMoney(m.cost)+'</td><td>'+preciseMoney(m.contribution)+'</td><td>'+(m.margin===null?"N/A":m.margin.toFixed(1)+"%")+'</td></tr>';}).join("");
 return documentHTML("Monthly contract review",'<h1>'+escapeHTML(data.company)+'</h1><p>Monthly contract review · '+escapeHTML(month)+'</p><p>'+reviews.length+' of '+data.contracts.length+' contracts have recorded costs.</p><h2>Recorded revenue: '+preciseMoney(revenue)+'</h2><p>Operating contribution: '+preciseMoney(contribution)+'</p><table><thead><tr><th>Contract</th><th>Revenue</th><th>Costs</th><th>Contribution</th><th>Margin</th></tr></thead><tbody>'+lines+'</tbody></table><p class="note">Internal management report. Includes only recorded reviews. Costs include labor and burden, supplies, and allocated overhead. Contribution is not business net profit; taxes and omitted expenses are excluded. Verify costs before acting.</p>');
}
export function priceProposal(company:string,c:Contract,price:number,effective:string){
 return documentHTML("Service price review",'<h1>Service price review</h1><p>Prepared by '+escapeHTML(company)+'<br>For '+escapeHTML(c.name)+'</p><h2>Proposed monthly service price</h2><p class="price">'+preciseMoney(price)+'</p><p>Proposed effective date: '+escapeHTML(effective||"To be agreed")+'</p><h2>Service scope</h2><p>'+escapeHTML(c.scope||"Confirm service scope with the client before agreement.")+'</p><h2>Next step</h2><p>Please review the proposed scope and monthly price. Any change requires mutual agreement and compliance with the existing contract. Specialty work, taxes, and payment terms should be agreed separately where applicable.</p><p class="note">Discussion draft. This document does not change the existing agreement or automatically apply a price increase.</p>');
}
