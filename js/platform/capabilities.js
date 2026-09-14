(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  app.platform=app.platform||{};
  const native=()=>Boolean(root.Capacitor&&typeof root.Capacitor.isNativePlatform==='function'&&root.Capacitor.isNativePlatform());
  function status(){
    const plugins=(root.Capacitor&&root.Capacitor.Plugins)||{};
    return {native:native(),barcode:Boolean(plugins.BarcodeScanner),camera:Boolean(plugins.Camera),location:Boolean(plugins.Geolocation),notifications:Boolean(plugins.LocalNotifications),share:Boolean(plugins.Share)};
  }
  async function scanBarcode(){
    const plugin=root.Capacitor?.Plugins?.BarcodeScanner;
    if(!native()||!plugin)throw new Error('Der native Scanner ist noch nicht installiert. Bitte den Code manuell eingeben.');
    const result=await plugin.scan();return result?.barcode?.rawValue||result?.content||null;
  }
  app.platform.capabilities={status,scanBarcode};
})(globalThis);
