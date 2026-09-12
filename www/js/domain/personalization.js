(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const ratings=['fitRating','leakRating','nightRating','skinComfortRating'];
  const tendencies=['small','normal','large'];
  const priorityTips={
    skin:'Hautverträglichkeit zunächst mit einer kleinen Menge im Alltag beobachten.',
    absorb:'Saugkraft passend zu Nutzungsdauer und Tageszeit vergleichen.',
    fit:'An Bauch, Rücken und Beinbündchen auf einen sicheren, druckfreien Sitz achten.',
    eco:'Materialangaben, Zertifizierungen und Entsorgungshinweise der Hersteller vergleichen.'
  };

  function normalizeExperience(input={}){
    const result={};
    for(const key of ratings){
      if(input[key]===undefined) continue;
      const value=Number(input[key]);
      if(!Number.isInteger(value)||value<1||value>5) throw new Error('Bewertungen müssen zwischen 1 und 5 liegen.');
      result[key]=value;
    }
    if(input.sizeTendency!==undefined){
      if(!tendencies.includes(input.sizeTendency)) throw new Error('Bitte eine gültige Größenwirkung auswählen.');
      result.sizeTendency=input.sizeTendency;
    }
    if(input.avoidRecommendation!==undefined){
      if(typeof input.avoidRecommendation!=='boolean') throw new Error('Ungültige Empfehlungseinstellung.');
      result.avoidRecommendation=input.avoidRecommendation;
    }
    if(input.notes!==undefined){
      if(typeof input.notes!=='string') throw new Error('Notizen müssen Text sein.');
      result.notes=input.notes.trim().slice(0,600);
    }
    return result;
  }

  function newest(experiences){
    return experiences.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')))[0]||null;
  }

  function average(experience){
    const values=ratings.map(key=>experience&&experience[key]).filter(Number.isFinite);
    return values.length ? values.reduce((sum,value)=>sum+value,0)/values.length : null;
  }

  function summarize({ageBand,weight,recommendedSize,priorities=[],fit,set,experiences=[]}){
    const selected=[...new Set(priorities)].filter(key=>priorityTips[key]);
    const latest=newest(experiences.filter(exp=>!set||exp.setId===set.id));
    const mean=average(latest);
    let experience={tone:'neutral',title:'Noch keine persönliche Erfahrung',note:'Nach einigen Anwendungen kannst du die Passform dieses Sets bewerten.'};
    if(latest){
      const product=[latest.productSnapshot&&latest.productSnapshot.brand,latest.productSnapshot&&latest.productSnapshot.line].filter(Boolean).join(' ');
      const tendency=({small:'fällt nach deiner Erfahrung eher klein aus',normal:'wirkt größenentsprechend',large:'fällt nach deiner Erfahrung eher groß aus'})[latest.sizeTendency];
      if(latest.avoidRecommendation) experience={tone:'warning',title:'Von dir ausgeschlossen',note:`${product||'Dieses Produkt'} wird für dieses Kind nicht bevorzugt.${latest.notes?` ${latest.notes}`:''}`};
      else if(mean!==null&&mean>=4) experience={tone:'positive',title:'Bisher gute persönliche Erfahrung',note:`${product||'Dieses Produkt'} wurde im Mittel mit ${mean.toFixed(1).replace('.',',')} von 5 bewertet.${tendency?` Es ${tendency}.`:''}`};
      else if(mean!==null&&mean<=2) experience={tone:'warning',title:'Erfahrung genauer beachten',note:`${product||'Dieses Produkt'} wurde im Mittel mit ${mean.toFixed(1).replace('.',',')} von 5 bewertet.${tendency?` Es ${tendency}.`:''}`};
      else experience={tone:'neutral',title:'Persönliche Erfahrung berücksichtigt',note:`${product||'Dieses Produkt'} ${tendency||'wurde bereits für dieses Kind bewertet'}.${latest.notes?` ${latest.notes}`:''}`};
    }
    const tips=selected.map(key=>priorityTips[key]);
    if(set&&set.purpose==='night'&&!selected.includes('absorb')) tips.push('Bei diesem Nacht-Set die Leistung über die gesamte Schlafdauer beobachten.');
    const reasons=[
      `Größe ${recommendedSize} ist ein Gewichts-Richtwert für ${String(weight).replace('.',',')} kg.`,
      `Die Altersgruppe ${ageBand} dient nur zur Einordnung; die Größe wird nicht allein daraus abgeleitet.`,
      `Fit-Check: ${fit.result}.`
    ];
    if(latest) reasons.push('Die letzte gespeicherte Produkterfahrung dieses Kindes und Sets wurde einbezogen.');
    return {experience,tips,reasons,confidenceLabel:latest?'Mit persönlicher Erfahrung':'Basis-Richtwert',latestExperience:latest};
  }

  domain.personalization={normalizeExperience,summarize,average};
  if(typeof module!=='undefined'&&module.exports) module.exports=domain.personalization;
})(globalThis);
