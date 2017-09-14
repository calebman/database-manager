var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var session = require('express-session');
var admin = require('../service/admin')
var webResult = require('../util/webResult')
var util = require('../util/util')
var path = require('path')
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//配置静态目录，vue-cli打包后的文件放置在这个目录
app.use(express.static('public'));
app.use(session({
    secret: 'Back', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));

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
            req.session.token={
                username:data.username,
                password:data.password
            }
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
            req.session.token.roleCode = result.data.loginInfo.roleCode
            webResult.createResponse(res,result)
        })
    }
});
//HTTP请求拦截器，权限验证
app.use('/admin', function(req, res, next){
    if(util.isEmptyObject(req.session.token)){
        webResult.createResponse(res,webResult.createResult(300,"请先登录"))
    }else{
        admin.permissionMatch(req.session.token.username,req.session.token.roleCode,"admin"+req.url,function (result) {
            if(result.code == 200){
                next()
            }else{
                webResult.createResponse(res,result)
            }
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

