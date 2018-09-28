const request = require('request');

module.exports = function(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) return reject(error);
      resolve(response);
    })
  });
};
