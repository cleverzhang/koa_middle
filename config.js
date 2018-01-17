let static = {
    port       : "8080",
    root       : "./",
    default    : "index.html",
    autoindex  : true
}
let redis = {
    host : "127.0.0.1",
    port : "7379"
};

let session = {
   key    : "SESSION_ID",
   expire : "1800"
};
module.exports = {static, redis, session};