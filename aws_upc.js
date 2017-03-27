let aws = require('aws-lib');
let credentials = require('./aws_credentials');
let prodAdv = aws.createProdAdvClient(credentials['accessKey'], credentials['secretKey'], yourAssociateTag);
