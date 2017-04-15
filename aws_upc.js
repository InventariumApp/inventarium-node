var aws = require('aws-lib');
var credentials = require('./amazon_credentials');
var prodAdv = aws.createProdAdvClient(credentials['accessKey'], credentials['secretKey'], "inventarium39-20");



exports.getProductDataForBarcode = function(res, upc) {
    if(upc.length > 12) {
        upc = upc.substring(1, upc.length);
    }
    var options = {SearchIndex: "Grocery", IdType: "UPC", ItemId: upc, ResponseGroup: "Images"};

    prodAdv.call("ItemLookup", options, function(err, result) {
        if(err) {
            console.log("Error: ", err);
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else if(typeof result['Items']['Request']['Errors'] !== 'undefined') {
            console.log('Error: ', result['Items']['Request']['Errors']['Error']['Message']);
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else if(typeof result === 'undefined') {
            console.log('No result for item');
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else {
            console.log(JSON.stringify(result));
            console.log('\n\n');

            console.log('Request UPC: ', upc);
            console.log("Length: ", result['Items']['Item'].length);
            // Item is an array if there are more than 1 result
            // If there is only 1 result, Item is a JSON object
            var productObj;
            var asin;
            if(typeof result['Items']['Item'].length === 'undefined') {
                productObj = result['Items']['Item'];
                asin = productObj['ASIN'];
            }
            else {
                productObj = result['Items']['Item'][0];
                asin = productObj['ASIN'];
            }
            // console.log(productObj);
            // console.log('\n\n');
            var rawProductName = productObj['ItemAttributes']['Title'];
            var productName = cleanName(rawProductName);
            getPrice(asin, productName, res);
        }
    });
}

exports.getProductDataForName = function(res, title) {
    var options = {Keywords: title, SearchIndex: "All"}
    prodAdv.call("ItemSearch", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
        }
        else if (typeof result === 'undefined') {
            console.log('No result for item');
        }
        else {
            console.log(JSON.stringify(result));
            console.log('\n\n');

            var productObj;
            var asin;
            if(typeof result['Items']['Item'].length === 'undefined') {
                productObj = result['Items']['Item'];
                asin = productObj['ASIN'];
            }
            else {
                productObj = result['Items']['Item'][0];
                asin = productObj['ASIN'];
            }
            // console.log(productObj);
            // console.log('\n\n');
            var rawProductName = productObj['ItemAttributes']['Title'];
            var productName = cleanName(rawProductName);
            getPrice(asin, productName, res);
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


/**
 * Called by getProductDataForBarcode and getProductDataForName
 * Calls getImageUrl
 * @param asin
 * @param cleanName
 * @param res
 */
function getPrice(asin, cleanName, res) {
    var options = {ResponseGroup: "Offers", IdType: "ASIN", ItemId: asin}
    prodAdv.call("ItemLookup", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else if (typeof result === 'undefined') {
            console.log('No result for item');
            res.json({'code': 200, 'status': 'No result for barcode: ' + upc});
        }
        else {
            console.log(JSON.stringify(result));
            console.log('\n\n');
            var price = result['Items']['Item']['OfferSummary']["LowestNewPrice"]['FormattedPrice'];
            console.log(cleanName, "    Price: ", price);
            // pass data to getImageUrl to get data
            getImageUrl(asin, cleanName, price, res);
        }
    });
}


/**
 * Called by getPrice
 * @param asin
 * @param name
 * @param price
 * @param res
 */
function getImageUrl(asin, name, price, res) {
    var options = {IdType: "ASIN", ItemId: asin, ResponseGroup: "Images"}
    prodAdv.call("ItemLookup", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
        }
        else if (typeof result === 'undefined') {
            console.log('No result for item');
        }
        else {
            console.log(JSON.stringify(result));
            console.log('\n\n');

            var productObj = (typeof result['Items']['Item'].length === 'undefined')
                ? result['Items']['Item'] : result['Items']['Item'][0]
            var imageUrl = productObj["Items"]["Item"]["MediumImage"]["URL"];
            // respond with price, the name of the product, and the image url
            res.json({"clean_nm": name, "price": price, "image_url": imageUrl});
        }
    });
}


// var options = {IdType: "ASIN", ItemId: "B000UENHH4", ResponseGroup: "Images"}
// prodAdv.call("ItemLookup", options, function(err, result) {
//     if (err) {
//         console.log("Error: ", err);
//     }
//     else if (typeof result === 'undefined') {
//         console.log('No result for item');
//     }
//     else {
//         console.log(JSON.stringify(result));
//         console.log('\n\n');
//
//         var productObj = (typeof result['Items']['Item'].length === 'undefined')
//             ? result['Items']['Item'] : result['Items']['Item'][0]
//         var imageUrl = productObj["Items"]["Item"]["MediumImage"]["URL"];
//         console.log("Image URL: ", imageUrl);
//     }
// });




