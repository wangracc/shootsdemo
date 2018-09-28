const fs = require('fs');
const path = require('path');
const debug = require('debug')('shoots');
const workspace = path.join(path.resolve(), 'server', 'startup');

async function empty() {}

function startup(context, config) {
  debug('==> check  startup exist', workspace);
  if (!fs.existsSync(workspace)) {
    debug('==> not exist', workspace);
    return;
  }

  let ctx = Object.assign({
    config: config
  }, context);


  try {
    //读取startup下的所有文件，然后运行
    let startups = fs.readdirSync(workspace);
    startups.forEach(async function(file) {
      if (ctx.mongo){
          await ctx.mongo(ctx, empty);
      }
      debug("==> startup", file);
      let startup = require(path.join(workspace, file));
      let result = await startup.call(null, null, ctx);
      debug('==> run startup ', file, ' result ', result);
    });

  } catch (e) {
    console.error(e.message);
    console.error(e.stack);
  }
}


module.exports = startup;
