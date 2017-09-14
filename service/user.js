var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');
var crypto = require('../util/crypto')

//用户管理界面创建时所需信息
function create(username,resultBack) {
    var task = []
    task.push(function (callback) {
        var data = {
            roles:[],
            users:[]
        }
        execute((squel.select().from("t_admin")
                .field("t_admin.tid","userCode")
                .field("username")
                .field("realname")
                .field("is_use","isUse")
                .field("nick_name","nickName")
                .left_join("t_role",null,"role_id = t_role.tid")
                .where("username != ?",username)
                .order("t_admin.tid",false).toString()),
            function(err,vals){
                vals.forEach((value,index)=>{
                    if(value.isUse == 1){
                        value.isUse = true
                    }else value.isUse = false
                    vals.splice(index,1,value)
                })
                data.users = vals
                callback(null,data)
            })
    })
    task.push(function (data,callback) {
        execute((squel.select().from("t_role")
                .field("tid","roleCode")
                .field("nick_name","nickName")
                .field("description").toString()),
            function(err,vals){
                data.roles = vals
                callback(null,data)
            })
    })
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) return console.log("[error]\n"+err);
        resultBack(webResult.createResult(200,"构建成功",result))
    })
}
//添加一个用户
function add(username,realname,roleCode,resultBack) {
    var task = []
    //判断是否有此角色
    task.push(function (callback) {
        execute(squel.select().from("t_role")
                .where("tid = ?", roleCode).toString(),
            function (err, vals) {
                if (vals.length > 0) {
                    callback(null)
                } else {
                    callback("角色不存在")
                }
            })
    })
    task.push(function (callback) {
        execute((squel.insert().into("t_admin")
                .set("username",username)
                .set("password",crypto.cryptoFromSHA1("123456"))
                .set("role_id",roleCode)
                .set("is_use",0)
                .set("realname",realname)
                .toString()),
            function(err,vals){
                if(vals.affectedRows > 0){
                    callback(null, vals.insertId)
                }else{
                    callback("添加用户失败")
                }
                resultBack(vals)
            })
    })
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,"添加用户成功",result))
        }
    })
}

//删除一个用户
function del(userCode,resultBack) {
    execute(squel.delete().from("t_admin")
            .where("tid = ?", userCode).toString(),
        function (err, vals) {
            if (vals.affectedRows > 0) {
                resultBack(webResult.createResult(200,"删除用户成功"))
            } else {
                resultBack(webResult.createResult(100,"用户不存在"))
            }
        })
}

//修改用户的所属角色
function edit(userCode,roleCode,resultBack) {
    execute(squel.update().table("t_admin")
            .set("role_id",roleCode)
            .where("tid = ?", userCode).toString(),
        function (err, vals) {
            if (vals.affectedRows > 0) {
                resultBack(webResult.createResult(200,"用户所属角色修改成功"))
            } else {
                resultBack(webResult.createResult(100,"用户不存在"))
            }
        })
}

//启用用户
function enabled(userCode,resultBack) {
    execute(squel.update().table("t_admin")
            .set("is_use",1)
            .where("tid = ?", userCode).toString(),
        function (err, vals) {
            if (vals.affectedRows > 0) {
                resultBack(webResult.createResult(200,"启用成功"))
            } else {
                resultBack(webResult.createResult(100,"用户不存在"))
            }
        })
}

//禁用用户
function disabled(userCode,resultBack) {
    execute(squel.update().table("t_admin")
            .set("is_use",0)
            .where("tid = ?", userCode).toString(),
        function (err, vals) {
            if (vals.affectedRows > 0) {
                resultBack(webResult.createResult(200,"禁用成功"))
            } else {
                resultBack(webResult.createResult(100,"用户不存在"))
            }
        })
}
exports.create = create;
exports.add = add;
exports.del = del;
exports.edit = edit;
exports.enabled = enabled;
exports.disabled = disabled;