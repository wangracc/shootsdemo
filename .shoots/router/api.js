 const Router = require('koa-router');
 const debug = require('debug')('shoots');
 const api = new Router({
   prefix: '/api'
 });

 /**
  * 用于调用server/lambda下的应用
  * @type {[type]}
  */
 api.all('/*', async function(ctx, next) {
   let query = ctx.request.query;
   let post = ctx.request.body;
   let params = ctx.extend(query, post);
   debug('==> call lambda api:', ctx.request.path, params);
   try {
     let res = await ctx.lambda.call(ctx.request.path.substr(4), params, ctx, next);
     if (ctx.res.statusCode == 302) {
       return
     }
     ctx.body = res;
   } catch (e) {
     debug('api返回数据出错', e.message);
     debug(e.stack);
     if (process.env.NODE_ENV == 'production') {
       return ctx.body = {
         "errcode": -1,
         "errmsg": e.message,
         "errorType": e.name
       };
     }
     ctx.body = {
       "errcode": -1,
       "errmsg": e.message,
       "errorType": e.name,
       "stackTrace": e.stack
     };
   }
 });

 module.exports = api;
