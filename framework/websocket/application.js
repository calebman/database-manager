var socket = require('socket.io');
var uuid = require('uuid');

exports.wsSendAll = function (type,message) {
    var clients = global.clients
    clients.forEach((client,i)=>{
        client.socket.emit(type, message);
    })
}
exports.wsSendFromId = function(uuid,type,message,callback) {
    var clients = global.clients
    let isHavaId = false
    if(!uuid){
        this.wsSendAll(type,message)
    }else{
        for (var i = 0; i < clients.length; i++) {
            if(clients[i].id == uuid){
                clients[i].socket.emit(type, message);
                isHavaId = true
                break ;
            }
        }
    }
    if(isHavaId){
        if(callback){
            callback(null)
        }
    }else{
        if(callback){
            callback("[webSocket] not found client id %s",uuid)
        }
    }
}
exports.wsSendFromUsername = function (username,type,message,callback) {
    var clients = global.clients
    let uuid = false
    for (var i = 0; i < clients.length; i++) {
        if(clients[i].username == username){
            uuid = clients[i].id
            break ;
        }
    }
    if(uuid){
        this.wsSendFromId(uuid,type,message,callback)
    }else{
        this.wsSendAll("bind")
        if(callback){
            callback("[webSocket] username %s not bind",username)
        }
    }
}
exports.create = function (port,messageBack) {
    if(!global.clients){
        global.clients = []
    }
    var clients = global.clients
    var io = socket.listen(port);
    io.on('connection', function (socket) {
        var client_uuid = uuid.v4().replace(/-/g,"")
        console.log(client_uuid+" connect server")
        var client = { "id": client_uuid, "socket": socket, "username":null}
        clients.push(client);
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
                    console.log("[webSocket] %s bind %s",client_uuid,username)
                }
            })
        });
        socket.on('message', function (data) {
            if(messageBack&&typeof messageBack == "function"){
                messageBack(client,"message",data)
            }
        });
        //断开事件
        socket.on('disconnect', function(data) {
            closeSocket()
        })
    });
    console.log("[webSocket] Listening on port "+port)
}