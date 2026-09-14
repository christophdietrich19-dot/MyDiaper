(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const bands=[
    {id:'0-3m',label:'0–3',unit:'Monate',minMonths:0,maxMonths:3},
    {id:'4-6m',label:'4–6',unit:'Monate',minMonths:4,maxMonths:6},
    {id:'7-12m',label:'7–12',unit:'Monate',minMonths:7,maxMonths:12},
    {id:'1-2y',label:'1–2',unit:'Jahre',minMonths:13,maxMonths:23},
    {id:'2-3y',label:'2–3',unit:'Jahre',minMonths:24,maxMonths:35},
    {id:'3-4y',label:'3–4',unit:'Jahre',minMonths:36,maxMonths:47},
    {id:'4-6y',label:'4–6',unit:'Jahre',context:'Nacht',minMonths:48,maxMonths:71},
    {id:'6plus',label:'6+',unit:'Jahre',context:'individuell',minMonths:72,maxMonths:Infinity}
  ];
  const copy=band=>band?{...band}:null;
  function all(){return bands.map(copy);}
  function get(id){return copy(bands.find(band=>band.id===id));}
  function describe(bandOrId){
    const band=typeof bandOrId==='string'?get(bandOrId):bandOrId;
    return band?`${band.label} ${band.unit}`:null;
  }
  function fromMonths(value){
    const months=Number(value);
    if(!Number.isFinite(months)||months<0)return null;
    return copy(bands.find(band=>months>=band.minMonths&&months<=band.maxMonths)||bands.at(-1));
  }
  function parseBirthdate(value){
    if(value instanceof Date)return Number.isNaN(value.getTime())?null:new Date(value.getTime());
    const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return null;
    const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
    const date=new Date(Date.UTC(year,month-1,day));
    return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?date:null;
  }
  function monthsFromBirthdate(value,now=new Date()){
    const birth=parseBirthdate(value),current=now instanceof Date?now:new Date(now);
    if(!birth||Number.isNaN(current.getTime()))return null;
    let months=(current.getUTCFullYear()-birth.getUTCFullYear())*12+current.getUTCMonth()-birth.getUTCMonth();
    if(current.getUTCDate()<birth.getUTCDate())months-=1;
    return Math.max(0,months);
  }
  function fromBirthdate(value,now){return fromMonths(monthsFromBirthdate(value,now)??0);}
  domain.ageBands={all,get,describe,fromMonths,monthsFromBirthdate,fromBirthdate};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.ageBands;
})(globalThis);
