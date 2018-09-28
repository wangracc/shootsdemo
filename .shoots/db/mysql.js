const mysql = require('promise-mysql');
const fs = require('fs');
const path = require('path');

const projectConfigFile = path.resolve("./.shoots.json");

module.exports = function() {

  if (!fs.existsSync(projectConfigFile)) {
    throw Error(projectConfigFile, ".shoots.json 文件没有找到");
  }

  const projectConfigData = fs.readFileSync(projectConfigFile, "utf8");
  const project = JSON.parse(projectConfigData);

  let config = null;
  if (project.Mysql && project.Mysql.used === true) {
    config = project.Mysql;
  } else if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE) {
    config = {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || '',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE,
      connectionLimit: 100
    };
  } else {
    console.log("==> no mysql config ", config);
  }
  if (config) {
    console.log("==> mysql config ", config);
    return mysql.createPool(config);
  }
  return null;
}
