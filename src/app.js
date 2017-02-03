/**
 * Created by Justin on 2/3/2017.
 */
'use strict';

const express = require('express');
const app = express();
const secrets = require('./config.json');
const Twitter = require('twitter');

var client = new Twitter({
	consumer_key: secrets.consumerKey,
	consumer_secret: secrets.consumerSecret,
	access_token_key: secrets.accessToken,
	access_token_secret: secrets.accessTokenSecret
});

app.get('/', function(req,res){
	client.get('statuses/user_timeline', function(error, tweets, response){
		console.log(tweets);
		console.log("We got in here?");
		res.send(tweets[0]);
	});
	//res.send("hello World.");
	
});

app.get('/recent', function(req, res){
	client.get('direct_messages', function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		console.log(response);
	});
});

app.get('/friend', function(req, res){
	client.get('friends/list', function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		console.log(response);
	});
});



app.listen(3000, function(){
	console.log("Front end listening on port 3000!");
});