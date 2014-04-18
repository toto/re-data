var eventId = 'rp14';

var allTracks = {
  'Business & Innovation':  { id:'business-innovation', label_de:'Business & Innovation',  label_en:'Business & Innovation', color:[194.0, 56.0, 24.0, 1.0] },
  'Science & Technology':   { id:'science-technology',  label_de:'Wissenschaft & Technik', label_en:'Science & Technology' , color:[0.0, 0.0, 0.0, 1.0] },
  'Politics & Society':     { id:'politics-society',    label_de:'Politik & Gesellschaft', label_en:'Politics & Society'   , color:[111.0, 79.0, 132.0, 1.0] },
  'Research & Education':   { id:'research-education',  label_de:'Forschung & Bildung',    label_en:'Research & Education' , color:[0.0, 0.0, 0.0, 1.0] },
  'Culture':                { id:'culture',             label_de:'Kultur',                 label_en:'Culture'              , color:[193.0, 117.0, 28.0, 1.0] },
  'Media':                  { id:'media',               label_de:'Medien',                 label_en:'Media'                , color:[78.0, 144.0, 178.0, 1.0] },
  're:publica':             { id:'republica',           label_de:'re:publica',             label_en:'re:publica'           , color:[0.0, 0.0, 0.0, 1.0] },
  're:campaign':            { id:'recampaign',          label_de:'re:campaign',            label_en:'re:campaign'          , color:[0.0, 0.0, 0.0, 1.0] },
  'Other':                  { id:'other',               label_de:'Other',                  label_en:'Other'                , color:[101.0, 156.0, 45.0, 1.0] }
}

var allFormats = {
  'Diskussion': { id:'discussion', label_de:'Diskussion', label_en:'Discussion' },
  'Vortrag':    { id:'talk',       label_de:'Vortrag',    label_en:'Talk'       },
  'Workshop':   { id:'workshop',   label_de:'Workshop',   label_en:'Workshop'   },
  'Aktion':     { id:'action',     label_de:'Aktion',     label_en:'Action'     }
}

var allLevels = {
  'Beginner':         { id:'beginner',     label_de:'Anfänger',         label_en:'Beginner'     },
  'Fortgeschrittene': { id:'intermediate', label_de:'Fortgeschrittene', label_en:'Intermediate' },
  'Experten':         { id:'advanced',     label_de:'Experten',         label_en:'Advanced'     }
};

var allLanguages = {
  'Englisch': { id:'en', label_de:'Englisch', label_en:'English' },
  'Deutsch':  { id:'de', label_de:'Deutsch',  label_en:'German'  }
};

var allDays = {
  '06.05.2014': { 'id':'rp14-day-1', 'label_de':'6. Mai', 'label_en':'6. May', 'date':'2014-05-06' },
  '07.05.2014': { 'id':'rp14-day-2', 'label_de':'7. Mai', 'label_en':'7. May', 'date':'2014-05-07' },
  '08.05.2014': { 'id':'rp14-day-3', 'label_de':'8. Mai', 'label_en':'8. May', 'date':'2014-05-08' },
};

module.exports.eventId = eventId;
module.exports.allDays = allDays;
module.exports.allTracks = allTracks;
module.exports.allLanguages = allLanguages;
module.exports.allLevels = allLevels;
module.exports.allFormats = allFormats;
