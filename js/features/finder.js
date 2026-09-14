(function(){
  const drafts=new Map();
  function state(child){
    if(!drafts.has(child.id)){
      const age=MyDiaper.domain.ageBands.fromBirthdate(child.birthdate);
      drafts.set(child.id,{step:1,age:age.id,
        weight:child.weight,weightBand:child.weight<5?'< 5':child.weight<=8?'5–8':child.weight<=11?'8–11':'11+',
        priorities:['skin'],setId:child.setId,answers:{leak:'no',marks:'no',closure:'good',night:'no'}});
    }
    return drafts.get(child.id);
  }
  function choice(child,field,value){
    const d=state(child);
    if(field==='priority') d.priorities=d.priorities.includes(value)?d.priorities.filter(v=>v!==value):[...d.priorities,value];
    if(field==='age'&&MyDiaper.domain.ageBands.get(value)) d.age=value;
    if(field==='weightBand'){d.weightBand=value;d.weight=({'< 5':4,'5–8':6.5,'8–11':9.5,'11+':12})[value];}
    if(field==='setId') d.setId=value;
    if(['leak','marks','closure','night'].includes(field)) d.answers[field]=value;
  }
  MyDiaper.finder={state,choice,reset:()=>drafts.clear()};
  MyDiaper.features.finder=function(ctx){
    const c=ctx.activeChild(), d=state(c), {icon,art}=ctx;
    const ageBands=MyDiaper.domain.ageBands.all();
    if(!ctx.activeSets().some(s=>s.id===d.setId)) d.setId=c.setId;
    const title=ctx.screenHeader('Windel-Finder','today');
    const progress=`<ol class="finder-progress" aria-label="Schritt ${d.step} von 4">${[1,2,3,4].map(n=>`<li class="${n===d.step?'current':n<d.step?'done':''}" ${n===d.step?'aria-current="step"':''}>${n}</li>`).join('')}</ol>`;
    let body='';
    if(d.step===1){
      body=`<div class="finder-intro"><div><h2>Wir finden gemeinsam<br>die passende Windel<br>für dein Baby.</h2><p>Nur ein paar schnelle Fragen –<br>und schon geht’s los!</p></div>${art('elephant')}<span class="little-heart">♥</span></div>
      <section class="finder-group"><h3>Wie alt ist dein Kind?</h3><div class="option-grid age-options">${ageBands.map(band=>`<button class="option age-option ${d.age===band.id?'selected':''}" data-action="finder-choice" data-field="age" data-value="${band.id}" aria-label="${ctx.esc(MyDiaper.domain.ageBands.describe(band))}${band.context?` · ${ctx.esc(band.context)}`:''}" aria-pressed="${d.age===band.id}"><span>${ctx.esc(band.label)}</span><small>${ctx.esc(band.unit)}${band.context?` · ${ctx.esc(band.context)}`:''}</small></button>`).join('')}</div><p class="age-help">Bis 4 Jahre detailliert, bei Nachtwindeln zusätzlich bis 6 Jahre. Darüber bleibt die Nutzung individuell möglich.</p></section>
      <section class="finder-group"><h3>Wie viel wiegt dein Baby? ${icon('weight')}</h3><div class="option-grid">${['< 5','5–8','8–11','11+'].map(v=>`<button class="option ${d.weightBand===v?'selected':''}" data-action="finder-choice" data-field="weightBand" data-value="${ctx.esc(v)}" aria-pressed="${d.weightBand===v}">${ctx.esc(v)} kg</button>`).join('')}</div></section>
      <section class="finder-group priorities"><h3>Was ist dir besonders wichtig?</h3><p>Du kannst mehrere Optionen wählen.</p><div class="priority-list">${[['skin','leaf','Besonders hautfreundlich'],['absorb','drop','Hohe Saugkraft'],['fit','shield','Guter Sitz'],['eco','leaf','Nachhaltige Materialien']].map(([id,i,label])=>`<button class="priority ${d.priorities.includes(id)?'selected':''}" data-action="finder-choice" data-field="priority" data-value="${id}" aria-pressed="${d.priorities.includes(id)}">${icon(i,id)}<span>${label}</span></button>`).join('')}</div></section>`;
    } else if(d.step===2){
      body=`<div class="finder-intro"><div><h2>Für jede Situation<br>das passende Set.</h2><p>Wir schauen auf ${ctx.esc(c.name)}<br>und eure Windeln im Alltag.</p></div>${art('elephant')}</div><section class="finder-group"><h3>Welches Windelset möchtest du prüfen?</h3><div class="stack">${ctx.activeSets().map(s=>`<button class="priority ${d.setId===s.id?'selected':''}" data-action="finder-choice" data-field="setId" data-value="${ctx.esc(s.id)}">${icon(s.purpose==='night'?'clock':s.purpose==='swim'?'drop':'diaper')}<span>${ctx.esc(s.label)}<small>${ctx.esc(s.brand)} · Größe ${ctx.esc(s.size)}</small></span></button>`).join('')}</div></section><form id="finderWeightForm" class="finder-group"><label class="field-title" for="finderWeight">Aktuelles Gewicht in kg</label><p>Für einen genaueren Richtwert.</p><input class="input" id="finderWeight" name="weight" type="number" min="1" max="80" step="0.1" value="${d.weight}" required><button class="btn secondary block" style="margin-top:12px">Gewicht übernehmen</button></form><p class="inline-note">Dein Kinderprofil bleibt unverändert. Die Angaben gelten für diesen Windel-Finder.</p>`;
    } else if(d.step===3){
      body=`<div class="finder-intro"><div><h2>Und wie sitzt<br>die Windel gerade?</h2><p>Deine Beobachtungen helfen uns<br>beim persönlichen Fit-Check.</p></div>${art('elephant')}</div>${[['leak','Läuft die Windel häufiger aus?','yes','Ja, häufiger','no','Nein'],['marks','Gibt es deutliche Abdrücke?','yes','Ja','no','Nein'],['closure','Wie schließen die Seiten?','tight','Eher knapp','good','Gut'],['night','Probleme hauptsächlich nachts?','yes','Ja','no','Nein']].map(([field,label,a,al,b,bl])=>`<section class="finder-group"><h3>${label}</h3><div class="choice-grid">${[[a,al],[b,bl]].map(([value,text])=>`<button class="option ${d.answers[field]===value?'selected':''}" data-action="finder-choice" data-field="${field}" data-value="${value}" aria-pressed="${d.answers[field]===value}">${text}</button>`).join('')}</div></section>`).join('')}`;
    } else {
      const size=ctx.recommendSize(d.weight),fit=MyDiaper.domain.fitCheck.evaluate(d.answers,size);
      const set=ctx.activeSets().find(item=>item.id===d.setId),experiences=ctx.experiencesFor(d.setId);
      const personal=MyDiaper.domain.personalization.summarize({ageBand:MyDiaper.domain.ageBands.describe(d.age),weight:d.weight,recommendedSize:size,priorities:d.priorities,fit,set,experiences});
      const products=MyDiaper.domain.catalog.candidates(MyDiaper.productCatalog,{size,purpose:set.purpose,priorities:d.priorities,experiences,currentProductSizeId:set.productSizeId}).slice(0,3);
      body=`<div class="finder-result personalized">${art('elephant')}<span class="badge success">${ctx.esc(personal.confidenceLabel)}</span><h1>Größe ${ctx.esc(size)}</h1><p>bei ${String(d.weight).replace('.',',')} kg · ${ctx.esc(set.label)}</p>
        <section class="finder-group result-fit"><span class="result-symbol">${icon(fit.code==='check_night'?'clock':fit.code==='try_larger'?'arrow':'check')}</span><div><h3>${ctx.esc(fit.result)}</h3><p>${ctx.esc(fit.note)}</p></div></section>
        <section class="personal-signal ${personal.experience.tone}"><span>${icon('heart')}</span><div><h3>${ctx.esc(personal.experience.title)}</h3><p>${ctx.esc(personal.experience.note)}</p></div></section>
        <section class="finder-explanation"><h3>Darauf basiert dein Ergebnis</h3><ul>${personal.reasons.map(reason=>`<li>${icon('check')}<span>${ctx.esc(reason)}</span></li>`).join('')}</ul></section>
        ${personal.tips.length?`<section class="finder-tips"><h3>Passend zu euren Wünschen</h3>${personal.tips.map(tip=>`<p>${icon('leaf')}<span>${ctx.esc(tip)}</span></p>`).join('')}</section>`:''}
        <section class="finder-products"><div class="section-heading"><div><span class="eyebrow">Interner Testkatalog</span><h3>Vergleichbare Produkte</h3></div><span class="catalog-count">${products.length}</span></div>${products.map(product=>`<article class="finder-product ${product.productSizeId===set.productSizeId?'selected':''}"><span>${icon(product.category==='pants'?'swap':'diaper')}</span><div><strong>${ctx.esc(product.brand)} ${ctx.esc(product.line)}</strong><small>Größe ${ctx.esc(product.size)} · ${product.priorityMatches.length?`${product.priorityMatches.length} Wunschkriter${product.priorityMatches.length===1?'ium':'ien'}`:'Basisvergleich'}</small></div>${product.productSizeId===set.productSizeId?'<span class="badge success">Aktuell</span>':`<button class="text-btn" data-action="catalog-assign" data-set-id="${ctx.esc(set.id)}" data-id="${ctx.esc(product.productSizeId)}">Übernehmen</button>`}</article>`).join('')}<p class="catalog-disclaimer">Katalogeigenschaften sind Testdaten und keine Herstellerzusage.</p></section>
        <div class="result-actions"><button class="btn secondary block" data-action="finder-profile-check">Fit-Check mit Profilwerten erfassen</button><button class="btn ghost block" data-action="experience-add" data-set-id="${ctx.esc(d.setId)}">${personal.latestExperience?'Neue Erfahrung ergänzen':'Erste Erfahrung eintragen'}</button></div>
        <p class="result-disclaimer">Richtwert, keine Garantie: Herstellerbereiche und tatsächliche Passform können abweichen. Finder-Eingaben ändern das Kinderprofil nicht automatisch.</p></div>`;
    }
    return `<div class="finder-screen">${title}${progress}${body}<div class="finder-footer">${d.step>1?`<button class="text-btn finder-back" data-action="finder-back">Zurück</button>`:''}<button class="btn primary block" data-action="${d.step===4?'route':'finder-next'}" ${d.step===4?'data-route="diapers"':''}>${d.step===4?'Zu meinen Windeln':'Weiter'} ${icon('arrow')}</button></div></div>`;
  };
})();
