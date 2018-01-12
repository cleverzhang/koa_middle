/**
 * 静态文件处理
 */
var fs      = require("fs");
var path    = require("path");
var mime    = require("mime");
var config  = require("../config").static;
function getFileContent(file){
    "use strict";
    return new Promise((resolve, reject) => {
        fs.readFile(file, (error, buffer) => {
            if (error){
                reject(error);
            }
            else{
                resolve(buffer);
            }
        });
    });
}
function getDirList(path){
    "use strict";
    return new Promise((resolve, reject) => {
        fs.readdir(path, (error, files) => {
            if (error){
                reject(error);
            }
            else{
                resolve(files);
            }
        });
    });
}
function getStat(path){
    "use strict";
    return new Promise((resolve, reject) => {
        fs.stat(path, (error, stat) => {
            if (error){
                reject(error);
            }
            else{
                resolve(stat);
            }
        });
    });
}
async function get(ctx){
    "use strict";
    let uri  = decodeURI(ctx.url);
    let file = path.join(config.root, uri)
    try{
        var state = await getStat(file);
    }
    catch (e){
        throw {code:404, uri:uri};
    }
    if (state.isDirectory()){
        let def_file = file;
        if (config.default){
            def_file = path.join(file, config.default);
        }
        try{
            let def_stat = await getStat(def_file);
            if (def_stat.isFile()){
                ctx.type = getType(def_file);
                return await getFileContent(def_file);
            }
            throw {code:404, uri:uri};
        }
        catch (e){
            if (config.autoindex){
                ctx.type = 'text/html';
                return await getDirList(file);
            }
            throw {code:403, uri:uri};
        }
    }
    else{
        ctx.type = getType(file);
        return await getFileContent(file);
    }

}
function getType(file_path){
    return mime.getType(file_path) || 'text/plain';
}


module.exports = function(){
    return async (ctx, next) => {
        "use strict";
        let uri  = decodeURI(ctx.url);
        try {
            var fc = await get(ctx);
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
        next();
    }
};