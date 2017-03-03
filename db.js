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
            connection.query("select gtin_nm from gtin where gtin_cd =" + " " + barcode, function(err, data){
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