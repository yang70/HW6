const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_yangmat',
  password        : '4858',
  database        : 'cs290_yangmat'
});

export default pool;