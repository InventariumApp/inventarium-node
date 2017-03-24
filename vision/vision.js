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

exports.getImageData = function(fileName, res) { 
    console.log("Here!");
     vision.detectLogos(storage.bucket(bucketName).file(fileName))
     //vision.detectLogos('/root/inventarium-node/images/cheerios.jpg')
    	.then((results) => {
    	    const logos = results[0];
    	    console.log('Results:');
            console.log(results);
            res.json({'product_name': logos[0]});
    	    logos.forEach((logo) => console.log(logo));
      });

    vision.detectText(storage.bucket(bucketName).file(fileName))
  	.then((results) => {
    	const detections = results[0];

    	console.log('Text:');
    	detections.forEach((text) => console.log(text));
  });
}

