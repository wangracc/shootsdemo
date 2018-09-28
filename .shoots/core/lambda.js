const fs = require('fs');
const path = require('path');

const workFolder = path.join(path.resolve(), 'server', 'lambda');

const lambdas = new Map();

module.exports = function(opts) {
  function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
      for (var prop in source) {
        target[prop] = source[prop];
      }
    });
    return target;
  }

  async function handle(name, params, ctx, next) {
    let key = name;
    let file = path.join(workFolder, name + ".js");

    let handler = lambdas.get(key);
    if (!handler) {
      if (!fs.existsSync(file)) {
        console.log('file not exists', file);
        return ctx.fail(new Error(`api${name} not found!`));
      }

      try {
        handler = require(file);
      } catch (e) {
        console.log("引用" + key + "出错");
        return ctx.fail(e);
      }

      if (process.env.PRD === "true") {
        lambdas.set(name, handler);
      } else {
        //  删除require的cache,针对开发环境
        delete require.cache[file];
      }
    }
    try {
      return await handler.call(null, params, ctx, next);
    } catch (e) {
      console.log("===================================== 调用lambda api出错了 ====================================");
      console.log(e.stack);
      throw e;

    }
  }



  return function lambda(ctx, next) {

    ctx.isGet = function() {
      return ctx.request.method === 'GET';
    };

    ctx.isPost = function() {
      return ctx.request.method === 'POST';
    };

    ctx.isPut = function() {
      return ctx.request.method === 'PUT';
    }

    ctx.isDelete = function() {
      return ctx.request.method === 'DELETE';
    }

    ctx.extend = extend;

    ctx.lambda = {};
    ctx.lambda.call = async function(name, params) {

      /*
       * 因为ctx.lambda.call可以嵌套调用，所以需要对 succeed/fail 回调进行压栈处理
       * 1. 在lambda函数执行前后压栈和恢复
       * 2. 堆栈信息储存在 context 上，如果lambda函数出错，只会影响一个上下文
       */
      var ret = null;
      ctx.succeed = function(data) {
        ret = data;
      }
      ctx.fail = function(error) {
        let data = {
          "errcode": -1,
          "errmsg": error.message,
          "errorType": error.name,
          "stackTrace": error.stack
        };
        ret = data;
      }
      ctx.__lambda_cb_stack = ctx.__lambda_cb_stack || [];
      ctx.__lambda_cb_stack.push({
        succeed: ctx.succeed,
        fail: ctx.fail
      });

      try {
        var retdata = await handle(name, params, ctx, next);
      } catch (e) {
        console.log("===================================== 调用lambda api出错了 ====================================");
        console.log(e.stack);
        ret = {
          errcode: -1,
          "errmsg": e.message,
          "errorType": e.name,
          "stackTrace": e.stack
        };
      }
      ctx.__lambda_cb_stack.pop();
      ctx.succeed = ctx.__lambda_cb_stack.length > 0 ? ctx.__lambda_cb_stack[ctx.__lambda_cb_stack.length - 1]['succeed'] : null;
      ctx.fail = ctx.__lambda_cb_stack.length > 0 ? ctx.__lambda_cb_stack[ctx.__lambda_cb_stack.length - 1]['fail'] : null;
      return ret;
    };
    return next();
  }
}
