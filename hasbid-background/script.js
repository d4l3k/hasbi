var gui = require('nw.gui');
var cv = require('opencv')
gui.Window.get().show();



cascades = [
//    "node_modules/opencv/data/haarcascade_frontalface_default.xml",
    "node_modules/opencv/data/haarcascade_frontalface_alt.xml"
//    "node_modules/opencv/data/haarcascade_frontalface_alt2.xml"
//    "node_modules/opencv/data/haarcascade_eye_tree_eyeglasses.xml"
//    "node_modules/opencv/data/haarcascade_mouth.xml"
];

camera = new cv.VideoCapture(-1);
detectFaces = function(){
    camera.read(function(err,image){
        a = image;
        var index = 0;
        var callback = function(success){
            if(!success && index<cascades.length){
                detectFace(cascades[index],image,callback);
                index++;
            } else {
                setTimeout(detectFaces,1000.0/30);
            }
        }
        callback(false);
    });
}
detectFaces();
detectFace = function(cascade, image, callback){
    image.detectObject(cv.FACE_CASCADE,{},function(err, faces){
        
        if(faces.length>0){
            var face = faces[0];
            //var div = document.body.children[0];
            image_y = (window.innerHeight - $("img").height())/2;
            image_x = (window.innerWidth - $("img").width())/2;
            var y = (240-(face.y+face.height/2))/10.0 + image_y;
            var x = -(320-(face.x+face.width/2))/10.0 + image_x;

            $("img").animate({top: y, left: x},100);
            //div.style.top = y+"px";
            //div.style.left = x+"px"
        }
        callback(faces.length>0);
    });
}
