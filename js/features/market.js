window.MyDiaper=window.MyDiaper||{};MyDiaper.features=MyDiaper.features||{};

MyDiaper.features.market=function(ctx){
  const items=MyDiaper.store.get().market,filter=ctx.ui.marketFilter||'Alle';
  const visible=filter==='Alle'?items:items.filter(item=>item.mode===filter);
  const iconFor=mode=>mode==='Verschenken'?'heart':mode==='Tauschen'?'swap':'tag';
  const conditionText=item=>/\bStück\b/i.test(item.condition)?item.condition:`${item.condition} · ${item.count} Stück`;
  return `<div class="market-screen">${ctx.screenHeader('Windel-Börse')}
    <section class="market-hero"><div><p class="eyebrow">Weitergeben statt wegwerfen</p><h1>Windeln finden<br>ein neues Zuhause.</h1><p>Verkaufen, tauschen, verschenken – übersichtlich und familiennah.</p></div><span class="market-hero-art">${ctx.icon('swap')}</span></section>
    <div class="market-filter" aria-label="Anzeigen filtern">${['Alle','Verkaufen','Tauschen','Verschenken'].map(mode=>`<button class="${filter===mode?'selected':''}" data-action="market-tab" data-mode="${mode}" aria-pressed="${filter===mode}">${mode}</button>`).join('')}</div>
    <button class="btn primary block create-listing" data-action="new-listing">${ctx.icon('plus')} Anzeige aufgeben</button>
    <section class="market-results"><div class="section-heading"><h2>${filter==='Alle'?'Anzeigen in deiner Nähe':filter}</h2><span>${visible.length} Treffer</span></div>
      ${visible.map(item=>`<article class="market-card" data-listing-id="${ctx.esc(item.id)}"><div class="listing-icon ${item.mode.toLowerCase()}">${ctx.icon(iconFor(item.mode))}</div><div class="listing-body"><div class="listing-top"><span class="listing-mode">${ctx.esc(item.mode)}</span><small>${ctx.esc(item.created)}</small></div><h3>${ctx.esc(item.title)}</h3><p>${ctx.esc(conditionText(item))}</p><div class="listing-meta"><span>${ctx.icon('pin')} ${ctx.esc(item.distance)}</span><strong>${ctx.esc(item.price)}</strong></div><div class="listing-owner"><span class="mini-avatar">${ctx.esc(item.owner.slice(0,1))}</span><span>von ${ctx.esc(item.owner)}</span><button class="text-btn" data-action="open-chat" data-id="${ctx.esc(item.id)}">Chat öffnen ${ctx.icon('arrow')}</button></div></div></article>`).join('')||`<div class="friendly-empty">${ctx.art('elephant')}<h2>Hier ist es noch ganz ruhig.</h2><p>In diesem Bereich gibt es momentan keine Demo-Anzeigen.</p></div>`}
    </section><p class="market-notice">Demo-Börse · Noch keine öffentlichen Nutzerkonten oder Zahlungen.</p></div>`;
};
