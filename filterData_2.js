//take the abercrombieData and filter it on data and fields inculded
//Page to pull the data from the API and filter it to contain:

// sem3_id
// name
// cat_id
// price
// description 
// image url - one only currently
// timestamp (updated_at) could also do created_at?
// specifications fields (color, size, etc, in individual columns) here so far: brand color size Could add the features fields?

// ------------------------------------------ upc ?
// ------------------------------------------ sku found per offer so does it want to be add to each historical price?
// ------------------------------------------ crumb ?
// ------------------------------------------ offer url - ?

//modules used
var moment = require('moment');
var fs = require('fs');
var keys = require('./keys.js');
var LineByLineReader = require('line-by-line');

//get the arguments passed in from command line
var args = process.argv.slice(2);

//auth for Semantics3 api
var api_key = keys.api_key;
var api_secret = keys.api_secret;
var sem3 = require('semantics3-node')(api_key,api_secret);

//Filter dates
var startDateFilterFrom = moment(new Date(args[0]));
var endDateFilterFrom = moment(new Date(args[1]));

var lr = new LineByLineReader(args[2]);//file to read line by line
var outputFile = fs.createWriteStream(args[3]); /* + (startOffset || '')*/ //if you want to pass in a start offset

var count = 0;

//error handling for file writing
outputFile.on('error', function(err) {
  console.log('err in streaming', err);
});


lr.on('error', function (err) {
  console.log('error in line by line module', err);
});

lr.on('line', function (line) {
  // pause emitting of lines do do async function
  lr.pause();

  line = JSON.parse(line);

  //filter for the products updates between Aug 1st and Aug 31st 2015
  if (count < 1000 && moment(new Date(line.updated_at * 1000)).isBetween(startDateFilterFrom, endDateFilterFrom)) {

    var newLine = {};

    newLine.sem3_id = line.sem3_id;
    newLine.sku = line.sku;//find this?
    newLine.crumb = line.crumb;//find this?
    newLine.cat_id = line.cat_id;
    newLine.category = line.category;
    newLine.name = line.name;
    newLine.description = line.description;
    newLine.brand = line.brand;
    newLine.color = line.color;
    newLine.size = line.size;
    newLine.url = line.sitedetails[0].url;
    newLine.updated_at = moment(new Date(line.updated_at * 1000)).format('L');

    count += 1;
    outputFile.write(JSON.stringify(newLine)+ '\n');

  }
  lr.resume();

});

lr.on('end', function () {

  console.log('stream done');
  outputFile.end();

});


/*
node filterData_2.js '2015/08/01' '2015/08/31' /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData.formatted
*/

