const Koa    = require("koa");
const path   = require("path");
const config = require("./config");
const app  = new Koa();

const fs  = require("./utils/static");

app.use(async (ctx, next) => {
    "use strict";
    let uri  = decodeURI(ctx.url);
    try {
        var fc = await fs.get(ctx);
    }
    catch (e){
        console.log(e);
        ctx.statusCode = e.code || 404;
        ctx.body = `${e.uri} Not Found(${e.code})`;
        return;
    }
    if (Array.isArray(fc)){
        ctx.body = fc.map(val => {
            return "<p><a href='"+ path.join(uri, val) + "'>" + val + "</a></p>";
        }).join("\n");
    }
    else{
        ctx.body = fc;
    }
});

app.listen(config.port);
console.log('start');