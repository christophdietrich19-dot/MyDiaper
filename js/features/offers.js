(function(){
  MyDiaper.features.offers=function(ctx){
    const local=ctx.ui.offerMode!=='online', list=ctx.ui.offerView==='list';
    const query=(ctx.ui.offerSearch || '').trim();
    const offers=MyDiaper.offerService.search({scope:local?'local':'online',query});
    const selected=offers.find(o=>o.id===ctx.ui.highlightOffer)||(!ctx.ui.highlightOffer&&offers.find(o=>o.id==='reference-dm'))||offers[0];
    const child=ctx.activeChild(),alerts=MyDiaper.offerRepository.listAlerts(child.id),hits=offers.filter(offer=>MyDiaper.offerRepository.matchingAlerts(child.id,offer).length).length;
    const imports=MyDiaper.offerImportRepository.list(),providers=MyDiaper.offerService.providers;
    const visuals=MyDiaper.createOfferVisuals(ctx);
    return `<div class="nearby-screen">${ctx.screenHeader(local?'Angebote in deiner Nähe':'Online-Angebote','today','offer-search')}
      <div class="location-row"><span>${ctx.icon('pin')}${ctx.esc(ctx.ui.mapLocation?'Standort einmalig verwendet':MyDiaper.store.get().settings.location)}</span><button class="text-btn" data-action="edit-location">Ändern</button></div>
      <button class="offer-source-summary" data-action="manage-offer-sources"><span>${ctx.icon('box')}</span><span><strong>${imports.length?`${imports.length} eigener Angebotsimport`:'Eigene Angebote importieren'}</strong><small>${imports.length?`${imports.reduce((sum,item)=>sum+item.offerCount,0)} kontrolliert eingelesene Angebote`:'JSON-Datei oder eingefügter Text · bleibt lokal'}</small></span><span>${ctx.icon('arrow')}</span></button>
      <button class="offer-alert-summary" data-action="manage-alerts"><span>${ctx.icon('bell')}</span><span><strong>${alerts.filter(alert=>alert.enabled).length} Preisalarm${alerts.filter(alert=>alert.enabled).length===1?'':'e'} für ${ctx.esc(child.name)}</strong><small>${hits?`${hits} Preisgrenze${hits===1?'':'n'} in dieser Ansicht erreicht`:'Noch keine passende Preisgrenze erreicht'}</small></span><span>${ctx.icon('arrow')}</span></button>
      <div class="view-switch" aria-label="Angebotsansicht"><button class="${!list?'selected':''}" data-action="offer-view" data-view="map" aria-pressed="${!list}">Karte</button><button class="${list?'selected':''}" data-action="offer-view" data-view="list" aria-pressed="${list}">Liste</button></div>
      ${local&&!list?`<div class="real-map-wrap"><div id="offerMap" class="nearby-map real-map" role="application" aria-label="Interaktive Karte mit Demo-Angebotsmarkern"></div><span class="demo-map-label">Echte Karte · Angebotsmarker sind Demo</span><button class="map-location-button" data-action="edit-location">${ctx.icon('pin')} Standort / Ort</button></div>`:''}
      ${offers.length ? (!list&&local ? `${visuals.card(selected,true)}<div class="deal-pagination">${offers.map(o=>`<button class="${o.id===selected.id?'active':''}" data-action="map-store" data-id="${ctx.esc(o.id)}" aria-label="${ctx.esc(o.product)} anzeigen"></button>`).join('')}<i></i><i></i></div><section class="nearby-more"><div class="section-heading"><h2>Weitere Angebote in deiner Nähe</h2><button class="text-btn" data-action="offer-view" data-view="list">Alle anzeigen</button></div>${offers.filter(o=>o.id!==selected.id).map(o=>visuals.card(o)).join('')}</section>` : `<section class="offer-list">${offers.map(o=>visuals.card(o)).join('')}</section>`) : '<div class="empty">Keine passenden Testangebote gefunden.</div>'}
      <div class="offer-data-note"><strong>Datenquellen:</strong> Karte © OpenStreetMap-Mitwirkende · ${providers.map(provider=>ctx.esc(provider.label)).join(' · ')}. Händler- und Angebotsmarker bleiben ausdrücklich Demo; eigene Importe zeigen ihren Prüfstand unverändert an.</div>
      <div class="tabs offer-scope"><button class="tab ${local?'active':''}" data-action="offer-tab" data-mode="local">In deiner Nähe</button><button class="tab ${!local?'active':''}" data-action="offer-tab" data-mode="online">Online</button></div>
      </div>`;
  };
})();
