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
var schedule = require('./schedule/application')
var chartsModule = require('../service/charts')
var logger = require('./logger/application')
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//配置静态目录，vue-cli打包后的文件放置在这个目录
app.use(express.static('public'));
//引入seesion模块
app.use(session({
    secret: 'Back', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));
//引入权限管理模块
app.use(permission.filter)
//引入定时任务模块
schedule.create()
//引入websocket模块
webSocket.create(3983)
//定义http请求监听端口
var port = normalizePort(process.env.PORT || '3982');
app.set('port', port);
//首页重定向
app.get('/', function (req, res) {
    chartsModule.addAccess(function (err) {
        if(err){
            logger.error(err)
        }
    })
    res.redirect(302, '/index.html');
});
//中间件加载
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
//图表构建时需要的数据
app.use('/getCharsData',function(req, res){
    if(util.isEmptyObject(req.session.token)){
        webResult.createResponse(res,webResult.createResult(300,"请先登录"))
    }else{
        chartsModule.getChartsData(function (result) {
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
//日志目录加载
if (!fs.existsSync(path.join(__dirname, '../logs'))) {
    fs.mkdir(path.join(__dirname, '../logs'));
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

// 生成30万条测试数据保存到根目录下
// generatorData(300000,"generatorData.xlsx")
// function generatorData(count,fileName) {
//     var data = []
//     var header = ["文本列","数字列","时间列","选择列"]
//     data.push(header)
//     for(var i=0;i<count;i++){
//         var row = []
//         row.push("text"+i)
//         row.push(i)
//         row.push("2017-09-05 10:26:44")
//         row.push("苹果")
//         data.push(row)
//     }
//     var buffer = require('node-xlsx').build([{name:"sheet", data:data}]);
//     var fileDir = 'excel/'+util.getTime("YYYYMMDD")
//     var targetDir = path.join( 'public/'+ fileDir);
//     if (!fs.existsSync(targetDir)) {
//         fs.mkdir(targetDir);
//     }
//     fs.writeFileSync(targetDir+"/"+fileName,buffer,'binary');
// }
module.exports = app

