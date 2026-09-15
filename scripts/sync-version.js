'use strict';
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const write=(file,content)=>{
  const target=path.join(root,file);
  if(fs.existsSync(target)&&fs.readFileSync(target,'utf8')===content)return false;
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
  return true;
};

function values(){
  const pkg=JSON.parse(read('package.json'));
  const match=String(pkg.version||'').match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if(!match)throw new Error('package.json enthält keine unterstützte semantische Version.');
  const version=`${match[1]}.${match[2]}.${match[3]}`;
  const channel=match[4]==='test'?'Testversion':match[4]||'';
  const androidVersionCode=Number(pkg.mydiaper?.androidVersionCode);
  if(!Number.isInteger(androidVersionCode)||androidVersionCode<1)throw new Error('mydiaper.androidVersionCode fehlt oder ist ungültig.');
  const displayName=['MyDiaper',channel,version].filter(Boolean).join(' ');
  return {pkg,version,channel,androidVersionCode,displayName};
}

function syncVersion(){
  const data=values(),changed=[];
  const meta=`(function(root){\n  'use strict';\n  const app=root.MyDiaper=root.MyDiaper||{};\n  const meta=Object.freeze({\n    name:'MyDiaper',\n    channel:${JSON.stringify(data.channel)},\n    version:${JSON.stringify(data.version)},\n    packageVersion:${JSON.stringify(data.pkg.version)},\n    androidVersionCode:${data.androidVersionCode},\n    displayName:${JSON.stringify(data.displayName)}\n  });\n  app.appMeta=meta;\n  if(root.document)root.document.title=meta.displayName;\n  if(typeof module!=='undefined'&&module.exports)module.exports=meta;\n})(globalThis);\n`;
  if(write('js/config/app-meta.js',meta))changed.push('js/config/app-meta.js');

  const capacitor=JSON.parse(read('capacitor.config.json'));
  capacitor.appName=data.displayName;
  if(write('capacitor.config.json',`${JSON.stringify(capacitor,null,2)}\n`))changed.push('capacitor.config.json');

  const manifest=JSON.parse(read('manifest.webmanifest'));
  manifest.name=data.displayName;
  if(write('manifest.webmanifest',`${JSON.stringify(manifest,null,2)}\n`))changed.push('manifest.webmanifest');

  let gradle=read('android/app/build.gradle')
    .replace(/versionCode\s+\d+/,`versionCode ${data.androidVersionCode}`)
    .replace(/versionName\s+"[^"]+"/,`versionName "${data.pkg.version}"`);
  if(write('android/app/build.gradle',gradle))changed.push('android/app/build.gradle');

  let strings=read('android/app/src/main/res/values/strings.xml')
    .replace(/(<string name="app_name">)[^<]*(<\/string>)/,`$1${data.displayName}$2`)
    .replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/,`$1${data.displayName}$2`);
  if(write('android/app/src/main/res/values/strings.xml',strings))changed.push('android/app/src/main/res/values/strings.xml');

  const projectFile='ios/App/App.xcodeproj/project.pbxproj';
  let xcode=read(projectFile)
    .replace(/CURRENT_PROJECT_VERSION = \d+;/g,`CURRENT_PROJECT_VERSION = ${data.androidVersionCode};`)
    .replace(/MARKETING_VERSION = [^;]+;/g,`MARKETING_VERSION = ${data.version};`);
  if(write(projectFile,xcode))changed.push(projectFile);
  return {...data,changed};
}

if(require.main===module){
  const result=syncVersion();
  console.log(`MyDiaper-Version synchronisiert: ${result.displayName} (Build ${result.androidVersionCode}).`);
}
module.exports={values,syncVersion};
