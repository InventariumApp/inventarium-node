var aws = require('aws-lib');
var credentials = require('./aws_credentials');
var prodAdv = aws.createProdAdvClient(credentials['accessKey'], credentials['secretKey'], "inventarium39-20");

var options = {SearchIndex: "Books", Keywords: "Javascript"}

prodAdv.call("ItemSearch", options, function(err, result) {
    console.log(result);
    result['Items']['Item'].map(function(item) {
        console.log(item);
    });
});
