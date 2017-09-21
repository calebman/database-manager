var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var session = require('express-session');
var admin = require('../service/admin')
var webResult = require('../util/webResult')
var util = require('../util/util')
var path = require('path')
var permission = require('./permission')
var webSocket = require('./websocket/application')
var app = express();

webSocket.create(3983,function (id,event,message) {
    let count = 0
    console.log("[webSocket] message "+message)
    var task =  setInterval(function() {
        webSocket.wsSend(id,"message",count++,function (err) {
            if(err) {
                clearInterval(task)
            }
            if(count > 100){
                count = 0
                clearInterval(task)
            }
        })
    }, 330)
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//配置静态目录，vue-cli打包后的文件放置在这个目录
app.use(express.static('public'));
app.use(session({
    secret: 'Back', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));
app.use(permission.filter)

var port = normalizePort(process.env.PORT || '3982');
app.set('port', port);
//首页重定向
app.get('/', function (req, res) {
    res.redirect(302, '/index.html');
});
//登录验证
app.use('/login', function(req, res, next){
    var data = JSON.parse(req.param("data"))
    admin.login(data.username,data.password,function (result) {
        if(result.code == 200){
            permission.login(req.session,{
                username:data.username,
                password:data.password
            })
        }
        webResult.createResponse(res,result)
    })
});
//注销
app.use('/logout', function(req, res, next){
    req.session.token = {}
    webResult.createResponse(res,webResult.createResult(200,"注销成功"))
});
//用户修改密码
app.use('/update', function(req, res, next){
    if(util.isEmptyObject(req.session.token)){
        webResult.createResponse(res,webResult.createResult(300,"请先登录"))
    }else{
        var data = JSON.parse(req.params.data)
        admin.update(req.session.token.username,data.newpassword,function (result) {
            webResult.createResponse(res,result)
        })
    }
});
//系统构建时需要的数据
app.use('/create', function(req, res){
    if(util.isEmptyObject(req.session.token)){
        webResult.createResponse(res,webResult.createResult(300,"请先登录"))
    }else{
        admin.create(req.session.token.username,function (result) {
            webResult.createResponse(res,result)
        })
    }
});

// 路由加载
var files = fs.readdirSync('./routes');
files.forEach((val,index)=>{
    var router = require('../routes/' + val);
    app.use('/admin', router);
});
//数据目录加载
if (!fs.existsSync(path.join(__dirname, '../public/upload/tmp'))) {
    fs.mkdir(path.join(__dirname, '../public/upload/tmp'));
}
if (!fs.existsSync(path.join(__dirname, '../public/excel/tmp'))) {
    fs.mkdir(path.join(__dirname, '../public/upload/tmp'));
}

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

module.exports = app

