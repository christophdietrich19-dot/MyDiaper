'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Android manifest blocks backups and cleartext traffic',()=>{
  const manifest=read('android/app/src/main/AndroidManifest.xml');
  assert.match(manifest,/android:allowBackup="false"/);
  assert.match(manifest,/android:dataExtractionRules="@xml\/data_extraction_rules"/);
  assert.match(manifest,/android:fullBackupContent="@xml\/backup_rules"/);
  assert.match(manifest,/android:usesCleartextTraffic="false"/);
  assert.match(manifest,/android:networkSecurityConfig="@xml\/network_security_config"/);
});

test('Android location stays foreground-only and uses explicit fine/coarse permissions',()=>{
  const manifest=fs.readFileSync(path.join(root,'android/app/src/main/AndroidManifest.xml'),'utf8');
  assert.match(manifest,/android\.permission\.ACCESS_COARSE_LOCATION/);
  assert.match(manifest,/android\.permission\.ACCESS_FINE_LOCATION/);
  assert.doesNotMatch(manifest,/ACCESS_BACKGROUND_LOCATION/);
  assert.match(manifest,/android:name="android\.hardware\.location" android:required="false"/);
  assert.match(manifest,/android:name="android\.hardware\.location\.gps" android:required="false"/);
});

test('FileProvider does not expose all external storage',()=>{
  const paths=read('android/app/src/main/res/xml/file_paths.xml');
  assert.doesNotMatch(paths,/<external-path\b/);
  assert.match(paths,/<cache-path\b/);
});

test('Release signing uses environment variables and signing material is ignored',()=>{
  const gradle=read('android/app/build.gradle');
  const ignore=read('.gitignore');
  for(const variable of ['MYDIAPER_KEYSTORE_FILE','MYDIAPER_KEYSTORE_PASSWORD','MYDIAPER_KEY_ALIAS','MYDIAPER_KEY_PASSWORD']){
    assert.ok(gradle.includes(variable),variable);
  }
  assert.match(gradle,/release\s*\{[\s\S]*?debuggable false/);
  assert.match(ignore,/\*\.jks/);
  assert.match(ignore,/\*\.keystore/);
  assert.match(ignore,/\.env/);
});
