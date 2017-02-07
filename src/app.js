/**
 * Created by Justin on 2/3/2017.
 */
'use strict';

const express = require('express');
const app = express();
const async = require('async');
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
	async.parallel({
		timeLine: function(callback) {
			client.get('statuses/user_timeline',{count: count}, function(error, tweets, response){
				//console.log("hit request");
				//console.log(tweets.length);
				if(!error && response.statusCode === 200) {
					var timeLineArray = [];
					
					for(var i=0; i<tweets.length; i++) {
						var object = {};
						var d = new Date(tweets[i].created_at);
						object.text = tweets[i].text;
						object.userName = tweets[i].user.name;
						object.screenName = tweets[i].user.screen_name;
						object.profileImageURL = tweets[i].user.profile_image_url;
						object.createdAt = timeSince(d);
						object.favoriteCount = tweets[i].favorite_count;
						object.retweetCount = tweets[i].retweet_count;
						object.friendCount = tweets[i].user.friends_count;
						timeLineArray.push(object);
					} // end for
					//res.send(tweets[0]);
					
					//console.log(timeLineArray);
					callback(null, timeLineArray);
				}//end if
				else{
					console.log("hitting else?");
					//Render an error here
				}//end else
			});//end client call
			
		},
		friends: function(callback) {
			client.get('friends/list', {count: count}, function(error, tweets, response){
				if(!error && response.statusCode === 200) {
					var friendsListArray = [];
					for (var i = 0; i < tweets.users.length; i++) {
						var object = {};
						object.userName = tweets.users[i].name;
						object.screenName = tweets.users[i].screen_name;
						object.profileImageURL = tweets.users[i].profile_image_url;
						object.following = tweets.users[i].following;
						
						friendsListArray.push(object);
					} // end for
					//res.send(tweets.users);
					callback(null, friendsListArray);
				}//end if
				else{
					console.log("Hitting an error here");
					console.log(error);
					console.log(response);
				}//end else
			});//end client call
		}
	}, function(err, results) {
		if(!err){
			console.log("Got into End of calls!");
			//console.log(results.timeLine[0].friendCount);
			res.render('index', {timeLinePosts: results.timeLine, 
				friendsList: results.friends, friendCount: results.timeLine[0].friendCount});
		}
	});	
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
	client.get('statuses/user_timeline', {count: count}, function(error, tweets, response){
		res.send(tweets);
		//res.send(response);
		console.log(error);
		//console.log(response);
	});
});



app.listen(3000, function(){
	console.log("Front end listening on port 3000!");
});



function timeSince(date) {
	
	var seconds = Math.floor((new Date() - date) / 1000);
	
	var interval = Math.floor(seconds / 31536000);
	
	if (interval > 1) {
		return interval + "yr";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + "mon";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + "d";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + "hr";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + "min";
	}
	return Math.floor(seconds) + "sec";
}

