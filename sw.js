const CACHE='mydiaper-v3-import-portability-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./css/base.css','./css/components.css','./js/data.js',
  './js/catalog/demo-products.js','./js/domain/catalog.js','./js/domain/pricing.js','./js/domain/offers.js','./js/domain/sizes.js','./js/domain/fit-check.js','./js/domain/personalization.js','./js/domain/inventory.js','./js/domain/model.js','./js/domain/backup.js',
  './js/storage/defaults.js','./js/storage/local-state.js','./js/storage/offer-imports.js','./js/repositories/family-repository.js','./js/repositories/offer-repository.js','./js/repositories/offer-import-repository.js','./js/services/offer-provider.js','./js/store.js','./js/platform/browser-files.js','./js/ui/family-context.js',
  './js/app.js','./js/features/today.js','./js/features/diapers.js','./js/features/offers.js','./js/features/market.js','./js/features/profile.js','./assets/icons/icon.svg',
  './css/reference.css','./js/ui/visuals.js','./js/ui/offer-visuals.js','./js/features/finder.js',
  './assets/fonts/nunito-regular.ttf','./assets/fonts/nunito-semibold.ttf','./assets/fonts/nunito-bold.ttf','./assets/fonts/caveat-medium.ttf',
  './assets/images/design-reference.png','./assets/images/sleeping-baby.png','./assets/images/elephant.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mydiaper-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
