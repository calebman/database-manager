var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');

//角色管理页面创建时需要的资源数据
function create(resultBack) {
    //获取所有的权限资源
    //所有任务
    var task = []
    task.push(function (callback) {
        var data = {
            roles:[],
            roleInfos:[]
        }
        execute((squel.select().from("t_resource")
                .field("tid","key")
                .field("resource_name","label")
                .field("resource_description","description")
                .field("disabled").toString()),
            function(err,vals){
                vals.forEach((value,index)=>{
                    if(value.disabled == 0){
                        value.disabled = false
                    }else value.disabled = true
                    vals.splice(index,1,value)
                })
                data.roles = vals
                callback(null,data)
        })
    })
    task.push(function (data,callback) {
        execute((squel.select().from("t_role")
                .field("tid","roleCode")
                .field("nick_name","nickName")
                .field("description")
                .where("nick_name != ?","超级管理员").toString()),
            function(err,vals){
                async.eachSeries(vals, function (val,callback) {
                    task2(val, function (roleInfo) {
                        data.roleInfos.push(roleInfo)
                        callback(null)
                    })
                },function (err) {
                    if (err) return callback(err);
                    callback(null,data)
                })
        })
    })
    
    function task2(val,roleInfoBack) {
        var children_task  = []
        children_task.push(function (callback) {
            var roleInfo = val
            execute("select resource_id from t_role_resource where role_id = " + roleInfo.roleCode,
                function(err,vals){
                    var resultVal = []
                    vals.forEach((value,index)=>{
                        resultVal.push(value.resource_id)
                    })
                    roleInfo.roles = resultVal
                    callback(null,roleInfo)
                })
        })
        children_task.push(function (data,callback) {
            execute("select count(tid) as 'count' from t_admin where role_id = " + data.roleCode,
                function(err,vals){
                    data.relevantUserCount = vals[0].count
                    callback(null,data)
                })
        })
        //子项流程控制
        async.waterfall(children_task, function (err, result) {
            if (err) return console.log("[error]\n"+err);
            roleInfoBack(result)
        })
    }
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) return console.log("[error]\n"+err);
        resultBack(webResult.createResult(200,"查询成功",result))
    })
}
//增加一个角色,回调一个主键值
function add(nickName,description,resultBack) {
    var task = []
    //判断是否有同名管理员
    task.push(function (callback) {
            execute(squel.select().from("t_role")
                    .where("nick_name = ?", nickName).toString(),
                function (err, vals) {
                    if (vals.length > 0) {
                        callback("此管理员名称已存在")
                    } else {
                        callback(null)
                    }
                })
        })
    task.push(function (callback) {
            execute(squel.insert().into("t_role")
                    .set("nick_name", nickName)
                    .set("description", description).toString(),
                function (err, vals) {
                    if(vals.affectedRows > 0){
                        callback(null, vals.insertId)
                    }else{
                        callback("添加管理员失败")
                    }
                })
        })
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,"添加管理员成功",result))
        }
    })
}
//删除一个角色
function del(roleCode,resultBack) {
    var task = []
    //将包含此角色的用户修改为未启用
    task.push(function (callback) {
        execute(squel.update().table("t_admin")
                .set("is_use",0)
                .where("role_id = ?",roleCode).toString(),
            function (err, vals) {
                callback(null)
            })
    })
    //将此角色拥有的资源删除
    task.push(function (callback) {
        execute(squel.delete().from("t_role_resource")
                .where("role_id = ?",roleCode).toString(),
            function (err, vals) {
                callback(null)
            })
    })
    //将此角色删除
    task.push(function (callback) {
        execute(squel.delete().from("t_role")
                .where("tid = ?",roleCode).toString(),
            function (err, vals) {
                if(vals.affectedRows > 0){
                    callback(null, "管理员删除成功")
                }else{
                    callback("管理员删除失败，管理员已经不存在")
                }
            })
    })
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,result))
        }
    })
};
//修改管理员的角色权限
function edit(roleCode,roles,resultBack) {
    //判断如果不是数组则转换转换为数组
    var task = []
    //将此角色拥有的资源删除
    task.push(function (callback) {
        execute(squel.delete().from("t_role_resource")
                .where("role_id = ?",roleCode).toString(),
            function (err, vals) {
                callback(null)
            })
    })
    if(roles.length > 0){
        //重新添加该角色的权限资源
        var insertRows = []
        roles.forEach((value,index)=>{
            insertRows.push({
                role_id:roleCode,
                resource_id:value
            })
        })
        task.push(function (callback) {
            execute(squel.insert().into("t_role_resource")
                    .setFieldsRows(insertRows).toString(),
                function (err, vals) {
                    if(vals.affectedRows == roles.length){
                        callback(null, "管理员权限修改成功")
                    }else{
                        callback("管理员权限修改失败")
                    }
                })
        })
    }
    //任务流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,result))
        }

    })
}

exports.create = create;
exports.add = add;
exports.del = del;
exports.edit = edit;