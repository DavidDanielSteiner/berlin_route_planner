const hanaClient = require("@sap/hana-client");
const connection = hanaClient.createConnection();

module.exports = {
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


    /**
    Aufgabe 2.1 Insert Test Data (Key Value) into Hana Database
     */
    insertIntoHdbTestData: function (hdb, sql, records, infoHandler) {
        connection.connect(hdb, (err) => {
            if (err) {
                return console.error("Connection error", err);
            }
            for (const c of records) {
                const params = [c.key, c.value];
                var stmt = connection.prepare(sql);
                stmt.exec(params, (err) => {
                    if (err) {
                        return console.error('SQL execute error:', err);
                    }
                    infoHandler(`Query '${sql}' successful. Values: '${params}'`);
                });
            }
        });

    },

    /**
     Aufgabe 2.2 Insert Station Data into Hana Database
     uuid,name,brand,street,house_number,post_code,city,latitude,longitude
   */
    insertIntoHdbStations: function (hdb, sql, records, infoHandler) {
        connection.connect(hdb, (err) => {
            if (err) {
                return console.error("Connection error", err);
            }
            for (const c of records) {
                const params = [c.uuid, c.name, c.brand, c.street, c.house_number, c.post_code, c.city, c.latitude, c.longitude];
                var stmt = connection.prepare(sql);
                stmt.exec(params, (err) => {
                    if (err) {
                        return console.error('SQL execute error:', err);
                    }
                    //infoHandler(`Query '${sql}' successful.`);
                });
            }infoHandler(`Import finished.`);
        });
    },

    /**
     Aufgabe 2.3 get all Stations in 'distance' from 'lat', 'lng'
    */
    readFromHdbStations: function (hdb, sql, params, handleRows, infoHandler) {
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
                infoHandler(`Query '${sql}' returned ${rows.length} stations`);
            });

        });
    }


};


