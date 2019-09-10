const express = require('express')
const app = express()
const port = 3000

const config = require('./config');
const db = require('./db');
const request = require('request');
const ta =require('@sap/textanalysis'); // Check: https://help.sap.com/viewer/62e301bb1872437cbb2a8c4209f74a65/2.0.00/en-US/acb990628a8045ff850e69fe2f13f4d1.html
//const hdbext = require('@sap/hdbext'); 
const async = require('async');// ??????
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

// VERSION_NR1

app.get('/performTextAnalysis', (req, res, next) => {
     //Get data from form
    var sGetText = req.query.input_text;
    var aParameters =[];
    var oJSONFrom_To={};
    
    var sSQLStatementTATableResult = "CALL TA_ANALYZE (DOCUMENT_TEXT=>?, LANGUAGE_CODE=>?, MIME_TYPE =>?, LANGUAGE_DETECTION =>'EN, DE', CONFIGURATION=>?, RETURN_PLAINTEXT=>1, TA_ANNOTATIONS => ?, PLAINTEXT => ? );";
    
    aParameters.push(sGetText);
    aParameters.push('DE');
    aParameters.push('text/plain');
    aParameters.push('EXTRACTION_CORE');

    var myTA_Analyze_Callback = function(data) {
        console.log(data);
        var nOffset=0;
        for(var myKey in data) {
            if (data[myKey]['TYPE']=='ADDRESS1' && nOffset==0)
            {
                oJSONFrom_To['FROM']=data[myKey]['TOKEN'];
                nOffset = data[myKey]['OFFSET']; 
                console.log(oJSONFrom_To['FROM']);
            } 
            else if (data[myKey]['TYPE']=='ADDRESS1' && nOffset!=0)
            {
                oJSONFrom_To['TO'] = data[myKey]['TOKEN'];
                console.log(oJSONFrom_To['TO']);
                //res.type('text/plain').send(oJSONFrom_To);
                //res.setHeader('Content-Type', 'application/json');
                //res.send(JSON.stringify(oJSONFrom_To));
                //res.send(oJSONFrom_To);
                //res.type('application/json').send(oJSONFrom_To)
                res.json(oJSONFrom_To);
            } 
            else continue;
        } 
        //res.type('text/plain').send('text');
      };
      
    
    //ADDRESS1 where OFFSET is kleiner

    // run sql statement and send rows to view
    var oJSON_TA_ANALYZE = function(callback) { 
        db.readFromHdbSync(
        config.hdb,
        sSQLStatementTATableResult,
        aParameters,
        rows => {
           callback(rows);
        },
        info => console.log(info),
        myTA_Analyze_Callback
        );      
    }
    oJSON_TA_ANALYZE(myTA_Analyze_Callback);
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

app.get('/unetz', (req, res, next) => {
    //Get data from form
    var sGetLon = req.query.lng;
    var sGetLat = req.query.lat;
    var sGetDistance = req.query.distance;
    //Define SQL Statement
    const sSQLStatement = "SELECT STATION_NAME, LINE_NAME, LATITUDE, LONGITUDE, "
    + "PREMISE_4326.st_distance(NEW ST_Point('Point ('|| ? ||' '|| ? ||')',4326),'meter') as Distance "  
    + "FROM U556741.U_STATIONS where (PREMISE_4326.st_distance(NEW ST_Point('Point ('|| ? ||' '|| ? ||')',4326),'kilometer')) < ? order by Distance;";
    
    var params_daten =[];
    
    //Fill in required data for sql statement
    params_daten.push(sGetLat);
    params_daten.push(sGetLon);
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

app.get('/short_path', (req, res, next) => {
   
    //Get data from form
    var sStart = req.query.start;
    var sEnd= req.query.end;
    //Define SQL Statement
    const sSQLStatement = "CALL U556741.NEAREST_WAY( STARTV => ?, ENDV => ?, ROUTING => ?);";
    
    var params_daten =[];
    
    //Fill in required data for sql statement
    params_daten.push(sStart);
    params_daten.push(sEnd);
    
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