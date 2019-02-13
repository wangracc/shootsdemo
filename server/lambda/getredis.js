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
     //这里是fea1分支新增的内容
     //这是直接在master更改的内容，为了研究git commit的时候message填写
     return ctx.succeed(res);
}