var express = require('express');
var config = require('./config');
var twilioNotifications = require('./twilio_notifications');
var twilio = require('./twilioClient');

var app = express();

app.use(twilioNotifications.notifyOnError);

app.get('/', function(req, res){
  res.send('Attempting to send message.');
  console.log('Received a request!');
  twilio.sendSms('+12169521610', 'Hello there, from Node Server!');
});

app.get('/user', function(req, res){
  res.send('Testing routing');
  console.log(req.query);
});

app.listen(3000, function(){
  console.log('App listening on port 3000!');
});
