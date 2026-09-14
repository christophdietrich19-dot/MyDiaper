(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};app.platform=app.platform||{};
  function register(handler){
    const plugin=root.Capacitor?.Plugins?.App;
    if(plugin&&typeof plugin.addListener==='function')plugin.addListener('backButton',handler);
  }
  function exit(){
    const plugin=root.Capacitor?.Plugins?.App;
    if(plugin&&typeof plugin.exitApp==='function')return plugin.exitApp();
    return false;
  }
  app.platform.navigation={register,exit};
})(globalThis);
