const shRedis = require("../lib/redis")
module.exports=async function(params,ctx){

    let key = params.key || "nokey";
    let value = params.value || "val";
    let res;
    redis = shRedis();

    try{
        res = await redis.set(key, value, 'EX',100);
        
    }catch(err){
        console.log("设置key失败",err)
    }
    return ctx.succeed(res);
}