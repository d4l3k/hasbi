var conn = new WebSocket('ws://localhost:38473');
var rubyQueue = [];
function execRuby(msg,callback){
    conn.send(msg);
    rubyQueue.push(callback);
}
function execProg(prog){
    execRuby('spawn("'+prog+'"); Process::exit',function(){});
}
conn.onopen = function (e) {
}
conn.onerror = function(e) {
}
conn.onmessage = function(e) {
    func = rubyQueue.shift();
    func(e.data);
}
