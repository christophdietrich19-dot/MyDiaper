'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

function paeth(a,b,c){
  const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);
  return pa<=pb&&pa<=pc?a:pb<=pc?b:c;
}

function pngAlphaStats(file){
  const png=fs.readFileSync(path.join(root,file));
  assert.equal(png.toString('ascii',1,4),'PNG');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20),bitDepth=png[24],colorType=png[25],interlace=png[28];
  assert.equal(bitDepth,8);assert.equal(colorType,6);assert.equal(interlace,0);
  const idat=[];let offset=8;
  while(offset<png.length){
    const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8);
    if(type==='IDAT')idat.push(png.subarray(offset+8,offset+8+length));
    offset+=12+length;
  }
  const raw=zlib.inflateSync(Buffer.concat(idat)),stride=width*4,reconstructed=Buffer.alloc(stride*height);
  let source=0,min=255,max=0,transparent=0;
  for(let y=0;y<height;y+=1){
    const filter=raw[source++];
    for(let x=0;x<stride;x+=1){
      const value=raw[source++],left=x>=4?reconstructed[y*stride+x-4]:0,up=y?reconstructed[(y-1)*stride+x]:0,upperLeft=y&&x>=4?reconstructed[(y-1)*stride+x-4]:0;
      const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,upperLeft):NaN;
      assert.ok(Number.isFinite(predictor),`Unbekannter PNG-Filter ${filter}`);
      reconstructed[y*stride+x]=(value+predictor)&255;
    }
    for(let x=3;x<stride;x+=4){const alpha=reconstructed[y*stride+x];min=Math.min(min,alpha);max=Math.max(max,alpha);if(alpha===0)transparent+=1;}
  }
  return {width,height,min,max,transparent,corner:[reconstructed[3],reconstructed[stride-1],reconstructed[(height-1)*stride+3],reconstructed[height*stride-1]]};
}

test('Babyillustration besitzt echte Transparenz statt eingebranntem Schachbrett',()=>{
  const stats=pngAlphaStats('assets/images/sleeping-baby.png');
  assert.equal(stats.min,0);assert.equal(stats.max,255);
  assert.deepEqual(stats.corner,[0,0,0,0]);
  assert.ok(stats.transparent>stats.width*stats.height*.35);
});

test('Profilkarten halten beide Aktionen innerhalb der verfügbaren Breite',()=>{
  const css=read('css/reference.css');
  assert.match(css,/\.profile-child\{[^}]*grid-template-columns:minmax\(0,1fr\) auto/);
  assert.match(css,/\.profile-child-actions\{[^}]*grid-template-columns:repeat\(2,34px\)/);
  assert.match(css,/\.child-main\{[^}]*overflow:hidden/);
});

test('Profilkopf reserviert dem Elefanten eine eigene Spalte neben dem Text',()=>{
  const css=read('css/reference.css');
  assert.match(css,/\.profile-hero\{[^}]*display:grid[^}]*grid-template-columns:minmax\(0,1fr\) 112px/);
  assert.match(css,/\.profile-hero>div\{[^}]*min-width:0/);
  assert.match(css,/\.profile-hero>\.art-elephant\{[^}]*position:relative[^}]*width:112px[^}]*height:112px/);
});

test('Android-Safe-Area wird über Capacitor und CSS bis zur Navigation geführt',()=>{
  const config=JSON.parse(read('capacitor.config.json')),base=read('css/base.css'),reference=read('css/reference.css');
  assert.equal(config.plugins.SystemBars.insetsHandling,'css');
  assert.match(base,/--app-safe-bottom:/);
  assert.match(reference,/\.bottom-nav\{[^}]*var\(--app-safe-bottom\)/);
  assert.match(reference,/\.finder-footer\{[^}]*var\(--app-safe-bottom\)/);
});

test('Alle Toggles verwenden dieselben geometrisch zentrierten Maße',()=>{
  const css=read('css/reference.css');
  assert.match(css,/\.toggle\{[^}]*width:44px[^}]*height:26px/);
  assert.match(css,/\.toggle::after\{[^}]*top:50%[^}]*width:20px[^}]*height:20px[^}]*translateY\(-50%\)/);
  assert.match(css,/\.toggle:checked::after\{transform:translate\(18px,-50%\)\}/);
});
