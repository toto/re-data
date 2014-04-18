
var fs = require('fs');
var path = require('path');
var rp14 = require('rp14Common');

var eventId = rp14.eventId;
var allDays = rp14.allDays;
var allTracks = rp14.allTracks;
var allLanguages = rp14.allLanguages;
var allLevels = rp14.allLevels;
var allFormats = rp14.allFormats;


exports.scrape = function (callback) {
	require('../lib/json_requester').get(
		{
			urls: {
				sessions: 'http://re-publica.de/event/1/sessions.json',
				speakers: 'http://re-publica.de/event/1/speakers.json',
				rooms:    'http://re-publica.de/event/1/rooms.json'
			}
		},
		function (result) {
			var data = [];

			var sessionList  = toArray(result.sessions.sessions);
			var speakerList  = toArray(result.speakers.speakers);
			var locationList = toArray(result.rooms.rooms      );

			var locationMap = {};
			var speakerMap = {};

			speakerList.forEach(function (speaker) {
				speaker = speaker.speaker;
				var entry = {
					'id': 'rp14-speaker-'+speaker.uid,
					'name': speaker.speakername,
					'photo': speaker.picture,
					'url': speaker.url,
					'biography': speaker.bio,
					'organization': speaker.organization,
					'position': speaker.position,
					'sessions': [],
				}
				speakerMap[entry.id] = entry;
				addEntry('speaker', entry);
			})


			locationList.forEach(function (location) {
				location = location.room;
				console.log("location " + location);
				var entry = {
					'id': 'rp14-location-'+location.nid,
					'label_de': location.title,
					'label_en': location.title,
					'type': 'location',
					'event': 'rp14',
					'is_stage': location.title.match(/stage /i) ? true : false
				}
				locationMap[entry.id] = entry;
				addEntry('location', entry);
			})

			sessionList.forEach(function (session) {
				session = session.session;

				var entry = {
					'id': 'rp14-session-' + session.nid,
					'title': session.title,
					'abstract': session.abstract,
					'description': '???',
					'url': session.url,
					'begin': parseDateTime(session.date, session.start),
					'end': parseDateTime(session.date, session.end),
					'duration': parseDuration(session.duration),
					'day': parseDay(session.date),
					'location': parseLocation(locationMap, session.roomnid),
					'track': parseTrack(session.category),
					'format': parseFormat(session.format),
					'level': parseLevel(session.experience),
					'lang': parseLanguage(session.language),
					'speakers': parseSpeakers(speakerMap, session.speakeruid),
					'enclosures': [],
					'links': []
				}

				addEntry('session', entry);
			})

			alsoAdd('track', allTracks);
			alsoAdd('format', allFormats);
			alsoAdd('level', allLevels);
			alsoAdd('language', allLanguages);
			alsoAdd('day', allDays);

			checkSpeakerSessions();
			checkTracks();
			checkLocations();


			function checkSpeakerSessions() {}
			function checkTracks() {}
			function checkLocations() {}

			function addEntry(type, obj) {
				obj.event = eventId;
				obj.type = type;
				data.push(obj);
			}

			function alsoAdd(type, list) {
				Object.keys(list).forEach(function (key) {
					var obj = clone(list[key]);
					obj.event = eventId;
					obj.type = type;
					data.push(obj);
				})
			}

			// console.log(data);

			callback(data);
		}
	);
}

function toArray(obj) {
	return Object.keys(obj).map(function (key) { return obj[key] })
}

function parseDay(dateString) {
	if (dateString == '') return false;

	var dateMatcher = /(\d\d)\.(\d\d)\.(\d\d\d\d)/;
	dateMatcher.exec(dateString);
	var day = RegExp.$1;
	var month = RegExp.$2;
	var year = RegExp.$3;

	var dayDict = allDays[day+'.'+month+'.'+year];
	if (dayDict == undefined) return false;
	return dayDict
}

function parseDate(text) {
	if (text == '') return false;

	var dateMatcher = /(\d\d)\.(\d\d)\.(\d\d\d\d)/;
	dateMatcher.exec(text);
	var day = RegExp.$1;
	var month = RegExp.$2;
	var year = RegExp.$3;
	return new Date(year, month, day, 0, 0, 0, 0);
}

function parseDateTime(date, time) {
	if ((date == '') && (time == '')) return false;

	var dateMatcher = /^(\d\d)\.(\d\d)\.(\d\d\d\d) /;
	dateMatcher.exec(date);


	var day = RegExp.$1;
	var month = RegExp.$2;
	var year = RegExp.$3;

	var timeMatcher = /(\d\d)\:(\d\d)/
	timeMatcher.exec(time);
	var hour = RegExp.$1;
	var minute = RegExp.$2;

	return new Date(year, month, day, hour, minute, 0, 0);

	console.log('Unknown date "'+date+'" and time "'+time+'"');
	return false
}

function parseDuration(text) {
	switch (text) {
		case '15 Minuten': return 15;
		case '30 Minuten': return 30;
		case '60 Minuten': return 60;
		case '90 Minuten': return 90;
		default:
			console.log('Unknown duration "'+text+'"')
			return false;
	}
}

function parseLocation(locationMap, roomid) {
	if (roomid == '') return false;

	var id = "rp14-location-"+roomid;
	var location = locationMap[id];

	if (location == undefined) {
		console.log("unknown location " + roomid);
		return false;
	}

	return {
					'id': location.id,
					'label_en': location.label_en,
					'label_de': location.label_de
	};
}


function parseTrack(text) {
	var track = allTracks[text];
	if (track) return track;
	console.error('Unknown Track "'+text+'"');
	return false;
}

function parseFormat(text) {
	var format = allFormats[text];
	if (format) return format;
	console.error('Unknown Format "'+text+'"');
	return false;
}

function parseLevel(text) {
	var level = allLevels[text];
	if (level) return level;
	console.error('Unknown Level "'+text+'"');
	return false;
}

function parseLanguage(text) {
	var language = allLanguages[text];
	if (language) return language;
	console.error('Unknown Language "'+text+'"');
	return false;
}

function parseSpeakers(speakerMap, speakeruidMap) {
	var speakers = [];
	for (var key in speakeruidMap) {
		var speakerId = speakeruidMap[key];
		var speaker = speakerMap['rp14-speaker-'+speakerId];
		if (speaker != undefined) {
			speakers.push({'id': speaker.id,
											'name': speaker.name});
		} else {
				console.log("unknown speaker " + speakerId);
		}
	}

	return speakers;
}

function clone(obj) {
	var newObj = {};
	Object.keys(obj).forEach(function (key) {
		newObj[key] = obj[key];
	})
	return newObj;
}