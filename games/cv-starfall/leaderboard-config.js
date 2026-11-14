/* Apelidos de teste ficam normalizados para comparar sem diferenciar maiúsculas. */
(function () {
  'use strict';

  const displayNicknames = Object.freeze({
    'kauan b':'KAUAN B',
    'eduardo f':'EDUARDO F',
    'luiz g':'LUIZ G',
    'yago k':'YAGO K',
    'johnata h':'JOHNATA H',
    'felype j':'FELYPE J',
    'joao p':'JOAO P',
    'natan r':'NATAN R',
    'ismail s':'ISMAIL S',
    'brendo t':'BRENDO T',
    'adryan v':'ADRYAN V',
    storm:'STORM',
    'hiago a':'HIAGO A',
    cypher:'CYPHER',
    nys:'NYS',
    educvv:'EDUCVV'
  });

  window.CV_STARFALL_SUPABASE = Object.freeze({
    ...(window.CV_GAMES_SUPABASE || {}),
    allowedNicknames:Object.keys(displayNicknames),
    settingsNicknames:[...Object.keys(displayNicknames), 'educvv dev', 'educvv dev1', 'adm'],
    displayNicknames,
    rosterNicknames:Object.entries(displayNicknames).filter(([nickname]) => nickname !== 'educvv').map(([,displayName]) => displayName)
  });
})();
