window.MyDiaper = window.MyDiaper || {}; MyDiaper.features = MyDiaper.features || {};

MyDiaper.features.diapers = function(ctx){
  const c = ctx.activeChild();
  const rec = ctx.recommendSize(c.weight);
  const days = ctx.daysText(c);
  const fit = ctx.latestFit();
  return `
    ${ctx.screenHeader('Meine Windeln')}
    <div class="inventory-shortcuts"><span class="muted">Finder, Fit-Check & Vorrat</span><button class="btn secondary sm" data-action="route" data-route="finder">${ctx.icon('search')} Finder öffnen</button></div>
    <section class="section">${ctx.childSwitcher()}</section>

    <section class="section grid-2">
      <div class="card">
        <div class="eyebrow">Allgemeine Empfehlung</div>
        <div class="flex-between" style="margin-top:8px"><div><h2 style="font-size:1.55rem;margin-bottom:4px">Größe ${rec}</h2><span class="muted">bei ${c.weight.toFixed(1).replace('.',',')} kg</span></div><div class="product-thumb">🩲</div></div>
        <p class="inline-note" style="margin-top:14px">Richtwert nach Gewicht. Herstellerbereiche und echter Sitz können abweichen.</p>
        <button class="btn primary block" data-action="fit-check">Passform genauer prüfen</button>
      </div>
      <div class="card">
        <div class="eyebrow">Letzter Fit-Check</div>
        ${fit ? `<h2 style="margin-top:8px">${ctx.esc(fit.result)}</h2><p class="muted">${ctx.esc(fit.note)}</p><span class="badge success">Gespeichert</span>` : `<div class="empty"><div class="big">✓</div><p>Noch kein spezifischer Fit-Check für ${ctx.esc(c.name)}.</p></div>`}
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><h2>Aktiver Vorrat</h2><button class="btn secondary sm" data-action="add-stock">+ Packung / Stück</button></div>
      <div class="card">
        <div class="flex-between"><div><strong>${ctx.esc(c.currentBrand)} ${ctx.esc(c.currentLine)}</strong><div class="muted">Größe ${ctx.esc(c.currentSize)} · ${ctx.esc(c.setLabel)}</div></div><span class="badge ${c.lowStock?'warning':'success'}">ca. ${days} Tage</span></div>
        <div class="progress" style="margin:14px 0 8px"><span style="width:${c.progress}%"></span></div>
        <div class="flex-between"><span><strong>${c.stock}</strong> Stück übrig</span><span>Ø ${c.dailyUse}/Tag</span></div>
        <div class="grid-2" style="margin-top:14px"><button class="btn ghost" data-action="use-one">− 1 verbraucht</button><button class="btn secondary" data-action="edit-stock">Vorrat bearbeiten</button></div>
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><h2>Aktive Windelarten</h2><button class="btn ghost sm" data-action="edit-child">Bearbeiten</button></div>
      <div class="grid-2">${ctx.activeSets().map(set=>`<button class="card soft" style="text-align:left;color:inherit" data-action="select-set" data-id="${ctx.esc(set.id)}" aria-pressed="${set.id===c.setId}" aria-label="${ctx.esc(set.label)} für ${ctx.esc(c.name)} auswählen"><strong>${ctx.esc(set.label)}</strong><div class="muted">für ${ctx.esc(c.name)}</div></button>`).join('')}</div>
    </section>
  `;
};
