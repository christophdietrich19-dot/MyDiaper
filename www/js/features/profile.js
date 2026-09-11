window.MyDiaper = window.MyDiaper || {}; MyDiaper.features = MyDiaper.features || {};

MyDiaper.features.profile = function(ctx){
  const s = MyDiaper.store.get();
  s.children = s.children.map(c => ctx.childView(c.id));
  return `
    <div class="eyebrow">Profil & Einstellungen</div><h1>Familie, Erinnerungen & App</h1><p class="muted">Mehrere Kinderprofile, eigener Vorrat und getrennte Empfehlungen.</p>
    <section class="section"><div class="section-heading"><h2>Kinderprofile</h2><button class="btn secondary sm" data-action="add-child">+ Profil</button></div><div class="stack">${s.children.map(c=>`<div class="card flex-between"><div class="flex"><div class="avatar ${c.color}">${ctx.esc(c.name.slice(0,1).toUpperCase())}</div><div><strong>${ctx.esc(c.name)}</strong><div class="muted">${c.weight.toFixed(1).replace('.',',')} kg · ${c.height} cm · Größe ${ctx.esc(c.currentSize)}</div></div></div><button class="btn ghost sm" data-action="edit-specific-child" data-id="${c.id}">Bearbeiten</button></div>`).join('')}</div></section>
    <section class="section"><h2>Erinnerungen</h2><div class="card">${Object.entries({stock:'Vorrat wird knapp',size:'Möglicher Größenwechsel',offers:'Passende Angebote',market:'Marktplatz-Nachrichten'}).map(([k,label])=>`<label class="list-row"><span>${label}</span><input type="checkbox" data-setting="${k}" ${s.settings.reminders[k]?'checked':''}></label>`).join('')}</div></section>
    <section class="section"><h2>Standort & Lieblingsgeschäfte</h2><div class="card"><div class="list-row"><div><strong>${ctx.esc(s.settings.location)}</strong><div class="muted">manuell gewählt · kein Standortzwang</div></div><button class="btn ghost sm" data-action="edit-location">Ändern</button></div><div class="list-row"><span>Bevorzugt</span><span class="muted">${ctx.esc(s.settings.preferredStores.join(', '))}</span></div></div></section>
    <section class="section"><h2>Testversion</h2><div class="card"><p class="muted">Profile und Einstellungen werden lokal im Browser gespeichert. Für eine spätere Store-Version ist die Struktur auf Cloud-Sync, Push, Barcode/Kamera und native Hülle vorbereitet.</p><button class="btn danger sm" data-action="reset-app">Testdaten zurücksetzen</button></div></section>
    <div class="credit"><strong>Idee: Felix & Christoph</strong><br>Konzept, Aufbau & Code: Christoph · christoph-it<br><span>MyDiaper Testversion 1.0</span></div>
  `;
};
