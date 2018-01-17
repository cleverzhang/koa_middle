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
        ctx.redis = new Proxy({},{
            get(target, prop){
                return function () {
                    var arg = arguments;
                    return new Promise((resolve, reject) => {
                        connect_redis().then((redis_server)=>{
                            redis_server[prop](...arg, (err, reply) => {
                                if (err){
                                    reject(err);
                                }
                                else{
                                    resolve(reply);
                                }
                                redis_server.quit();
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    });
                };
            }
        });
        await next();
    }
}