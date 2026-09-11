(function(root){
  'use strict';
  const app = root.MyDiaper = root.MyDiaper || {};
  const domain = app.domain = app.domain || {};
  function evaluate(answers, recommendedSize){
    if(!answers || !['yes','no'].includes(answers.leak) || !['yes','no'].includes(answers.marks) ||
       !['tight','good'].includes(answers.closure) || !['yes','no'].includes(answers.night)){
      throw new Error('Bitte alle Fit-Check-Fragen beantworten.');
    }
    const score = (answers.leak === 'yes' ? 1 : 0) + (answers.marks === 'yes' ? 2 : 0) +
      (answers.closure === 'tight' ? 2 : 0);
    if(score >= 3) return {
      code:'try_larger', score,
      result:recommendedSize == null ? 'Eine Nummer größer testen' : `Größe ${recommendedSize} bzw. eine Nummer größer testen`,
      note:'Abdrücke oder knapper Sitz sprechen dafür, die nächste Größe gezielt zu testen.'
    };
    if(answers.night === 'yes') return {
      code:'check_night', score, result:'Nachtlösung prüfen',
      note:'Wenn das Problem hauptsächlich nachts auftritt, kann eine saugstärkere Nachtwindel sinnvoller sein als sofort größer zu wechseln.'
    };
    return {code:'observe', score, result:'Aktuelle Größe weiter beobachten',
      note:'Die Antworten sprechen aktuell nicht klar für einen Größenwechsel.'};
  }
  domain.fitCheck = {evaluate};
  if(typeof module !== 'undefined' && module.exports) module.exports = domain.fitCheck;
})(globalThis);
