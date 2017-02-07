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
	var errorMessage = "";
	async.parallel({
		timeLine: function(callback) {
			client.get('statuses/user_timeline',{count: count}, function(error, tweets, response){
				var timeLineArray = [];
				if(!error && response.statusCode === 200) {
					
					
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
					
				}//end if
				callback(error, timeLineArray);
			});//end client call
			
		},
		friends: function(callback) {
			client.get('friends/list', {count: count}, function(error, tweets, response){
				var friendsListArray = [];

				if(!error && response.statusCode === 200) {
					
					for (var i = 0; i < tweets.users.length; i++) {
						var object = {};
						object.userName = tweets.users[i].name;
						object.screenName = tweets.users[i].screen_name;
						object.profileImageURL = tweets.users[i].profile_image_url;
						object.following = tweets.users[i].following;
						
						friendsListArray.push(object);
					} // end for
					//res.send(tweets.users);
					
				}//end if
				callback(error, friendsListArray);
			});//end client call
		},
		directMessages: function(callback){
			var directMessageArray = [];
			getDirectMessages('direct_messages');
			getDirectMessages('direct_messages/sent');
			
			function getDirectMessages(call){
				client.get(call, {count: count}, function(error, tweets, response){
					if(!error && response.statusCode === 200) {
						for (var i = 0; i < tweets.length; i++) {
							var object = {};
							var d = new Date(tweets[i].created_at);
							object.text = tweets[i].text;
							object.userName = tweets[i].sender.name;
							object.screenName = tweets[i].sender.screen_name;
							object.profileImageURL = tweets[i].sender.profile_image_url;
							object.createdAt = tweets[i].created_at;
							object.time = timeSince(d);
							//Determining if it is the end user sending the message, or receiving. used for displaying view.
							if(call ==='direct_messages/sent'){
								object.me = true;
							}
							else{
								object.me = false;
							}
							directMessageArray.push(object);
						} // end for
						
						//If the array is populated with the count amount *2 (for the 2 calls)
						//Then this code executes
						if(directMessageArray.length == (count*2)){
							//Here we are sorting the array of messages based on date.
							directMessageArray.sort(function(a,b){
								return new Date(a.createdAt) - new Date(b.createdAt);
							});
							//Slice the array and keep only the amount up to count we want.
							callback(error, directMessageArray.slice(count, directMessageArray.length));
						} // end if
					} //end if
					
					//need to put callback here ????????
					
				});
			}//end getDirectMessages Function.
		}
	}, function(err, results) {
		console.log(err);
		console.log(results.timeLine);
		if(!err){
			//console.log(results.timeLine[0].friendCount);
			res.render('index', {timeLinePosts: results.timeLine, directMessages: results.directMessages,
				friendsList: results.friends, friendCount: results.timeLine[0].friendCount});
		} //end if
		else{
			displayError(res, "There was an issue in handling your request.\n"+ err);
		} //end else
	});	// end function

	
}); // end async
//
//app.get('/recent', function(req, res){
//	client.get('direct_messages', {count: count}, function(error, tweets, response){
//		if(!error && response.statusCode === 200) {
//			res.send(tweets);
//			var directMessageArray = [];
//			for (var i = 0; i < tweets.length; i++) {
//				var object = {};
//				object.text = tweets[i].text;
//				object.userName = tweets[i].sender.name;
//				object.screenName = tweets[i].sender.screen_name;
//				object.profileImageURL = tweets[i].sender.profile_image_url;
//				object.createdAt = tweets[i].created_at;
//				directMessageArray.push(object);
//			} // end for
//		} //end if
//		else{
//			errorMessage("An error occured while requesting direct Messages");
//		}//end else
//	});
//});
//
//app.get('/myrecent', function(req, res){
//	client.get('direct_messages/sent',{count: count, since_id: '827662798922641400'}, function(error, tweets, response){
//		res.send(tweets);
//		//res.send(response);
//		console.log(error);
//		//console.log(response);
//	});
//});


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

function displayError(res, error){
	res.render('error', {error: error});
}

