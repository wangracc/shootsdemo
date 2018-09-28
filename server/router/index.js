// import Router from 'koa-router';
const Router = require('koa-router')
const index = new Router({});




/**
 * 用于调用server/lambda下的应用
 * @type {[type]}
 */
index.get('/hello', async function(ctx, next) {

   await ctx.render('hello.ejs');
});


index.get('/mysql', async function(ctx, next) {

  console.log("mysql");
  let data = await ctx.mysql.query(
    `SELECT ? + ? as test`, [1, 1]
  );
  console.log("mysql return data", data)
  ctx.body = 'mysql'
});




module.exports = index;
