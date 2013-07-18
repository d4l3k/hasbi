console.log('Hello from inside WebKit!');
var conn = new WebSocket('ws://localhost:38473');
var rubyQueue = [];
function execRuby(msg,callback){
    conn.send(msg);
    rubyQueue.push(callback);
}
conn.onopen = function (e) {
    //execRuby("Process::exit");
    execRuby("get_applications",function(msg){
        app_data = JSON.parse(msg);
        //$(".applications").get(0).innerText = json[1];
        //console.log(JSON.stringify(json[1]));
        $.each(app_data,function(index, item){
            console.log(JSON.stringify(item));

            $('<div class="tile bg-color-green icon"><div class="tile-content"><img src="images/Market128.png"/></div><div class="brand"><span class="name">'+item.Name+'</span><span class="badge">6</span></div></div>').appendTo('.tile-group')
        });
    });
}
conn.onerror = function(e) {
}
conn.onmessage = function(e) {
    func = rubyQueue.shift();
    func(e.data);
}
