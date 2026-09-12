(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const guide=new Map(app.catalog.sizeGuide.map(item=>[item.size,item]));
  const brands=[
    {id:'brand-pampers',name:'Pampers'},
    {id:'brand-babylove',name:'Babylove'},
    {id:'brand-babydream',name:'Babydream'},
    {id:'brand-lupilu',name:'Lupilu'},
    {id:'brand-hipp',name:'HiPP'},
    {id:'brand-lillydoo',name:'Lillydoo'}
  ];
  const products=[
    {id:'product-pampers-premium-protection',brandId:'brand-pampers',name:'Premium Protection',category:'day',sizes:['3','4'],traits:['skin','fit']},
    {id:'product-pampers-baby-dry',brandId:'brand-pampers',name:'Baby-Dry',category:'day',sizes:['3','4','5','6'],traits:['absorb','night']},
    {id:'product-pampers-pants',brandId:'brand-pampers',name:'Pants',category:'pants',sizes:['5','6'],traits:['fit','absorb']},
    {id:'product-babylove-premium',brandId:'brand-babylove',name:'Premium',category:'day',sizes:['4','5'],traits:['skin','fit']},
    {id:'product-babylove-nature',brandId:'brand-babylove',name:'Nature',category:'day',sizes:['4','5'],traits:['eco','skin']},
    {id:'product-babydream-premium',brandId:'brand-babydream',name:'Premium',category:'day',sizes:['4','5'],traits:['fit']},
    {id:'product-babydream-pants',brandId:'brand-babydream',name:'Pants',category:'pants',sizes:['5','6'],traits:['fit','absorb']},
    {id:'product-lupilu-soft-dry',brandId:'brand-lupilu',name:'Soft & Dry',category:'day',sizes:['4','5'],traits:['absorb']},
    {id:'product-lupilu-pants',brandId:'brand-lupilu',name:'Pants',category:'pants',sizes:['5','6'],traits:['fit']},
    {id:'product-hipp-babysanft',brandId:'brand-hipp',name:'Babysanft',category:'day',sizes:['3','4','5'],traits:['skin']},
    {id:'product-lillydoo-green',brandId:'brand-lillydoo',name:'Green',category:'day',sizes:['3','4','5'],traits:['eco','skin']},
    {id:'product-lillydoo-pants',brandId:'brand-lillydoo',name:'Pants',category:'pants',sizes:['5','6'],traits:['fit','eco']}
  ].map(({sizes,...product})=>({...product,active:true,sourceType:'demo',sizeLabels:sizes}));
  const sizes=products.flatMap(product=>product.sizeLabels.map(label=>{
    const range=guide.get(label)||{};
    return {id:`size-${product.id.slice(8)}-${label.replace('+','plus')}`,productId:product.id,label,
      minWeightKg:range.min??null,maxWeightKg:range.max??null,rangeSource:'general-test-guide',active:true};
  }));
  const packages=[
    ['package-pampers-premium-4-74','size-pampers-premium-protection-4',74],
    ['package-pampers-babydry-4-74','size-pampers-baby-dry-4',74],
    ['package-pampers-babydry-4-76','size-pampers-baby-dry-4',76],
    ['package-pampers-babydry-5-68','size-pampers-baby-dry-5',68],
    ['package-babylove-premium-4-84','size-babylove-premium-4',84],
    ['package-babydream-premium-4-80','size-babydream-premium-4',80],
    ['package-lupilu-soft-dry-4-78','size-lupilu-soft-dry-4',78],
    ['package-hipp-babysanft-4-66','size-hipp-babysanft-4',66],
    ['package-hipp-babysanft-4-70','size-hipp-babysanft-4',70]
  ].map(([id,productSizeId,unitsPerPack])=>({id,productSizeId,unitsPerPack,barcodeEan:null,sourceType:'demo'}));

  app.productCatalog={
    source:{kind:'demo',label:'Interner Testkatalog',verifiedAt:null},
    brands,products,sizes,packages
  };
})(globalThis);
