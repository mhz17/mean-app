const express = require('express');
const router = express.Router();
const Crawler = require('crawler');
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const url = require('url');

// declare axios for making http requests
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';

/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});


var jsonData = {
  results: [
    {
      "date": "",
      "league": "",
      "link": "",
      "homeTeam": "",
      "awayTeam": "",
      "homeScore": "",
      "awayScore": "",
      "homePossessions": "",
      "awayPossessions": "",
      "homeShots": "",
      "awayShots": "",
      "homeShotsOnTarget": "",
      "awayShotsOnTarget": "",
      "homeCorners": "",
      "awayCorners": "",
      "homeFouls": "",
      "awayFouls": "",
      "referee": "",
      "attendance": ""
    }
  ]
};

function clearVariable(){
  return {
    results: [
      {
        "date": "",
        "league": "",
        "link": "",
        "homeTeam": "",
        "awayTeam": "",
        "homeScore": "",
        "awayScore": "",
        "homePossessions": "",
        "awayPossessions": "",
        "homeShots": "",
        "awayShots": "",
        "homeShotsOnTarget": "",
        "awayShotsOnTarget": "",
        "homeCorners": "",
        "awayCorners": "",
        "homeFouls": "",
        "awayFouls": "",
        "referee": "",
        "attendance": ""
      }
    ]
  };
}

// Get all posts
router.get('/posts:date', (req, res) => {

  console.log('URL: ' + 'http://www.bbc.co.uk/sport/football/scores-fixtures/' + req.params.date.replace(':', ''));
  
  var filelocation = path.resolve('output') + '\\stats.csv';
  fs.truncate(filelocation, 0, function(){console.log('File has been truncated')})

  c = new Crawler({
    maxConnections: 100,
    callback: function(error, response, done) {

      if (error) {
  
        console.log('Error retrieving main data: ' + error);

    } else {

       // console.log('Main started');
        var $ = response.$;
        getMatchDetails($);

    }

    done();

    }
});

c_stats = new Crawler({
  maxConnections: 100,
  callback: function(error, response, done) {

    if (error) {

      console.log('Error retrieving stats: ' + error);

  } else {
      // console.log('Stats started: ' + response.request.uri.href);
      var $ = response.$;
      getMatchStats($, response.request.uri.href);

  }

  done();

  }
});

// Queue a list of URLs
  c.queue(['http://www.bbc.co.uk/sport/football/scores-fixtures/' + req.params.date.replace(':', '')]);

  c.on('drain',function(){
      // console.log('Main queue compeleted');
      for (var v in jsonData.results) {
        if (jsonData.results[v].link.length > 0) {
          c_stats.queue([jsonData.results[v].link]);
        }
      }

    });



c_stats.on('drain', function(){

  console.log('Stats queue completed');

  var fields = ['date', 
  'league', 
  'link', 
  'homeTeam', 
  'awayTeam', 
  'homeScore', 
  'awayScore', 
  'homePossessions',
  'awayPossessions',
  'homeShots',
  'awayShots',
  'homeShotsOnTarget',
  'awayShotsOnTarget',
  'homeCorners',
  'awayCorners',
  'homeFouls',
  'awayFouls',
  'referee',
  'attendance'];

  var result = json2csv({ data: jsonData.results, fields: fields });

  fs.writeFile(filelocation, result, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved: ' + err);
    } else{
      // console.log('File has been saved');
    }
  });

  res.send(jsonData.results);

})

});

function getMatchDetails($) {

  var urlStats;
  var Matchdate;
  var League;
  var Home;
  var Away;
  var HomeScore;
  var AwayScore;

  $('.sp-c-date-picker-timeline__item--selected').filter(function(){
    var data = $(this);
    Matchdate = data.children().first().attr('href');
    Matchdate = Matchdate.replace('/sport/football/scores-fixtures/', '');
  });


  $('.sp-c-fixture__block-link').filter(function () {
    var data = $(this);
    urlStats = 'http://www.bbc.co.uk' + data.attr('href');

    if (!data.attr('data-reactid').includes('National League') && !data.attr('data-reactid').includes('Scottish')
        && !data.attr('data-reactid').includes('Italian') && !data.attr('data-reactid').includes('Spanish')) {

      League = data.parent().parent().parent().children().first().text();
      Home = data.children().first().children().first().children().first().children().first().children().first().children().first().attr('title');
      Away = data.children().first().children().first().children().last().children().first().children().first().children().first().attr('title');
      HomeScore = data.children().first().children().first().children().first().children().last().children().text();
      AwayScore = data.children().first().children().first().children().last().children().last().children().text();

      if (jsonData.results.length == 1 && jsonData.results[0].link == "") {
        jsonData.results[0].date = Matchdate;
        jsonData.results[0].league = League;
        jsonData.results[0].link = urlStats;
        jsonData.results[0].homeTeam = Home;
        jsonData.results[0].awayTeam = Away;
        jsonData.results[0].homeScore = HomeScore;
        jsonData.results[0].awayScore = AwayScore;
      }
      else {
        jsonData.results.push(
          { "date": Matchdate, "league": League, "link": urlStats, "homeTeam": Home, "awayTeam": Away, "homeScore": HomeScore, "awayScore": AwayScore }
        );
      }

    }

  });

}

function getMatchStats($, url) {

      var PossessionsHome;
      var PossessionsAway;
      var shotsHome;
      var shotsAway;
      var shotsOnTargetHome;
      var shotsOnTargetAway;
      var cornersHome;
      var cornersAway;
      var foulsHome;
      var foulsAway;
      var refereeName;
      var attendanceCount;

      $('.sp-c-football-match-stats').filter(function () {
        var data = $(this);

        PossessionsHome = data.children().last().children().first().children().first().next().children().last().text();
        PossessionsAway = data.children().last().children().first().children().first().next().next().children().last().text();
        shotsHome = data.children().last().children().first().next().children().first().next().children().last().text();
        shotsAway = data.children().last().children().first().next().children().first().next().next().children().last().text();
        shotsOnTargetHome = data.children().last().children().first().next().next().children().first().next().children().last().text();
        shotsOnTargetAway = data.children().last().children().first().next().next().children().first().next().next().children().last().text();
        cornersHome = data.children().last().children().first().next().next().next().children().first().next().children().last().text();
        cornersAway = data.children().last().children().first().next().next().next().children().first().next().next().children().last().text();
        foulsHome = data.children().last().children().last().children().first().next().children().last().text();
        foulsAway = data.children().last().children().last().children().first().next().next().children().last().text();

      });

      $('#tab-0').filter(function () {
        var data = $(this);
        refereeName = data.children().first().next().children().first().children().last().children().first().children().first().children().last().text();
        attendanceCount = data.children().first().next().children().first().children().last().children().first().children().last().children().last().text();
      });


      for (var i = 0; i < jsonData.results.length; i++) {
        if (jsonData.results[i].link == url) {
          jsonData.results[i].homePossessions = PossessionsHome;
          jsonData.results[i].awayPossessions = PossessionsAway;
          jsonData.results[i].homeShots = shotsHome;
          jsonData.results[i].awayShots = shotsAway;
          jsonData.results[i].homeShotsOnTarget = shotsOnTargetHome;
          jsonData.results[i].awayShotsOnTarget = shotsOnTargetAway;
          jsonData.results[i].homeCorners = cornersHome;
          jsonData.results[i].awayCorners = cornersAway;
          jsonData.results[i].homeFouls = foulsHome;
          jsonData.results[i].awayFouls = foulsAway;
          jsonData.results[i].referee = refereeName;
          jsonData.results[i].attendance = attendanceCount;
        }
      }

}


module.exports = router;