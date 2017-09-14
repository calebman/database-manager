var transliteration = require('transliteration');
var uuid = require('uuid');
var moment = require('moment');
var squel = require("squel");
//判断是否为空对象
function isEmptyObject(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
}
//判断是否为undefined
function isUnderfined(obj) {
    if (typeof(reValue) == "undefined") {
        return true
    }
    return false
}
//对字符串进行拼音转换
function transliterationStr(str) {
    return transliteration.slugify(str, {separator: ''})
}
//获取列类型
function getTypeFromColumn(name) {
    var index = name.indexOf("_")
    return name.substr(0,index)
}
//获取列名称
function getNameFromColumn(name) {
    var index = name.indexOf("_")
    return name.substr(index+1,name.length)
}
//转换列
function createColumn(column) {
    return column.type+"_"+column.label
}
//获取uuid
function getUUID() {
    return uuid.v4().replace(/-/g,"")
}
//获取格式化后的时间
function getTime(format) {
    return moment().format(format);
}
//构建表格的数据筛选sql
function getFilterSql(filterParam,isOr) {
    //筛选语句构建
    var sqlFilter = squel.expr()
    filterParam.forEach((domain,index)=>{
        var itemSql = "("+domain.role[0]
        switch (domain.role[1]){
            case "equal":
                itemSql+=" = "+"'"+domain.value[0]+"'"
                break
            case "notEqual":
                itemSql+=" != "+"'"+domain.value[0]+"'"
                break
            case "contain":
                itemSql+=" LIKE "+"'%"+domain.value[0]+"%'"
                break
            case "notContain":
                itemSql+=" NOT LIKE "+"'%"+domain.value[0]+"%'"
                break
            case "before":
                itemSql+=" < "+"'"+domain.value[0]+"'"
                break
            case "after":
                itemSql+=" > "+"'"+domain.value[0]+"'"
                break
            case "between":
                itemSql+=" BETWEEN "+"'"+domain.value[0]+"' AND DATE_ADD('"+domain.value[1]+"',INTERVAL 1 DAY)"
                break
            case "=":
                itemSql+=" = "+domain.value[0]
                break
            case ">":
                itemSql+=" > "+domain.value[0]
                break
            case "<":
                itemSql+=" < "+domain.value[0]
                break
            case "include":
                var items = ""
                domain.value.forEach((item,index)=>{
                    items+="'"+item+"',"
                })
                items = items.substr(0,items.length-1)
                itemSql+=" in("+items+")"
                break
            case "isNull":
                itemSql+=" = ''"
                break
            case "notNull":
                itemSql+=" != ''"
                break
        }
        itemSql+=")"
        if(isOr){
            sqlFilter.or(itemSql)
        }else{
            sqlFilter.and(itemSql)
        }
    })
    return sqlFilter
}
//递归生成树
function getTree(data,parentCode) {
    var trees = []
    for(var i=0;i<data.length;i++){
        var item = data[i]
        if(item.parentCode == parentCode){
            var tree = {}
            tree.id=item.selfCode
            tree.label=item.name
            tree.children = []
            getChildren(tree,data)
            data.splice(i,1)
            i--
            trees.push(tree)
        }
    }
    return trees
}
//递归算法的js实现
function getChildren(parentItem,data) {
    if(existChildren(parentItem,data)){
        for(var i=0;i<data.length;i++){
            var item = data[i]
            if(item.parentCode == parentItem.id){
                var tree = {}
                tree.id=item.selfCode
                tree.label=item.name
                tree.children = []
                getChildren(tree,data)
                data.splice(i,1)
                i--
                parentItem.children.push(tree)
            }
        }
    }else{
         return
    }
}
//判断是否存在子元素
function existChildren(parentItem,data) {
    for(var i=0;i<data.length;i++){
        var item = data[i]
        if(parentItem.id == item.parentCode){
            return true
        }
    }
    return false
}
exports.isEmptyObject = isEmptyObject;
exports.isUnderfined = isUnderfined;
exports.transliterationStr = transliterationStr;
exports.getTypeFromColumn = getTypeFromColumn;
exports.getNameFromColumn = getNameFromColumn;
exports.createColumn = createColumn;
exports.getUUID = getUUID;
exports.getTime = getTime;
exports.getFilterSql = getFilterSql;
exports.getTree = getTree;