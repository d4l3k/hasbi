console.log('Hello from inside WebKit!');
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
    //execRuby("Process::exit");
    execRuby("app_data",function(msg){
        app_data = JSON.parse(msg);
        //$(".applications").get(0).innerText = json[1];
        //console.log(JSON.stringify(json[1]));
        $.each(app_data,function(index, item){
            //console.log(JSON.stringify(item));
            var tile_group = $('.tile-group').eq(Math.floor(index / 25.0));
            if(tile_group.length == 0){
                tile_group = $('<div class="tile-group tile-drag"></div>').appendTo('.page-region-content');
            }
            $('<div class="tile icon" onClick="execProg(\''+item.Exec+'\')"><div class="tile-content"><img src="'+item.Icon+'"/></div><div class="brand"><span class="name">'+item.Name+'</span></div></div>').appendTo(tile_group);
        });
        $(function(){
            $.StartMenu();
        });
        $(document).resize();
    });
    execRuby("get_name_bits",function(name){
        bits = JSON.parse(name);
        $(".first-name").text(bits[0]);
        $(".last-name").text(bits[1]);
    });
    execRuby("Gtk::IconTheme.get_default.lookup_icon('stock_person', 64, 1).get_filename.read_string",function(name){
        bits = JSON.parse(name);
        $(".avatar img").attr("src",bits);
    });
}
conn.onerror = function(e) {
}
conn.onmessage = function(e) {
    func = rubyQueue.shift();
    func(e.data);
}
