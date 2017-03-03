var express = require('express');
var config = require('./config');
var phoneNumbers = require('./phone_numbers');
var twilioNotifications = require('./twilio_notifications');
var twilio = require('./twilioClient');
// var chatbot = require('./apiaiClient');
var bodyParser = require('body-parser');
// var barcodeDb = require('./db');


var app = express();

var mysql = require('mysql');
var pool = mysql.createPool(require('./mysql_config'));

function getProductName(req, res) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log("An error occurred!");
            console.log(err)
            return;
        }

        var barcode = req.query['barcode'];
        console.log("Barcode: " + barcode);
        if (barcode === null || typeof barcode === 'undefined') {
            console.log('Error in prduct_name. Trouble reading barcode.');
            res.json({'code': 100, 'status': 'Error attempting to get product name.'});
            return;
        }
        else {
            connection.query("select gtin_nm from gtin where gtin_cd =" + " " + barcode, function(err, data){
                if(!err) {
                    console.log("Data: " + data);
                    if(data.length > 0) {
                        console.log("Here:" + data[0]);
                        res.json(data[0]['gtin_nm']);
                        connection.release();
                    }
                    else {
                        res.json({'code': 200, 'status': 'No result for barcode: ' + barcode});
                    }
                }
            });
        }
    });
}

app.use(twilioNotifications.notifyOnError);
app.use(bodyParser.urlencoded({extended: false}));

app.get('/israel', function (req, res) {
    res.send('Attempting to send message.');
    console.log('Received a request!');
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
    getProductName(req, res);
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
    console.log('App listening on port 3000!');
});
