const mysql = require('mysql');

exports.pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_yangmat',
  password        : process.env.DBPASSWORD,
  database        : 'cs290_yangmat'
});
