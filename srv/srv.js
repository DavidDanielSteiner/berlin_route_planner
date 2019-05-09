const express = require('express')
const app = express()
const port = 3000

const config = require('./config');
const db = require('./db');

//Added packages
const http = require('https');
const parse = require('csv-parse/lib/sync')

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


/**
Aufgabe 2.1 Get TestData from Web CSV, Insert TestData into Hdb
 */
app.get('/importTestData', (req, res, next) => {
   var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
   const Http = new XMLHttpRequest();
   const url = 'https://wiki.htw-berlin.de/confluence/download/attachments/31623434/test.txt?version=1&modificationDate=1552985182810&api=v2';
   Http.open("GET", url);
   Http.send();
   Http.onreadystatechange=function(){
       if(this.readyState==4 && this.status==200) {
           const records = parse(Http.responseText, {
               columns: true,
               trim: true,
               skip_empty_lines: true
           })
           //console.log(records);
           const sql = `INSERT INTO \"U556414\".\"IMPORT\" VALUES (?, ?)`;
           db.insertIntoHdbTestData(
               config.hdb,
               sql,
               records,
               info => console.log(info)
           );
       }
   }
});

/**
Aufgabe 2.2 Get StationData from Web, Parse Data from CSV format, Insert Data into Database
 */
app.get('/importStations', (req, res, next) => {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    const Http = new XMLHttpRequest();
    //https://tankerkoenig@dev.azure.com/tankerkoenig/tankerkoenig-data/_git/tankerkoenig-data
    const url = 'https://dev.azure.com/tankerkoenig/362e70d1-bafa-4cf7-a346-1f3613304973/_apis/git/repositories/0d6e7286-91e4-402c-af56-fa75be1f223d/Items?path=%2Fstations%2Fstations.csv&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&download=true&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1';
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200) {
            const records = parse(Http.responseText, {
                columns: true,
                trim: true,
                skip_empty_lines: true
            })
            //console.log(records);
            const sql = `INSERT INTO "U556414"."STATIONS2" VALUES (?,?,?,?,?,?,?,?,?)`;

            db.insertIntoHdbStations(
                config.hdb,
                sql,
                records,
                info => console.log(info)
            );
        }
    }
});


/**
Aufgabe 2.3
 */
app.get('/stations', (req, res, next) => {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var distance = req.query.distance;
    console.log(lat)
    console.log(lng)
    console.log(distance)

    const sql = `SELECT name_station, brand, street, house_number, post_code, city, NEW ST_POINT(LATITUDE, LONGITUDE).ST_SRID(4326).ST_Distance( NEW ST_Point('POINT('||?||' '||?||')', 4326), 'kilometer') AS distance_km FROM "U556414"."STATIONS2" WHERE NEW ST_POINT(LATITUDE, LONGITUDE).ST_SRID(4326).ST_Distance( NEW ST_Point('POINT('||?||' '||?||')', 4326), 'kilometer') <= ?`;
    const params = [lat, lng, lat, lng,distance];

    db.readFromHdbStations(
        config.hdb,
        sql,
        params,
        rows => res.type('application/json').send(rows),
        info => console.log(info)
    );
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));



