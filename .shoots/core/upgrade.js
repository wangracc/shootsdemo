//支持热升级
const Url = require('url');
const fs = require('fs');
const path = require('path');
const git = require('simple-git');
const cloneOrPull = require('git-clone-or-pull');
const cp = require('child_process');

const cwd = path.join(__dirname, '..', '..')

module.exports = function(opts) {

  function getRemoteUrl() {
    return new Promise(function(resolve, reject) {
      git().listRemote(['--get-url'], function(err, url) {
        if (!err) {
          console.log('Remote url for repository at ' + __dirname + ':')
          url = url.replace(/\n/, "");
          return resolve({
            error: null,
            url: url
          })
        }
        return resolve({
          error: err,
          url: null
        })
      });
    });
  }

  function gitUpdate(gitUrl) {
    return new Promise(function(resolve, reject) {
      cloneOrPull(`${gitUrl}`,
        './',
        function(err) {
          console.log(err);
          return resolve({
            errcode: err ? -1 : 0,
            errsmg: err ? '拉取代码失败' : '拉取代码成功',
            data: err
          })
        });
    })
  }


  //对比json，获得最新安装包
  function getNeedInstallDependencies(oldPackage, newPackage) {

    let oldDependencies = oldPackage.dependencies;
    let newDependencies = newPackage.dependencies;

    let needInstall = [];

    for (var name in newDependencies) {
      if (newDependencies.hasOwnProperty(name)) {
        if (oldDependencies.hasOwnProperty(name)) {
          if (newDependencies[name] != oldDependencies[name]) {
            //更新包
            needInstall.push(`${name}@${newDependencies[name]}`)
          }
        } else {
          //新增包
          needInstall.push(`${name}@${newDependencies[name]}`)
        }

      }
    }

    return needInstall;
  }


  function install(dependencies) {
    return new Promise(function(resolve, reject) {
      let options = {
        cwd: cwd
      }
      let dependenciesStr = dependencies.join(" ")
      let cmd = `cd ${cmd} && npm install ${dependenciesStr}--registry="https://registry.npm.taobao.org"`
      let install = cp.exec(cmd,
        options,
        function(err, stdout, stderr) {
          console.log('stdout: ' + stdout)
          console.log('stderr: ' + stderr)
          resolve({
            errcode: err === null && !stderr ? 0 : -1,
            errsmg: err === null && !stderr ? '安装包成功' : '安装包失败',
            data: {
              err: err,
              stdout: stdout,
              stderr: stderr
            }
          })
        })

      install.stdout.on('data', function(data) {
        console.log('install stdout: ' + data);
      });

      install.stderr.on('data', function(data) {
        console.log('install stderr: ' + data);
      });

      install.on('exit', function(code) {
        console.log('install process exited with code ' + code)
      });
    })
  }

  function reload() {
    return new Promise(function(resolve, reject) {
      let options = {
        cwd: cwd
      }

      let reload = cp.exec('pm2 reload 0', options, function(err, stdout, stderr) {
        console.log('stdout: ' + stdout)
        console.log('stderr: ' + stderr)
        resolve({
          errcode: err === null && !stderr ? 0 : -1,
          errsmg: err === null && !stderr ? 'ok' : 'fail',
          data: {
            err: err,
            stdout: stdout,
            stderr: stderr
          }
        })
      })

      reload.stdout.on('data', function(data) {
        console.log('data stdout: ' + data);
      });

      reload.stderr.on('data', function(data) {
        console.log('data stderr: ' + data);
      });

      reload.on('exit', function(code) {
        console.log('reload process exited with code ' + code)
      });
    });
  }


  return async function upgrade(ctx, next) {

    if (ctx.path === "/shoots/ping") {
      return ctx.body = {
        msg: 'ok'
      };
    }
    if (ctx.path === "/shoots/upgrade") {
      if (ctx.request.method === 'GET') {
        //显示文本框
        let view = path.join('..', '..', '.shoots', 'views', 'upgrade.ejs')
        await ctx.render(view)
        return
      }

      if (ctx.request.method == 'POST') {

        let username = ctx.request.body.name
        let pwd = ctx.request.body.pwd

        if (!username) {
          return ctx.body = {
            errcode: -1,
            errmsg: '用户名不能为空.'
          };
        }


        if (!pwd) {
          return ctx.body = {
            errcode: -1,
            errmsg: '密码不能为空.'
          };
        }


        if (!process.env.GIT_USER) {
          return ctx.body = {
            errcode: -1,
            errmsg: '没有设置升级帐号[GIT_USER]，不支持在线升级.'
          };
        }

        if (!process.env.GIT_PASSWORD) {
          return ctx.body = {
            errcode: -1,
            errmsg: '没有设置升级帐号[GIT_PASSWORD]，不支持在线升级.'
          };
        }


        let result = await getRemoteUrl()
        if (result.error) {
          console.error(error)
          console.error(error.stack)
          return ctx.body = error.stack
        }


        let auth = username.replace('@', '%40') + ':' + pwd
        let str = Url.parse(result.url).protocol + "//"
        let gitUrl = result.url.replace(str, str + auth + '@')
        console.log(gitUrl)

        let packageFile = path.join(cwd, 'package.json')
        let oldPackage = JSON.parse(fs.readFileSync(packageFile, 'utf8'))

        let error = await gitUpdate(gitUrl)

        if (error && error.errcode !== 0) {
          console.error(error)
          return ctx.body = error
        }

        let newPackage = JSON.parse(fs.readFileSync(packageFile, 'utf8'))

        let dependencies = getNeedInstallDependencies(oldPackage, newPackage)

        if (dependencies && dependencies.length > 0) {
          console.log("need to install or upgrade", dependencies)
          error = await install(dependencies)
          if (error && error.errcode !== 0) {
            console.error(error)
            return ctx.body = error
          }
        }


        ctx.body = {
          errcode: 0,
          errmsg: '正在重启，请不要刷新页面...'
        };
        setTimeout(async function() {
          console.log("reload");
          await reload();
        }, 3000);
      }
      return;
    }

    next();
  }

}
