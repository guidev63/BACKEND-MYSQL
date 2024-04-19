const mysql =require("mysql");
var pool =mysql.createPool({
    "user":"354982",
    "password":"!@gui2125",
    "database":"guilhermedev23_dados",
    "host":"mysql-guilhermedev23.alwaysdata.net",
    "port":3306

});

exports.pool=pool;