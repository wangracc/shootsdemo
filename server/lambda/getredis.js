const shootsRedis =  require('../lib/redis')
module.exports = async function(params,ctx){
    console.log(params);

    //第一次提交
    //第二次提交
    //第三次提交
    let key;
   try{
       key = params.key;
   } catch(err){

    console.log(err);
   }
   //first push
   //second push
   //third push
    let redis = shootsRedis();
     let res=await redis.get(key);
     console.log(res);
     return ctx.succeed(res);
}