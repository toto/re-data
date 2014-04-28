var ical = require('ical');

exports.scrape = function (callback) {
 ical.fromURL('http://lanyrd.com/2014/uikonf/uikonf-schedule.ics', {}, function(err, data) {
   for (var k in data){
     if (data.hasOwnProperty(k)) {
       var ev = data[k]
       console.log("Conference",
         ev.summary);
     }
   }
 });
}