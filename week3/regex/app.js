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
  
  var query = {};
  
  if("overview" in options) {
    query.overview = { "$regex": options.overview, "$options": "i"};
  }
  
  return query;
}

function projectionDocument(options) {
  
  var projection = {
    "_id": 0,
    "name": 1,
    "founded_year": 1,
    "overview": 1
  } 
  
  return projection;
}

function commndLineOptions() {
  
  var cli = commandLineArgs([
    { name: "overview", alias: "o", type: String }
  ]);
  
  var options = cli.parse();
  
  if(!(("overview" in options))){
    console.log(cli.getUsage({
      title:"Usage",
      descriptions: "You must supply atleast one option"
    }));
    process.exit();
   }
  
   return options;
}

//To run this app: node app.js -o "personal finance"