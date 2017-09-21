var socket = require('socket.io');
var uuid = require('uuid');

var clients = [];
exports.wsSend = function(uuid,type,message,callback) {
    let isHavaId = false
    for (var i = 0; i < clients.length; i++) {
        if(uuid&&clients[i].id == uuid){
            clients[i].socket.emit(type, message);
            isHavaId = true
            break ;
        }else if(!uuid){
            isHavaId = true
            clients[i].socket.emit(type, message);
        }
    }
    if(isHavaId){
        callback(null)
    }else{
        callback("[webSocket] not found client id "+uuid)
    }
}
exports.create = function (port,messageBack) {
    var io = socket.listen(port);
    io.on('connection', function (socket) {
        var client_uuid = uuid.v4().replace(/-/g,"")
        console.log(client_uuid+" connect server")
        clients.push({ "id": client_uuid, "socket": socket, "username":null});
        var closeSocket = function() {
            console.log(client_uuid+" disconnect server")
            clients.forEach((c,i)=>{
                if (clients[i].id == client_uuid) {
                    clients.splice(i, 1);
                }
            })
        };
        socket.on('bind', function (username) {
            clients.forEach((c,i)=>{
                if (clients[i].id == client_uuid) {
                    clients[i].username = username
                }
            })
        });
        socket.on('message', function (data) {
            messageBack(client_uuid,"message",data)
        });
        //断开事件
        socket.on('disconnect', function(data) {
            closeSocket()
        })
    });
    console.log("[webSocket] Listening on port "+port)
}