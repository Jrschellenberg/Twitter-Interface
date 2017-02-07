/**
 * Created by Justin on 2/3/2017.
 */
'use strict';

const express = require('express');
const app = express();
const async = require('async');
const secrets = require('./config.js');
const Twitter = require('twitter');
const count = 5;

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




app.get('/', function(req,res){
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
						object.createdAt = timeSince(d); //Calling timeSince function to calculate time since posted.
						object.favoriteCount = tweets[i].favorite_count;
						object.retweetCount = tweets[i].retweet_count;
						object.friendCount = tweets[i].user.friends_count;
						timeLineArray.push(object);
					} // end for
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
				}//end if
				callback(error, friendsListArray);
			});//end client call
		},
		directMessages: function(callback){
			var directMessageArray = [];
			getDirectMessages('direct_messages');
			getDirectMessages('direct_messages/sent');
			/*
			A function closure since these calls are very similar.
			@param call: The string to be passed to client.get refering to which api call to make.
			 */
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
							object.time = timeSince(d); //This is calling the function timeSince to convert to time since posted.
							//Determining if it is the end user sending the message, or receiving. used for displaying view.
							if(call ==='direct_messages/sent'){
								object.me = true;
							}
							else{
								object.me = false;
							}
							directMessageArray.push(object);
						} // end for
						//If the array is populated with the count amount *2 (i.e on the 2nd call)
						if(directMessageArray.length == (count*2)){
							//Here we are sorting the array of messages based on date.
							directMessageArray.sort(function(a,b){
								return new Date(a.createdAt) - new Date(b.createdAt);
							});
							//Slice the array and keep only the amount up to count we want.
							callback(error, directMessageArray.slice(count, directMessageArray.length)); //giving only 5 recent messages to the callback
						} // end if
					} //end if
				});
			}//end getDirectMessages Function.
		}
	}, function(err, results) {
		if(!err){ //Successfully requested all the api calls.
			// Render the page with the populated information.
			res.render('index', {timeLinePosts: results.timeLine, directMessages: results.directMessages,
				friendsList: results.friends, friendCount: results.timeLine[0].friendCount, screenName: results.timeLine[0].screenName});
		} //end if
		else{
			//Render the error page with the following hardString plus the error from twitter api.
			res.render('error', {error: "There was an issue in handling your request.\n"+ err});
		} //end else
	});	// end function
}); // end async

app.listen(3000, function(){
	console.log("Front end listening on port 3000!");
});

/*
A function to parse date object into amount of second, minute, hour, days, months, years ago since it was made.
@param date: a Date object to compare against the current date.
 */
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