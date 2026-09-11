window.MyDiaper = window.MyDiaper || {};

MyDiaper.catalog = {
  types: ['Windel', 'Pants', 'Nachtwindel', 'Schwimmwindel'],
  brands: [
    { name: 'Pampers', lines: ['Premium Protection', 'Baby-Dry', 'Pants'] },
    { name: 'Babylove', lines: ['Premium', 'Nature'] },
    { name: 'Babydream', lines: ['Premium', 'Pants'] },
    { name: 'Lupilu', lines: ['Soft & Dry', 'Pants'] },
    { name: 'HiPP', lines: ['Babysanft'] },
    { name: 'Lillydoo', lines: ['Green', 'Pants'] }
  ],
  sizeGuide: [
    { size:'0', min:1.5, max:2.5 }, { size:'1', min:2, max:5 }, { size:'2', min:4, max:8 },
    { size:'3', min:6, max:10 }, { size:'4', min:9, max:14 }, { size:'4+', min:10, max:15 },
    { size:'5', min:11, max:16 }, { size:'5+', min:12, max:17 }, { size:'6', min:13, max:18 },
    { size:'7', min:15, max:22 }, { size:'8', min:17, max:25 }
  ],
  offers: {
    local: [
      {id:'l1',store:'dm',distance:1.2,product:'Pampers Premium Protection',size:'4',count:74,price:17.95,oldPrice:22.95,type:'Windel'},
      {id:'l2',store:'Rossmann',distance:2.6,product:'Babydream Premium',size:'4',count:80,price:15.99,oldPrice:19.49,type:'Windel'},
      {id:'l3',store:'Kaufland',distance:4.1,product:'Pampers Baby-Dry',size:'5',count:68,price:16.49,oldPrice:21.99,type:'Windel'},
      {id:'l4',store:'Lidl',distance:3.4,product:'Lupilu Soft & Dry',size:'4',count:78,price:12.99,oldPrice:14.99,type:'Windel'}
    ],
    online: [
      {id:'o1',store:'dm online',shipping:'Ab 49 € frei',product:'Babylove Premium',size:'4',count:84,price:15.95,oldPrice:17.45,type:'Windel'},
      {id:'o2',store:'Rossmann online',shipping:'Filialabholung möglich',product:'Pampers Baby-Dry',size:'4',count:76,price:17.49,oldPrice:22.49,type:'Windel'},
      {id:'o3',store:'Müller online',shipping:'Versand möglich',product:'HiPP Babysanft',size:'4',count:70,price:16.95,oldPrice:19.95,type:'Windel'}
    ]
  }
};
