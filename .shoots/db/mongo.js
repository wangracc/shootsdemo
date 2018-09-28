const mysql = require('promise-mysql');
const fs = require('fs');
const path = require('path');
const mongo = require('koa-mongo');
const convert = require('koa-convert');


const projectConfigFile = path.resolve("./.shoots.json");

module.exports = function() {

  if (!fs.existsSync(projectConfigFile)) {
    throw Error(projectConfigFile, ".shoots.json 文件没有找到");
  }

  const projectConfigData = fs.readFileSync(projectConfigFile, "utf8");
  const project = JSON.parse(projectConfigData);

  let config = null;
  if (project.Mongo && project.Mongo.used === true) {
    config = project.Mongo;
  } else if (process.env.MONGO_DBNAME && process.env.MONGO_URL && process.env.MONGO_DBNAME) {
    config = {
      name: process.env.MONGO_DBNAME,
      keys: ['xfruit'],
      session: {
        url: process.env.MONGO_URL,
        collection: 'sessions',
      },
      mongo: {
        dbname: process.env.MONGO_DBNAME,
        uri: process.env.MONGO_URL,
        max: 100,
        min: 1,
        timeout: 30000,
        log: false
      }
    }
  } else {
    console.log("==> no mongo config ", config)
  }
  if (config) {
    console.log("==> mongo config ", config)
    return convert(mongo(config.mongo));
  }
  return null;
}
