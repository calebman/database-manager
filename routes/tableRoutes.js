var express = require('express');
var webResult = require('../util/webResult');
var router = express.Router();
var xlsx = require('node-xlsx');
var formidable = require('formidable');
var path = require('path');
var util = require('../util/util');
var async = require('async');
var fs = require('fs');
var tableMoudle = require('../service/table')
router.route("/system/table/create")
    .get(function(req, res){
        tableMoudle.create(function (result) {
            webResult.createResponse(res,result)
        })
    })
//解析上传的exccel表格
router.route("/system/table/excel")
    .post(function(req, res){
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../public/excel/tmp');   //文件保存的临时目录为当前项目下的tmp文件夹
        form.keepExtensions = true;
        form.parse(req,function (err, fields, file) {
            var filePath = '';
            if(file.tmpFile){
                filePath = file.tmpFile.path;
            } else {
                for(var key in file){
                    if( file[key].path && filePath==='' ){
                        filePath = file[key].path;
                        break;
                    }
                }
            }
            var obj = xlsx.parse(filePath)[0];
            var result = {
                columnsData:[],
                tableData:[]
            }
            obj.data.forEach((value,index)=>{
                if(index==0){
                    value.forEach((item,i)=>{
                        result.columnsData.push({
                            label:item,
                            type:"text",
                            prop:"text_"+item
                        })
                    })
                }else{
                    var dataItem = {}
                    value.forEach((item,i)=>{
                        dataItem[result.columnsData[i].prop] = item
                    })
                    result.tableData.push(dataItem)
                }
            })

            fs.unlinkSync(filePath)
            webResult.createResponse(res,webResult.createResult(200,"测试获取成功",result))

        })
    })
//表格编辑
router.route("/system/table/edit")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        tableMoudle.edit(data.tableName,data.updateOpts,data.isAdd,function (result) {
            webResult.createResponse(res,result)
        })
    })

//表格删除
router.route("/system/table/del")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        tableMoudle.del(data.tableName,function (result) {
            webResult.createResponse(res,result)
        })
    })
module.exports = router;