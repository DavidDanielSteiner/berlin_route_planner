const config = require('./srv/config');
const db = require('./srv/db');

const sql = `SELECT * FROM adbkt.reg where id=?`;
const params = [1];
db.readFromHdb(
    config.hdb,
    sql,
    params,
    rows => console.log(JSON.stringify(rows, null, 2)),
    info => console.log(info)
);

