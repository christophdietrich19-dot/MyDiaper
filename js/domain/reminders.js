(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const defaults={stockDays:4,sizeCheckWeeks:4,quietStart:'20:00',quietEnd:'08:00'};
  const clock=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
  function whole(value,min,max,label){
    const number=Number(value);
    if(!Number.isInteger(number)||number<min||number>max)throw new Error(`${label} muss zwischen ${min} und ${max} liegen.`);
    return number;
  }
  function normalize(input={}){
    const value={...defaults,...input};
    if(!clock.test(String(value.quietStart))||!clock.test(String(value.quietEnd)))throw new Error('Ruhezeiten müssen als HH:MM angegeben werden.');
    return {stockDays:whole(value.stockDays,1,30,'Vorratsgrenze'),sizeCheckWeeks:whole(value.sizeCheckWeeks,1,26,'Größenintervall'),quietStart:String(value.quietStart),quietEnd:String(value.quietEnd)};
  }
  function stockDue(days,enabled=true,config=defaults){
    const checked=normalize(config);
    return Boolean(enabled)&&days!==null&&Number.isFinite(days)&&days<=checked.stockDays;
  }
  domain.reminders={defaults,normalize,stockDue};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.reminders;
})(globalThis);
