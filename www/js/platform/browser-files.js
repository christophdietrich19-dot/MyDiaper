(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  app.platform=app.platform||{};
  async function readText(file,maxBytes){
    if(!file)throw new Error('Bitte eine JSON-Datei auswählen.');
    if(file.size>maxBytes)throw new Error('Die ausgewählte Datei ist zu groß.');
    return file.text();
  }
  function downloadText(filename,text){
    if(typeof Blob==='undefined'||!root.URL?.createObjectURL||!root.document)return false;
    const url=root.URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
    const anchor=root.document.createElement('a');
    anchor.href=url;anchor.download=filename;anchor.hidden=true;
    root.document.body.appendChild(anchor);anchor.click();anchor.remove();
    root.URL.revokeObjectURL(url);
    return true;
  }
  app.platform.files={readText,downloadText};
  if(typeof module!=='undefined'&&module.exports)module.exports=app.platform.files;
})(globalThis);
