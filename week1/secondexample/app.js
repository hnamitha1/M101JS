var MongoClient = require('mongodb').MongoClient,
		assert = require('assert');

MongoClient.connect('mongodb://localhost:27017/video', function(err, db) {
	assert.equal(null, err);
	console.log("Successfully connected to server");
	
	db.collection('movies').find({}).toArray(function(err, docs) {
					docs.forEach(function(doc) {
							console.log(doc.title, doc.year);
					});																 
																					 
					db.close();						
  });
	console.log("Called find()");
})