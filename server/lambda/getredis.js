const shootsRedis =  require('../lib/redis')
module.exports = async function(params,ctx){
    console.log(params);

   //t1
//    t2
    let key;
   try{
       key = params.key;
   } catch(err){

    console.log(err);
   }
    let redis = shootsRedis();
     let res=await redis.get(key);
     console.log(res);
     return ctx.succeed(res);
}