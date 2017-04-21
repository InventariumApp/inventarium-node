var aws = require('aws-lib');
var credentials = require('./amazon_credentials');
var prodAdv = aws.createProdAdvClient(credentials['accessKey'], credentials['secretKey'], "inventarium39-20");
var jQuery = require('jquery');



exports.getProductDataForBarcode = function(res, upc) {
    if(upc.length > 12) {
        upc = upc.substring(1, upc.length);
    }
    var options = {SearchIndex: "Grocery", IdType: "UPC", ItemId: upc};

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
            console.log("Product Barcode JSON:");
            // console.log(productObj);
            // console.log('\n\n');
            var rawProductName = productObj['ItemAttributes']['Title'];
            var productName = cleanName(rawProductName);
            var category = productObj['ItemAttributes']['ProductGroup'];
            var data = {};
            data['clean_nm'] = productName;
            data['category'] = category;
            data['asin'] = asin;
            getPrice(data, null, res, undefined);
        }
    });
}

exports.getProductDataForName = function(res, name, userEmail, firebaseCallback) {
    var options = {Keywords: name, SearchIndex: "All"}
    prodAdv.call("ItemSearch", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
        }
        else if (typeof result === 'undefined' || typeof result['Items'] === 'undefined'
            || typeof result['Items']['Item'] === 'undefined') {
            console.log('No result for item');
        }
        else {
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
             console.log(productObj);
            // console.log('\n\n');
            var rawProductName = productObj['ItemAttributes']['Title'];
            var category = productObj['ItemAttributes']['ProductGroup'];
            var productName = cleanName(rawProductName);
            var data = {};
            data['clean_nm'] = productName;
            data['category'] = category.toLowerCase();
            data['asin'] = asin;
            getPrice(data, userEmail, res, firebaseCallback);
        }
    });
}


/**
 * Called by getProductDataForBarcode and getProductDataForName
 * Calls getImageUrl
 * @param asin
 * @param cleanName
 * @param res
 */
function getPrice(data, userEmail, res, firebaseCallback) {
    var options = {ResponseGroup: "Offers", IdType: "ASIN", ItemId: data.asin}
    prodAdv.call("ItemLookup", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
            res.json({'code': 200, 'status': 'No result for barcode: ' + data.asin});
        }
        else if (typeof result === 'undefined') {
            console.log('No result for item');
            res.json({'code': 200, 'status': 'No result for barcode: ' + data.asin});
        }
        else {
            // console.log(result);
            var price = result['Items']['Item']['OfferSummary']["LowestNewPrice"]['FormattedPrice'];
            if(typeof price !== 'undefined') {
                console.log(data.clean_nm, "    Price: ", price);
                // pass data to getImageUrl to get data
                data['price'] = price;
                getImageUrl(data, userEmail, res, firebaseCallback);
            }
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
function getImageUrl(data, userEmail, res, firebaseCallback) {
    var options = {IdType: "ASIN", ItemId: data.asin, ResponseGroup: "Images"}
    return prodAdv.call("ItemLookup", options, function(err, result) {
        if (err) {
            console.log("Error: ", err);
        }
        else if (typeof result === 'undefined') {
            console.log('No result for item');
        }
        else {
            // console.log(JSON.stringify(result));
            // console.log('\n\n');
            var productObj;
            if(typeof result['Items']['Item'].length === 'undefined') {
                console.log("set item 1");
                productObj = result['Items']['Item'];
                data.asin = productObj['ASIN'];
            }
            else {
                console.log("set item 2");
                productObj = result['Items']['Item'][0];
                data.asin = productObj['ASIN'];
            }
            var imageUrl = productObj["LargeImage"]["URL"];
            // respond with price, the name of the product, and the image url
            console.log("Image URL: ", imageUrl);
            data['image_url'] = imageUrl;
            // console.log(typeof firebaseCallback);
            if(typeof res !== 'undefined') {
                res.json(data);
            }
            if(typeof firebaseCallback === 'function') {
                console.log("Type of firebase callback is function");
                firebaseCallback(userEmail, data);
            }
            else {
                console.log("Type of firebase callback is NOT function");
            }
        }
    });
}

function cleanName(name) {
    var cleanName = name.replace(/\./g, '');
    cleanName = cleanName.replace(/\//g, ' ');
    if(cleanName.includes(',')) {
        cleanName = cleanName.substring(0, cleanName.indexOf(','));
    }
    return cleanName;
}