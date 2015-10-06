//--- Set up twit module, new twit, request, and syllable ---
var Twit = require('twit');
var request = require("request");
var syllable = require("syllable");
var T = new Twit({
                    consumer_key:         process.env.POETRYBOT_TWIT_CONSUMER_KEY,
                    consumer_secret:      process.env.POETRYBOT_TWIT_CONSUMER_SECRET,
                    access_token:         process.env.POETRYBOT_TWIT_ACCESS_TOKEN,
                    access_token_secret:  process.env.POETRYBOT_TWIT_ACCESS_TOKEN_SECRET
                });
//--- End ---

//--- Requests to poetrydb to get all lines of poetry with a linecount of 14 ---
//--- ( My API made on KimonoLabs grabbed some odd data so I decided to work with a preexisting database ) ---
//--- Then call haiku and prose functions ---
function run() {
var all_lines = [];
  request("http://poetrydb.org/linecount/14/lines", function(err, response, body) {
    var json_object = JSON.parse(body);
    for (obj=0;obj<json_object.length;obj++) {
      for(line=0;line<json_object[obj]['lines'].length;line++) {
        all_lines.push(json_object[obj]['lines'][line]);
      }
    };
    makeHaiku(all_lines);
    makeProse(all_lines);
  });
};
//--- End ---

//--- Push three random lines into tweet ---
function makeProse(all_lines) {
  var tweet = [];
  tweet.push(all_lines[Math.floor(Math.random()*all_lines.length)]);
  tweet.push(all_lines[Math.floor(Math.random()*all_lines.length)]);
  tweet.push(all_lines[Math.floor(Math.random()*all_lines.length)]);
  tweet = tweet.join('\n');
  post(tweet);
};
//--- End ---

//--- Push three random lines of 5,7,5 syllables into tweet ---
function makeHaiku(all_lines) {
  var tweet = [];
  var fives = [];
  var sevens = [];

  for (i=0;i<all_lines.length;i++) {
    if ((syllable(all_lines[i])) == 7) {
      sevens.push(all_lines[i]);
    }
    else if ((syllable(all_lines[i])) == 5) {
      fives.push(all_lines[i]);
    };
  };

  tweet.push(fives[Math.floor(Math.random()*fives.length)]);
  tweet.push(sevens[Math.floor(Math.random()*sevens.length)]);
  tweet.push(fives[Math.floor(Math.random()*fives.length)]);
  tweet = 'A haiku:\n' + tweet.join('\n');
  post(tweet);
};
//--- End ---

//--- Post tweet to Twitter ---
function post(tweet) {
  T.post('statuses/update', {
    status: tweet
  }, function (err, reply) {});
};
//--- End ---

//--- run() once and then set run() to be called once a day ---
run();
var dayInMilliseconds = 1000 * 60 * 60 * 24;
setInterval(function() {
  try {
    run();
  }
  catch (e) {
    console.log(e);
  }
}, dayInMilliseconds);
//--- End ---