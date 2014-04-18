var Browser = require("zombie");
var sessionURL = "https://re-publica.de/event/1/sessions";
var urlPrefix = "https://14.re-publica.de";
var rp14 = require('./rp14Common');

function getSpeakersFromNode(node) {
  if (node == null || node == undefined) return [];

  var result = [];

  var idMatcher = /\/user\/(\d+)\/event\/(\d+)/;
  var speakerLinks = node.getElementsByTagName('a');

  for (var index = 0; index < speakerLinks.length; index++) {
    var link = speakerLinks[index];

    var path = link.attributes['href'].value;
    idMatcher.exec(path);
    var id = RegExp.$1;

    result.push({ 'name': link.textContent.trim(),
                  'url': urlPrefix + path,
                  'id':  "rp14-speaker-" + id });
  }

  return result;
};

function getDateTimeFromRowForClassName(rowNode, className) {

  var time = rowNode.querySelectorAll('.' + className).item(0);

  if (time) {
     return new Date(time.attributes['content'].value);
  }

  return false;
};

function getIdFromSessionLinkPath(path) {
    var pathMatcher = /\/session\/(.+)$/
    pathMatcher.exec(path);

    return RegExp.$1;
}

function getDayFromBeginTime(begin) {
  if (!begin || begin.getDate() == undefined) return false;

  var dayString = "0" + begin.getDate() + ".0" + (begin.getMonth() + 1) + "." + begin.getFullYear();
  var result = rp14.allDays[dayString];
  if (result == undefined) {
    console.log("unknown day " + dayString);
  }
  return result;
}

function getLocationFromName(locationName) {
  if (!locationName || locationName.length == 0) return false;
  var location = {
          'id': 'rp14-location-' + locationName.trim().replace(/[^A-Za-z0-9]/g, '-'),
          'label_de': locationName.trim(),
          'label_en': locationName.trim(),
          'type': 'location',
          'event': rp14.eventId,
          'is_stage': locationName.trim().match(/stage /i) ? true : false
          };
          // TODO collect all locations
  return location;
}

function getLanguageFromName(langName) {
    var result = rp14.allLanguages[langName.trim()];
    if (result == undefined) {
      console.log("unknown language " + langName.trim());
    }
    return result;
}

function getLevelFromName(levelName) {
  var result = rp14.allLevels[levelName.trim()];
  if (result == undefined) {
    console.log("unknown level " + levelName.trim());
  }
  return result;
}

function getFormatFromName(formatName) {
  var result = rp14.allFormats[formatName.trim()];
  if (result == undefined) {
    console.log("unknown format " + formatName.trim());
  }
  return result;
}

function getTrackFromName(trackName) {
  var name = trackName.trim();
  var track = rp14.allTracks[name];
  if (track == undefined) {
    console.log("unknown track '" + name + "'")
  }
  return track;
}



exports.scrape = function (callback) {
  var browser = new Browser();

  var data = [];

  browser.visit(sessionURL, function () {
    var rows  = browser.queryAll(".views-row");
    var count = 0;
    var allLocations = {};
    var allSpeakers = {};
    var sessionsToSpeakers = {};

    function addEntry(type, obj) {
      obj.event = rp14.eventId;
      obj.type = type;
      data.push(obj);
    }

    function alsoAdd(type, list) {
      Object.keys(list).forEach(function (key) {
        var obj = clone(list[key]);
        obj.event = rp14.eventId;
        obj.type = type;
        data.push(obj);
      })
    }

    function clone(obj) {
      var newObj = {};
      Object.keys(obj).forEach(function (key) {
        newObj[key] = obj[key];
      })
      return newObj;
    }


    // console.log(rows);
    rows.forEach(function(row) {
       count++;
       var titleNode = row.querySelectorAll('.views-field-title').item(0);
       var title = titleNode.textContent;
       var linkNode = titleNode.getElementsByTagName('a').item(0);
       var path = linkNode.attributes['href'].value;

       var trackName = row.getElementsByClassName('views-field-field-session-track-ref').item(0).textContent;
       var speakersNode = row.getElementsByClassName('views-field-field-session-speaker').item(0);
       var speakers = getSpeakersFromNode(speakersNode);
       var startTime = getDateTimeFromRowForClassName(row, 'date-display-start');
       var endTime = getDateTimeFromRowForClassName(row, 'date-display-end');
       var stageName = row.getElementsByClassName('views-field-field-session-room').item(0).textContent;
       var skillLevelName = row.getElementsByClassName('views-field-field-session-exp-level-ref').item(0).textContent;
       var langName = row.getElementsByClassName('views-field-field-session-language-ref').item(0).textContent;
       var sessionFormatName = row.getElementsByClassName('views-field-field-session-format-ref').item(0).textContent;
       var duration = (startTime && endTime) ? (endTime - startTime) / 1000.0 : 0;
       var sessionLocation = getLocationFromName(stageName.trim());

       if (sessionLocation && sessionLocation != undefined) {
          allLocations[sessionLocation['id']] = sessionLocation;
      }

       var entry = {
         'id': 'rp14-session-' + getIdFromSessionLinkPath(path),
         'title': title.trim(),
         'abstract': '',
         'description': '',
         'url': urlPrefix + path,
         'begin': startTime,
         'end': endTime,
         'duration': duration,
         'day': getDayFromBeginTime(startTime),
         'location': sessionLocation,
         'track': getTrackFromName(trackName),
         'format': getFormatFromName(sessionFormatName.trim()),
         'level': getLevelFromName(skillLevelName.trim()),
         'lang': getLanguageFromName(langName.trim()),
         'speakers': speakers,
         'enclosures': [],
         'links': []
       }



       addEntry('session', entry);

       var sessionForSpeaker = { 'id': entry['id'],
                                 'title': entry['title'] };
       for (var i = speakers.length - 1; i >= 0; i--){
         var speaker = speakers[i];

         if (allSpeakers[speaker['id']]) {
           // if the speaker was already encountered we
           // just add the session to his list
           speaker = allSpeakers[speaker['id']];
           speaker['sessions'].push(sessionForSpeaker);
         } else {
           // or we add the speaker to the full list and put
           // this session as the first entry into his session list
           speaker['sessions'] = [ sessionForSpeaker ];
           allSpeakers[speaker['id']] = speaker;
         }
       }
     }); // rows

     alsoAdd('track', rp14.allTracks);
     alsoAdd('format', rp14.allFormats);
     alsoAdd('level', rp14.allLevels);
     alsoAdd('language', rp14.allLanguages);
     alsoAdd('day', rp14.allDays);
     alsoAdd('speaker', allSpeakers);
     alsoAdd('location', allLocations);

     console.log("events = " + count);


     console.log(data);

     callback(data);
  });

};