var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require('command-line-args'),
    assert = require('assert');

var options = commndLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {
  
  assert.equal(err, null);
  console.log("Successfully connected to MongoDB.");
  
  var query = queryDocument(options);
  var projection = projectionDocument(options);
  
  var cursor = db.collection('companies').find(query, projection);
  var numMatches = 0;
  
  cursor.forEach(
      function(doc){
        numMatches = numMatches + 1;
        console.log(doc);
      },
      function(err) {
        assert.equal(err, null);
        console.log("Our query was:" +JSON.stringify(query));
        console.log("Matching documents: " + numMatches);
        return db.close();
      }
  );
});

function queryDocument(options) {
  
  console.log(options);
  
  var query = {
    "founded_year": {
      "$gte": options.firstYear,
      "$lte": options.lastYear
    }
  };
  
  if("employees" in options) {
    query.number_of_employees = { "$gte": options.employees };
  }
  
  if("ipo" in options) {
    if ( options.ipo == "yes" ) {
      query["ipo.valuation_amount"] = {"$exists": true, "$ne": null};
    } else if (options.ipo == "no" ) {
      query["ipo.valuation_amount"] = null;
    }
  }
  
  if("country" in options) {
    query["offices.country_code"] = options.country
  }
  
  return query;
}

function projectionDocument(options) {
  var projection = {
    "_id": 0,
    "name": 1,
    "founded_year": 1
  };
 
  if ("employees" in options) {
    projection.number_of_employees = 1;
  }
  
  if("ipo" in options) {
    projection["ipo.valuation_amount"] = 1;
  }
  
  if("country" in options) {
    projection["offices.country_code"] = 1
  }
  
  return projection;
}

function commndLineOptions() {
  
  var cli = commandLineArgs([
    { name: "firstYear", alias: "f", type: Number },
    { name: "lastYear", alias: "l", type: Number },
    { name: "employees", alias: "e", type: Number },
    { name: "ipo", alias: "i", type: String },
    { name: "country", alias: "c", type: String }
    
  ]);
  
  var options = cli.parse();
  
  if (!(("firstYear" in options) && ("lastYear" in options))) {
    console.log(cli.getUsage({
      title:"Usage",
      descriptions: "The first two options below are required. The rest are optional."
    }));
    process.exit();
   }
  
   return options;
}

//To run this app: node app-countries.js -f 2004 -l 2008 -e 100 -c IRL
// node app-countries.js -f 2004 -l 2008 -e 100 -c IRL -i yes