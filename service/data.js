var execute = require("../mysql/connection");
var squel = require("squel");
var async = require('async');
var util = require('../util/util')
var webResult = require('../util/webResult');


//指定表格的数据构建
function create(tableName,resultBack) {
    var task = []
    //构建列
    task.push(function (callback) {
        var data = {
            columns:[],
            configs:{
                delUrl: "/admin/data/table/"+tableName+"/del",
                editUrl: "/admin/data/table/"+tableName+"/edit",
                addUrl: "/admin/data/table/"+tableName+"/add",
                filterUrl: "/admin/data/table/"+tableName+"/create/filter"
            },
            pagination:{},
            tableData:[],
            tableName:tableName
        }
        execute(("desc "+tableName), function(err,vals){
            if(err) callback(tableName+"不存在")
            else{
                async.eachSeries(vals, function (val,callback) {
                    if(val.Key != "PRI"){
                        var column={
                            label:"",
                            prop:"",
                            type:""
                        }
                        column.label = util.getNameFromColumn(val.Field)
                        column.prop = val.Field
                        column.type = util.getTypeFromColumn(val.Field)
                        if(column.type == "select"){
                            execute((squel.select().from("t_select")
                                .field("select_value","value")
                                .where("select_key = ?",data.tableName+"_"+column.label).toString()),function (err,vals) {
                                column.items = vals
                                data.columns.push(column)
                                callback(null)
                            })
                        }else{
                            data.columns.push(column)
                            callback(null)
                        }
                    }else{
                        callback(null)
                    }
                },function (err) {
                    if (err) return callback(err);
                    callback(null,data)
                })
            }
        })
    })
    //构建分页
    task.push(function (data,callback) {
        var pagination = {
            pageCurrent:1,
            pageSize:30,
            totalCount:0
        }
        execute("select count(tid) as 'count' from "+data.tableName, function(err,vals){
            pagination.totalCount = vals[0].count
            data.pagination = pagination
            callback(null,data)
        })
    })
    //构建数据
    task.push(function (data,callback) {
        //动态构建sql语句
        var sqlSquel = squel.select().from(data.tableName)
        sqlSquel.field("tid")
        data.columns.forEach((column,index)=>{
            if(column.type == "date"){
                sqlSquel.field("date_format("+column.prop+",'%Y-%c-%d %h:%i:%s')",column.prop)
            }else{
                sqlSquel.field(column.prop)
            }
        })
        sqlSquel.order("tid",false)
        sqlSquel.limit(data.pagination.pageSize).offset((data.pagination.pageCurrent-1)*data.pagination.pageSize)
        execute(sqlSquel.toString(),function(err,vals){
            data.tableData = vals
            callback(null,data)
        })
    })
    //流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,"构建成功",result))
        }
    })
}
//指定表格的数据筛选
function filter(tableName,columns,filterParam,pageSize,pageCurrent,isOr,resultBack) {
    var task = []
    task.push(function (callback) {
        var data = {
            pagination:{
                pageCurrent:pageCurrent,
                pageSize:pageSize,
                totalCount:0
            },
            tableData:[]
        }
        //动态构建sql语句
        var sqlSquel = squel.select().from(tableName)
        sqlSquel.field("count(tid)","count")
        var sqlFilter = util.getFilterSql(filterParam,isOr)
        sqlSquel.where(sqlFilter)
        //取得总条数
        execute(sqlSquel.toString(),function (err,vals) {
            if(err) return callback(err)
            else {
                data.pagination.totalCount = vals[0].count
                callback(null,data,sqlFilter)
            }
        })
    })
    task.push(function (data,sqlFilter,callback) {
        //动态构建sql语句
        var sqlSquel = squel.select().from(tableName)
        sqlSquel.field("tid")
        columns.forEach((column,index)=>{
            if(column.type == "date"){
                sqlSquel.field("date_format("+column.prop+",'%Y-%c-%d %h:%i:%s')",column.prop)
            }else{
                sqlSquel.field(column.prop)
            }
        })
        sqlSquel.where(sqlFilter)
        sqlSquel.order("tid",false)
        sqlSquel.limit(pageSize).offset((pageCurrent-1)*pageSize)
        //取得具体数据
        execute(sqlSquel.toString(),function (err,vals) {
            if(err) return callback(err)
            else {
                data.tableData = vals
                callback(null,data)
            }
        })
    })
    //流程控制
    async.waterfall(task, function (err, result) {
        if (err) {
            resultBack(webResult.createResult(100,err))
        }else{
            resultBack(webResult.createResult(200,"构建成功",result))
        }
    })

}
//添加数据
function add(tableName,rowData,resultBack) {
    //动态构建sql语句
    var sqlSquel = squel.insert().into(tableName)
    for(var _key in rowData){
        sqlSquel.set(_key,rowData[_key])
    }
    execute(sqlSquel.toString(),function (err,vals) {
        if(err) return resultBack(webResult.createResult(100,err))
        else {
           if(vals.affectedRows > 0){
               resultBack(webResult.createResult(200,"插入成功",{
                   tid:vals.insertId
               }))
           }else{
               resultBack(webResult.createResult(100,"插入失败，存在相同的数据"))
           }
        }
    })

}
//编辑数据
function edit(tableName,rowData,resultBack) {
    //动态构建sql语句
    var sqlSquel = squel.update().table(tableName)
    for(var _key in rowData){
        if(_key != "tid"){
            sqlSquel.set(_key,rowData[_key])
        }
    }
    sqlSquel.where("tid = ?",rowData["tid"])
    console.log(sqlSquel.toString())
    execute(sqlSquel.toString(),function (err,vals) {
        if(err) return resultBack(webResult.createResult(100,err))
        else {
            if(vals.affectedRows > 0){
                resultBack(webResult.createResult(200,"编辑成功"))
            }else{
                resultBack(webResult.createResult(100,"编辑失败，编辑数据不存在"))
            }
        }
    })
}

