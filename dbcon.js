var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_chinv',
  password        : '3708',
  database        : 'cs290_chinv'
});

module.exports.pool = pool;
