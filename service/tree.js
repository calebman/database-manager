var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');

//增减或者编辑树节点
function edit(isAdd,parentNode,node,callback) {
    if(isAdd){
        if(!parentNode.value){
            parentNode.value = 0
        }
        execute(squel.insert().into("t_table")
            .set("parent_code",parentNode.value)
            .set("name",node.label)
            .set("is_table",0).toString(),function (err,vals) {
            if(err)return callback(webResult.createResult(100,err))
            else callback(webResult.createResult(200,"添加树节点成功",{
                tid:vals.insertId
            }))
        })
    }else{
        execute(squel.update().table("t_table")
            .set("parent_code",parentNode.value==null?0:parentNode.value)
            .set("name",node.label)
            .set("is_table",0)
            .where("tid = ?",node.value).toString(),function (err,vals) {
            if(err)return callback(webResult.createResult(100,err))
            else callback(webResult.createResult(200,"修改树节点成功"))
        })
    }
}

//删除树节点
function del(node,callback) {
    execute(squel.delete().from("t_table")
        .where("tid = ?",node.value).toString(),function (err,vals) {
        if(err)return callback(webResult.createResult(100,err))
        else callback(webResult.createResult(200,"删除树节点成功"))
    })
}
exports.edit = edit;
exports.del = del;

