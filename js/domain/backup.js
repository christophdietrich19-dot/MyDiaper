(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const FORMAT='mydiaper-family-backup';
  const VERSION=1;
  const MAX_CHARS=2000000;

  function validDate(value){
    if(value==null||value==='')throw new Error('Das Backup enthält keinen gültigen Exportzeitpunkt.');
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))throw new Error('Das Backup enthält keinen gültigen Exportzeitpunkt.');
    return date.toISOString();
  }
  function create(state,now=new Date()){
    const checked=domain.model.assertState(domain.model.clone(state));
    return {format:FORMAT,version:VERSION,exportedAt:validDate(now),state:checked};
  }
  function serialize(state,now=new Date()){return JSON.stringify(create(state,now),null,2);}
  function parse(input){
    if(typeof input!=='string'||!input.trim())throw new Error('Bitte Backup-Daten einfügen oder eine JSON-Datei wählen.');
    if(input.length>MAX_CHARS)throw new Error('Das Familien-Backup ist zu groß.');
    let value;
    try{value=JSON.parse(input);}catch(error){throw new Error('Das Familien-Backup ist kein gültiges JSON.');}
    if(!value||value.format!==FORMAT||value.version!==VERSION)throw new Error('Unbekanntes Backupformat oder nicht unterstützte Version.');
    validDate(value.exportedAt);
    if(!value.state||![1,2,3,4,5].includes(value.state.schemaVersion))throw new Error('Das Backup enthält keine unterstützte MyDiaper-Datenversion.');
    return {format:FORMAT,version:VERSION,exportedAt:value.exportedAt,state:domain.model.migrate(domain.model.clone(value.state),app.legacyDefaults)};
  }
  domain.backup={create,serialize,parse,FORMAT,VERSION,MAX_CHARS};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.backup;
})(globalThis);
