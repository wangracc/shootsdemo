module.exports = async function(params, ctx, next) {
    console.log(ctx.shoots);

    let res = await ctx.shoots.ajax("http://www.baidu.com")
    return ctx.succeed({
        params: params,
        res: res
    });
}
