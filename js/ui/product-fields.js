(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[ch]));
  function eligible(purpose,query=''){
    const q=String(query).trim().toLocaleLowerCase('de');
    return app.productCatalog.products.filter(product=>product.active!==false&&app.domain.catalog.compatible(product,purpose)&&(!q||`${app.productCatalog.brands.find(b=>b.id===product.brandId)?.name||''} ${product.name}`.toLocaleLowerCase('de').includes(q)));
  }
  function html({prefix='product',purpose='day',productSizeId=null,includePackage=false,brand='',line='',size=''}){
    const details=productSizeId?app.domain.catalog.details(app.productCatalog,productSizeId):null,manual=!details;
    return `<fieldset class="product-picker" data-product-picker data-prefix="${esc(prefix)}" data-purpose="${esc(purpose)}" data-package="${includePackage?'true':'false'}" data-selected-product-size-id="${esc(productSizeId||'')}">
      <legend>Produkt auswählen</legend><div class="input-group"><label>Im Katalog suchen</label><input class="input" type="search" data-product-search placeholder="Marke oder Produktlinie"></div>
      <label class="manual-toggle"><input type="checkbox" data-product-manual ${manual?'checked':''}> Andere / manuelle Eingabe</label>
      <div class="product-catalog-fields ${manual?'hidden':''}"><div class="input-group"><label>Marke</label><select class="select" data-product-brand></select></div><div class="input-group"><label>Produktlinie</label><select class="select" data-product-line></select></div><div class="input-group"><label>Größe</label><select class="select" data-product-size></select></div>${includePackage?'<div class="input-group"><label>Packung (optional)</label><select class="select" data-product-package></select></div>':''}</div>
      <div class="product-manual-fields ${manual?'':'hidden'}"><div class="input-group"><label>Marke</label><input class="input" data-manual-brand value="${esc(details?.brand.name||brand)}"></div><div class="input-group"><label>Produktlinie</label><input class="input" data-manual-line value="${esc(details?.product.name||line)}"></div><div class="input-group"><label>Größe</label><input class="input" data-manual-size value="${esc(details?.size.label||size)}" required></div></div>
      <p class="product-picker-note">Gewichtsbereiche sind nur ein Richtwert. Entscheidend ist der tatsächliche Sitz.</p>
    </fieldset>`;
  }
  function option(value,label,selected){return `<option value="${esc(value)}"${value===selected?' selected':''}>${esc(label)}</option>`;}
  function sync(picker,preferred={}){
    if(!picker)return;const manual=picker.querySelector('[data-product-manual]').checked;
    picker.querySelector('.product-catalog-fields').classList.toggle('hidden',manual);picker.querySelector('.product-manual-fields').classList.toggle('hidden',!manual);picker.querySelector('[data-manual-size]').required=manual;picker.querySelector('[data-product-size]').required=!manual;if(manual)return;
    const products=eligible(picker.dataset.purpose,picker.querySelector('[data-product-search]').value),brands=[...new Set(products.map(p=>p.brandId))];
    const brandSelect=picker.querySelector('[data-product-brand]'),lineSelect=picker.querySelector('[data-product-line]'),sizeSelect=picker.querySelector('[data-product-size]');
    const currentBrand=preferred.brandId||brandSelect.value||brands[0];brandSelect.innerHTML=brands.map(id=>option(id,app.productCatalog.brands.find(b=>b.id===id)?.name||id,id===currentBrand?currentBrand:'' )).join('');if(!brands.includes(brandSelect.value))brandSelect.value=brands[0]||'';
    const lines=products.filter(p=>p.brandId===brandSelect.value),currentLine=preferred.productId||lineSelect.value||lines[0]?.id;lineSelect.innerHTML=lines.map(p=>option(p.id,p.name,currentLine)).join('');if(!lines.some(p=>p.id===lineSelect.value))lineSelect.value=lines[0]?.id||'';
    const sizes=app.productCatalog.sizes.filter(s=>s.productId===lineSelect.value&&s.active!==false),currentSize=preferred.productSizeId||sizeSelect.value||sizes[0]?.id;sizeSelect.innerHTML=sizes.map(s=>option(s.id,`Größe ${s.label}${s.minWeightKg!=null?` · ${s.minWeightKg}–${s.maxWeightKg??'+'} kg`:''}`,currentSize)).join('');if(!sizes.some(s=>s.id===sizeSelect.value))sizeSelect.value=sizes[0]?.id||'';
    const packSelect=picker.querySelector('[data-product-package]');if(packSelect){const packs=app.productCatalog.packages.filter(p=>p.productSizeId===sizeSelect.value);packSelect.innerHTML='<option value="">Keine Packung gewählt</option>'+packs.map(p=>option(p.id,`${p.unitsPerPack} Stück`,preferred.productPackageId||packSelect.value)).join('');}
  }
  function enhance(container){const scope=container||document;if(typeof scope.querySelectorAll!=='function')return;scope.querySelectorAll('[data-product-picker]').forEach(picker=>{const id=picker.dataset.selectedProductSizeId;const details=id&&app.domain.catalog.details(app.productCatalog,id);sync(picker,details?{brandId:details.brand.id,productId:details.product.id,productSizeId:details.size.id}:{});});}
  function change(target){const picker=target.closest&&target.closest('[data-product-picker]');if(!picker)return false;
    if(target.matches('[data-product-search],[data-product-manual],[data-product-brand],[data-product-line],[data-product-size]')){const preferred={};if(target.matches('[data-product-brand]'))preferred.brandId=target.value;if(target.matches('[data-product-line]'))preferred.productId=target.value;if(target.matches('[data-product-size]'))preferred.productSizeId=target.value;sync(picker,preferred);return true;}return false;
  }
  function purpose(picker,value){if(picker){picker.dataset.purpose=value;sync(picker);}}
  function value(form){const picker=form.querySelector('[data-product-picker]');if(!picker)return null;const manual=picker.querySelector('[data-product-manual]').checked;
    if(manual)return {productSizeId:null,productPackageId:null,brand:picker.querySelector('[data-manual-brand]').value.trim(),line:picker.querySelector('[data-manual-line]').value.trim(),size:picker.querySelector('[data-manual-size]').value.trim()};
    const id=picker.querySelector('[data-product-size]').value,details=app.domain.catalog.details(app.productCatalog,id);if(!details)throw new Error('Bitte eine Produktgröße auswählen.');return {productSizeId:id,productPackageId:picker.querySelector('[data-product-package]')?.value||null,brand:details.brand.name,line:details.product.name,size:details.size.label,packageUnits:Number(app.productCatalog.packages.find(p=>p.id===picker.querySelector('[data-product-package]')?.value)?.unitsPerPack)||null};
  }
  app.productFields={html,enhance,change,purpose,value};
})(globalThis);
