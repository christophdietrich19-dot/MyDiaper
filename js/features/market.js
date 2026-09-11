window.MyDiaper = window.MyDiaper || {}; MyDiaper.features = MyDiaper.features || {};

MyDiaper.features.market = function(ctx){
  const items = MyDiaper.store.get().market;
  const filter = ctx.ui.marketFilter || 'Alle';
  const visible = filter==='Alle' ? items : items.filter(x=>x.mode===filter);
  return `
    <div class="eyebrow">Windelbörse</div><h1>Verkaufen, tauschen, verschenken</h1><p class="muted">Praktisch statt Social Network. Zustand immer klar kennzeichnen.</p>
    <section class="section"><div class="tabs">${['Alle','Verkaufen','Tauschen','Verschenken'].map(x=>`<button class="tab ${filter===x?'active':''}" data-action="market-tab" data-mode="${x}">${x}</button>`).join('')}</div></section>
    <section class="section"><button class="btn primary block" data-action="new-listing">+ Anzeige aufgeben</button></section>
    <section class="section stack">
      ${visible.map(m=>`<article class="card market-listing"><div class="product-thumb">📦</div><div><div class="flex-between"><span class="badge ${m.mode==='Verschenken'?'success':m.mode==='Tauschen'?'blue':''}">${ctx.esc(m.mode)}</span><span class="muted">${ctx.esc(m.created)}</span></div><h3 style="margin:9px 0 4px">${ctx.esc(m.title)}</h3><div class="muted">${ctx.esc(m.condition)} · ${m.count} Stück</div><div class="meta"><span class="badge">📍 ${ctx.esc(m.distance)}</span><span class="badge">${ctx.esc(m.price)}</span><span class="badge">von ${ctx.esc(m.owner)}</span></div><button class="btn secondary sm" style="margin-top:10px" data-action="open-chat" data-id="${m.id}">Chat öffnen</button></div></article>`).join('') || '<div class="card empty">Keine Anzeigen in diesem Bereich.</div>'}
    </section>
  `;
};
