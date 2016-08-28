var MongoClient = require('mongodb').MongoClient,
    commandLineArgs = require('command-line-args'),
    assert = require('assert');

var options = commndLineOptions();

MongoClient.connect('mongodb://localhost:27017/crunchbase', function(err, db) {
  
  assert.equal(err, null);
  console.log("Successfully connected to MongoDB.");
  
  var query = queryDocument(options);
  var projection = projectionDocument(options);
  
  var cursor = db.collection('companies').find(query);
  cursor.project(projection);
 // cursor.sort({founded_year: 1});
  cursor.sort([["founded_year", 1], ["number_of_employees", -1]]);
  cursor.skip(options.skip);
  cursor.limit(options.limit);
  
  var numMatches = 0;
  
  cursor.forEach(
      function(doc){
        numMatches = numMatches + 1;
        console.log(doc.name + "\n\tfonded " + doc.founded_year +
                   "\n\t" + doc.number_of_employees + " employees");
      },
      function(err) {
        assert.equal(err, null);
        console.log("Our query was:" + JSON.stringify(query));
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
    
  return projection;
}

function commndLineOptions() {
  
  var cli = commandLineArgs([
    { name: "firstYear", alias: "f", type: Number },
    { name: "lastYear", alias: "l", type: Number },
    { name: "employees", alias: "e", type: Number },
    { name: "skip", type: Number, defaultValue: 0 },
    { name: "limit", type: Number, defaultValue: 20000 }
    
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

//To run this app: >node app.js -f 2006 -l 2009 -e 250 --limit 10 --skip 10