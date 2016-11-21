var express = require('express');
var mongodb = require('mongodb');
var request = require('request');
var app = express();
app.set('port', (process.env.PORT || 5000));
var MongoClient = mongodb.MongoClient;
var moment = require('moment');


//(Focus on This Variable)
// var url = 'mongodb://kseniya292:Anas5Image@ds149577.mlab.com:49577/imagesearch'; //change to local 
var localURL = "mongodb://root:password@localhost:27017/imagesearchLOCALDB"  ;   
app.set('MONGO_URL', (process.env.MONGO || localURL))
//(Focus on This Variable)

app.get('/', function (req, res) {
	res.send('to search for kittens, add parameters to url like this: "/search/kittens"');
});


app.get('/search/:query', function (req, res) {	
  var searchItem = req.params.query;
  // console.log(searchItem);
	var offset = req.query.offset;

  if (searchItem == "latest") {
  		console.log(searchItem);

	  	MongoClient.connect(app.get('MONGO_URL'), function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    console.log('Connection established to', app.get('MONGO_URL'));

		    db.collection('latest').find().sort({$natural: -1}).limit(10).toArray(function (err, data) {
		    	res.send(data);
		    }); //db collection end
		 	
		    //Close connection
		    db.close();
		  } //if else statement
		}); //mongoclient connect

  } else {

	  if (offset) {
	  	var apiUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + searchItem + '&count=10&offset=' + offset;
	  } else {
		var apiUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + searchItem;
	  }

	  var key = 'febec337dda64d47b57e6f6002e8146e';
	  var arr = [];
	  // console.log(searchItem);

	    var options = {
	      url: apiUrl,
	      headers: {
	        'Ocp-Apim-Subscription-Key': key
	      }
	    };

	    function callback(error, response, body) {
	        if (error) {
	            console.log(error)
	        } else if (!error && response.statusCode == 200) {
	            var info = JSON.parse(body);
	            var objectArray = info.value;

	            for (var i = 0; i < objectArray.length; i++) {
		            	arr.push({ 
		            		"url" : objectArray[i].contentUrl,
		            		"snippet" : objectArray[i].name,
		            		"thumbnail" : objectArray[i].thumbnailUrl,
		            		"context" : objectArray[i].hostPageUrl
		            	});
	            } //for loop
	        }
	        res.send(arr);
	    } //callback

	    request(options, callback);

	   	var now = moment().format();

	    MongoClient.connect (app.get('MONGO_URL'), function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    console.log('Connection established to', app.get('MONGO_URL'));
		    // console.log(short_url);
			    db.collection('latest').insert({"term" : searchItem, "when" : now}, function (err, data) {
			    	if (err) throw err;
			    }); //db.collection

		    //Close connection
		    db.close();
		  }
		}); //mongoclient connect


  } //if else

  

 


}); //app.get

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 5000!');
});





