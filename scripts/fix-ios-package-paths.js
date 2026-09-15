'use strict';
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'..','ios','App','CapApp-SPM','Package.swift');
if(!fs.existsSync(file))process.exit(0);
const before=fs.readFileSync(file,'utf8');
const after=before.replace(/(\.package\(name:\s*"[^"]+",\s*path:\s*")([^"]+)("\))/g,(_,start,value,end)=>`${start}${value.replace(/\\/g,'/')}${end}`);
if(after!==before)fs.writeFileSync(file,after,'utf8');
console.log('Capacitor-iOS-Paketpfade sind macOS-kompatibel.');
