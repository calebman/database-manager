var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var webResult = require('../util/webResult');
var util = require('../util/util');
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
        //获取数据条数
        children_task.push(function (tableInfo,callback) {
            execute("select count(tid) as 'count' from "+tableInfo.tableName,function (err,vals) {
                if(err) return callback(err)
                else {
                    tableInfo.tableDataCount = vals[0].count
                    callback(null,tableInfo)
                }
            })
        })
        //获取表格位置
        children_task.push(function (tableInfo,callback) {
            execute(squel.select().from("t_table")
                .field("parent_code","parentCode")
                .where("name = ?",tableInfo.tableName)
                .toString(),function (err,vals) {
                if(err) return callback(err)
                else {
                    var position = []
                    position.push(vals[0].parentCode)
                    tableInfo.position = position
                    callback(null,tableInfo)
                }
            })
        })
        //递归组装position
        children_task.push(function (tableInfo,callback) {
            execute(squel.select().from("t_table")
                .field("tid","selfCode")
                .field("parent_code","parentCode")
                .toString(),function (err,vals) {
                if(err) return callback(err)
                else {
                    util.getPosition(vals,tableInfo.position)
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

//编辑表格
function edit(roleCode,tableName,updateOpts,isAdd,resultBack) {
    //定义所有任务
    var task = []
    if(isAdd){
        //校验表格是否已经存在
        task.push(function (callback) {
            execute(squel.select().from("t_table")
                .where("name = ?",tableName).toString(),function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    if(vals.length > 0){
                        callback("表格已存在")
                    }else{
                        callback(null)
                    }
                }
            })
        })
        //构建建表语句并执行
        task.push(function (callback) {
            var items = []
            var addPosition = []
            var sql = "create table `"+tableName+"` ( " +
                "`tid` int(11) NOT NULL AUTO_INCREMENT,"
            updateOpts.forEach((upt,i)=>{
                var addSql = ""
                switch (upt.opt){
                    case "add":
                        var col = upt.col
                        switch (col.type){
                            case "text":
                                addSql="`text_"+col.label+"` varchar(255) DEFAULT NULL,"
                                break
                            case "number":
                                addSql="`number_"+col.label+"` int(11) DEFAULT NULL,"
                                break
                            case "date":
                                addSql="`date_"+col.label+"` datetime DEFAULT NULL,"
                                break
                            case "select":
                                addSql="`select_"+col.label+"` varchar(255) DEFAULT NULL,"
                                col.items.forEach((v,i)=>{
                                    items.push({
                                        select_key:tableName+"_"+col.label,
                                        select_value:v.value
                                    })
                                })
                                break
                            case "img":
                                addSql="`img_"+col.label+"` text,"
                                break
                        }
                        break
                    case "addPosition":
                        addPosition.push({
                            parent_code:upt.position[upt.position.length-1],
                            name:tableName,
                            is_table:1
                        })
                        break
                }
                sql+=addSql
            })
            sql+="PRIMARY KEY (`tid`)) DEFAULT CHARSET=utf8"
            execute(sql,function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    callback(null,items,addPosition)
                }
            })
        })
        //选择项插入
        task.push(function (items,addPosition,callback) {
            if(items.length>0){
                execute(squel.insert().into("t_select")
                    .setFieldsRows(items).toString(),function (err,vals) {
                    if(err){
                        callback(err)
                    }else{
                        callback(null,addPosition)
                    }
                })
            }else{
                callback(null,addPosition)
            }
        })
        //设定表格位置
        task.push(function (addPosition,callback) {
            execute(squel.insert().into("t_table")
                .setFieldsRows(addPosition).toString(),function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    callback(null,vals.insertId)
                }
            })
        })
        //构建权限项
        task.push(function (tableId,callback) {
            var addPermission = []
            addPermission.push(function (back) {
                var permissionId = []
                execute(squel.insert().into("t_resource")
                    .set("resource_name",tableName+"-查看")
                    .set("resource_description","查看"+tableName+"数据")
                    .set("permission_url","admin/data/table/"+tableName+"/create/*")
                    .set("disabled",0)
                    .toString(),function (err,vals) {
                    if(err){
                        back(err)
                    }else{
                        permissionId.push({
                            role_id:roleCode,
                            resource_id:vals.insertId
                        })
                        back(null,permissionId)
                    }
                })
            })
            addPermission.push(function (permissionId,back) {
                execute(squel.insert().into("t_resource")
                    .set("resource_name",tableName+"-添加")
                    .set("resource_description","添加"+tableName+"数据")
                    .set("permission_url","admin/data/table/"+tableName+"/add/*")
                    .set("disabled",0)
                    .toString(),function (err,vals) {
                    if(err){
                        back(err)
                    }else{
                        permissionId.push({
                            role_id:roleCode,
                            resource_id:vals.insertId
                        })
                        back(null,permissionId)
                    }
                })
            })
            addPermission.push(function (permissionId,back) {
                execute(squel.insert().into("t_resource")
                    .set("resource_name",tableName+"-编辑")
                    .set("resource_description","编辑"+tableName+"数据")
                    .set("permission_url","admin/data/table/"+tableName+"/edit/*")
                    .set("disabled",0)
                    .toString(),function (err,vals) {
                    if(err){
                        back(err)
                    }else{
                        permissionId.push({
                            role_id:roleCode,
                            resource_id:vals.insertId
                        })
                        back(null,permissionId)
                    }
                })
            })
            addPermission.push(function (permissionId,back) {
                execute(squel.insert().into("t_resource")
                    .set("resource_name",tableName+"-删除")
                    .set("resource_description","删除"+tableName+"数据")
                    .set("permission_url","admin/data/table/"+tableName+"/del/*")
                    .set("disabled",0)
                    .toString(),function (err,vals) {
                    if(err){
                        back(err)
                    }else{
                        permissionId.push({
                            role_id:roleCode,
                            resource_id:vals.insertId
                        })
                        back(null,permissionId)
                    }
                })
            })
            async.waterfall(addPermission, function (err,permissionId) {
                if (err) return callback(err);
                callback(null,tableId,permissionId)
            })
        })
        //赋予操作用户表权限
        task.push(function (tableId,permissionId,callback) {
            execute(squel.insert().into("t_role_resource")
                .setFieldsRows(permissionId)
                .toString(),function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    callback(null,tableId)
                }
            })
        })
        async.waterfall(task, function (err,tableId) {
            if (err) return resultBack(webResult.createResult(100,err));
            resultBack(webResult.createResult(200,"表格创建成功",{
                tid:tableId
            }))
        })
    }else{
        var addSelectItems = []
        var delSelectItems = []
        //严格按照顺序整理 rename=>changePosition=>del=>add=>edit
        var orderOpts = []
        var order = ["rename","changePosition","del","add","edit"]
        order.forEach((v,j)=>{
            updateOpts.forEach((upt,i)=>{
                if(upt.opt == v){
                    orderOpts.push(upt)
                }
            })
        })
        //修改编辑项
        orderOpts.forEach((upt,i)=>{
            switch (upt.opt){
                case "rename":
                    task.push(function (callback) {
                        var children = []
                        //修改表名
                        children.push(function (back) {
                            execute("alter table `"+upt.oldTableName+"` rename `"+upt.tableName+"`",function (err,vals) {
                                if(err) {
                                    back(err)
                                } else{
                                    back(null)
                                }
                            })
                        })
                        //修改相应位置的表名
                        children.push(function (back) {
                            execute(squel.update().table("t_table")
                                .set("name",upt.tableName)
                                .where("name = ?",upt.oldTableName).toString(),function (err,vals) {
                                if(err) {
                                    back(err)
                                } else{
                                    back(null)
                                }
                            })
                        })
                        //修改权限列表的表名
                        children.push(function (back) {
                            var editPermission = []
                            editPermission.push(function (back) {
                                execute(squel.update().table("t_resource")
                                    .set("resource_name",upt.tableName+"-查看")
                                    .set("resource_description","查看"+upt.tableName+"数据")
                                    .set("permission_url","admin/data/table/"+upt.tableName+"/create")
                                    .where("permission_url = ?","admin/data/table/"+upt.oldTableName+"/create")
                                    .toString(),function (err,vals) {
                                    if(err){
                                        back(err)
                                    }else{
                                        back(null)
                                    }
                                })
                            })
                            editPermission.push(function (back) {
                                execute(squel.update().table("t_resource")
                                    .set("resource_name",upt.tableName+"-编辑")
                                    .set("resource_description","编辑"+upt.tableName+"数据")
                                    .set("permission_url","admin/data/table/"+upt.tableName+"/edit")
                                    .where("permission_url = ?","admin/data/table/"+upt.oldTableName+"/edit")
                                    .toString(),function (err,vals) {
                                    if(err){
                                        back(err)
                                    }else{
                                        back(null)
                                    }
                                })
                            })
                            editPermission.push(function (back) {
                                execute(squel.update().table("t_resource")
                                    .set("resource_name",upt.tableName+"-添加")
                                    .set("resource_description","添加"+upt.tableName+"数据")
                                    .set("permission_url","admin/data/table/"+upt.tableName+"/add")
                                    .where("permission_url = ?","admin/data/table/"+upt.oldTableName+"/add")
                                    .toString(),function (err,vals) {
                                    if(err){
                                        back(err)
                                    }else{
                                        back(null)
                                    }
                                })
                            })
                            editPermission.push(function (back) {
                                execute(squel.update().table("t_resource")
                                    .set("resource_name",upt.tableName+"-删除")
                                    .set("resource_description","删除"+upt.tableName+"数据")
                                    .set("permission_url","admin/data/table/"+upt.tableName+"/del")
                                    .where("permission_url = ?","admin/data/table/"+upt.oldTableName+"/del")
                                    .toString(),function (err,vals) {
                                    if(err){
                                        back(err)
                                    }else{
                                        back(null)
                                    }
                                })
                            })
                            async.waterfall(editPermission, function (err) {
                                if (err) return back(err);
                                back(null)
                            })
                        })
                        async.waterfall(children, function (err) {
                            if (err) return callback(err);
                            callback(null)
                        })
                    })
                    break
                case "changePosition":
                    //修改表格所处位置
                    task.push(function (callback) {
                        execute(squel.update().table("t_table")
                            .set("parent_code",upt.newPosition[upt.newPosition.length-1])
                            .where("name = ?",upt.tableName).toString(),function (err,vals) {
                            if(err) {
                                callback(err)
                            } else{
                                callback(null)
                            }
                        })
                    })
                    break
                case "del":
                    //删除列
                    task.push(function (callback) {
                        var col = upt.col
                        switch (col.type){
                            case "select":
                                delSelectItems.push(tableName+"_"+col.label)
                                break
                        }
                        execute("alter table `"+tableName+"` drop column `"+upt.col.type+"_"+upt.col.label+"`",function (err,vals) {
                            if(err) {
                                callback(err)
                            } else{
                                callback(null)
                            }
                        })
                    })
                    break
                case "add":
                    //添加列
                    task.push(function (callback) {
                        var col = upt.col
                        var addSql = ""
                        switch (col.type){
                            case "text":
                                addSql="`text_"+col.label+"` varchar(255) DEFAULT NULL"
                                break
                            case "number":
                                addSql="`number_"+col.label+"` int(11) DEFAULT NULL"
                                break
                            case "date":
                                addSql="`date_"+col.label+"` datetime DEFAULT NULL"
                                break
                            case "select":
                                addSql="`select_"+col.label+"` varchar(255) DEFAULT NULL"
                                col.items.forEach((v,i)=>{
                                    addSelectItems.push({
                                        select_key:tableName+"_"+col.label,
                                        select_value:v.value
                                    })
                                })
                                break
                            case "img":
                                addSql="`img_"+col.label+"` text"
                                break
                        }
                        execute("alter table `"+tableName+"` add column "+addSql,function (err,vals) {
                            if(err){
                                callback(err)
                            }else{
                                callback(null)
                            }
                        })
                    })
                    break
                case "edit":
                    task.push(function (callback) {
                        var col = upt.col
                        var editSql = ""
                        switch (col.type){
                            case "text":
                                editSql="`text_"+col.label+"` varchar(255) DEFAULT NULL"
                                break
                            case "number":
                                editSql="`number_"+col.label+"` int(11) DEFAULT NULL"
                                break
                            case "date":
                                editSql="`date_"+col.label+"` datetime DEFAULT NULL"
                                break
                            case "select":
                                editSql="`select_"+col.label+"` varchar(255) DEFAULT NULL"
                                col.items.forEach((v,i)=>{
                                    delSelectItems.push(tableName+"_"+col.label)
                                    addSelectItems.push({
                                        select_key:tableName+"_"+col.label,
                                        select_value:v.value
                                    })
                                })
                                break
                            case "img":
                                editSql="`img_"+col.label+"` text"
                                break
                        }
                        execute("alter table `"+tableName+"` change  "+upt.oldCol.type+"_"+upt.oldCol.label+" "+editSql,function (err,vals) {
                            if(err){
                                callback(err)
                            }else{
                                callback(null)
                            }
                        })
                    })
                    break
            }
        })
        //循环删除选择项
        task.push(function (callback) {
            async.eachSeries(delSelectItems, function (item,callback) {
                execute(squel.delete().from("t_select")
                    .where("select_key = ?",item)
                    .toString(),function (err,vals) {
                    if(err){
                        callback(err)
                    }else{
                        callback(null)
                    }
                })
            },function (err) {
                if (err) return callback(err);
                callback(null)
            })
        })
        //增添选择项
        task.push(function (callback) {
            if(addSelectItems.length>0){
                execute(squel.insert().into("t_select")
                    .setFieldsRows(addSelectItems)
                    .toString(),function (err,vals) {
                    if(err){
                        callback(err)
                    }else{
                        callback(null)
                    }
                })
            }else{
                callback(null)
            }
        })

        async.waterfall(task, function (err) {
            if (err) return resultBack(webResult.createResult(100,err));
            resultBack(webResult.createResult(200,"表格编辑成功"))
        })
    }
}