//删除数据
function del(tableName,delRows,resultBack) {
    //动态构建sql语句
    var sqlSquel = squel.delete().from(tableName)
    var deleteRoles = "tid in("
    delRows.forEach((value,index)=>{
        deleteRoles += value["tid"]+","
    })
    deleteRoles=deleteRoles.substr(0,deleteRoles.length-1)
    deleteRoles+=")"
    sqlSquel.where(deleteRoles)
    execute(sqlSquel.toString(),function (err,vals) {
        if(err) return resultBack(webResult.createResult(100,err))
        else {
            if(vals.affectedRows > delRows.length-1){
                resultBack(webResult.createResult(200,"删除成功"))
            }else{
                resultBack(webResult.createResult(101,"部分数据删除失败"))
            }
        }
    })
}

//图片上传
function addImgUrl(tableName,columnName,tid,url,resultBack) {
    var task = []
    task.push(function (callback) {
        execute(squel.select().from(tableName)
            .field(columnName)
            .where("tid = ?",tid).toString(),function (err,vals) {
            if(err) return callback(err)
            else callback(null,vals[0][columnName])
        })
    })
    task.push(function (getUrl,callback) {
        var data = {
            url:""
        }
        let setUrl = ""
        if(getUrl != ""){
            setUrl+=getUrl+";"+url
        }else{
            setUrl = url
        }
        execute(squel.update().table(tableName)
            .set(columnName,setUrl)
            .where("tid = ?",tid).toString(),function (err,vals) {
            if(err) return callback(err)
            else {
                data.url = url
                callback(null,data)
            }
        })
    })
    //流程控制
    async.waterfall(task, function (err, result) {
        if(err){
            resultBack(webResult.createResult(100,"图片入库失败"))
        }else{
            resultBack(webResult.createResult(200,"图片入库成功",result))
        }
    })
}

