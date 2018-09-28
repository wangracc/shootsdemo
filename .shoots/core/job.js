const fs = require('fs');
const path = require('path');
const debug = require('debug')('shoots');
const workspace = path.join(path.resolve(), 'server', 'job');
const CronJob = require('cron').CronJob;
async function empty() {}

module.exports = function(context, config) {
  debug('==> check  job exist', workspace);
  if (!fs.existsSync(workspace)) {
    debug('==> not exist', workspace);
    return;
  }
  let ctx = Object.assign({
    config: config,
    CronJob: function(cron, doFunc, afterFunc) {
      try {
        return new CronJob(cron,
          doFunc,
          afterFunc || null,
          true,
          'Asia/Shanghai'
        );
      } catch (e) {
        console.log(e.message);
        console.log(e.stack);
      }
    }
  }, context);

  //读取startup下的所有文件，然后运行
  let startups = fs.readdirSync(workspace);
  startups.forEach(async function(file) {
    if (ctx.mongo) {
      await ctx.mongo(ctx, empty);
    }
    debug("==> check job", file);
    try {
      let startup = require(path.join(workspace, file));
      let job = await startup.call(null, null, ctx);
      debug('==> run job ', file);
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
    }
  });
}
