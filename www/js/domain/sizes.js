(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const domain = app.domain = app.domain || {};
  // Keep the prototype's inclusive ranges and lower-middle overlap rule.
  function recommendSize(weight, guide){
    if(!Number.isFinite(weight) || weight <= 0 || !Array.isArray(guide) || !guide.length) return null;
    const candidates = guide.filter(x => weight >= x.min && weight <= x.max);
    if(!candidates.length) return weight < 2 ? '0' : '8+';
    return candidates[Math.floor((candidates.length - 1) / 2)].size;
  }
  domain.sizes = {recommendSize};
  if(typeof module !== 'undefined' && module.exports) module.exports = domain.sizes;
})(globalThis);
