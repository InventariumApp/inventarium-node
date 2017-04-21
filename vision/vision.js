// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');
const Storage = require('@google-cloud/storage');

// Instantiates a client
const vision = Vision();
const storage = Storage();

// The path to the local image file, e.g. "/path/to/image.png
//const cheerios = 'cheerios.jpg';
const bucketName = 'nifty-acolyte-159120.appspot.com';
//const bucketName = 'inventarium-bucket';

exports.getImageData = function (fileName, res) {
    // Performs label detection on the remote file
    console.log("Inide vision function");
    vision.detectLabels(storage.bucket(bucketName).file(fileName))
        .then((results) => {
            const labels = results[0];
            console.log('******** Labels **********');
            labels.forEach((label) => console.log(label));
            if(labels.length > 0) {
                res.json({"product_name": labels[0]});
            }
            else {
                console.log('No image detected');
                res.json({"error":"no_image"});
            }
    });
}

