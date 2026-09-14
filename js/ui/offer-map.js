(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  let map=null,lastView={center:[52.5207,13.4095],zoom:12};
  const fixed={
    'reference-dm':[52.5346,13.4245],'reference-rossmann':[52.5162,13.4381],
    l1:[52.5265,13.4078],l2:[52.5068,13.3901],l3:[52.5410,13.3912],l4:[52.4989,13.4280]
  };
  function destroy(){if(map){lastView={center:[map.getCenter().lat,map.getCenter().lng],zoom:map.getZoom()};map.remove();map=null;}}
  const esc=value=>String(value||'•').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[ch]));
  function markerHtml(store,selected){return `<span class="offer-map-pin${selected?' selected':''}"><b>${esc(String(store||'•').slice(0,2))}</b></span>`;}
  function mount(element,offers,selectedId,onSelect,userLocation){
    destroy();if(!element||!root.L)return;
    map=root.L.map(element,{zoomControl:true,attributionControl:true,tap:true}).setView(lastView.center,lastView.zoom);
    root.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    (offers||[]).forEach((offer,index)=>{
      const coords=offer.latitude&&offer.longitude?[offer.latitude,offer.longitude]:fixed[offer.id]||[52.52+(index*.009),13.405+(index*.012)];
      const icon=root.L.divIcon({className:'offer-map-marker',html:markerHtml(offer.store,offer.id===selectedId),iconSize:[42,52],iconAnchor:[21,48]});
      root.L.marker(coords,{icon,title:`Demo: ${offer.store} – ${offer.product}`}).addTo(map).bindTooltip(`Demo · ${offer.store}`,{direction:'top'}).on('click',()=>onSelect&&onSelect(offer.id));
    });
    if(userLocation){
      root.L.circleMarker([userLocation.latitude,userLocation.longitude],{radius:8,color:'#fff',weight:3,fillColor:'#2d98e5',fillOpacity:1}).addTo(map).bindTooltip('Dein ungefährer Standort');
      root.L.circle([userLocation.latitude,userLocation.longitude],{radius:Math.min(userLocation.accuracy||80,1000),color:'#65aee8',weight:1,fillOpacity:.08}).addTo(map);
      map.setView([userLocation.latitude,userLocation.longitude],14);
    }
    setTimeout(()=>map&&map.invalidateSize(),0);
  }
  app.offerMap={mount,destroy};
})(globalThis);
