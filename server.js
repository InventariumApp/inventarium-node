var vision = require('./vision/vision.js');
var express = require('express');
var config = require('./config');
var phoneNumbers = require('./phone_numbers');
var twilioNotifications = require('./twilio_notifications');
var twilio = require('twilio');
var twilioClient = require('./twilioClient');
var chatbot = require('./apiaiClient');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var pool = mysql.createPool(require('./mysql_config'));
var barcodeDb = require('./db');
var aws = require('./aws.js');
var firebase = require('./firebase.js');
var path = require('path');
var fs = require('fs');
var https = require('https');
var moment = require('moment');


var exphbs  = require('express-handlebars');
var app = express();
// var fs = require('fs');
// var http = require('https');
// var sslPath = '/etc/letsencrypt/live/inventarium.me/';
// var options = {
//     key: fs.readFileSync(sslPath + 'privkey.pem'),
//     cert: fs.readFileSync(sslPath + 'fullchain.pem')
// };

var options = {
    ca: fs.readFileSync('/home/israel/inventarium_me.ca-bundle'),
    cert: fs.readFileSync('/home/israel/inventarium_me.crt'),
    key: fs.readFileSync('/home/israel/inventarium_me.key')
};


app.use(express.static('static'));
// Setting up handlebars
app.engine('handlebars', exphbs(
    {
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/'
    })
);
app.set('view engine', 'handlebars');

app.use(twilioNotifications.notifyOnError);
app.use(bodyParser.urlencoded({extended: false}));




app.get('/israel/:test', function (req, res) {
    res.send('Attempting to send message.');
    console.log('Received a request!');
    console.log(req.params.test);
    twilioClient.sendSms(phoneNumbers.israelPhoneNumber, 'Hello there, from Node Server_1!');
    // var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.israelPhoneNumber);
});

app.get('/michael', function (req, res) {
    res.send('Attempting to send message.');
    console.log('Received a request!');
    twilioClient.sendSms(phoneNumbers.michaelPhoneNumber, 'Hello there, from Node Server_2!');
    //var response = chatbot.sendToChatbot('I just threw away the milk', '<33>', phoneNumbers.michaelPhoneNumber);
});

app.get('/user', function (req, res) {
    res.send('Testing routing');
    console.log(req.query);
});

app.get('/product_data_for_barcode', function (req, res) {
    console.log("Received barcode request.");
    console.log(req.body);
    //barcodeDb.getProductName(req, res, pool, mysql); // MySQL Barcode Database
    aws.getProductDataForBarcode(res, req.query['barcode']);  // AWS Barcode
});

app.get('/product_data_for_name/:product_name', function(req, res) {
    console.log("Received product name request.");
    aws.getProductDataForName(res, req.params.product_name, undefined, undefined);
});

app.get('/image_data/:filename', function(req, res) {
    console.log("received image");
    const fileName = decodeURIComponent(req.params.filename);
    console.log(fileName);
    vision.getImageData(fileName, res);
});

app.post('/share_list', function(req, res) {
   console.log("Request to share list");
   var userEmail = req.body.user_email;
   var recipientPhoneNumber = req.body.recipient_phone_number;
   console.log('User Email: ', userEmail);
   console.log('Recipeient Phone Numnber: ', recipientPhoneNumber);
   // create a link between user and number
   firebase.shareWithPhoneNumber(userEmail, recipientPhoneNumber);
   firebase.shareShoppingList(userEmail, recipientPhoneNumber);
   res.sendStatus(200);
});

app.get('/graphs/top_products/:user', function(req, res) {
    const userEmail = decodeURIComponent(req.params.user);
    firebase.getTopProductsForUser(userEmail).then(function(results) {
        var chartData = [];
        var chartLabels = [];
        var count = 0;

        for(i in results) {
            if(count < 6) {
                var currLabel = results[i][0];
                chartLabels.push(currLabel.substring(0, 20));
                chartData.push(results[i][1]);
            }
            count++;
        }
        console.log('\n\n');
        console.log(chartLabels);
        res.render('topProductsPage', {chartData: JSON.stringify(chartData),
                             chartLabels: JSON.stringify(chartLabels)}
        );
    });
});

app.get('/graphs/top_categories/:user', function(req, res) {
    console.log("Request to Categories Pie Chart");
    const userEmail = decodeURIComponent(req.params.user);
    firebase.getItemCategoryCounts(userEmail).then(function(results) {
        var chartData = [];
        var chartLabels = [];

        for(var key in results) {
            chartLabels.push(key);
            chartData.push(results[key]);
        }
        res.render('categoryPiePage', {chartData: JSON.stringify(chartData),
            chartLabels: JSON.stringify(chartLabels)}
        );
    });
});

app.get('/graphs/line_graph/:user/:item', function(req, res) {
    console.log("Request to Line Graph");
    const userEmail = decodeURIComponent(req.params.user);
    const item = decodeURIComponent(req.params.item);
    firebase.getLineGraphData(userEmail, item).then(function(results) {
        var chartData = [];
        var chartLabels = [];

        for(var key in results) {
            chartLabels.push(moment().day('Monday').week(key).format('MM/DD'));
            chartData.push(results[key]);
        }
        res.render('lineGraphPage', {chartData: JSON.stringify(chartData),
            chartLabels: JSON.stringify(chartLabels)}
        );
    });
});

app.get('/graphs/', function(req, res) {
    const userEmail = decodeURIComponent(req.params.user);
    firebase.getTopProductsForUser('iphoneaccount@gmail,com').then(function(results) {
        var chartData = [];
        var chartLabels = [];
        var count = 0;

        for(i in results) {
            console.log(results[i]);
            chartLabels.push(results[i][0]);
            chartData.push(results[i][1]);
        }
        console.log('\n\n');
        console.log(chartLabels);
        res.render('topProductsPage', {chartData: JSON.stringify(chartData),
            chartLabels: JSON.stringify(chartLabels)}
        );
    });
});


app.post('/twilio', function (req, res) {
    console.log("Received a Message From User");
    // console.log(req.body);
    var message = req.body.Body;
    var senderPhoneNumber = req.body.From;
    chatbot.handleChatbotRequest(message, '<33>', senderPhoneNumber);
    var twimlResponse = twilio.TwimlResponse();
    twimlResponse.message("");
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twimlResponse.toString());
});

app.post('tiwlio/fail', function() {
   console.log("Error from twilio!");
   console.log(req.body.Body);
});

var json_body_parser = bodyParser.json();
app.post('/chatbot/webhook/', json_body_parser, function(req, res) {
   console.log('Received a WEBHOOK request.');
   // console.log(req.body);
   if(typeof req.body.originalRequest === 'undefined') {
       // this request is from sms... ignore it. It is already being handles by twilio endpoint
       console.log('Webhook request from SMS... ignoring');
   }
   else if(req.body.originalRequest.source === 'google') {
       console.log('Request from Ivan');
       chatbot.fulfillRequest(req.body, res);
   }
   //console.log(req.body);
});


// SECURE SERVER :)
https.createServer(options, app).listen(443, function() {
    console.log("App Started!");
});

// app.listen(3000, function () {
//     console.log('App Started!');
// });