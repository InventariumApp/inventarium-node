// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');

// Instantiates a client
const vision = Vision();

// The path to the local image file, e.g. "/path/to/image.png
const fileName = '/root/inventarium-node/images/cheerios.jpg';
const bucketName = 'nifty-acolyte-159120.appspot.com';

// Performs label detection on the local file
vision.detectLogos(fileName)
  .then((results) => {
  console.log(results)
  const logos = results[0];

    console.log('Labels:');
    logos.forEach((label) => console.log(label));
  });

function getImageData(fileName) {
    vision.detectLogos(storage.bucket(bucketName).file(fileName))
        .then((results) => {
	    const logos = results[0];
            logos.forEach((label) => console.log(label));
	});
}

/*
// The name of the bucket where the file resides, e.g. "my-bucket"
// const bucketName = 'my-bucket';

// The path to the file within the bucket, e.g. "path/to/image.png"
// const fileName = 'path/to/image.png';

// Performs logo detection on the remote file
vision.detectLogos(storage.bucket(bucketName).file(fileName))
*/
