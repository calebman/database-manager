var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var util = require('../util/util')
var webResult = require('../util/webResult');

//增加一个访问量
function addAccess(resultBack) {
    var task =[]
    task.push(function (callback) {
        execute(squel.select().from("t_access")
            .field("tid")
            .field("access_count","accessCount")
            .field("access_date","accessDate")
            .where("access_date = ?",util.getTime("YYYY-MM-DD")).toString(),
            function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    if(vals.length > 0){
                        callback(null,vals[0])
                    }else{
                        callback(null,null)
                    }
                }
            })
    })
    task.push(function (access,callback) {
        if(access){
            access.accessCount ++
            execute(squel.update().table("t_access")
                    .set("access_count",access.accessCount)
                    .where("tid = ?",access.tid).toString(),
                function (err,vals) {
                    if(err){
                        callback(err)
                    }else callback(null)
                })
        }else{
            access = {
                accessCount:0,
                access_date:util.getTime("YYYY-MM-DD")
            }
            execute(squel.insert().into("t_access")
                    .set("access_count",access.accessCount)
                    .set("access_date",access.access_date).toString(),
                function (err,vals) {
                    if(err){
                        callback(err)
                    }else callback(null)
                })
        }
    })
    //流程控制
    async.waterfall(task, function (err) {
        if (err) {
            resultBack(err)
        }else{
            resultBack(null)
        }
    })
}

//获取表格所有数据并存入数据库
function addDataCount(resultBack) {
    var task = []
    //获取所有表格名称
    task.push(function (callback) {
        execute(squel.select().from("information_schema.tables")
                .field("table_name","tableName")
                .where("table_schema = ?","vue_dm_db")
                .where("table_type = ?","base table").toString(),
            function (err,vals) {
                if(err) return callback(err)
                else {
                    var tableNames = []
                    vals.forEach((value,index)=>{
                        var tableName = value.tableName
                        if(tableName.substr(0,2)!="t_"){
                            tableNames.push(tableName)
                        }
                    })
                    callback(null,tableNames)
                }
            })
    })
    task.push(function (tableNames,callback) {
        var dataCount = 0
        async.eachSeries(tableNames, function (tableName,callback) {
            execute("select count(tid) as 'count' from "+tableName,function (err,vals) {
                if(err) return callback(err)
                else {
                    dataCount += vals[0].count
                    callback(null)
                }
            })
        },function (err) {
            if (err) return callback(err);
            callback(null,dataCount)
        })
    })
    task.push(function (dataCount,callback) {
        execute(squel.select().from("t_data_count")
                .field("tid")
                .field("data_count","dataCount")
                .field("date")
                .where("date = ?",util.getTime("YYYY-MM-DD")).toString(),
            function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    if(vals.length > 0){
                        var val = vals[0]
                        val.dataCount = dataCount
                        callback(null,val,val.dataCount)
                    }else{
                        callback(null,null,dataCount)
                    }
                }
            })
    })
    task.push(function (val,dataCount,callback) {
        if(val){
            execute(squel.update().table("t_data_count")
                    .set("data_count",val.dataCount)
                    .where("tid = ?",val.tid).toString(),
                function (err,vals) {
                    if(err){
                        callback(err)
                    }else callback(null)
                })
        }else{
            var insertData = {
                dataCount:dataCount,
                date:util.getTime("YYYY-MM-DD")
            }
            execute(squel.insert().into("t_data_count")
                    .set("data_count",insertData.dataCount)
                    .set("date",insertData.date).toString(),
                function (err,vals) {
                    if(err){
                        callback(err)
                    }else callback(null)
                })
        }
    })
    //流程控制
    async.waterfall(task, function (err) {
        if (err) {
            resultBack(err)
        }else{
            resultBack(null)
        }
    })
}
//获取图表数据源
function getChartsData(resultBack) {
    var task = []
    task.push(function (callback) {
        execute(squel.select().from("t_access")
                .field("access_count","accessCount")
                .field("access_date","accessDate")
                .toString()
        ,function (err,vals) {
            if(err){
                callback(err)
            }else{
                var accessList = []
                vals.forEach((v,i)=>{
                    var access = []
                    access.push(v.accessDate)
                    access.push(v.accessCount)
                    accessList.push(access)
                })
                callback(null,accessList)
            }
        })
    })
    task.push(function (accessList,callback) {
        execute(squel.select().from("t_data_count")
                .field("data_count","dataCount")
                .field("date")
                .toString()
            ,function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    var dataList = []
                    vals.forEach((v,i)=>{
                        var data = []
                        data.push(v.date)
                        data.push(v.dataCount)
                        dataList.push(data)
                    })
                    callback(null,{
                        accessList:accessList,
                        dataList:dataList
                    })
                }
            })
    })
    //流程控制
    async.waterfall(task, function (err,result) {
        if (err) {
            resultBack(webResult.createResult(100,"数据获取失败"))
        }else{
            resultBack(webResult.createResult(200,"数据获取成功",result))
        }
    })
}

exports.addAccess = addAccess;
exports.addDataCount = addDataCount;
exports.getChartsData = getChartsData;