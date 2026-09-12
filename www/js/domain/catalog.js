(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const domain=app.domain=app.domain||{};
  const clean=value=>String(value??'').trim().toLocaleLowerCase('de');
  const categoryLabels={day:'Windel',pants:'Pants',night:'Nachtwindel',swim:'Schwimmwindel',custom:'Spezialwindel'};

  function createIndex(catalog){
    if(!catalog||!Array.isArray(catalog.brands)||!Array.isArray(catalog.products)||!Array.isArray(catalog.sizes)||!Array.isArray(catalog.packages)) throw new Error('Ungültiger Produktkatalog.');
    const brands=new Map(),products=new Map(),sizes=new Map(),packages=new Map();
    for(const brand of catalog.brands){if(!brand.id||!brand.name||brands.has(brand.id))throw new Error('Ungültige Katalogmarke.');brands.set(brand.id,brand);}
    for(const product of catalog.products){if(!product.id||!brands.has(product.brandId)||!product.name||products.has(product.id))throw new Error('Ungültiges Katalogprodukt.');products.set(product.id,product);}
    for(const size of catalog.sizes){if(!size.id||!products.has(size.productId)||!size.label||sizes.has(size.id))throw new Error('Ungültige Produktgröße.');sizes.set(size.id,size);}
    for(const pack of catalog.packages){if(!pack.id||!sizes.has(pack.productSizeId)||!Number.isInteger(pack.unitsPerPack)||pack.unitsPerPack<=0||packages.has(pack.id))throw new Error('Ungültige Produktpackung.');packages.set(pack.id,pack);}
    return {brands,products,sizes,packages};
  }
  function details(catalog,productSizeId){
    const index=createIndex(catalog),size=index.sizes.get(productSizeId);
    if(!size)return null;
    const product=index.products.get(size.productId),brand=index.brands.get(product.brandId);
    return {brand,product,size,packages:[...index.packages.values()].filter(pack=>pack.productSizeId===size.id)};
  }
  function findProductSize(catalog,{brand,line,size}){
    const index=createIndex(catalog);
    const product=[...index.products.values()].find(item=>{
      const maker=index.brands.get(item.brandId);
      return clean(maker.name)===clean(brand)&&clean(item.name)===clean(line);
    });
    if(!product)return null;
    return [...index.sizes.values()].find(item=>item.productId===product.id&&clean(item.label)===clean(size))||null;
  }
  function compatible(product,purpose){
    if(purpose==='swim')return product.category==='swim';
    if(purpose==='pants')return product.category==='pants';
    if(purpose==='day')return product.category==='day';
    if(purpose==='night')return product.category!=='swim';
    return true;
  }
  function candidates(catalog,{size,purpose,priorities=[],experiences=[],currentProductSizeId=null}){
    const index=createIndex(catalog),wanted=new Set(priorities),experienceBySize=new Map();
    for(const exp of experiences){
      if(!exp.productSizeId)continue;
      const current=experienceBySize.get(exp.productSizeId);
      if(!current||String(exp.updatedAt||exp.createdAt||'')>String(current.updatedAt||current.createdAt||''))experienceBySize.set(exp.productSizeId,exp);
    }
    return [...index.sizes.values()].filter(item=>clean(item.label)===clean(size)).map(item=>{
      const product=index.products.get(item.productId),brand=index.brands.get(product.brandId),experience=experienceBySize.get(item.id)||null;
      if(!compatible(product,purpose)||experience?.avoidRecommendation)return null;
      const matches=(product.traits||[]).filter(trait=>wanted.has(trait));
      const values=['fitRating','leakRating','nightRating','skinComfortRating'].map(key=>experience?.[key]).filter(Number.isFinite);
      const mean=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
      const score=10+matches.length*3+(mean===null?0:mean)+(item.id===currentProductSizeId?6:0);
      return {productSizeId:item.id,brand:brand.name,line:product.name,category:product.category,size:item.label,
        minWeightKg:item.minWeightKg,maxWeightKg:item.maxWeightKg,traits:[...(product.traits||[])],priorityMatches:matches,
        experience,score,packages:[...index.packages.values()].filter(pack=>pack.productSizeId===item.id)};
    }).filter(Boolean).sort((a,b)=>b.score-a.score||`${a.brand} ${a.line}`.localeCompare(`${b.brand} ${b.line}`,'de'));
  }
  function labelForCategory(category){return categoryLabels[category]||categoryLabels.custom;}

  domain.catalog={createIndex,details,findProductSize,candidates,labelForCategory,compatible};
  if(typeof module!=='undefined'&&module.exports)module.exports=domain.catalog;
})(globalThis);
