# Set process name
$0 = "hasbi"

require 'bundler'
Bundler.require

# Setup window
GirFFI.setup :WebKit, '1.0'
Gtk.init
win = Gtk::Window.new :toplevel
screen = win.get_screen
alphamap = screen.get_rgba_colormap()
Gtk::Widget.set_default_colormap alphamap
win.set_colormap(alphamap)
win.set_type_hint(6)
#win.set_type_hint(2)
wv = WebKit::WebView.new
wv.set_transparent true
win.add wv
wv.open("file://#{File.absolute_path('./web/index.html')}")
win.resize(1920,1080)
#win.move(0,0)
#win.set_keep_above true
win.stick
win.show_all
GObject.signal_connect(win, "destroy") { Gtk.main_quit }

EM::run do
    give_tick = proc { Gtk::main_iteration; EM.next_tick(give_tick);}
    give_tick.call
    # Start Websocket
    EM::WebSocket.start(:host => "0.0.0.0", :port => 38473) do |ws|
        ws.onopen { |handshake|
            puts "WebSocket connection open"

            # Access properties on the EM::WebSocket::Handshake object, e.g.
            # path, query_string, origin, headers
        }
        ws.onclose { puts "Connection closed" }
        ws.onmessage { |msg|
            puts "Recieved command: #{msg}"
            ws.send(MultiJson.dump(eval(msg)))
        }
    end
end
