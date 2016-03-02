//take the data from abercrombieData.formatted and augment with new data from v1/offers

var fs = require('fs');
var LineByLineReader = require('line-by-line');
var keys = require('./keys.js');
var moment = require('moment');

//get the arguments passed in from command line
var args = process.argv.slice(2);

//auth for Semantics3 api
var api_key = keys.api_key;
var api_secret = keys.api_secret;
var sem3 = require('semantics3-node')(api_key,api_secret);

var lr = new LineByLineReader(args[0]);
var outputFile = fs.createWriteStream(args[1]);

//handle errors on writing newStream
outputFile.on('error', function(err) {
  console.log('error in writing file', err);
});


//variable to be used when inserting comas between objects in the outputFile
var separator = "";

//to insert into the outputFile so that the data converted to csv is in a friendly format
outputFile.write("[");


lr.on('error', function (err) {
  console.log('error in line by line module', err);
});


lr.on('line', function (line) {
  // pause emitting of lines do do async function
  lr.pause();

  line = JSON.parse(line);

  sem3.products.offers_field( "sem3_id", line.sem3_id.toString() );

  sem3.products.get_offers(


    function(err, offers) {

      if (err) {
         console.log("Couldn't execute request: run_query", err);
         return;
      }

      //take the data from the api and add to the current object
      JSON.parse(offers).results.forEach(function (price) {
        var date = moment(new Date(price.lastrecorded_at * 1000)).format('L');
        line[date] = price.price;
      });

      //write the new line to the outputFile
      outputFile.write(separator + JSON.stringify(line, null, 2));
      if (!separator) {
        separator = ",";
      }

      lr.resume();
    }

  );

});


//all the lines of the inputFile have been run
lr.on('end', function () {

  console.log('stream done');
  outputFile.write("]");
  outputFile.end();

});


/*
node addPriceHistories_2.js /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData.formatted /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData.formatted.priced
*/