const Koa    = require("koa");
const path   = require("path");
const config = require("./config");
const app  = new Koa();

const static  = require("./utils/static");

app.use(static());

app.listen(config.port);
console.log('start');