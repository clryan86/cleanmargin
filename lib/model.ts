export type Contract = {
  id: string; name: string; type: string; price: number; hours: number; wage: number;
  burden: number; supplies: number; overhead: number; target: number; renewal: string; scope: string;
};
export type Review = Contract & { month: string; actualHours: number; actualSupplies: number; actualOverhead: number; actualRevenue: number; notes: string };
export type Workspace = { company: string; contracts: Contract[]; reviews: Review[] };
export const emptyWorkspace: Workspace = { company: "My cleaning business", contracts: [], reviews: [] };
export function calculate(c: Contract, review?: Review) {
  const source = review ?? c;
  const revenue = review ? review.actualRevenue : c.price;
  const hours = review ? review.actualHours : c.hours;
  const supplies = review ? review.actualSupplies : c.supplies;
  const overhead = review ? review.actualOverhead : c.overhead;
  const loadedRate = source.wage * (1 + source.burden / 100);
  const labor = hours * loadedRate;
  const cost = labor + supplies + overhead;
  const contribution = revenue - cost;
  const margin = revenue > 0 ? contribution / revenue * 100 : null;
  const targetPrice = Math.ceil(cost / (1 - source.target / 100) * 100) / 100;
  return { revenue, hours, supplies, overhead, loadedRate, labor, cost, contribution, margin, targetPrice, gap: Math.max(0, targetPrice - revenue), overrun: hours - source.hours };
}
export function currentMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }
export function demoWorkspace(month: string): Workspace {
  const base = { wage: 20, burden: 22, target: 30, renewal: "", scope: "Office cleaning, restrooms, waste removal, and common areas. Specialty work priced separately." };
  const contracts: Contract[] = [
    {...base,id:"demo-1",name:"Northline Offices",type:"Office",price:3200,hours:76,supplies:160,overhead:190,renewal:`${month}-28`},
    {...base,id:"demo-2",name:"Cedar Learning Center",type:"Education",price:2850,hours:66,supplies:140,overhead:170},
    {...base,id:"demo-3",name:"Parkside Business Center",type:"Office",price:4600,hours:108,supplies:230,overhead:260},
    {...base,id:"demo-4",name:"Atlas Distribution",type:"Warehouse",price:2150,hours:45,supplies:110,overhead:145},
    {...base,id:"demo-5",name:"Willow Community Center",type:"Community",price:1800,hours:42,supplies:90,overhead:120},
  ];
  const hours = [99,69,106,44,54];
  return { company:"Clearway Cleaning · Sample", contracts, reviews: contracts.map((c,i)=>({...c,month,actualHours:hours[i],actualSupplies:c.supplies,actualOverhead:c.overhead,actualRevenue:c.price,notes:i===0?"Extra meeting-room resets increased hours. Confirm scope with the client before changing price.":""})) };
}
export const money = (value: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value);
export const preciseMoney = (value: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
