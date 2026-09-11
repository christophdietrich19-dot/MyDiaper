(function(){
  const paths = {
    home:'<path d="m3 10 9-8 9 8v11h-6v-7H9v7H3z"/>',
    diaper:'<path d="M3 5h18l-1 9c-.7 4-3.8 7-8 7s-7.3-3-8-7L3 5Z"/><path d="M3.5 9h17M4 13c4-1 6 2 6 7m10-7c-4-1-6 2-6 7M6 5V3h12v2"/>',
    tag:'<path d="M14 3h7v7L10 21 3 14 14 3Z"/><circle cx="17.5" cy="6.5" r="1"/>',
    swap:'<path d="M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3z"/>',
    search:'<circle cx="10" cy="10" r="7"/><path d="m16 16 6 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 5v7l5 2m-1-13 4 3"/>',
    calendar:'<rect x="3" y="5" width="18" height="17" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h1m6 0h1m-8 4h1m6 0h1"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-9.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    leaf:'<path d="M21 3C8 2 2 8 5 16c8 5 16-2 16-13Z"/><path d="M3 22 16 8"/>',
    drop:'<path d="M12 2S4 11 4 16a8 8 0 0 0 16 0c0-5-8-14-8-14Z"/><path d="M8 14c-1 3 0 5 3 6"/>',
    shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="M12 3v17M4 7h16"/>',
    weight:'<path d="m6 8-2 13h16L18 8H6Z"/><circle cx="12" cy="5" r="3"/><path d="M10 13h4l-3 5"/>',
    arrow:'<path d="M3 12h18m-7-7 7 7-7 7"/>',
    back:'<path d="m15 3-9 9 9 9"/>',
    pin:'<path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    bulb:'<path d="M8 17c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8M8 18h8m-7 3h6M12 1v-1M2 3 0 2m22 1 2-1"/><path d="m9 10 3 3 3-3m-3 3v5"/>',
    sun:'<circle cx="12" cy="12" r="5"/><path d="M12 0v3m0 18v3M0 12h3m18 0h3M3 3l2 2m14 14 2 2M3 21l2-2M19 5l2-2"/>',
    crown:'<path d="m2 5 5 5 5-8 5 8 5-5-3 15H5L2 5Z"/>',
    bell:'<path d="M5 17h14l-2-4V8a5 5 0 0 0-10 0v5l-2 4Zm5 4h4"/>',
    check:'<path d="m4 12 5 5L21 5"/>',
    plus:'<path d="M12 3v18M3 12h18"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    box:'<path d="m3 7 9-5 9 5v12l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v11M7 4l10 5"/>'
  };
  function icon(name, extra=''){
    return `<svg class="ui-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.diaper}</svg>`;
  }
  // Original supplied artwork stays unmodified. SVG viewports reuse exact visual details.
  const crops={elephant:[589,362,117,112],brandElephant:[103,44,160,145],babyPhoto:[277,308,51,51],
    pampers:[797,742,101,103],hipp:[796,978,56,82],dm:[804,851,41,41],map:[787,409,293,285],wordmark:[271,58,319,76]};
  function art(name, extra=''){
    if(name==='elephant'||name==='brandElephant') return `<img class="reference-art art-${name} ${extra}" src="assets/images/elephant.png" alt="" aria-hidden="true">`;
    const box=crops[name];
    return `<svg class="reference-art art-${name} ${extra}" viewBox="${box.join(' ')}" aria-hidden="true"><image href="assets/images/design-reference.png" width="1122" height="1402"/></svg>`;
  }
  function rainbow(){return '<svg class="rainbow" viewBox="0 0 130 105" aria-hidden="true"><path d="M12 63a50 50 0 0 1 100 0" fill="none" stroke="#ffc6b6" stroke-width="10"/><path d="M22 64a40 40 0 0 1 80 0" fill="none" stroke="#ffdfbd" stroke-width="9"/><path d="M32 65a30 30 0 0 1 60 0" fill="none" stroke="#cdebe7" stroke-width="9"/><path d="M42 66a20 20 0 0 1 40 0" fill="none" stroke="#c8e4f8" stroke-width="8"/><path d="M98 84c-13-19-24 0 1 16 28-17 12-34-1-16Z" fill="#ffc5b7"/><g fill="#e0f5f3"><circle cx="44" cy="99" r="17"/><circle cx="25" cy="105" r="14"/><circle cx="53" cy="109" r="17"/></g></svg>';}
  MyDiaper.visuals={icon,art,rainbow};
})();
