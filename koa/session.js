var def_opt  = require("../config").session;
var get_session_id = function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}
module.exports = () => {
    "use strict";
    return async (ctx, next) => {
        if (!ctx["redis"]){
            throw new Error("ctx.redis not found!!")
        }
        let session_id = ctx.cookies.get(def_opt.key);
        if (!session_id){
            session_id = get_session_id();
            ctx.cookies.set(def_opt.key, session_id);
        }

        ctx.session = {
            async set(name, value){
                await ctx.redis.hset(session_id, name, value);
                return true;
            },
            async get(name){
                return await ctx.redis.hget(session_id, name);
            },
            async all(){
                return await ctx.redis.hgetall(session_id);
            },
            async del(name){
                return await ctx.redis.hdel(session_id, name);
            },
            async destory(){
                await ctx.redis.expire(session_id, 0);
                ctx.cookies.set(def_opt.key, '');
                return true;
            },
            session_id(){
                return session_id;
            }
        }
        await ctx.session.set("last", Date().toLocaleString());
        await ctx.redis.expire(session_id, def_opt.expire);
        await next();
    }
}