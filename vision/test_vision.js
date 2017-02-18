console.log("Hello")
// Imports the Google Cloud client library
const Vision = require('@google-cloud/vision');

// Instantiates a client
const vision = Vision();

// The path to the local image file, e.g. "/path/to/image.png
const fileName = '/root/inventarium-node/images/cheerios.jpg';

// Performs label detection on the local file
vision.detectLabels(fileName)
  .then((results) => {
  console.log(results)
  const labels = results[0];

    console.log('Labels:');
    labels.forEach((label) => console.log(label));
  });


console.log("im after ")
