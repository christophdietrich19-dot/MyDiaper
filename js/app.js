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
  const bestOfferForSize = size => MyDiaper.offerService.search({scope:'local',size})[0] || MyDiaper.offerService.search({scope:'local'})[0];
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
  function modal(title,body){ modalRoot.className='modal-root open'; modalRoot.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><span class="modal-grabber"></span><div class="modal-header"><h2>${esc(title)}</h2><button class="icon-btn" data-action="close-modal" aria-label="Dialog schließen">${icon('close')}</button></div>${body}</div>`; }
  const dateText=value=>value?new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value)):'ohne Datum';
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
    modal(`Fit-Check für ${c.name}`, `<form id="fitForm" class="stack form-sheet" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}"><div class="modal-context">${icon('diaper')}<div><strong>${esc(c.setLabel)}</strong><small>${esc(c.currentBrand)} ${esc(c.currentLine)} · Größe ${esc(c.currentSize)}</small></div></div>
      <div class="question-block"><strong>Läuft die Windel häufiger aus?</strong><div class="choice-grid"><label class="choice"><input type="radio" name="leak" value="yes" required> Ja, häufiger</label><label class="choice"><input type="radio" name="leak" value="no"> Nein</label></div></div>
      <div class="question-block"><strong>Gibt es deutliche Abdrücke?</strong><div class="choice-grid"><label class="choice"><input type="radio" name="marks" value="yes" required> Ja</label><label class="choice"><input type="radio" name="marks" value="no"> Nein</label></div></div>
      <div class="question-block"><strong>Wie schließen die Klett-/Seitenbereiche?</strong><div class="choice-grid"><label class="choice"><input type="radio" name="closure" value="tight" required> Eher knapp</label><label class="choice"><input type="radio" name="closure" value="good"> Gut</label></div></div>
      <div class="question-block"><strong>Probleme hauptsächlich nachts?</strong><div class="choice-grid"><label class="choice"><input type="radio" name="night" value="yes" required> Ja</label><label class="choice"><input type="radio" name="night" value="no"> Nein</label></div></div>
      <button class="btn primary block">Auswertung speichern</button></form>`);
  }

  function experienceModal(experience){
    const c=activeChild(),rating=(name,label,low,high)=>`<fieldset class="rating-field"><legend>${label}</legend><div class="rating-scale">${[1,2,3,4,5].map(value=>`<label><input type="radio" name="${name}" value="${value}" ${(experience?.[name]??3)===value?'checked':''} required><span>${value}</span></label>`).join('')}</div><div class="rating-ends"><small>${low}</small><small>${high}</small></div></fieldset>`;
    modal(experience?'Erfahrung bearbeiten':'Erfahrung eintragen',`<form id="experienceForm" class="stack form-sheet" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}" data-id="${esc(experience?.id||'')}"><div class="modal-context mint">${icon('heart')}<div><strong>${esc(c.name)} · ${esc(c.setLabel)}</strong><small>${esc(c.currentBrand)} ${esc(c.currentLine)} · Größe ${esc(c.currentSize)}</small></div></div><p class="form-explainer">Diese Einschätzung gilt nur für dieses Kind und dieses Windelset.</p>
      ${rating('fitRating','Passform','schwierig','sehr gut')}${rating('leakRating','Auslaufschutz','schwach','sehr gut')}${rating('nightRating','Nachtleistung','ungeeignet','sehr gut')}${rating('skinComfortRating','Hautkomfort','schwach','sehr gut')}
      <div class="input-group"><label for="sizeTendency">Wie fällt die Größe aus?</label><select class="select" id="sizeTendency" name="sizeTendency"><option value="small" ${experience?.sizeTendency==='small'?'selected':''}>Eher klein</option><option value="normal" ${!experience||experience.sizeTendency==='normal'?'selected':''}>Größenentsprechend</option><option value="large" ${experience?.sizeTendency==='large'?'selected':''}>Eher groß</option></select></div>
      <label class="avoid-check"><input type="checkbox" name="avoidRecommendation" ${experience?.avoidRecommendation?'checked':''}><span>${icon('shield')}</span><span><strong>Nicht erneut empfehlen</strong><small>Dieses Produkt bei Vorschlägen für ${esc(c.name)} zurückstellen.</small></span></label>
      <div class="input-group"><label for="experienceNotes">Persönliche Notiz</label><textarea class="input" id="experienceNotes" name="notes" maxlength="600" rows="3" placeholder="Was ist euch aufgefallen?">${esc(experience?.notes||'')}</textarea></div>
      <button class="btn primary block">Erfahrung speichern</button></form>`);
  }

  function historyModal(){
    const c=activeChild(),fits=repository.listFitChecks(c.id,c.setId).slice().reverse(),experiences=repository.listExperiences(c.id,c.setId).slice().reverse(),sizes=repository.listSizeHistory(c.id,c.setId).slice().reverse();
    const experienceCards=experiences.map(item=>`<article class="history-card"><span class="history-icon mint">${icon('heart')}</span><div><strong>Produkterfahrung · ${dateText(item.updatedAt||item.createdAt)}</strong><p>${esc(item.notes||({small:'Fällt eher klein aus.',normal:'Wirkt größenentsprechend.',large:'Fällt eher groß aus.'}[item.sizeTendency]||'Bewertung gespeichert.'))}</p><small>${item.avoidRecommendation?'Nicht erneut empfehlen':'Persönliche Bewertung für dieses Set'}</small></div><button class="icon-btn" data-action="experience-edit" data-id="${esc(item.id)}" aria-label="Erfahrung bearbeiten">${icon('user')}</button></article>`).join('');
    const fitCards=fits.map(item=>`<article class="history-card"><span class="history-icon blue">${icon('check')}</span><div><strong>${esc(item.result)}</strong><p>${esc(item.note)}</p><small>Fit-Check · ${dateText(item.createdAt)}</small></div></article>`).join('');
    const sizeCards=sizes.map(item=>{const changedSize=item.fromSize!==item.toSize,from=[item.fromProduct?.brand,item.fromProduct?.line].filter(Boolean).join(' '),to=[item.toProduct?.brand,item.toProduct?.line].filter(Boolean).join(' ');return `<article class="history-card"><span class="history-icon peach">${icon('arrow')}</span><div><strong>${item.fromSize==null?`Start mit Größe ${esc(item.toSize)}`:changedSize?`Größe ${esc(item.fromSize)} → ${esc(item.toSize)}`:'Produkt gewechselt'}</strong><p>${from&&to&&from!==to?`${esc(from)} → ${esc(to)}`:item.reason==='catalog'?'Aus dem Testkatalog übernommen':item.reason==='profile'?'Über das Kinderprofil geändert':item.reason==='manual'?'Im Windelset geändert':'Ausgangsprodukt übernommen'}</p><small>Produkt- & Größenverlauf · ${dateText(item.createdAt)}</small></div></article>`;}).join('');
    modal(`Verlauf für ${c.name}`,`<div class="modal-context">${icon('clock')}<div><strong>${esc(c.setLabel)}</strong><small>${esc(c.currentBrand)} ${esc(c.currentLine)} · Größe ${esc(c.currentSize)}</small></div></div><div class="history-list">${experienceCards}${fitCards}${sizeCards}${!experienceCards&&!fitCards&&!sizeCards?'<div class="friendly-empty compact"><strong>Noch kein Verlauf</strong><p>Fit-Checks, Erfahrungen und Größenwechsel erscheinen später hier.</p></div>':''}</div><button class="btn primary block" data-action="experience-add">Neue Erfahrung eintragen</button>`);
  }

  function stockModal(){ const c=activeChild(); modal('Vorrat bearbeiten', `<form id="stockForm" class="stack" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}"><div class="inline-note">${esc(c.name)} · ${esc(c.setLabel)}</div><div class="form-grid"><div class="input-group"><label for="setBrand">Marke</label><input id="setBrand" class="input" name="brand" value="${esc(c.currentBrand)}"></div><div class="input-group"><label for="setLine">Produktlinie</label><input id="setLine" class="input" name="line" value="${esc(c.currentLine)}"></div><div class="input-group"><label for="setSize">Größe</label><input id="setSize" class="input" name="size" value="${esc(c.currentSize)}" required></div></div><div class="input-group"><label for="setStock">Aktueller Bestand</label><input id="setStock" class="input" type="number" min="0" name="stock" value="${c.stock}" required></div><div class="input-group"><label for="setDailyUse">Ø Verbrauch pro Tag</label><input id="setDailyUse" class="input" type="number" min="0" step="0.1" max="20" name="dailyUse" value="${c.dailyUse}" required></div><button class="btn primary block">Speichern</button></form>`); }
  function addStockModal(){ const c=activeChild(); modal('Packung / Stück hinzufügen', `<form id="addStockForm" class="stack" data-child-id="${esc(c.id)}" data-set-id="${esc(c.setId)}"><div class="input-group"><label>Anzahl hinzufügen</label><input class="input" name="amount" type="number" min="1" value="30" required></div><div class="inline-note">Später kann hier der Barcode-Scanner Marke, Größe und Packungsmenge automatisch übernehmen.</div><button class="btn primary block">Zum Vorrat hinzufügen</button></form>`); }
  function locationModal(){ modal('Standort für Angebote', `<form id="locationForm" class="stack"><div class="input-group"><label>Ort oder PLZ</label><input class="input" name="location" value="${esc(MyDiaper.store.get().settings.location)}" required></div><div class="inline-note">Die Testversion arbeitet mit manueller Eingabe. Standortfreigabe bleibt später freiwillig.</div><button class="btn primary block">Speichern</button></form>`); }
  function priceAlertModal(offer){
    if(!offer||!offer.productSizeId)throw new Error('Für dieses Angebot ist noch keine Produktgröße verknüpft.');
    const c=activeChild(),alerts=MyDiaper.offerRepository.listAlerts(c.id),existing=alerts.find(item=>item.productSizeId===offer.productSizeId&&(item.scope===offer.scope||item.scope==='both'));
    const unit=pricing.offerUnitPrice(offer),value=existing?.maxUnitPrice??(unit===null?0.25:Math.ceil(unit*100)/100);
    modal(existing?'Preisalarm bearbeiten':'Preisalarm anlegen',`<form id="priceAlertForm" class="stack form-sheet" data-child-id="${esc(c.id)}" data-product-size-id="${esc(offer.productSizeId)}" data-id="${esc(existing?.id||'')}"><div class="modal-context mint">${icon('bell')}<div><strong>${esc(c.name)} · ${esc(offer.product)}</strong><small>Größe ${esc(offer.size)} · aktuell ${unit===null?'–':unit.toFixed(2).replace('.',',')} € pro Windel</small></div></div><p class="form-explainer">Der Alarm wird nur mit Angeboten derselben Katalog-Produktgröße verglichen.</p><div class="input-group"><label for="maxUnitPrice">Maximaler Stückpreis in Euro</label><input class="input" id="maxUnitPrice" name="maxUnitPrice" type="number" min="0.01" max="10" step="0.01" value="${value.toFixed(2)}" required></div><div class="input-group"><label for="alertScope">Angebotsbereich</label><select class="select" id="alertScope" name="scope"><option value="local" ${(existing?.scope||offer.scope)==='local'?'selected':''}>Nur in deiner Nähe</option><option value="online" ${(existing?.scope||offer.scope)==='online'?'selected':''}>Nur online</option><option value="both" ${existing?.scope==='both'?'selected':''}>Lokal und online</option></select></div><div class="inline-note">Die Testversion speichert den Alarm lokal. Benachrichtigungen und echte Preisfeeds folgen später.</div><button class="btn primary block">Preisalarm speichern</button></form>`);
  }
  function manageAlertsModal(){
    const c=activeChild(),alerts=MyDiaper.offerRepository.listAlerts(c.id);
    modal(`Preisalarme für ${c.name}`,`<div class="history-list price-alert-list">${alerts.length?alerts.map(alert=>{const found=MyDiaper.domain.catalog.details(MyDiaper.productCatalog,alert.productSizeId);return `<article class="history-card"><span class="history-icon mint">${icon('bell')}</span><div><strong>${esc(found?`${found.brand.name} ${found.product.name}`:'Katalogprodukt')}</strong><p>Größe ${esc(found?.size.label||'–')} · bis ${alert.maxUnitPrice.toFixed(2).replace('.',',')} € pro Windel</p><small>${({local:'In deiner Nähe',online:'Online',both:'Lokal und online'})[alert.scope]}</small></div><button class="icon-btn" data-action="remove-price-alert" data-id="${esc(alert.id)}" aria-label="Preisalarm entfernen">${icon('close')}</button></article>`;}).join(''):'<div class="friendly-empty compact"><strong>Noch keine Preisalarme</strong><p>Öffne ein Angebot und lege dort deine persönliche Preisgrenze fest.</p></div>'}</div><p class="catalog-disclaimer">Demo-Angebote lösen keine echte Push-Nachricht aus.</p>`);
  }
  function offerSourcesModal(){
    const imports=MyDiaper.offerImportRepository.list(),status=MyDiaper.offerImportRepository.status(),template=MyDiaper.offerImportRepository.template();
    const sources=`<article class="source-card demo"><span>${icon('box')}</span><div><strong>Lokale MyDiaper-Testdaten</strong><small>Feste Demo-Quelle · nicht live geprüft</small></div><span></span></article>${imports.map(item=>`<article class="source-card"><span>${icon('check')}</span><div><strong>${esc(item.label)}</strong><small>${item.offerCount} Angebot${item.offerCount===1?'':'e'} · importiert am ${dateText(item.importedAt)}</small></div><button class="icon-btn" data-action="remove-offer-source" data-id="${esc(item.providerKey)}" aria-label="${esc(item.label)} entfernen">${icon('close')}</button></article>`).join('')}`;
    modal('Angebotsquellen',`<div class="source-list">${sources}</div>${status.warning?`<div class="inline-note">${esc(status.warning)}</div>${status.readOnly?'<button class="reset-link" data-action="reset-offer-imports">Beschädigte Importdaten zurücksetzen</button>':''}`:''}<form id="offerImportForm" class="stack form-sheet"><div class="input-group"><label for="offerImportFile">JSON-Datei auswählen</label><input class="input file-input" id="offerImportFile" type="file" accept="application/json,.json"></div><div class="input-group"><label for="offerImportBundle">oder Angebotsdaten einfügen</label><textarea class="input json-import" id="offerImportBundle" name="bundle" maxlength="${MyDiaper.domain.offers.MAX_IMPORT_CHARS}" placeholder="JSON-Angebotsdaten hier einfügen"></textarea></div><div class="privacy-note">${icon('shield')}<span>Der Import wird lokal gespeichert. Produktpackungen müssen bereits im internen Katalog existieren; Preise werden nicht als live verifiziert ausgegeben.</span></div><button class="btn primary block">Quelle prüfen & importieren</button></form><details class="source-help"><summary>Formatbeispiel anzeigen</summary><pre class="json-preview">${esc(template)}</pre></details>`);
  }
  function backupExportModal(){
    const text=MyDiaper.domain.backup.serialize(MyDiaper.store.get());
    modal('Familien-Backup exportieren',`<div class="privacy-note">${icon('shield')}<span>Das Backup enthält private Kinder-, Vorrats-, Fit- und Einstellungsdaten. Es wird nur lokal angezeigt oder heruntergeladen.</span></div><div class="input-group"><label for="familyBackupExport">Versioniertes JSON-Backup</label><textarea class="input json-import" id="familyBackupExport" readonly>${esc(text)}</textarea></div><div class="backup-actions"><button class="btn primary" data-action="download-family-backup">JSON herunterladen</button><button class="btn secondary" data-action="family-backup-import">Backup einlesen</button></div>`);
  }
  function backupImportModal(){
    modal('Familien-Backup einlesen',`<form id="backupImportForm" class="stack form-sheet"><div class="input-group"><label for="familyBackupFile">JSON-Datei auswählen</label><input class="input file-input" id="familyBackupFile" type="file" accept="application/json,.json"></div><div class="input-group"><label for="familyBackupText">oder Backup-Daten einfügen</label><textarea class="input json-import" id="familyBackupText" name="backup" maxlength="${MyDiaper.domain.backup.MAX_CHARS}" placeholder="MyDiaper-Familien-Backup hier einfügen" required></textarea></div><div class="privacy-note">${icon('shield')}<span>Vor dem Einlesen werden Format, Version und sämtliche Kind-/Set-Zuordnungen geprüft. Erst danach kannst du das Ersetzen bestätigen.</span></div><button class="btn primary block">Backup prüfen & einlesen</button></form>`);
  }
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
    if(a==='experience-add'){if(b.dataset.setId)family.selectSet(b.dataset.setId);experienceModal();}
    if(a==='experience-edit'){const c=activeChild(),experience=repository.listExperiences(c.id).find(item=>item.id===b.dataset.id&&item.setId===c.setId);if(!experience)throw new Error('Erfahrung für dieses Set nicht gefunden.');experienceModal(experience);}
    if(a==='history')historyModal();
    if(a==='catalog-assign'){const c=activeChild(),setId=b.dataset.setId||c.setId;repository.assignProduct(c.id,setId,b.dataset.id);family.selectSet(setId);toast('Katalogprodukt für dieses Set übernommen.');render();}
    if(a==='offer-view'){ui.offerView=b.dataset.view;render();}
    if(a==='map-store'){if(b.dataset.id==='unavailable')toast('Für diesen Händler sind keine Demo-Angebote hinterlegt.');else{ui.highlightOffer=b.dataset.id;render();}}
    if(a==='offer-search')modal('Angebote suchen',`<form id="offerSearchForm" class="stack"><div class="input-group"><label for="offerQuery">Produkt, Händler oder Größe</label><input class="input" id="offerQuery" name="query" value="${esc(ui.offerSearch||'')}" placeholder="z. B. Pampers"></div><button class="btn primary">Suchen</button></form>`);
    if(a==='favorite-offer'){MyDiaper.store.patch(s=>{const ids=s.settings.favoriteOfferIds||[];s.settings.favoriteOfferIds=ids.includes(b.dataset.id)?ids.filter(id=>id!==b.dataset.id):[...ids,b.dataset.id];});render();}
    if(a==='price-alert')priceAlertModal(MyDiaper.offerService.getById(b.dataset.id));
    if(a==='manage-alerts')manageAlertsModal();
    if(a==='remove-price-alert'){MyDiaper.offerRepository.removeAlert(activeChild().id,b.dataset.id);toast('Preisalarm entfernt.');manageAlertsModal();}
    if(a==='manage-offer-sources')offerSourcesModal();
    if(a==='remove-offer-source'&&confirm('Diese lokal importierte Angebotsquelle wirklich entfernen?')){MyDiaper.offerImportRepository.remove(b.dataset.id);toast('Angebotsquelle entfernt.');offerSourcesModal();render();}
    if(a==='reset-offer-imports'&&confirm('Die unlesbaren lokalen Angebotsimporte wirklich zurücksetzen?')){MyDiaper.offerImportRepository.reset();toast('Angebotsimporte zurückgesetzt.');offerSourcesModal();render();}
    if(a==='family-backup-export')backupExportModal();
    if(a==='family-backup-import')backupImportModal();
    if(a==='download-family-backup'){
      const day=new Date().toISOString().slice(0,10),text=MyDiaper.domain.backup.serialize(MyDiaper.store.get());
      if(MyDiaper.platform.files.downloadText(`mydiaper-familie-${day}.json`,text))toast('Familien-Backup heruntergeladen.');
      else toast('Download nicht verfügbar. Das JSON kann aus dem Textfeld kopiert werden.');
    }
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

  document.addEventListener('change', async (e)=>{
    try {
    if(e.target.id==='offerImportFile'&&e.target.files?.[0]){document.getElementById('offerImportBundle').value=await MyDiaper.platform.files.readText(e.target.files[0],MyDiaper.domain.offers.MAX_IMPORT_CHARS);toast('Angebotsdatei geladen. Bitte Import bestätigen.');}
    if(e.target.id==='familyBackupFile'&&e.target.files?.[0]){document.getElementById('familyBackupText').value=await MyDiaper.platform.files.readText(e.target.files[0],MyDiaper.domain.backup.MAX_CHARS);toast('Backup-Datei geladen. Bitte Einlesen bestätigen.');}
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
    if(e.target.id==='experienceForm'){
      e.preventDefault();const f=new FormData(e.target);
      repository.saveExperience(e.target.dataset.childId,e.target.dataset.setId,{id:e.target.dataset.id||undefined,fitRating:+f.get('fitRating'),leakRating:+f.get('leakRating'),nightRating:+f.get('nightRating'),skinComfortRating:+f.get('skinComfortRating'),sizeTendency:f.get('sizeTendency'),avoidRecommendation:f.get('avoidRecommendation')!==null,notes:f.get('notes')||''});
      closeModal();toast('Persönliche Erfahrung gespeichert.');render();
    }
    if(e.target.id==='stockForm') { e.preventDefault(); const f=new FormData(e.target); repository.updateSet(e.target.dataset.childId,e.target.dataset.setId,{brand:f.get('brand'),line:f.get('line'),size:f.get('size'),stock:+f.get('stock'),dailyUse:+f.get('dailyUse')}); closeModal(); toast('Vorrat aktualisiert.'); render(); }
    if(e.target.id==='addStockForm') { e.preventDefault(); const f=new FormData(e.target); repository.addStock(e.target.dataset.childId,e.target.dataset.setId,+f.get('amount')); closeModal(); toast('Vorrat ergänzt.'); render(); }
    if(e.target.id==='locationForm') { e.preventDefault(); const f=new FormData(e.target); MyDiaper.store.patch(s=>s.settings.location=f.get('location')); closeModal(); toast('Standort gespeichert.'); render(); }
    if(e.target.id==='priceAlertForm'){e.preventDefault();const f=new FormData(e.target);MyDiaper.offerRepository.saveAlert(e.target.dataset.childId,{id:e.target.dataset.id||undefined,productSizeId:e.target.dataset.productSizeId,maxUnitPrice:+f.get('maxUnitPrice'),scope:f.get('scope'),enabled:true});closeModal();toast('Preisalarm gespeichert.');render();}
    if(e.target.id==='offerImportForm'){e.preventDefault();const f=new FormData(e.target),result=MyDiaper.offerImportRepository.importText(f.get('bundle'));ui.offerView='list';closeModal();toast(`${result.offerCount} Angebot${result.offerCount===1?'':'e'} aus ${result.label} importiert.`);render();}
    if(e.target.id==='backupImportForm'){
      e.preventDefault();const f=new FormData(e.target),backup=MyDiaper.domain.backup.parse(String(f.get('backup')||''));
      if(!confirm('Das geprüfte Backup ersetzt jetzt die lokal gespeicherten Familien- und Einstellungsdaten. Fortfahren?'))return;
      MyDiaper.store.replace(backup.state);family.clearSelection();MyDiaper.finder.reset();closeModal();toast('Familien-Backup erfolgreich eingelesen.');render();
    }
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
