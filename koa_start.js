const Koa    = require("koa");
const config = require("./config").static;
const app  = new Koa();

const static  = require("./koa/static");
const redis   = require("./koa/redis");
const session = require("./koa/session");
app.use(redis({
    host : "10.85.114.151",
    port : 6380
}));
app.use(async (ctx, next) => {
    console.log(await ctx.redis.incr("incr3"));
    await next();
});
app.use(session());
app.use(async (ctx, next) => {
    console.log(ctx.session.session_id());
    console.log(await ctx.session.set("name","zhangsan"));
    console.log(await ctx.session.all());
    await next();
});
app.use(static());
app.listen(config.port);
console.log('start');