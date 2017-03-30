var vision = require('./vision/vision.js');
var express = require('express');
var config = require('./config');
var phoneNumbers = require('./phone_numbers');
var twilioNotifications = require('./twilio_notifications');
var twilio = require('./twilioClient');
// var chatbot = require('./apiaiClient');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var pool = mysql.createPool(require('./mysql_config'));
var barcodeDb = require('./db');
var awsUpc = require('./aws_upc.js');

var app = express();

app.use(twilioNotifications.notifyOnError);
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/static'));

app.get('/israel/:test', function (req, res) {
    res.send('Attempting to send message.');
    console.log('Received a request!');
    console.log(req.params.test);
    twilio.sendSms(phoneNumbers.israelPhoneNumber, 'Hello there, from Node Server_1!');
    // var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.israelPhoneNumber);
});

app.get('/michael', function (req, res) {
    res.send('Attempting to send message.');
    console.log('Received a request!');
    twilio.sendSms(phoneNumbers.michaelPhoneNumber, 'Hello there, from Node Server_2!');
    //var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.michaelPhoneNumber);
});

app.get('/user', function (req, res) {
    res.send('Testing routing');
    console.log(req.query);
});

app.get('/product_name', function (req, res) {
    console.log("Received barcode request.");
    //barcodeDb.getProductName(req, res, pool, mysql);
    awsUpc.getProductName(res, req.query['barcode']);
});

app.get('/image_data/:filename', function(req, res) {
    console.log("received image");
    const fileName = decodeURIComponent(req.params.filename);
    console.log(fileName);
    vision.getImageData(fileName, res);
});

// app.post('/twilio', function (req, res) {
//     console.log("Received a Message From User");
//     console.log(req.body);
//     message_body = req.body.Body;
//     sender_phone_number = req.body.From
//     chatbot.sendToChatbot(message_body, '<33>', sender_phone_number, function (result) {
//         var twilio = require('twilio');
//         var twiml = new twilio.TwimlResponse();
//         twiml.message(result);
//         res.writeHead(200, {'Content-Type': 'text/xml'});
//         res.end(twiml.toString());
//     });
// });

app.listen(3000, function () {
    console.log('App Started!');
});
