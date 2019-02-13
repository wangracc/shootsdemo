const Redis = require("ioredis");
const config = require("../config/config")

module.exports = function (){
    // return new Redis(redisConnectString);
    let redis;
    try{
        redis = new Redis(config.redishost);
    }catch(err){
        console.log("连接redis失败",err);
    }
    return redis;
}