(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const contents=['wet','stool','both','dry','unknown'];
  const labels={wet:'Nur nass',stool:'Nur Stuhlgang',both:'Nass & Stuhlgang',dry:'Trocken',unknown:'Nicht erfasst'};

  function normalize(input={}){
    const quantity=Number(input.quantity??1);
    if(!Number.isSafeInteger(quantity)||quantity<=0)throw new Error('Ein Windelwechsel muss mindestens eine Windel enthalten.');
    const content=String(input.contents||'unknown');
    if(!contents.includes(content))throw new Error('Bitte eine gültige Beobachtung auswählen.');
    const usedAt=new Date(input.usedAt||new Date());
    if(Number.isNaN(usedAt.getTime()))throw new Error('Ungültiger Zeitpunkt für den Windelwechsel.');
    return {quantity,contents:content,usedAt:usedAt.toISOString(),note:String(input.note||'').trim().slice(0,240)};
  }

  function dayKey(value){
    const date=new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function summarize(events,{childId,setId=null,from=null,to=null}={}){
    const result={changes:0,units:0,wet:0,stool:0,dry:0,unknown:0};
    for(const event of events||[]){
      if(childId&&event.childId!==childId)continue;
      if(setId&&event.setId!==setId)continue;
      const time=new Date(event.usedAt).getTime();
      if(from&&time<new Date(from).getTime())continue;
      if(to&&time>=new Date(to).getTime())continue;
      const item=normalize(event);result.changes+=1;result.units+=item.quantity;
      if(item.contents==='wet'||item.contents==='both')result.wet+=1;
      if(item.contents==='stool'||item.contents==='both')result.stool+=1;
      if(item.contents==='dry')result.dry+=1;
      if(item.contents==='unknown')result.unknown+=1;
    }
    return result;
  }

  function daily(events,options={}){
    const groups=new Map();
    for(const event of events||[]){
      if(options.childId&&event.childId!==options.childId)continue;
      if(options.setId&&event.setId!==options.setId)continue;
      const key=dayKey(event.usedAt);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(event);
    }
    return [...groups.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([date,items])=>({date,items:items.slice().sort((a,b)=>String(b.usedAt).localeCompare(String(a.usedAt))),summary:summarize(items)}));
  }

  domain.activity={contents,labels,normalize,summarize,daily,dayKey};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.activity;
})(globalThis);
