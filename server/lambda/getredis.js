const shootsRedis =  require('../lib/redis')
module.exports = async function(params,ctx){
    console.log(params);

    //m1
    //m2
    //m3
    //m4
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