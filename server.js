var express = require('express');
var config = require('./config');
var phoneNumbers = require('./phone_numbers');
var twilioNotifications = require('./twilio_notifications');
var twilio = require('./twilioClient');
var chatbot = require('./apiaiClient');


var app = express();

app.use(twilioNotifications.notifyOnError);

app.get('/israel', function(req, res){
  res.send('Attempting to send message.');
  console.log('Received a request!');
  twilio.sendSms(phoneNumbers.israelPhoneNumber, 'Hello there, from Node Server!');
  var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.israelPhoneNumber);
});

app.get('/michael', function(req, res){
  res.send('Attempting to send message.');
  console.log('Received a request!');
  twilio.sendSms(phoneNumbers.michaelPhoneNumber, 'Hello there, from Node Server!');
  var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.michaelPhoneNumber);
});

app.get('/user', function(req, res){
  res.send('Testing routing');
  console.log(req.query);
});

app.listen(3000, function(){
  console.log('App listening on port 3000!');
});
