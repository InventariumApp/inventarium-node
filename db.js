var mysql = require('mysql');

function getProductName(req, res, pool) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log("An error occurred!");
            console.log(err)
            return;
        }

        var barcode = req.query['barcode'];
        console.log("Barcode: " + barcode);
        if (barcode === null || typeof barcode === 'undefined') {
            console.log('Error in prduct_name. Trouble reading barcode.');
            res.json({'code': 100, 'status': 'Error attempting to get product name.'});
            return;
        }
        else {
            var sql = "select gtin.gtin_nm, brand.brand_nm from gtin inner join brand " +
                "where gtin.gtin_cd = ? and gtin.bsin = brand.bsin"
            var inserts = [barcode];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function(err, data){
                if(!err) {
                    console.log("Data: " + data);
                    if(data.length > 0) {
                        console.log("Here:" + data[0]);
                        res.json(data[0]);
                        connection.release();
                    }
                    else {
                        res.json({'code': 200, 'status': 'No result for barcode: ' + barcode});
                    }
                }
            });
        }
    });
}

module.exports = {
	getProductName: getProductName,
}