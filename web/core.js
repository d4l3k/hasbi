console.log('Hello from inside WebKit!');
var conn = new WebSocket('ws://localhost:38473');
var rubyQueue = [];
function execRuby(msg,callback){
    conn.send(msg);
    rubyQueue.push(callback);
}
conn.onopen = function (e) {
    //execRuby("Process::exit");
    execRuby("puts 'marshmellow'",function(msg){
        console.log("Response!"); 
    });
}
conn.onerror = function(e) {
}
conn.onmessage = function(e) {
    func = rubyQueue.shift();
    func();
}
