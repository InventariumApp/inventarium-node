// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');

// Instantiates a client
const vision = Vision();

// The path to the local image file, e.g. "/path/to/image.png
const fileName = '/root/inventarium-node/images/cheerios.jpg';

// Performs label detection on the local file
vision.detectLogos(fileName)
  .then((results) => {
  console.log(results)
  const logos = results[0];

    console.log('Labels:');
    logos.forEach((label) => console.log(label));
  });

