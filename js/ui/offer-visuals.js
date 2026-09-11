(function(){
  // Prices, products and imagery in these two records come from the supplied design, not a live feed.
  MyDiaper.referenceOffers=[
    {id:'reference-dm',store:'dm',storeName:'dm Drogerie-Markt',distance:1.2,product:'Pampers Baby-Dry',size:'4',weight:'9–14 kg',count:74,price:17.95,oldPrice:22.95,type:'Windel',art:'pampers',demo:true},
    {id:'reference-rossmann',store:'Rossmann',storeName:'Rossmann',distance:1.4,product:'HiPP Babysanft Windeln',size:'4',count:66,price:16.95,oldPrice:19.95,type:'Windel',art:'hipp',demo:true}
  ];
  MyDiaper.createOfferVisuals=function(ctx){
    const {esc,icon,art}=ctx;
    const money=value=>value.toFixed(2).replace('.',',');
    function favorite(o){
      const saved=(MyDiaper.store.get().settings.favoriteOfferIds || []).includes(o.id);
      return `<button class="favorite ${saved?'saved':''}" data-action="favorite-offer" data-id="${esc(o.id)}" aria-label="${esc(o.product)} ${saved?'aus Favoriten entfernen':'merken'}" aria-pressed="${saved}">${icon('heart')}</button>`;
    }
    function image(o){return o.art?art(o.art):`<div class="product-thumb">${icon('diaper')}</div>`;}
    function card(o,featured=false){
      const discount=o.oldPrice?Math.round((1-o.price/o.oldPrice)*100):null;
      const unit=MyDiaper.domain.pricing.offerUnitPrice(o);
      const unitLabel=unit===null?'':`<small class="unit-price">${unit.toFixed(2).replace('.',',')} € / Windel</small>`;
      if(featured) return `<article class="deal-card"><span class="best-deal">${icon('crown')} Bester Deal</span><div class="deal-main"><div class="deal-image">${image(o)}</div><div class="deal-description"><h3>${esc(o.product)}</h3><p>Größe ${esc(o.size)} ${o.weight?`(${esc(o.weight)})`:''}<br>${o.count} Stück</p><div class="deal-price"><strong>${money(o.price)} €</strong>${o.oldPrice?`<del>${money(o.oldPrice)} €</del>`:''}</div>${discount?`<span class="discount">-${discount}%</span>`:''}</div>${favorite(o)}</div><div class="deal-shop">${o.store==='dm'?art('dm'):`<span class="shop-initial">${esc(o.store.slice(0,1))}</span>`}<div><strong>${esc(o.storeName||o.store)}</strong><small>${String(o.distance).replace('.',',')} km entfernt</small></div></div></article>`;
      return `<article class="compact-offer"><div class="compact-product">${image(o)}</div><div><h3>${esc(o.product)}</h3><p>Größe ${esc(o.size)}, ${o.count} Stück</p><div class="compact-price"><strong>${money(o.price)} €</strong>${discount?`<span class="discount">-${discount}%</span>`:''}</div><small>${esc(o.store)} · ${o.distance?`${String(o.distance).replace('.',',')} km`:esc(o.shipping||'Online-Angebot')}</small>${unitLabel}</div>${favorite(o)}</article>`;
    }
    return {card};
  };
})();