//删除图片
function delImg(tableName,columnName,tid,url,resultBack) {
    var task = []
    task.push(function (callback) {
        execute(squel.select().from(tableName)
            .field(columnName)
            .where("tid = ?",tid).toString(),function (err,vals) {
            if(err) return callback(err)
            else callback(null,vals[0][columnName])
        })
    })
    task.push(function (getUrl,callback) {
        var urls = getUrl.split(";")
        var setUrl = ""
        urls.forEach((value,index)=>{
            console.log(value+"   "+url)
            if(value!=url){
                setUrl+=(value+";")
            }
        })
        setUrl=setUrl.substr(0,setUrl.length-1)
        execute(squel.update().table(tableName)
            .set(columnName,setUrl)
            .where("tid = ?",tid).toString(),function (err,vals) {
            if(err) return callback(err)
            else {
                callback(null)
            }
        })
    })
    //流程控制
    async.waterfall(task, function (err, result) {
        if(err){
            resultBack(webResult.createResult(100,"图片移除失败"))
        }else{
            resultBack(webResult.createResult(200,"图片移除成功"))
        }
    })
}
//指定表格的数据筛选
function exportData(tableName,columns,filterParam,resultBack) {
    //动态构建sql语句
    var exportTableData = []
    var sqlSquel = squel.select().from(tableName)
    var col = []
    columns.forEach((column,index)=>{
        if(column.type == "date"){
            col.push(column.label)
            sqlSquel.field("date_format("+column.prop+",'%Y-%c-%d %h:%i:%s')",column.label)
        }else if(column.type != "img"){
            col.push(column.label)
            sqlSquel.field(column.prop,column.label)
        }
    })
    exportTableData.push(col)
    sqlSquel.where(util.getFilterSql(filterParam))
    resultBack(null,false,20,"正在提取数据",exportTableData)
    //取得具体数据
    execute(sqlSquel.toString(),function (err,vals) {
        if(err) {
            resultBack(exportTableData,err)
        }else{
            vals.forEach((value,index)=>{
                var row = []
                for(let _key in value){
                    row.push(value[_key])
                }
                exportTableData.push(row)
            })
            resultBack(null,true,40,"数据提取成功",exportTableData)
        }

    })
}
//构建sql语句插入数据库
function importData(tableName,obj, resultBack) {
    var task = []
    task.push(function (callback) {
        execute(squel.select().from("information_schema.columns")
            .field("column_name","columnName")
            .where("table_schema = ?","vue_dm_db")
            .where("table_name = ?",tableName).toString(),function (err,vals) {
            if(err) {
                callback(err)
            }
            else{
                var cols = []
                vals.forEach((v,i)=>{
                    if(v.columnName != "tid"){
                        let arr = v.columnName.split("_")
                        cols.push({
                            name:arr[1],
                            type:arr[0],
                            prop:v.columnName
                        })
                    }
                })
                var insertCol = []
                obj[0].forEach((v,i)=>{
                    cols.forEach((col,j)=>{
                        if(v==col.name&&col.type!="img"){
                            insertCol.push({
                                prop:col.prop,
                                index:i
                            })
                        }
                    })
                })
                if(insertCol.length < 1){
                    callback("未检测到合法列项")
                }else{
                    //以5000一次插入分割
                    obj.splice(0,1)
                    var insertSql = []
                    var s = squel.insert().into(tableName)
                    var rows = []
                    var haveUseLoad = true
                    obj.forEach((row,j)=>{
                        var rowSql = {}
                        insertCol.forEach((v,i)=>{
                            rowSql[v.prop] = row[v.index]
                        })
                        rows.push(rowSql)
                        haveUseLoad = true
                        if((j+1)%5000 == 0){
                            s.setFieldsRows(rows)
                            insertSql.push(s.toString())
                            haveUseLoad = false
                            s = squel.insert().into(tableName)
                            rows = []
                            resultBack(null,false,(40+(j*30)/obj.length),"构建录入数据")
                        }
                    })
                    if(haveUseLoad){
                        s.setFieldsRows(rows)
                        insertSql.push(s.toString())
                    }
                    callback(null,insertSql)
                }
            }
        })
    })
    task.push(function (insertSql,callback) {
        resultBack(null,false,70,"执行批量录入")
        var i =0
        async.eachSeries(insertSql, function (sql,callback) {
            i++
           execute(sql,function (err,vals) {
               if(err) return callback(err)
               else{
                   resultBack(null,false,(70+(i*30)/insertSql.length),"批量录入数据库")
                   callback(null)
               }
           })
        },function (err) {
            if (err) return callback(err);
            callback(null)
        })
    })
    async.waterfall(task, function (err) {
        if (err) return resultBack(err);
        resultBack(null,true,100)
    })
}
exports.create = create;
exports.filter = filter;
exports.add = add;
exports.edit = edit;
exports.del = del;
exports.addImgUrl = addImgUrl;
exports.delImg = delImg;
exports.exportData = exportData;
exports.importData = importData;