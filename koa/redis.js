const Redis  = require("redis");
var def_opt  = require("../config").redis;
module.exports = (options) => {
    "use strict";
    options.host = options.host || def_opt.host;
    options.port = options.port || def_opt.port;
    var connect_redis = () => {
        return new Promise((resolve, reject) => {
            var client = Redis.createClient(options.port, options.host);
            client.on("ready",()=>{
                resolve(client);
            });
            client.on("error", (err) => {
                reject(err);
            });
        });
    }

    return async (ctx, next) => {
        var redis_server = await connect_redis();
        ctx.redis = new Proxy({},{
            get(target, prop){
                if (prop in target){
                    return target[prop];
                }
                let func = function () {
                    var arg = arguments;
                    return new Promise((resolve, reject) => {
                        try{
                            redis_server[prop](...arg, (err, reply) => {
                                if (err){
                                    reject(err);
                                }
                                else{
                                    resolve(reply);
                                }
                            });
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                };
                return target[prop] = func;
            }
        });
        await next();
    }
}