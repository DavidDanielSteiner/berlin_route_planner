const hanaClient = require("@sap/hana-client");
const connection = hanaClient.createConnection();

module.exports = {

    readFromHdbSync: async function (hdb, sql, params, infoHandler) {
        return new Promise(function(resolve, reject) {
                        connection.connect(hdb, (err) =>
                            {
                                if (err) {
                                    return console.error("Connection error", err);
                                }

                        var stmt = connection.prepare(sql);
                        stmt.exec(params, (err, rows) => {
                            connection.disconnect();

                            if (err) {
                                return console.error('SQL execute error:', err);
                            }

                                    resolve(rows);
                                    infoHandler(`Query '${sql}' returned ${rows.length} items`);
                                });
                                })
                        
                    }
        )
    },

    readFromHdb: function (hdb, sql, params, handleRows, infoHandler) {
        connection.connect(hdb, (err) => {
            if (err) {
                return console.error("Connection error", err);
            }

            var stmt = connection.prepare(sql);
            stmt.exec(params, (err, rows) => {
                connection.disconnect();

                if (err) {
                    return console.error('SQL execute error:', err);
                }

                handleRows(rows);
                infoHandler(`Query '${sql}' returned ${rows.length} items`);
            });
        });
    },

    writeInToHDB: function (hdb, sql, params, handleRows, infoHandler) {
        connection.connect(hdb, (err) => {
            if (err) {
                return console.error("Connection error", err);
            }

            var stmt = connection.prepare(sql);
            stmt.exec(params, (err, rows) => {
                connection.disconnect();
                //connection.query(sql,)
                /** connection.query(sql, [params], function (err, result) {  
                    if (err) throw err;  
                    console.log("Number of records inserted: " + result.affectedRows);  
                    });  */

                if (err) {
                    return console.error('SQL execute error:', err);
                }
                handleRows(rows);
                infoHandler(`Query '${sql}' saved ${rows.length} items`);
                /** connection.end(function(err){
                    if (err) throw err;
                    connection.disconnect();

                });*/

            });
        });
    },

};