const koa = require('koa');
const compose = require('koa-compose');
const convert = require('koa-convert');

const views = require('koa-views');
const serve = require('koa-static');
const path = require('path');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const http = require('http');
const IO = require('socket.io');
const debug = require('debug')('shoots');
const Mysql = require('./db/mysql');
const mongo = require('./db/mongo')();
const Mssql = require('./db/mssql');
const middleware = require('./core/middleware');
const lambda = require('./core/lambda');
const router = require('./core/router');
const startup = require('./core/startup');
const job = require('./core/job');

const api = require('./router/api');
const config = require('./config')();



const app = new koa();

const server = http.createServer(app.callback());
/*处理扫码登录*/


const io = IO.listen(server);

let context = {
  mssql: null,
  mysql: null,
  mongo: null
};
//用于给JOB,startup 数据库连接
//处理数据库连接
(async function() {
  context.mssql = await Mssql();
  console.log('==> mssql middleware init');
  context.mysql = Mysql();
  console.log('==> mysql middleware init');
  if (mongo) {
    console.log('==> mongo middleware init')
    context.mongo = mongo
    startup(context, config);
    job(context, config);
    app.use(mongo);
  }
})();




app.use(async(ctx, next) => {
  if (context.mssql) {
    ctx.mssql = context.mssql;
  }
  if (context.mysql) {
    ctx.mysql = context.mysql;
  }
  await next();
})






app.use(async(ctx, next) => {
  let start = new Date();
  await next();
  let ms = new Date() - start;
  console.log(`==> ${ctx.method} ${ctx.url} - ${ms}ms`);
  ctx.set('X-Response-Time', `${ms}ms`);
  ctx.set('X-Powered-By', 'xfruit.cn');
});

// 设置gzip
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}));

// 设置渲染引擎
app.use(views(path.resolve(__dirname, '../server/views'), {
  extension: 'ejs',
  options: {
    'delimiter': '?'
  }
}));

// 设置跨域
app.use(convert(cors()));

// body解析
app.use(bodyParser({
  formLimit: "50mb",
  jsonLimit: "50mb"
}));



app.use(middleware());
app.use(lambda());

const routers = router();

debug('==> routers length', routers.length);

for (var i = 0; i < routers.length; i++) {
  app.use(routers[i].routes());
}

app.use(api.routes());

const publicPath = path.join(__dirname, '..', 'public');

debug('==> public static file path', publicPath);
app.use(convert(serve(publicPath)));

app.use(async(ctx, next) => {
  ctx.io = io;
  next()
})

io.on('connection', function(socket) {
  console.log(socket.id)
  socket.broadcast.emit('chat message', 'welcome');
  socket.on('chat message', function(msg) {
    console.log('message: ' + msg);
    socket.emit('chat message', msg);
    socket.broadcast.emit('chat message', msg);
  });

});



console.log(config);


module.exports = server;
