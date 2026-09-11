window.MyDiaper = window.MyDiaper || {};

(function(){
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modalRoot');
  const toastRoot = document.getElementById('toastRoot');
  const ui = { route:'today', offerMode:'local', marketFilter:'Alle', offerView:'map' };
  const repository = MyDiaper.repository;
  const family = MyDiaper.createFamilyContext(repository, MyDiaper.store);
  const pricing = MyDiaper.domain.pricing;
  const {icon,art,rainbow} = MyDiaper.visuals;

  const esc = (v='') => String(v).replace(/[&<>'"]/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[ch]));
  const activeChild = family.activeChild;
  const recommendSize = weight => MyDiaper.domain.sizes.recommendSize(weight, MyDiaper.catalog.sizeGuide);
  const bestOfferForSize = size => MyDiaper.catalog.offers.local.filter(o=>o.size===size).sort(pricing.compareOffers)[0] || MyDiaper.catalog.offers.local[0];
  const unitPriceText = offer => { const value = pricing.offerUnitPrice(offer); return value === null ? '–' : value.toFixed(2).replace('.',','); };
  const offerCard = (o,mode)=> `<article class="card offer-card"><div class="product-thumb">🛍️</div><div><div class="flex" style="gap:7px"><strong>${esc(o.store)}</strong>${o.oldPrice?`<span class="badge danger">-${Math.round((1-o.price/o.oldPrice)*100)}%</span>`:''}</div><div>${esc(o.product)} · Größe ${esc(o.size)}</div><div class="muted">${o.count} Stück · ${unitPriceText(o)} € / Windel${mode==='local'?` · ${o.distance} km`:o.shipping?` · ${esc(o.shipping)}`:''}</div></div><div class="price">${o.price.toFixed(2).replace('.',',')} €<small>${o.oldPrice?o.oldPrice.toFixed(2).replace('.',',')+' € vorher':'Testangebot'}</small></div></article>`;
  const childSwitcher = ()=> `<div class="child-switcher">${MyDiaper.store.get().children.map(child=>family.childView(child.id)).map(c=>`<button class="child-chip ${c.id===activeChild().id?'active':''}" data-action="switch-child" data-id="${esc(c.id)}"><span class="avatar ${esc(c.color)}">${esc(c.name.slice(0,1).toUpperCase())}</span><strong>${esc(c.name)}</strong><small>Größe ${esc(c.currentSize)}</small></button>`).join('')}</div>`;
  const screenHeader=(title,back='today',action='')=>`<header class="screen-header"><button class="icon-btn" data-action="route" data-route="${back}" aria-label="Zurück">${icon('back')}</button><h1>${esc(title)}</h1>${action?`<button class="icon-btn" data-action="${action}" aria-label="Angebote suchen">${icon('search')}</button>`:'<span></span>'}</header>`;
  const ctx = {ui,esc,...family,recommendSize,bestOfferForSize,offerCard,childSwitcher,compareOffers:pricing.compareOffers,icon,art,rainbow,screenHeader};

  function render(){
    const fn = MyDiaper.features[ui.route] || MyDiaper.features.today;
    app.innerHTML = fn(ctx);
    document.getElementById('appShell').dataset.screen=ui.route;
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.route===ui.route));
    document.getElementById('notificationDot').classList.toggle('hidden', !activeChild().lowStock);
    app.focus({preventScroll:true});
  }
  function toast(msg){
    const d=document.createElement('div'); d.className='toast'; d.textContent=msg; toastRoot.appendChild(d); setTimeout(()=>d.remove(),2600);
  }
  function closeModal(){ modalRoot.className='modal-root'; modalRoot.innerHTML=''; }
  function modal(title,body){ modalRoot.className='modal-root open'; modalRoot.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h2>${esc(title)}</h2><button class="icon-btn" data-action="close-modal">✕</button></div>${body}</div>`; }
  function showNotifications(){ const c=activeChild(); modal('Benachrichtigungen', `<div class="stack"><div class="card soft"><strong>Vorrat ${c.lowStock?'wird knapp':'in Ordnung'}</strong><div class="muted">${esc(c.name)}: ${c.stock} Stück · ca. ${family.daysText(c)} Tage</div></div><div class="card soft"><strong>Größe regelmäßig prüfen</strong><div class="muted">Aktueller Gewichts-Richtwert: Größe ${recommendSize(c.weight)}</div></div></div>`); }

  function childForm(child){
    const c=child ? family.childView(child.id) : {name:'',birthdate:'',weight:6,height:60,color:'lilac',currentBrand:'Pampers',currentLine:'Premium Protection',currentSize:'3',dailyUse:6,stock:0,types:['Windel']};
    modal(child?'Kinderprofil bearbeiten':'Neues Kinderprofil', `<form id="childForm" class="stack" data-id="${esc(c.id||'')}">
      <div class="form-grid"><div class="input-group"><label>Name / Spitzname</label><input class="input" name="name" value="${esc(c.name)}" required></div><div class="input-group"><label>Geburtsdatum</label><input class="input" type="date" name="birthdate" value="${esc(c.birthdate)}"></div><div class="input-group"><label>Gewicht in kg</label><input class="input" type="number" step="0.1" min="1" max="80" name="weight" value="${c.weight}" required></div><div class="input-group"><label>Größe in cm</label><input class="input" type="number" min="30" max="200" name="height" value="${c.height}" required></div></div>
      <div class="form-grid"><div class="input-group"><label>Aktuelle Marke</label><select class="select" name="brand">${[...new Set([c.currentBrand,...MyDiaper.catalog.brands.map(b=>b.name)])].map(name=>`<option ${name===c.currentBrand?'selected':''}>${esc(name)}</option>`).join('')}</select></div><div class="input-group"><label>Aktuelle Größe</label><input class="input" name="size" value="${esc(c.currentSize)}" required></div><div class="input-group"><label>Verbrauch pro Tag</label><input class="input" type="number" min="0" step="0.1" max="20" name="dailyUse" value="${c.dailyUse}" required></div><div class="input-group"><label>Vorrat</label><input class="input" type="number" min="0" name="stock" value="${c.stock}" required></div></div>
      <div class="input-group"><label>Windelarten (Komma getrennt)</label><input class="input" name="types" value="${esc(c.types.join(', '))}"></div>
      <button class="btn primary block">Speichern</button></form>`);
  }

  function fitCheck(){
    const c=activeChild();
    modal(`Fit-Check für ${c.name}`, `<form id="fitForm" class="stack" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}">
      <div><strong>Läuft die Windel häufiger aus?</strong><div class="choice-grid" style="margin-top:8px"><label class="choice"><input type="radio" name="leak" value="yes" required> Ja, häufiger</label><label class="choice"><input type="radio" name="leak" value="no"> Nein</label></div></div>
      <div><strong>Gibt es deutliche Abdrücke?</strong><div class="choice-grid" style="margin-top:8px"><label class="choice"><input type="radio" name="marks" value="yes" required> Ja</label><label class="choice"><input type="radio" name="marks" value="no"> Nein</label></div></div>
      <div><strong>Wie schließen die Klett-/Seitenbereiche?</strong><div class="choice-grid" style="margin-top:8px"><label class="choice"><input type="radio" name="closure" value="tight" required> Eher knapp</label><label class="choice"><input type="radio" name="closure" value="good"> Gut</label></div></div>
      <div><strong>Probleme hauptsächlich nachts?</strong><div class="choice-grid" style="margin-top:8px"><label class="choice"><input type="radio" name="night" value="yes" required> Ja</label><label class="choice"><input type="radio" name="night" value="no"> Nein</label></div></div>
      <button class="btn primary block">Auswertung speichern</button></form>`);
  }

  function stockModal(){ const c=activeChild(); modal('Vorrat bearbeiten', `<form id="stockForm" class="stack" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}"><div class="inline-note">${esc(c.name)} · ${esc(c.setLabel)}</div><div class="form-grid"><div class="input-group"><label for="setBrand">Marke</label><input id="setBrand" class="input" name="brand" value="${esc(c.currentBrand)}"></div><div class="input-group"><label for="setLine">Produktlinie</label><input id="setLine" class="input" name="line" value="${esc(c.currentLine)}"></div><div class="input-group"><label for="setSize">Größe</label><input id="setSize" class="input" name="size" value="${esc(c.currentSize)}" required></div></div><div class="input-group"><label for="setStock">Aktueller Bestand</label><input id="setStock" class="input" type="number" min="0" name="stock" value="${c.stock}" required></div><div class="input-group"><label for="setDailyUse">Ø Verbrauch pro Tag</label><input id="setDailyUse" class="input" type="number" min="0" step="0.1" max="20" name="dailyUse" value="${c.dailyUse}" required></div><button class="btn primary block">Speichern</button></form>`); }
  function addStockModal(){ const c=activeChild(); modal('Packung / Stück hinzufügen', `<form id="addStockForm" class="stack" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}"><div class="input-group"><label>Anzahl hinzufügen</label><input class="input" name="amount" type="number" min="1" value="30" required></div><div class="inline-note">Später kann hier der Barcode-Scanner Marke, Größe und Packungsmenge automatisch übernehmen.</div><button class="btn primary block">Zum Vorrat hinzufügen</button></form>`); }
  function locationModal(){ modal('Standort für Angebote', `<form id="locationForm" class="stack"><div class="input-group"><label>Ort oder PLZ</label><input class="input" name="location" value="${esc(MyDiaper.store.get().settings.location)}" required></div><div class="inline-note">Die Testversion arbeitet mit manueller Eingabe. Standortfreigabe bleibt später freiwillig.</div><button class="btn primary block">Speichern</button></form>`); }
  function newListingModal(){ modal('Anzeige aufgeben', `<form id="listingForm" class="stack"><div class="form-grid"><div class="input-group"><label>Art</label><select class="select" name="mode"><option>Verkaufen</option><option>Tauschen</option><option>Verschenken</option></select></div><div class="input-group"><label>Stückzahl</label><input class="input" type="number" min="1" name="count" value="20"></div></div><div class="input-group"><label>Titel</label><input class="input" name="title" placeholder="z. B. Pampers Größe 4" required></div><div class="input-group"><label>Zustand</label><select class="select" name="condition"><option>Original verschlossen</option><option>Geöffnet · Restbestand</option></select></div><div class="input-group"><label>Preis / Tauschwunsch</label><input class="input" name="price" placeholder="z. B. 8 € / gegen Größe 5"></div><button class="btn primary block">Anzeige speichern</button></form>`); }
  function openChat(id){
    const item=MyDiaper.store.get().market.find(x=>x.id===id); const msgs=MyDiaper.store.get().chats[id]||[];
    modal(`Chat · ${item?item.owner:'Marktplatz'}`, `<div class="inline-note">${item?esc(item.title):''}</div><div class="chat-box">${msgs.length?msgs.map(m=>`<div class="chat-bubble ${m.from}">${esc(m.text)}</div>`).join(''):'<div class="empty">Noch keine Nachrichten.</div>'}</div><form id="chatForm" data-id="${id}" class="flex"><input class="input" name="message" placeholder="Nachricht schreiben …" required><button class="btn primary">Senden</button></form>`);
  }

  document.addEventListener('click', (e)=>{
    try {
    const b=e.target.closest('[data-action]'); if(!b) return; const a=b.dataset.action;
    if(a==='route'){ closeModal(); ui.route=b.dataset.route; render(); scrollTo({top:0,left:0,behavior:'instant'}); }
    if(a==='switch-child'){ repository.switchChild(b.dataset.id); closeModal(); render(); }
    if(a==='select-set'){ family.selectSet(b.dataset.id); render(); }
    if(a==='family-picker'){ modal('Deine Kinder',`<p class="child-picker-intro">Für wen schauen wir heute nach?</p>${childSwitcher()}<div class="child-picker-actions"><button class="btn primary" data-action="add-child">${icon('plus')} Kind hinzufügen</button><button class="btn secondary" data-action="edit-child">Profil bearbeiten</button></div>`); }
    if(a==='notifications') showNotifications();
    if(a==='tips') modal('Kleine Tipps für euren Alltag',`<div class="stack"><div class="card soft"><h3>Jedes Kind hat sein eigenes Set</h3><p>Wechsle über das Profilbild zwischen deinen Kindern. Vorräte und Fit-Checks bleiben getrennt.</p></div><div class="card soft"><h3>Alles im Blick</h3><p>Unter Windeln kannst du Packungen hinzufügen und den Verbrauch für Tages-, Nacht- oder Schwimmwindeln erfassen.</p></div><button class="btn primary" data-action="route" data-route="finder">Windel-Finder öffnen ${icon('arrow')}</button></div>`);
    if(a==='finder-choice'){MyDiaper.finder.choice(activeChild(),b.dataset.field,b.dataset.value);render();}
    if(a==='finder-next'){
      const d=MyDiaper.finder.state(activeChild());
      if(d.step===2){const input=document.getElementById('finderWeight');if(input && input.value!==undefined){const weight=Number(input.value);if(!Number.isFinite(weight)||weight<1||weight>80)throw new Error('Bitte ein Gewicht zwischen 1 und 80 kg eingeben.');d.weight=weight;}}
      d.step=Math.min(4,d.step+1);render();scrollTo({top:0,left:0,behavior:'instant'});
    }
    if(a==='finder-back'){const d=MyDiaper.finder.state(activeChild());d.step=Math.max(1,d.step-1);render();scrollTo({top:0,left:0,behavior:'instant'});}
    if(a==='finder-profile-check'){const d=MyDiaper.finder.state(activeChild());family.selectSet(d.setId);fitCheck();}
    if(a==='offer-view'){ui.offerView=b.dataset.view;render();}
    if(a==='map-store'){if(b.dataset.id==='unavailable')toast('Für diesen Händler sind keine Demo-Angebote hinterlegt.');else{ui.highlightOffer=b.dataset.id;render();}}
    if(a==='offer-search')modal('Angebote suchen',`<form id="offerSearchForm" class="stack"><div class="input-group"><label for="offerQuery">Produkt, Händler oder Größe</label><input class="input" id="offerQuery" name="query" value="${esc(ui.offerSearch||'')}" placeholder="z. B. Pampers"></div><button class="btn primary">Suchen</button></form>`);
    if(a==='favorite-offer'){MyDiaper.store.patch(s=>{const ids=s.settings.favoriteOfferIds||[];s.settings.favoriteOfferIds=ids.includes(b.dataset.id)?ids.filter(id=>id!==b.dataset.id):[...ids,b.dataset.id];});render();}
    if(a==='add-child') childForm();
    if(a==='edit-child') childForm(activeChild());
    if(a==='edit-specific-child') childForm(MyDiaper.store.get().children.find(c=>c.id===b.dataset.id));
    if(a==='fit-check') fitCheck();
    if(a==='edit-stock') stockModal();
    if(a==='add-stock') addStockModal();
    if(a==='use-one'){ const c=activeChild(); const used=repository.consumeStock(c.id,c.setId); toast(used ? '1 Windel vom Vorrat abgezogen.' : 'Kein Vorrat zum Abziehen vorhanden.'); render(); }
    if(a==='offer-tab'){ ui.offerMode=b.dataset.mode; render(); }
    if(a==='market-tab'){ ui.marketFilter=b.dataset.mode; render(); }
    if(a==='new-listing') newListingModal();
    if(a==='open-chat') openChat(b.dataset.id);
    if(a==='edit-location') locationModal();
    if(a==='close-modal') closeModal();
    if(a==='reset-app' && confirm('Testdaten wirklich zurücksetzen?')){ MyDiaper.store.reset(); family.clearSelection(); MyDiaper.finder.reset(); toast('Testdaten zurückgesetzt.'); render(); }
    } catch(error) { toast(error.message); }
  });

  document.addEventListener('change', (e)=>{
    try {
    if(e.target.matches('[data-setting]')){ const key=e.target.dataset.setting; MyDiaper.store.patch(s=>s.settings.reminders[key]=e.target.checked); toast('Einstellung gespeichert.'); }
    } catch(error) { toast(error.message); render(); }
  });

  document.addEventListener('submit',(e)=>{
    try {
    if(e.target.id==='finderWeightForm'){e.preventDefault();const weight=Number(new FormData(e.target).get('weight'));if(!Number.isFinite(weight)||weight<1||weight>80)throw new Error('Bitte ein Gewicht zwischen 1 und 80 kg eingeben.');MyDiaper.finder.state(activeChild()).weight=weight;toast('Gewicht für den Finder übernommen.');}
    if(e.target.id==='offerSearchForm'){e.preventDefault();ui.offerSearch=String(new FormData(e.target).get('query')||'');ui.offerView='list';closeModal();render();}
    if(e.target.id==='childForm'){
      e.preventDefault(); const f=new FormData(e.target);
      repository.saveChildProfile({id:e.target.dataset.id || undefined,name:f.get('name'),birthdate:f.get('birthdate'),weight:+f.get('weight'),height:+f.get('height'),brand:f.get('brand'),size:f.get('size'),dailyUse:+f.get('dailyUse'),stock:+f.get('stock'),types:String(f.get('types')).split(',')});
      closeModal(); toast('Kinderprofil gespeichert.'); render();
    }
    if(e.target.id==='fitForm'){
      e.preventDefault(); const f=new FormData(e.target);
      repository.saveFitCheck(e.target.dataset.childId,e.target.dataset.setId,Object.fromEntries(f));
      closeModal(); toast('Fit-Check gespeichert.'); render();
    }
    if(e.target.id==='stockForm') { e.preventDefault(); const f=new FormData(e.target); repository.updateSet(e.target.dataset.childId,e.target.dataset.setId,{brand:f.get('brand'),line:f.get('line'),size:f.get('size'),stock:+f.get('stock'),dailyUse:+f.get('dailyUse')}); closeModal(); toast('Vorrat aktualisiert.'); render(); }
    if(e.target.id==='addStockForm') { e.preventDefault(); const f=new FormData(e.target); repository.addStock(e.target.dataset.childId,e.target.dataset.setId,+f.get('amount')); closeModal(); toast('Vorrat ergänzt.'); render(); }
    if(e.target.id==='locationForm') { e.preventDefault(); const f=new FormData(e.target); MyDiaper.store.patch(s=>s.settings.location=f.get('location')); closeModal(); toast('Standort gespeichert.'); render(); }
    if(e.target.id==='listingForm') { e.preventDefault(); const f=new FormData(e.target); MyDiaper.store.patch(s=>s.market.unshift({id:'m'+Date.now(),mode:f.get('mode'),title:f.get('title'),condition:f.get('condition'),count:+f.get('count'),price:f.get('price')||'VB',distance:'in deiner Nähe',owner:'Du',created:'Jetzt'})); closeModal(); toast('Anzeige gespeichert.'); render(); }
    if(e.target.id==='chatForm') { e.preventDefault(); const f=new FormData(e.target); const id=e.target.dataset.id; MyDiaper.store.patch(s=>{s.chats[id]=s.chats[id]||[]; s.chats[id].push({from:'me',text:f.get('message')});}); openChat(id); }
    } catch(error) { toast(error.message); }
  });

  document.querySelectorAll('.nav-item').forEach(b=>{
    const entry=({today:['home','Heute'],diapers:['diaper','Windeln'],offers:['tag','Angebote'],market:['swap','Börse'],profile:['user','Profil']})[b.dataset.route];
    b.innerHTML=icon(entry[0],entry[0])+`<small>${entry[1]}</small>`;
    b.addEventListener('click',()=>{ui.route=b.dataset.route;closeModal();render();scrollTo({top:0,left:0,behavior:'instant'});});
  });
  document.getElementById('notificationsButton').addEventListener('click',showNotifications);
  document.getElementById('desktopBrand').innerHTML=art('brandElephant')+art('wordmark')+'<p>Kleine Schritte. Große Abenteuer.</p><p class="handwritten">Mehr Zeit für das,<br>was wirklich zählt. ♡</p>';

  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  render();
  if(MyDiaper.store.status().warning) toast(MyDiaper.store.status().warning);

  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
