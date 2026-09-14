(function(){
  MyDiaper.features=MyDiaper.features || {};
  MyDiaper.features.today=function(ctx){
    const c=ctx.activeChild(), {icon,art,rainbow}=ctx,state=MyDiaper.store.get(),stockDue=MyDiaper.domain.reminders.stockDue(c.days,state.settings.reminders.stock,state.settings.reminderConfig);
    const dayStart=new Date();dayStart.setHours(0,0,0,0);
    const summary=MyDiaper.domain.activity.summarize(state.usageEvents,{childId:c.id,from:dayStart});
    return `<div class="today-screen">
      <header class="greeting"><div><h1>${ctx.esc(ctx.greeting())} <span class="wave">👋</span></h1><p>Schön, dass du da bist.</p></div><button class="baby-avatar" data-action="family-picker" aria-label="Kinderprofil wechseln: ${ctx.esc(c.name)}">${art('babyPhoto')}<span class="child-indicator">${ctx.esc(c.name.slice(0,1))}</span></button></header>
      <section class="today-hero theme-${ctx.esc(c.color)}" aria-label="Heute"><div class="hero-copy"><h2>Heute</h2><p>Alles im Blick für einen<br>entspannten Tag.</p></div><div class="hero-sun">${icon('sun')}</div><div class="hero-cloud"></div><img class="sleeping-baby" src="assets/images/sleeping-baby.png" alt="Schlafendes Baby in neutraler salbei-mintfarbener Kleidung mit einem Kuschelhäschen"></section>
      <section class="today-stats" aria-label="Übersicht für ${ctx.esc(c.name)}">
        <button class="stat-card blue" data-action="activity-log">${icon('diaper')}<span><strong>${summary.changes}</strong><small>Wechsel heute<br>${summary.wet} nass · ${summary.stool} Stuhlgang</small></span></button>
        <button class="stat-card lilac" data-action="edit-stock">${icon('clock')}<span><strong>${c.stock}</strong><small>Windeln im Vorrat<br>(ca. ${ctx.daysText(c)} Tage)</small></span></button>
        <button class="stat-card mint" data-action="notifications">${icon('heart','filled')}<span><strong>${stockDue?'Bald nachkaufen':'Alles gut!'} <span class="tiny-heart">♥</span></strong><small>${stockDue?'Dein Vorrat wird langsam knapp.':'Dein Vorrat ist im grünen Bereich.'}</small></span></button>
        <button class="stat-card lavender" data-action="route" data-route="diapers">${icon('calendar')}<span><small>Nächster Einkauf<br>in ca. ${ctx.daysText(c)} Tagen</small></span></button>
      </section>
      <div class="quote-card"><p>„Kleine Windeln<br>für eine große Zukunft.“</p>${rainbow()}</div>
      <section class="quick-section"><h2>Schnellzugriff</h2><div class="quick-grid">
      ${[['search','blue','Windel-Finder','finder'],['tag','pink','Angebote','offers'],['swap','mint','Windel-Börse','market'],['bulb','peach','Tipps','tips']].map(([i,color,label,route])=>`<button class="quick-item" data-action="${route==='tips'?'tips':'route'}" data-route="${route}"><span class="quick-bubble ${color}">${icon(i)}</span><small>${label}</small></button>`).join('')}
      </div></section>
      <span class="sr-only">Familienübersicht · ${ctx.esc(c.name)} · ${c.stock} Windeln</span>
    </div>`;
  };
})();
