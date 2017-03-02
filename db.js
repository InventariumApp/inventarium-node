var mysql = require('mysql');
var pool = mysql.createPool(require('./mysql_config'));


function getProductName(req, res) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log("An error occurred!");
		}

        var barcode = req.query['barcode'];
        if (barcode === null || barcode === 'undefined') {
            console.log('Error in prduct_name. Trouble reading barcode.');
            res.json({'code': 100, 'status': 'Error: attempting to get product name.'});
        }
        else {
            connection.query("select gtin_nm from gtin where gtin_cd =" + " " + barcode, function(err, data){
                connection.release();
                if(!err) {
                	console.log(data[0]);
                	res.json(data[0]['gtin_nm'])
                }
            });
		}

		connection.on('error', function(err) {
			console.log("Mysql: An error occurred");
			return;
		});
	});
}

// getProductName('0008817013220');

module.exports = {
	getProductName: getProductName,
}