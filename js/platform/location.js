(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};app.platform=app.platform||{};
  const native=()=>Boolean(root.Capacitor&&typeof root.Capacitor.isNativePlatform==='function'&&root.Capacitor.isNativePlatform());
  async function current(){
    const plugin=root.Capacitor?.Plugins?.Geolocation;
    try{
      if(native()&&plugin){
        const status=await plugin.requestPermissions({permissions:['coarseLocation','location']});
        if(status.location!=='granted'&&status.coarseLocation!=='granted')throw new Error('Standortfreigabe wurde nicht erteilt.');
        const position=await plugin.getCurrentPosition({enableHighAccuracy:false,timeout:12000,maximumAge:300000});
        return {latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,source:'device'};
      }
      if(!root.navigator?.geolocation)throw new Error('Standort ist auf diesem Gerät nicht verfügbar.');
      return await new Promise((resolve,reject)=>root.navigator.geolocation.getCurrentPosition(
        position=>resolve({latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy,source:'browser'}),
        ()=>reject(new Error('Standort konnte nicht gelesen werden. Du kannst Ort oder PLZ weiterhin manuell eingeben.')),
        {enableHighAccuracy:false,timeout:12000,maximumAge:300000}
      ));
    }catch(error){throw new Error(error.message||'Standort konnte nicht gelesen werden.');}
  }
  app.platform.location={current};
})(globalThis);
