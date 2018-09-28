const getRawBody = require('raw-body')

module.exports = function(options, ctx) {
  let config = options || {
    limit: "1mb"
  }
  return getRawBody(ctx.req, {
    length: ctx.length,
    limit: config.limit || '1mb',
    encoding: ctx.charset
  });
}
