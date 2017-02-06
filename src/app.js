/**
 * Created by Justin on 2/3/2017.
 */
'use strict';

const express = require('express');
const app = express();
const secrets = require('./config.js');
const Twitter = require('twitter');

app.use('/static', express.static(__dirname+'/public'));

app.set('view engine', 'jade');
app.set('views', __dirname+'/view');

//Initializing twitter npm package, using secret keys from ./config.js
var client = new Twitter({
	consumer_key: secrets.consumerKey,
	consumer_secret: secrets.consumerSecret,
	access_token_key: secrets.accessToken,
	access_token_secret: secrets.accessTokenSecret
});

var count = 5;


app.get('/', function(req,res){
	
	client.get('statuses/user_timeline',{count: count}, function(error, tweets, response){
		console.log("hit request");
		console.log(tweets.length);
		if(!error && response.statusCode === 200) {
			var array = [];
			
			
			for(var i=0; i<tweets.length; i++) {
				
				
				var object = {};
				object.text = tweets[i].text;
				object.userName = tweets[i].user.name;
				object.screenName = tweets[i].user.screen_name;
				object.profileImageURL = tweets[i].user.profile_image_url;
				object.createdAt = tweets[i].created_at;
				object.favoriteCount = tweets[i].favorite_count;
				object.retweetCount = tweets[i].retweet_count;
				
				array.push(object);
				
				//console.log(tweets[i].text);
				//console.log(tweets[i].user.name);
				//console.log(tweets[i].user.screen_name);
				//console.log(tweets[i].user.profile_image_url);
				//console.log(tweets[i].created_at);
				//console.log(tweets[i].favorite_count);
				//console.log(tweets[i].retweet_count);
				
			}
			var sentJSON = JSON.stringify(array);
			//res.send(sentJSON);
			
			res.render('index');
			/*
			 Going to need.
			 tweets.text //the text
			 tweets.user.name // the tweeters name
			 tweets.user.screen_name // the tweeters screen name
			 tweets.profile_image_url // the url to the background image.
			 tweets.created_at // the time it is created, need to do some math to get hrs ago.
			 tweets.favorite_count //the number of likes it has
			 tweets.retweet_count //the number of times it has been retweeted.
			 */
			
			
			//res.send();
		}//end if
		else{
			console.log("hitting else?");
		}
	});
	//res.send("hello World.");
	
});

app.get('/recent', function(req, res){
	client.get('direct_messages', {count: count}, function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		//console.log(response);
	});
});

app.get('/myrecent', function(req, res){
	client.get('direct_messages/sent',{count: count}, function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		//console.log(response);
	});
});


app.get('/friend', function(req, res){
	client.get('friends/list', {count: count}, function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		//console.log(response);
	});
});



app.listen(3000, function(){
	console.log("Front end listening on port 3000!");
});