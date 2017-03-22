function getProductName(req, res, pool, mysql) {
    console.log("Inside the function");
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
            var sql = "select gtin.gtin_nm, brand.brand_nm from gtin left join brand " +
                "on gtin.bsin = brand.bsin where gtin_cd = ?"
            var inserts = [barcode];
            sql = mysql.format(sql, inserts);

            connection.query(sql, function(err, data){
                connection.release();
                if(!err) {
                    console.log("Data: " + data);
                    if(data.length > 0) {
                        var cleanName = getCleanName(data[0]);
                        data[0]['clean_nm'] = cleanName;
                        res.json(data[0]);
                    }
                    else {
                        res.json({'code': 200, 'status': 'No result for barcode: ' + barcode});
                    }
                }
            });
        }
    });
}

function getCleanName(data) {
    if(data['brand_nm']) {
        return data['brand_nm'] + " " + data['gtin_nm'];
    }
    else {
        return data['gtin_nm'];
    }
}

module.exports = {
	getProductName: getProductName,
}