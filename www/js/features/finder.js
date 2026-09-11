(function(){
  const drafts=new Map();
  function state(child){
    if(!drafts.has(child.id)){
      const months=child.birthdate ? Math.max(0,Math.floor((Date.now()-new Date(child.birthdate))/2629800000)) : 0;
      drafts.set(child.id,{step:1,age:months<4?'0–3':months<7?'4–6':months<13?'7–12':'12+',
        weight:child.weight,weightBand:child.weight<5?'< 5':child.weight<=8?'5–8':child.weight<=11?'8–11':'11+',
        priorities:['skin'],setId:child.setId,answers:{leak:'no',marks:'no',closure:'good',night:'no'}});
    }
    return drafts.get(child.id);
  }
  function choice(child,field,value){
    const d=state(child);
    if(field==='priority') d.priorities=d.priorities.includes(value)?d.priorities.filter(v=>v!==value):[...d.priorities,value];
    if(field==='age') d.age=value;
    if(field==='weightBand'){d.weightBand=value;d.weight=({'< 5':4,'5–8':6.5,'8–11':9.5,'11+':12})[value];}
    if(field==='setId') d.setId=value;
    if(['leak','marks','closure','night'].includes(field)) d.answers[field]=value;
  }
  MyDiaper.finder={state,choice,reset:()=>drafts.clear()};
  MyDiaper.features.finder=function(ctx){
    const c=ctx.activeChild(), d=state(c), {icon,art}=ctx;
    if(!ctx.activeSets().some(s=>s.id===d.setId)) d.setId=c.setId;
    const title=ctx.screenHeader('Windel-Finder','today');
    const progress=`<ol class="finder-progress" aria-label="Schritt ${d.step} von 4">${[1,2,3,4].map(n=>`<li class="${n===d.step?'current':n<d.step?'done':''}" ${n===d.step?'aria-current="step"':''}>${n}</li>`).join('')}</ol>`;
    let body='';
    if(d.step===1){
      body=`<div class="finder-intro"><div><h2>Wir finden gemeinsam<br>die passende Windel<br>für dein Baby.</h2><p>Nur ein paar schnelle Fragen –<br>und schon geht’s los!</p></div>${art('elephant')}<span class="little-heart">♥</span></div>
      <section class="finder-group"><h3>Wie alt ist dein Baby?</h3><div class="option-grid">${['0–3','4–6','7–12','12+'].map(v=>`<button class="option ${d.age===v?'selected':''}" data-action="finder-choice" data-field="age" data-value="${v}" aria-pressed="${d.age===v}"><span>${v}</span><small>Monate</small></button>`).join('')}</div></section>
      <section class="finder-group"><h3>Wie viel wiegt dein Baby? ${icon('weight')}</h3><div class="option-grid">${['< 5','5–8','8–11','11+'].map(v=>`<button class="option ${d.weightBand===v?'selected':''}" data-action="finder-choice" data-field="weightBand" data-value="${ctx.esc(v)}" aria-pressed="${d.weightBand===v}">${ctx.esc(v)} kg</button>`).join('')}</div></section>
      <section class="finder-group priorities"><h3>Was ist dir besonders wichtig?</h3><p>Du kannst mehrere Optionen wählen.</p><div class="priority-list">${[['skin','leaf','Besonders hautfreundlich'],['absorb','drop','Hohe Saugkraft'],['fit','shield','Guter Sitz'],['eco','leaf','Nachhaltige Materialien']].map(([id,i,label])=>`<button class="priority ${d.priorities.includes(id)?'selected':''}" data-action="finder-choice" data-field="priority" data-value="${id}" aria-pressed="${d.priorities.includes(id)}">${icon(i,id)}<span>${label}</span></button>`).join('')}</div></section>`;
    } else if(d.step===2){
      body=`<div class="finder-intro"><div><h2>Für jede Situation<br>das passende Set.</h2><p>Wir schauen auf ${ctx.esc(c.name)}<br>und eure Windeln im Alltag.</p></div>${art('elephant')}</div><section class="finder-group"><h3>Welches Windelset möchtest du prüfen?</h3><div class="stack">${ctx.activeSets().map(s=>`<button class="priority ${d.setId===s.id?'selected':''}" data-action="finder-choice" data-field="setId" data-value="${ctx.esc(s.id)}">${icon(s.purpose==='night'?'clock':s.purpose==='swim'?'drop':'diaper')}<span>${ctx.esc(s.label)}<small>${ctx.esc(s.brand)} · Größe ${ctx.esc(s.size)}</small></span></button>`).join('')}</div></section><form id="finderWeightForm" class="finder-group"><label class="field-title" for="finderWeight">Aktuelles Gewicht in kg</label><p>Für einen genaueren Richtwert.</p><input class="input" id="finderWeight" name="weight" type="number" min="1" max="80" step="0.1" value="${d.weight}" required><button class="btn secondary block" style="margin-top:12px">Gewicht übernehmen</button></form><p class="inline-note">Dein Kinderprofil bleibt unverändert. Die Angaben gelten für diesen Windel-Finder.</p>`;
    } else if(d.step===3){
      body=`<div class="finder-intro"><div><h2>Und wie sitzt<br>die Windel gerade?</h2><p>Deine Beobachtungen helfen uns<br>beim persönlichen Fit-Check.</p></div>${art('elephant')}</div>${[['leak','Läuft die Windel häufiger aus?','yes','Ja, häufiger','no','Nein'],['marks','Gibt es deutliche Abdrücke?','yes','Ja','no','Nein'],['closure','Wie schließen die Seiten?','tight','Eher knapp','good','Gut'],['night','Probleme hauptsächlich nachts?','yes','Ja','no','Nein']].map(([field,label,a,al,b,bl])=>`<section class="finder-group"><h3>${label}</h3><div class="choice-grid">${[[a,al],[b,bl]].map(([value,text])=>`<button class="option ${d.answers[field]===value?'selected':''}" data-action="finder-choice" data-field="${field}" data-value="${value}" aria-pressed="${d.answers[field]===value}">${text}</button>`).join('')}</div></section>`).join('')}`;
    } else {
      const size=ctx.recommendSize(d.weight),fit=MyDiaper.domain.fitCheck.evaluate(d.answers,size);
      body=`<div class="finder-result">${art('elephant')}<span class="badge success">Dein persönlicher Richtwert</span><h1>Größe ${ctx.esc(size)}</h1><p>bei ${String(d.weight).replace('.',',')} kg</p><section class="finder-group"><h3>${ctx.esc(fit.result)}</h3><p>${ctx.esc(fit.note)}</p></section><p class="muted">Herstellerbereiche und die tatsächliche Passform können abweichen. Alter und Wünsche sind noch keine Produktfilter.</p><button class="btn secondary block" data-action="finder-profile-check">Fit-Check mit Profilwerten erfassen</button><p class="muted">Öffnet den speicherbaren Check für das gewählte Set mit dem Gewicht aus dem Kinderprofil. Finder-Angaben werden nicht ungefragt übernommen.</p></div>`;
    }
    return `<div class="finder-screen">${title}${progress}${body}<div class="finder-footer">${d.step>1?`<button class="text-btn finder-back" data-action="finder-back">Zurück</button>`:''}<button class="btn primary block" data-action="${d.step===4?'route':'finder-next'}" ${d.step===4?'data-route="diapers"':''}>${d.step===4?'Zu meinen Windeln':'Weiter'} ${icon('arrow')}</button></div></div>`;
  };
})();
