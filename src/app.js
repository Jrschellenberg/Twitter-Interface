/**
 * Created by Justin on 2/3/2017.
 */
'use strict';

const express = require('express');
const app = express();

app.get('/', function(req,res){
	res.send("Hello World");
});

app.listen(3000, function(){
	console.log("Front end listening on port 3000!");
});