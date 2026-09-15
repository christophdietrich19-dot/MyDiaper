'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const strict=process.argv.includes('--store');
const required=[
  'index.html','manifest.webmanifest','capacitor.config.json',
  'js/config/app-meta.js','js/ui/feedback.js','js/ui/offer-map.js','scripts/sync-version.js',
  'assets/icons/icon-192.png','assets/icons/icon-512.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'android/app/src/main/res/drawable-port-xxxhdpi/splash.png',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
  'android/app/src/main/res/xml/backup_rules.xml',
  'android/app/src/main/res/xml/data_extraction_rules.xml',
  'android/app/src/main/res/xml/network_security_config.xml',
  'scripts/init-android-signing.ps1','scripts/build-android-test-release.ps1','.gitignore',
  'docs/STORE_RELEASE.md','docs/PRIVACY_DATA_INVENTORY.md','docs/STORE_METADATA_DRAFT.md','THIRD_PARTY_NOTICES.md',
  'docs/OPERATOR_QUESTIONNAIRE.md','docs/NATIVE_READINESS.md','docs/MARKETPLACE_LOCAL_DEMO.md'
];
const failures=[],gates=[];
let capacitorConfig=null;
for(const file of required)if(!fs.existsSync(path.join(root,file)))failures.push(`Fehlt: ${file}`);
try{
  capacitorConfig=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
  if(!/^[a-z][a-z0-9]*(\.[a-z0-9-]+)+$/i.test(capacitorConfig.appId||''))failures.push('Capacitor appId ist ungültig.');
  if(capacitorConfig.webDir!=='www')failures.push('Capacitor webDir muss auf www zeigen.');
}catch(error){failures.push(`Capacitor-Konfiguration: ${error.message}`);}
try{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const version=String(pkg.version||'').replace(/-test$/,'');
  const displayName=`MyDiaper Testversion ${version}`;
  const meta=fs.readFileSync(path.join(root,'js/config/app-meta.js'),'utf8');
  const gradle=fs.readFileSync(path.join(root,'android/app/build.gradle'),'utf8');
  const strings=fs.readFileSync(path.join(root,'android/app/src/main/res/values/strings.xml'),'utf8');
  if(!meta.includes(`version:${JSON.stringify(version)}`)||!meta.includes(`packageVersion:${JSON.stringify(pkg.version)}`)||!meta.includes(`displayName:${JSON.stringify(displayName)}`))failures.push('Sichtbare App-Metadaten sind nicht mit package.json synchronisiert.');
  if(capacitorConfig?.appName!==displayName)failures.push('Capacitor-Appname ist nicht mit package.json synchronisiert.');
  if(!gradle.includes(`versionCode ${pkg.mydiaper?.androidVersionCode}`)||!gradle.includes(`versionName "${pkg.version}"`))failures.push('Android-Buildversion ist nicht mit package.json synchronisiert.');
  if(!strings.includes(displayName))failures.push('Android-Appname ist nicht mit package.json synchronisiert.');
}catch(error){failures.push(`Versionssynchronisation: ${error.message}`);}
try{
  const manifest=fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
  if(!manifest.includes('android:allowBackup="false"'))failures.push('Android-Backups sind nicht deaktiviert.');
  if(!manifest.includes('android:usesCleartextTraffic="false"'))failures.push('Android-Klartextverkehr ist nicht deaktiviert.');
  if(!manifest.includes('android:dataExtractionRules="@xml/data_extraction_rules"'))failures.push('Android-Datenextraktionsregeln fehlen.');
  const filePaths=fs.readFileSync(path.join(root,'android/app/src/main/res/xml/file_paths.xml'),'utf8');
  if(/<external-path\b/.test(filePaths))failures.push('FileProvider gibt den gesamten externen Speicher frei.');
}catch(error){failures.push(`Android-Härtung: ${error.message}`);}
for(const dir of ['android','ios'])if(!fs.existsSync(path.join(root,dir)))gates.push(`${dir}: Plattformprojekt noch nicht erzeugt`);
gates.push('Betreiber-/Support-/Privacy-URLs noch offen','Produktiver Moderations- und Kontolöschprozess benötigt Backend','Store-Konten, sicher verwahrte Signierschlüssel-Sicherung, signiertes AAB, Screenshots und Einreichung stehen aus','Reale Händlerfeeds und verifizierte Produkt-EANs stehen aus');
if(strict)failures.push(...gates);
console.log(`MyDiaper ${strict?'Store':'lokaler'} Release-Check`);
if(failures.length){for(const item of failures)console.error(`FEHLER: ${item}`);process.exitCode=1;}
else console.log('OK: lokale Struktur, Teststart und Release-Unterlagen sind vorbereitet.');
if(!strict){console.log('Offene externe Gates:');for(const gate of gates)console.log(`- ${gate}`);}