//删除表格
function del(tableName,resultBack) {
    var task = []
    //查找该表的相关权限
    task.push(function (callback) {
        execute(squel.select().from("t_resource")
            .field("tid")
            .where("permission_url LIKE 'admin/data/table/"+tableName+"%'")
            .toString(),function (err,vals) {
            if(err){
                callback(err)
            }else{
                callback(null,vals)
            }
        })
    })
    //循环删除拥有此权限项
    task.push(function (permissionId,callback) {
        async.eachSeries(permissionId, function (permission,callback) {
            execute(squel.delete().from("t_role_resource")
                .where("resource_id = ?",permission.tid)
                .toString(),function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },function (err) {
            if (err) return callback(err);
            callback(null,permissionId)
        })
    })
    //循环删除权限项
    task.push(function (permissionId,callback) {
        async.eachSeries(permissionId, function (permission,callback) {
            execute(squel.delete().from("t_resource")
                .where("tid = ?",permission.tid)
                .toString(),function (err,vals) {
                if(err){
                    callback(err)
                }else{
                    callback(null)
                }
            })
        },function (err) {
            if (err) return callback(err);
            callback(null)
        })
    })
    //删除表格位置信息
    task.push(function (callback) {
        execute(squel.delete().from("t_table")
            .where("name = ?",tableName)
            .toString(),function (err,vals) {
            if(err){
                callback(err)
            }else{
                callback(null)
            }
        })
    })
    //删除表格带有的选择项
    task.push(function (callback) {
        execute(squel.delete().from("t_select")
            .where("select_key LIKE '"+tableName+"_%'")
            .toString(),function (err,vals) {
            if(err){
                callback(err)
            }else{
                callback(null)
            }
        })
    })
    //删除表格
    task.push(function (callback) {
        execute("DROP TABLE `"+tableName+"`",function (err,vals) {
            if(err){
                callback(err)

            }else{
                callback(null)

            }
        })
    })
    async.waterfall(task, function (err,result) {
        if (err)  return resultBack(webResult.createResult(100,"表格不存在"))
        resultBack(webResult.createResult(200,"表格删除成功"))
    })
}

exports.create=create
exports.edit=edit
exports.del=del