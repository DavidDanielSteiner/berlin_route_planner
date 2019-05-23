const express = require('express')
const app = express()
const port = 3000

const config = require('./config');
const db = require('./db');
const request = require('request');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/db', (req, res, next) => {
    const sql = `SELECT * FROM adbkt.reg where id=?`;
    var dbid = req.query.dbid;
    console.log(`dbid: ${dbid}`);
    const params = [dbid];
    db.readFromHdb(
        config.hdb,
        sql,
        params,
        rows => res.type('application/json').send(rows), 
        info => console.log(info)
    );
});

app.get('/mult', (req, res, next) => {
    res.send(`${req.query.num1 * req.query.num2}`);
});

app.get('/import', (req, res, next) => {
    const parse = require('csv-parse');
    const url = 'https://dev.azure.com/tankerkoenig/362e70d1-bafa-4cf7-a346-1f3613304973/_apis/git/repositories/0d6e7286-91e4-402c-af56-fa75be1f223d/Items?path=%2Fstations%2Fstations.csv&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&download=true&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1';

    var sSQLStatement = "INSERT INTO TANKSTELLENDATEN VALUES (?,?,?,?,?,?,?,?,?,null)";
    const parser = parse({
        delimiter: ',',
        
        }, function(err, records){
          records.shift();
          console.log(records)
          res.send(records);
            db.writeInToHDB(
            config.hdb,
            sSQLStatement,
            records,
            rows => console.log (rows.length),
            info => console.log(info)
        );

        if (err) {
            return console.error('Import failed:', err);
        }} 
      );
    //get data from url and parse into json -> write into hdb
    request(url).pipe(parser); 
});

app.get('/outbound', (req, res, next) => {
    /**
     * Before: to be done in SQL Editor
     * 'UPDATE Tankstellendaten SET Shape_4326 = NEW ST_Point('Point ('|| latitude ||' '|| longitude||') ',4326)'
     */

    //Get data from form
    var sGetLon = req.query.lng;
    var sGetLat = req.query.lat;
    var sGetDistance = req.query.distance;
    //Define SQL Statement
    const sSQLStatement = "SELECT * FROM Tankstellendaten where (shape_4326.st_distance(NEW ST_Point('Point ('|| ? ||' '|| ?||')',4326),'kilometer'))<?;";

    
    
    var params_daten =[];
    
    //Fill in required data for sql statement
    params_daten.push(sGetLat);
    params_daten.push(sGetLon);
    params_daten.push(sGetDistance);
    
    console.log(params_daten);

    // run sql statement and send rows to view
    db.readFromHdb(
        config.hdb,
        sSQLStatement,
        params_daten,
        rows => res.type('application/json').send(rows),
        info => console.log(info));
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))