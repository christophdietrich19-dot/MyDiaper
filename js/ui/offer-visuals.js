(function(){
  MyDiaper.createOfferVisuals=function(ctx){
    const {esc,icon,art}=ctx;
    const money=value=>value.toFixed(2).replace('.',',');
    const child=ctx.activeChild(),alerts=MyDiaper.offerRepository.listAlerts(child.id);
    function favorite(o){
      const saved=(MyDiaper.store.get().settings.favoriteOfferIds || []).includes(o.id);
      return `<button class="favorite ${saved?'saved':''}" data-action="favorite-offer" data-id="${esc(o.id)}" aria-label="${esc(o.product)} ${saved?'aus Favoriten entfernen':'merken'}" aria-pressed="${saved}">${icon('heart')}</button>`;
    }
    function alertFor(o){return alerts.find(alert=>alert.productSizeId===o.productSizeId&&(alert.scope==='both'||alert.scope===o.scope));}
    function alertButton(o){
      if(!o.productSizeId)return '';
      const alert=alertFor(o),hit=alert&&MyDiaper.domain.offers.matchesAlert(o,alert);
      return `<button class="offer-alert-button ${alert?'active':''} ${hit?'hit':''}" data-action="price-alert" data-id="${esc(o.id)}">${icon('bell')}<span>${hit?'Preisalarm erreicht':alert?'Preisalarm ändern':'Preisalarm'}</span></button>`;
    }
    function image(o){return o.art?art(o.art):`<div class="product-thumb">${icon('diaper')}</div>`;}
    function card(o,featured=false){
      const discount=o.oldPrice?Math.round((1-o.price/o.oldPrice)*100):null;
      const unit=MyDiaper.domain.pricing.offerUnitPrice(o);
      const unitPrefix=o.scope==='online'&&o.shippingPrice===undefined?'ab ':'';
      const unitLabel=unit===null?'':`<small class="unit-price">${unitPrefix}${unit.toFixed(2).replace('.',',')} € / Windel${unitPrefix?' · zzgl. möglicher Versand':''}</small>`;
      const fresh=MyDiaper.domain.offers.freshness(o),source=`<span class="offer-freshness ${fresh.status}">${esc(fresh.label)}</span>`;
      const place=o.distance!==undefined?`${String(o.distance).replace('.',',')} km entfernt`:esc(o.city||o.shipping||(o.scope==='online'?'Online-Angebot':'Lokaler Import'));
      if(featured) return `<article class="deal-card"><div class="offer-card-labels"><span class="best-deal">${icon('crown')} Bester Deal</span>${source}</div><div class="deal-main"><div class="deal-image">${image(o)}</div><div class="deal-description"><h3>${esc(o.product)}</h3><p>Größe ${esc(o.size)} ${o.weight?`(${esc(o.weight)})`:''}<br>${o.count} Stück</p><div class="deal-price"><strong>${money(o.price)} €</strong>${o.oldPrice?`<del>${money(o.oldPrice)} €</del>`:''}</div>${discount?`<span class="discount">-${discount}%</span>`:''}${unitLabel}</div>${favorite(o)}</div><div class="deal-shop">${o.store==='dm'?art('dm'):`<span class="shop-initial">${esc(o.store.slice(0,1))}</span>`}<div><strong>${esc(o.storeName||o.store)}</strong><small>${place}</small></div></div>${alertButton(o)}</article>`;
      return `<article class="compact-offer"><div class="compact-product">${image(o)}</div><div class="compact-offer-copy"><div class="offer-card-labels">${source}${alertFor(o)&&MyDiaper.domain.offers.matchesAlert(o,alertFor(o))?'<span class="offer-freshness alert">Grenze erreicht</span>':''}</div><h3>${esc(o.product)}</h3><p>Größe ${esc(o.size)}, ${o.count} Stück</p><div class="compact-price"><strong>${money(o.price)} €</strong>${discount?`<span class="discount">-${discount}%</span>`:''}</div><small>${esc(o.store)} · ${place}</small>${unitLabel}${alertButton(o)}</div>${favorite(o)}</article>`;
    }
    return {card};
  };
})();
