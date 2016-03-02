//Page to pull the data from the API and filter it to contain:

// sem3_id, -
// ------------------------------------------upc
// sku -
// name -
// cat_id -
// crumb -
// price -
// timestamp - 
// description -
// specifications fields (color, size, etc, in individual columns) weight brand model color size
// image url - one only currently
// offer url - ?

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

var startOffset = args[3];
var outputFile = fs.createWriteStream(args[2] + (startOffset || ''));

var count = 0;
var offset = startOffset || 0;

//error handling for file writing
outputFile.on('error', function(err) {
  console.log('err in streaming', err);
});


var isWorking = false;
var didThrowError = false;
var pageNum = 0;

var doWork = function(){
  
  if(isWorking){
    return;
  }

  isWorking = true;

  if(count < 1000){
    console.log('Page# ' + pageNum + ' Offset: ' + offset);
    offset+=10;
    sem3.products.clear();
    sem3.products.products_field( "site", "abercrombie.com");
    sem3.products.products_field( "isactive", 1 );
    sem3.products.products_field( "offset", offset);
    sem3.products.get_products(getData);
  }else{
    outputFile.end();
    console.log('FINISHED');
  }

};

sem3.products.products_field( "site", "abercrombie.com");
sem3.products.products_field( "isactive", 1 );
isWorking = true;
sem3.products.get_products(getData);

setInterval(doWork, 10);

function getData (err, products) {

  pageNum++;

  if (err) {
    // console.log(err);
    // console.log("Couldn't execute request: iterate_products");
    // console.log('Updating offset');
    // offset += 200;
    // didThrowError = true;
    // isWorking = false;
    // return;
  }

  var filteredByDate = JSON.parse(products).results.filter(function (product) {
    //filter for the products updates between Aug 1st and Aug 31st 2015
    if (moment(new Date(product.updated_at * 1000)).isBetween(startDateFilterFrom, endDateFilterFrom)) {
      return product;
    }
  });
  
  if (filteredByDate.length > 0) {
    filteredByDate.map(function (product) {
      return {
        sem3_id: product.sem3_id,
        name: product.name,
        // description: product.description,
        // cat_id: product.cat_id,
        category: product.category,
        // sku: product.sku,
        // updated_at: moment(new Date(product.updated_at * 1000)).format('L'),
        // crumb: product.crumb,
        url: product.sitedetails[0].url
      };

    }).forEach(function (product) {

      count += 1;
      console.log('COUNT', count);
      outputFile.write(JSON.stringify(product)+ '\n'); //stringify means each object will go on one line

    });

  }

  isWorking = false;

}

/*
node pullAndFilterData_1.js '2015/08/01' '2015/08/31' /Users/anna/Desktop/sem3Project_abercrombie/abercrombieData.formatted
*/

