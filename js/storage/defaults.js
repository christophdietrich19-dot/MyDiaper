(function(root){
  const app = root.MyDiaper = root.MyDiaper || {};
  // Original demo records also serve as the v1 migration fixture.
  app.legacyDefaults = {
    activeChildId:'emma',
    children:[
      {id:'emma',name:'Emma',birthdate:'2026-01-15',weight:8.4,height:70,color:'mint',currentBrand:'Pampers',currentLine:'Premium Protection',currentSize:'3',dailyUse:6,stock:36,types:['Windel']},
      {id:'leo',name:'Leo',birthdate:'2024-08-02',weight:13.8,height:91,color:'blue',currentBrand:'Babydream',currentLine:'Pants',currentSize:'6',dailyUse:5,stock:54,types:['Pants','Nachtwindel']},
      {id:'mia',name:'Mia',birthdate:'2025-03-20',weight:11.5,height:83,color:'peach',currentBrand:'Babylove',currentLine:'Premium',currentSize:'5',dailyUse:5,stock:17,types:['Windel','Schwimmwindel']}
    ],
    settings:{location:'Berlin',locationMode:'manual',reminders:{stock:true,size:true,offers:true,market:true},preferredStores:['dm','Rossmann','Kaufland']},
    market:[
      {id:'m1',mode:'Verkaufen',title:'Pampers Premium Protection Größe 3',condition:'Original verschlossen',count:56,price:'8 €',distance:'2 km',owner:'Nina',created:'Heute'},
      {id:'m2',mode:'Tauschen',title:'Babylove Premium Größe 4',condition:'Geöffnet · ca. 28 Stück',count:28,price:'gegen Größe 5',distance:'4 km',owner:'Alex',created:'Heute'},
      {id:'m3',mode:'Verschenken',title:'Lupilu Pants Größe 5',condition:'Geöffnet · Restbestand',count:14,price:'kostenlos',distance:'6 km',owner:'Sarah',created:'Gestern'}
    ],
    chats:{m1:[{from:'them',text:'Hallo! Die Packung ist noch da.'},{from:'me',text:'Super, wäre Abholung morgen möglich?'}]},
    fitChecks:{}
  };
  if(typeof module !== 'undefined' && module.exports) module.exports = app.legacyDefaults;
})(globalThis);
