//Page to pull the data from the API and filter it to contain:
//product name and product category
// sem3_id
// url

//modules used
var moment = require('moment');
var fs = require('fs');
var keys = require('./keys.js');

//get the arguments passed in from command line
var args = process.argv.slice(2);

//auth for Semantics3 api
var api_key = keys.api_key;
var api_secret = keys.api_secret;
var sem3 = require('semantics3-node')(api_key,api_secret);

//Filter dates
var startDateFilterFrom = moment(new Date(args[0]));
var endDateFilterFrom = moment(new Date(args[1]));

var outputFile = fs.createWriteStream(args[2]);

var count = 0;

//error handling for file writing
outputFile.on('error', function(err) {
  console.log('err in streaming', err);
});


var getData = function (err, products) {
  // console.log('COUNT', count);
  if (err) {
     console.log("Couldn't execute request: iterate_products");
     return;
  }


  var filteredByDate = JSON.parse(products).results.filter(function (product) {
    //filter for the products updates between Aug 1st and Aug 31st 2015
    console.log( 'new date on this data', moment(new Date(product.updated_at * 1000)).format('MM/DD/YYYY') );
    if (moment(new Date(product.updated_at * 1000)).isBetween(startDateFilterFrom, endDateFilterFrom)) {
      return product;
    }
  });
  
  if (filteredByDate.length > 0) {
    filteredByDate.map(function (product) {
      return {
        sem3_id: product.sem3_id,
        name: product.name,
        category: product.category,
        updated_at: moment(new Date(product.updated_at * 1000)).format('L'),
        url: product.sitedetails.url
      };

    }).forEach(function (product) {

      count += 1;
      outputFile.write(JSON.stringify(product)+ '\n'); //stringify means each object will go on one line

    });

  }

  if (count < 1000) { 

    sem3.products.iterate_products(getData);

  } else {

    console.log('FINISHED');
    outputFile.end();
    return;

  }

  console.log("Successfully retrieved next page of products");

};



sem3.products.products_field( "site", "abercrombie.com");
sem3.products.products_field( "isactive", 1 );

sem3.products.get_products(getData);

/*
node pullAndFilterData_1.js '2015/08/01' '2015/08/31' /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData.formatted
*/

