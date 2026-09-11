(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const domain = app.domain = app.domain || {};
  function pricePerDiaper(price, count, shippingPrice = 0){
    if(!Number.isFinite(price) || price < 0 || !Number.isInteger(count) || count <= 0 ||
       !Number.isFinite(shippingPrice) || shippingPrice < 0) return null;
    return (price + shippingPrice) / count;
  }
  function offerUnitPrice(offer){
    return pricePerDiaper(offer.price, offer.count, offer.shippingPrice === undefined ? 0 : offer.shippingPrice);
  }
  function compareOffers(a, b){
    return (offerUnitPrice(a) ?? Infinity) - (offerUnitPrice(b) ?? Infinity);
  }
  domain.pricing = {pricePerDiaper, offerUnitPrice, compareOffers};
  if(typeof module !== 'undefined' && module.exports) module.exports = domain.pricing;
})(globalThis);
