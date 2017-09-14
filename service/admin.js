var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');
var util = require('../util/util');
var crypto = require('../util/crypto')

//用户登录
function login(username,password,resultBack) {
    //登录判断
    execute((squel.select().from("t_admin")
            .where("username = ?",username)
            .where("is_use = 1").toString()),
        function(err,vals){
            if(vals.length > 0){
                if(vals[0].password == crypto.cryptoFromSHA1(password)){
                    resultBack(webResult.createResult(200,"登陆成功"))
                }else{
                    resultBack(webResult.createResult(300,"登录密码错误"))
                }
            }else{
                resultBack(webResult.createResult(300,"用户不存在或者未启用"))
            }
        })
}
//用户修改密码
function update(username,newpassword,resultBack) {
    //登录判断
    execute((squel.update().table("t_admin")
            .set("password",crypto.cryptoFromSHA1(newpassword))
            .where("username = ?",username).toString()),
        function(err,vals){
            if(vals.affectedRows > 0){
                resultBack(webResult.createResult(200,"密码修改成功"))
            }else{
                resultBack(webResult.createResult(300,"用户不存在"))
            }
        })
}
//主界面构建时需要数据
function create(username,resultBack) {
    var task = []
    task.push(function (callback) {
        var data = {
            loginInfo:{},
            tableTree:[]
        }
        execute((squel.select().from("t_admin")
                .field("username")
                .field("realname")
                .field("nick_name","nickName")
                .field("role_id","roleCode")
                .left_join("t_role",null,"role_id = t_role.tid")
                .where("username = ?",username)
                .where("is_use = 1")
                .order("role_id",false).toString()),
            function(err,vals){
                if(vals.length > 0){
                    data.loginInfo = vals[0]
                    data.loginInfo.token = true
                    callback(null,data)
                }else{
                    callback("用户未被启用")
                }
            })
    })
    task.push(function (data,callback) {
        execute(squel.select().from("t_table")
            .field("tid","selfCode")
            .field("parent_code","parentCode")
            .field("name").toString(),
            function (err,vals) {
                data.tableTree = util.getTree(vals,0)
                callback(null,data)
        })
    })

    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(300,err))
        }else{
            resultBack(webResult.createResult(200,"构建成功",result))
        }
    })
}
//用户权限判断
function permissionMatch(username,roleCode,requestUrl,resultBack) {
    var task = []
    //查询该用户的用户状态
    task.push(function (callback) {
        execute((squel.select().from("t_admin")
                .field("is_use","isUse")
                .where("username = ?",username).toString()),
            function(err,vals){
                if(vals.length > 0){
                    if(vals[0].isUse == 0){
                        callback("发起请求的用户被禁用")
                    }else{
                        callback(null)
                    }
                }else{
                    callback("发起请求的用户不存在")
                }
            })
    })
    //查询该用户的所有权限资源
    task.push(function (callback) {
        execute((squel.select().from("t_role_resource")
                .field("permission_url","permissionUrl")
                .left_join("t_resource",null,"resource_id = t_resource.tid")
                .where("role_id = ?",roleCode).toString()),
            function(err,vals){
                if(vals.length > 0){
                    callback(null,vals)
                }else{
                    callback("权限不足，请联系管理员")
                }
            })
    })
    //构建该用户的菜单列表
    task.push(function (userRoles,callback) {
        //对请求的URL进行验证
        let isValidateSuccess = false
        let requsetRoles = []
        requsetRoles.push(requestUrl+"/*")
        while(requestUrl.lastIndexOf("/") > -1){
            requestUrl = requestUrl.substr(0,requestUrl.lastIndexOf("/"))
            requsetRoles.splice(0,0,requestUrl+"/*")
        }
        requsetRoles.forEach((requsetRole,index)=>{
            userRoles.forEach((value,index)=>{
                if(requsetRole == value.permissionUrl){
                    isValidateSuccess = true
                }
            })
        })
        if(isValidateSuccess){
            callback(null,"有权访问")
        }else{
            callback("权限不足，请联系管理员")
        }
    })
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(400,err))
        }else{
            resultBack(webResult.createResult(200,result))
        }
    })
}

exports.login = login;
exports.update = update;
exports.create = create;
exports.permissionMatch = permissionMatch;