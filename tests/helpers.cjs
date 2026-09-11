const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function memoryStorage(seed = {}){
  const values = new Map(Object.entries(seed));
  return {getItem:key => values.has(key) ? values.get(key) : null,
    setItem:(key, value) => values.set(key, String(value)), values};
}

// Runs the actual classic-script entry point without HTTP, modules or a bundler.
// Only the small DOM surface needed by the existing renderer is stubbed here.
function loadApp(storage = memoryStorage(), base = root){
  const elements = new Map(), listeners = {};
  const element = id => {
    if(!elements.has(id)) elements.set(id, {innerHTML:'',className:'',children:[],dataset:{},
      classList:{toggle(){}}, focus(){}, appendChild(child){this.children.push(child);},
      addEventListener(type, handler){this[type] = handler;},remove(){}});
    return elements.get(id);
  };
  const nav = ['today','diapers','offers','market','profile'].map(route => {
    const node = element(`nav-${route}`); node.dataset.route = route; return node;
  });
  const document = {
    getElementById:element, querySelectorAll:() => nav, createElement:() => element(`new-${elements.size}`),
    addEventListener:(type, handler) => { listeners[type] = handler; }
  };
  const context = vm.createContext({document, localStorage:storage, navigator:{}, location:{protocol:'file:'},
    console, setTimeout(){}, scrollTo(){}, confirm:() => true, addEventListener(){},
    FormData:class { constructor(form){this.values = Object.entries(form.fields);} get(key){return this.values.find(v=>v[0]===key)?.[1] ?? null;} [Symbol.iterator](){return this.values[Symbol.iterator]();} }
  });
  context.window = context;
  const html = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(match => match[1]);
  for(const script of scripts) vm.runInContext(fs.readFileSync(path.join(base, script), 'utf8'), context, {filename:script});
  function click(action, extra = {}){
    const button = {dataset:{action, ...extra}};
    listeners.click({target:{closest:() => button}});
  }
  function submit(id, fields, dataset = {}){ listeners.submit({preventDefault(){},target:{id, fields, dataset}}); }
  return {app:context.MyDiaper, context, elements, storage, scripts, html, nav, click, submit};
}
const plain = value => JSON.parse(JSON.stringify(value));
module.exports = {loadApp, memoryStorage, plain, root};
