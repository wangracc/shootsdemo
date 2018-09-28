const Soap = require('soap');

module.exports = function(params, options) {
  return new Promise(function(resolve, reject) {
    let opts = options || {};
    let type = params.type || 'json';
    Soap.createClient(params.url, opts, function(error, client) {
      if (error) return reject(error);
      client[params.fun].call(null, params.args, function(err, result) {
        if (error) return reject(error);
        type === 'json' ? resolve(result) : resolve(client.lastResponse);
      });
    });
  });
}
