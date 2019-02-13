const shootsRedis =  require('../lib/redis')
module.exports = async function(params,ctx){
    console.log(params);
    let key;
    console.log("dev分支新增的内容")
   try{
       key = params.key;
   } catch(err){

    console.log(err);
   }
    let redis = shootsRedis();
    console.log("test分支新增的内容");
     let res=await redis.get(key);
     console.log(res);
     return ctx.succeed(res);
}