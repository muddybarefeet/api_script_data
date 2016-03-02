//pull all product information from the abercrombie site filtered for active products

//modules used
var fs = require('fs');
var keys = require('./keys.js');

//auth for Semantics3 api
var api_key = keys.api_key;
var api_secret = keys.api_secret;
var sem3 = require('semantics3-node')(api_key,api_secret);

//get the arguments passed in from command line
var args = process.argv.slice(2);
var outputFile = fs.createWriteStream(args[0]); /* + (startOffset || '')*/ //if you want to pass in a start offset

//error handling for file writing
outputFile.on('error', function(err) {
  console.log('err in streaming', err);
});

var offset = 0;
var isWorking = false;
var didThrowError = false;
var pageNum = 0;

var doWork = function () {
  
  if (isWorking) {
    return;
  }

  isWorking = true;

  if (offset < 2000) {

    //increase the offset to go to the next set of results
    console.log('Page# ' + pageNum + ' Offset: ' + offset);
    offset+=10;
    sem3.products.clear();
    sem3.products.products_field( "site", "abercrombie.com");
    sem3.products.products_field( "isactive", 1 );
    sem3.products.products_field( "offset", offset);
    sem3.products.get_products(getData);
    
  } else {

    outputFile.end();
    console.log('FINISHED');

  }

};

//method to pipe the query to the new file
var getData = function (err, products) {

  pageNum++;

  if (err) {
    console.log('error getting page of products',err);
  }


  JSON.parse(products).results.forEach(function (product) {
    outputFile.write(JSON.stringify(product) + '\n'); //stringify means each object will go on one line
  });

  isWorking = false;

};

//start the query
sem3.products.products_field( "site", "abercrombie.com");
sem3.products.products_field( "isactive", 1 );
isWorking = true;
sem3.products.get_products(getData);

setInterval(doWork, 10);//setInterval to check when the last api call has run and call the next query with the offset increased

/*
node pullApiData_1.js /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData
*/

