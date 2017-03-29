var aws = require('aws-lib');
var credentials = require('./amazon_credentials');
var prodAdv = aws.createProdAdvClient(credentials['accessKey'], credentials['secretKey'], "inventarium39-20");



exports.getProductName = function(res, upc) {
    if(upc.length > 12) {
        upc = upc.substring(1, upc.length);
    }
    var options = {SearchIndex: "Grocery", IdType: "UPC", ItemId: upc};

    prodAdv.call("ItemLookup", options, function(err, result) {
        if(err) {
            console.log("Error: ", err);
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else if(typeof result['Items']['Request']['Errors'] != 'undefined') {
            console.log('Error: ', result['Items']['Request']['Errors']['Error']['Message']);
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else {
            console.log(JSON.stringify(result));
            console.log('\n\n\n');
            //result['Items']['Item'].map(function(item) {
            //    console.log(item);
            //});
            console.log('Request UPC: ', upc);
            var productObj = result['Items']['Item'][0];
            console.log(productObj);
            console.log('\n\n\n');
            var rawProductName = productObj['ItemAttributes']['Title'];
            var productName = cleanName(rawProductName);
            console.log('Product Name: ', productName);
            res.json({'clean_nm': productName});
        }
    });
}

function cleanName(name) {
    var cleanName = name.replace(/\./g, '');
    if(cleanName.includes(',')) {
        cleanName = cleanName.substring(0, cleanName.indexOf(','));
    }
    return cleanName;
}
