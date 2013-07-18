# Set process name
$0 = "hasbi"

require 'bundler'
Bundler.require

# Setup window
GirFFI.setup :WebKit, '3.0'
Gtk.init
win = Gtk::Window.new :toplevel
screen = win.get_screen
#alphamap = screen.get_rgba_colormap()
#Gtk::Widget.set_default_colormap alphamap
#win.set_colormap(alphamap)
win.set_type_hint(6)
#win.set_type_hint(2)
scr = Gtk::ScrolledWindow.new nil, nil
wv = WebKit::WebView.new
#wv.pry
#wv.set_transparent true
win.add scr
scr.add wv

win.set_default_geometry 1920,1080
#win.move(0,0)
#win.set_keep_above true
#win.stick
win.show_all
wv.open("file://#{File.absolute_path('./web/index.html')}")
GObject.signal_connect(win, "destroy") { Gtk.main_quit }
$app_info = []
def get_applications
    $app_info = []
    Dir.glob('/usr/share/applications/*.desktop').each do |app|
        if File.file? app
            text = File.open(app).read
            data = {}
            icon_theme = Gtk::IconTheme.get_default
            lines = text.split("\n")
            lines.each do |line|
                bits = line.split("=")
                if bits.length>1
                    if bits[0]=="Name" or bits[0]=="Exec" or bits[0]=="Comment"
                        data[bits[0]]=bits[1]
                    elsif bits[0]=="Icon"
                        if bits[1][0]=='/'
                            data[bits[0]]=bits[1]
                        else
                            icon_name = bits[1].split('.')[0]
                            if icon_theme.has_icon icon_name
                                data[bits[0]]= icon_theme.lookup_icon(icon_name,64,0).get_filename.read_string
                            elsif icon_theme.has_icon bits[1]
                                data[bits[0]]= icon_theme.lookup_icon(bits[1],64,0).get_filename.read_string
                            else
                                puts "[ERROR::NO_ICON] #{icon_name}, #{bits[1]}"
                            end

                            #data[bits[0]]=`find {/usr/share/icons,/usr/share/pixmaps} -iname "#{bits[1]}"`.strip
                        end
                    end
                end
            end
            $app_info << data
        end
    end
end
def app_data
    $app_info
end
get_applications

def get_name_bits
    full = GLib.get_real_name
    bits = full.split ' '
    first = bits[0]
    last = bits[1..-1].join ' '
    return [first,last]
end

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
