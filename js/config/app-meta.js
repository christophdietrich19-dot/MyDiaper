(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const meta=Object.freeze({
    name:'MyDiaper',
    channel:"Testversion",
    version:"1.1.5",
    packageVersion:"1.1.5-test",
    androidVersionCode:7,
    displayName:"MyDiaper Testversion 1.1.5"
  });
  app.appMeta=meta;
  if(root.document)root.document.title=meta.displayName;
  if(typeof module!=='undefined'&&module.exports)module.exports=meta;
})(globalThis);
