var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');

//获取所有表格数据
function create(resultBack) {
    var task = []
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
        var tableInfos = []
        async.eachSeries(tableNames, function (tableName,callback) {
            childrenTask(tableName, function (err,tableInfo) {
                if(err) return callback(err)
                else{
                    tableInfos.push(tableInfo)
                    callback(null)
                }
            })
        },function (err) {
            if (err) return callback(err);
            callback(null,tableInfos)
        })
    })
    function childrenTask(tableName,childrenBack) {
        var children_task  = []
        children_task.push(function (callback) {
            execute(squel.select().from("information_schema.columns")
                    .field("column_name","columnName")
                    .where("table_schema = ?","vue_dm_db")
                    .where("table_name = ?",tableName).toString(),function (err,vals) {
                var tableInfo = {}
                if(err) return callback(err)
                else {
                   var columnsData = []
                    vals.forEach((value,index)=>{
                       var columnName = value.columnName
                       if(columnName!="tid"){
                          var items = columnName.split("_")
                           columnsData.push({
                               type:items[0],
                               label:items[1],
                               prop:columnName
                           })
                       }
                    })
                    tableInfo.tableName = tableName
                    tableInfo.columnsData = []
                    async.eachSeries(columnsData, function (col,callback) {
                        col.items = []
                        col.inputItem = ""
                        col.selectItem = ""
                        if(col.type=="select"){
                            execute(squel.select().from("t_select")
                                .field("select_value","value")
                                .where("select_key = ?",tableName+"_"+col.label).toString(),
                                function (err,vals) {
                                    if(err) return callback(err)
                                    col.items = vals
                                    tableInfo.columnsData.push(col)
                                    callback(null)
                                })
                        }else{
                            tableInfo.columnsData.push(col)
                            callback(null)
                        }
                    },function (err) {
                        if (err) return callback(err);
                        tableInfo.columnsData = columnsData
                        callback(null,tableInfo)
                    })
                }
            })
        })
        children_task.push(function (tableInfo,callback) {
            execute("select count(tid) as 'count' from "+tableInfo.tableName,function (err,vals) {
                if(err) return callback(err)
                else {
                    tableInfo.tableDataCount = vals[0].count
                    callback(null,tableInfo)
                }
            })
        })
        //子项流程控制
        async.waterfall(children_task, function (err, result) {
            if (err) return childrenBack(err);
            childrenBack(null,result)
        })
    }
    async.waterfall(task, function (err, tableInfos) {
        if (err) return resultBack(webResult.createResult(100,err));
        resultBack(webResult.createResult(200,"请求表格数据成功",{
            tableInfos:tableInfos
        }))
    })
}

exports.create=create