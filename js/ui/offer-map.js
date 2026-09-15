(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  let map=null,lastView={center:[51.1657,10.4515],zoom:6};
  function destroy(){if(map){lastView={center:[map.getCenter().lat,map.getCenter().lng],zoom:map.getZoom()};map.remove();map=null;}}
  const esc=value=>String(value||'•').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":"&#39;"}[ch]));
  function markerHtml(store,selected){return `<span class="offer-map-pin${selected?' selected':''}"><b>${esc(String(store||'•').slice(0,2))}</b></span>`;}
  function coordinates(offer){
    if(offer?.latitude===null||offer?.latitude===undefined||offer?.latitude===''||offer?.longitude===null||offer?.longitude===undefined||offer?.longitude==='')return null;
    const latitude=Number(offer?.latitude),longitude=Number(offer?.longitude);
    return Number.isFinite(latitude)&&latitude>=-90&&latitude<=90&&Number.isFinite(longitude)&&longitude>=-180&&longitude<=180?[latitude,longitude]:null;
  }
  function mount(element,offers,selectedId,onSelect,userLocation){
    destroy();if(!element||!root.L)return;
    map=root.L.map(element,{zoomControl:true,attributionControl:true,tap:true}).setView(lastView.center,lastView.zoom);
    root.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    const located=[];
    (offers||[]).forEach(offer=>{
      const coords=coordinates(offer);
      if(!coords)return;
      const icon=root.L.divIcon({className:'offer-map-marker',html:markerHtml(offer.store,offer.id===selectedId),iconSize:[42,52],iconAnchor:[21,48]});
      const source=offer.sourceType==='demo'?'Demo':'Import';
      root.L.marker(coords,{icon,title:`${source}: ${offer.store} – ${offer.product}`}).addTo(map).bindTooltip(`${source} · ${offer.store}`,{direction:'top'}).on('click',()=>onSelect&&onSelect(offer.id));
      located.push(coords);
    });
    const userCoords=coordinates(userLocation);
    if(userCoords){
      root.L.circleMarker(userCoords,{radius:8,color:'#fff',weight:3,fillColor:'#2d98e5',fillOpacity:1}).addTo(map).bindTooltip('Dein ungefährer Standort');
      root.L.circle(userCoords,{radius:Math.min(Number(userLocation.accuracy)||80,1000),color:'#65aee8',weight:1,fillOpacity:.08}).addTo(map);
      map.setView(userCoords,14);
    }else if(located.length===1)map.setView(located[0],14);
    else if(located.length>1){
      const bounds=root.L.latLngBounds(located);
      map.fitBounds(bounds.pad(.18),{maxZoom:14});
    }
    setTimeout(()=>map&&map.invalidateSize(),0);
  }
  app.offerMap={mount,destroy,coordinates};
  if(typeof module!=='undefined'&&module.exports)module.exports=app.offerMap;
})(globalThis);
