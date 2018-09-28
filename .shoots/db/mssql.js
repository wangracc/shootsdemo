const sql = require('mssql')
const fs = require('fs');
const path = require('path');
const projectConfigFile = path.resolve("./.shoots.json");

module.exports = async function() {

  if (!fs.existsSync(projectConfigFile)) {
    throw Error(projectConfigFile, ".shoots.json 文件没有找到");
  }

  const projectConfigData = fs.readFileSync(projectConfigFile, "utf8");
  const project = JSON.parse(projectConfigData);

  let config = null;
  //'mssql://username:password@localhost/database'
  if (project.Mssql && project.Mssql.used === true) {
    config = project.Mssql.conn;
  } else {
    config = process.env.MSSQL_CONNECT_STR;
  }
  if (config) {
    console.log("==> mssql config ", config)
    try {
      return await sql.connect(config);
    } catch (e) {
      console.error('==> can not connect mssql', config, e);
    }
  }
  return null
}
