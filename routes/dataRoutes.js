var dataModule = require('../service/data');
var formidable = require('formidable');
var express = require('express');
var webResult = require('../util/webResult');
var path = require('path');
var util = require('../util/util');
var async = require('async');
var fs = require('fs');
var xlsx = require('node-xlsx');
var router = express.Router();
var webSocket = require('../framework/websocket/application')

router.route("/data/table/:tableName/create")
    .get(function(req, res){
        var tableName = req.params.tableName
        dataModule.create(tableName,function (result) {
            webResult.createResponse(res,result)
        })
    })
router.route("/data/table/:tableName/create/filter")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.filter(tableName,data.columns,data.filter,data.pageSize,data.pageCurrent,data.isOr,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/data/table/:tableName/add")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.add(tableName,data.rowData,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/data/table/:tableName/edit")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.edit(tableName,data.rowData,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/data/table/:tableName/del")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.del(tableName,data.delRows,function (result) {
            //是否同步删除文件系统中上传的图片
            // if(result.code == 200){
            //     data.delRows.forEach((row,index)=>{
            //         for(let _key in row){
            //             if(_key.substring(0,_key.indexOf("_"))=="img"){
            //                 var delImgs = row[_key].split(";")
            //                 delImgs.forEach((url,index)=>{
            //                     var delFilePath = path.join(__dirname, "../public/"+url);
            //                     if(fs.existsSync(delFilePath)){
            //                         fs.unlinkSync(delFilePath)
            //                     }
            //                 })
            //             }
            //         }
            //     })
            // }
            webResult.createResponse(res,result)
        })
    })

router.route("/data/table/:tableName/edit/upload/:columnName/:tid")
    .post(function(req, res){
        var tableName = req.params.tableName
        var columnName = req.params.columnName
        var tid = req.params.tid
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../public/upload/tmp');   //文件保存的临时目录为当前项目下的tmp文件夹
        form.maxFieldsSize = 2 * 1024 * 1024;  //用户头像大小限制为最大1M
        form.keepExtensions = true;        //使用文件的原扩展名
        var task = []
        task.push(function (callback) {
            form.parse(req, function (err, fields, file) {
                var filePath = '';
                //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
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
                //文件移动的目录文件夹，不存在时创建目标文件夹
                var time = util.getTime("YYYYMMDD")
                var targetDir = path.join(__dirname, '../public/upload/'+time);
                if (!fs.existsSync(targetDir)) {
                    fs.mkdir(targetDir);
                }
                var fileExt = filePath.substring(filePath.lastIndexOf('.'));
                //判断文件类型是否允许上传
                if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
                    var err = new Error('此文件类型不允许上传');
                    res.json({code:-1, message:'此文件类型不允许上传'});
                } else {
                    //以当前时间戳对上传文件进行重命名
                    var fileName =  util.getUUID()+fileExt;
                    var targetFile = path.join(targetDir, fileName);
                    //移动文件
                    fs.rename(filePath, targetFile, function (err) {
                        if (err) {
                            callback("图片移动失败")
                        } else {
                            //上传成功，返回文件的相对路径
                            var fileUrl = 'upload/'+time +'/'+ fileName;
                            callback(null,fileUrl)
                        }
                    });
                }
            });
        })
        task.push(function (url,callback) {
            dataModule.addImgUrl(tableName,columnName,tid,url,function (result) {
                callback(null,result)
            })
        })
        //流程控制
        async.waterfall(task, function (err, result) {
            if (err) {
                webResult.createResponse(res,webResult.createResult(100,err))
            }else{
                webResult.createResponse(res,result)
            }
        })

    })

router.route("/data/table/:tableName/edit/removeImg")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.delImg(tableName,data.columnName,data.tid,data.src,function (result) {
            var delFilePath = path.join(__dirname, "../public/"+data.src);
            fs.unlinkSync(delFilePath)
            webResult.createResponse(res,result)
        })
    })

router.route("/data/table/:tableName/create/export")
    .post(function(req, res){
        var tableName = req.params.tableName
        var data = JSON.parse(req.param("data"))
        dataModule.exportData(tableName,data.columns,data.filter,function (err,isComplete,percent,detail,data) {
            if(isComplete){
                var buffer = xlsx.build([{name:"sheet", data:data}]);
                var fileDir = 'excel/'+util.getTime("YYYYMMDD")
                var targetDir = path.join( 'public/'+ fileDir);
                var fileName = util.getUUID()+".xlsx"
                if (!fs.existsSync(targetDir)) {
                    fs.mkdir(targetDir);
                }
                fs.writeFileSync(targetDir+"/"+fileName,buffer,'binary');
                webSocket.wsSendFromUsername(req.session.token.username,"progress",{
                    detail:"数据导出成功，共"+data.length+"条",
                    percent:100
                })
                webResult.createResponse(res,webResult.createResult(200,"导出成功",{
                    fileUrl:fileDir+"/"+fileName
                }))
            }else{
                webSocket.wsSendFromUsername(req.session.token.username,"progress",{
                    detail:detail,
                    percent:percent
                })
            }
        })
    })

router.route("/data/table/:tableName/create/import")
    .post(function(req, res) {
        var tableName = req.params.tableName
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../public/excel/tmp');   //文件保存的临时目录为当前项目下的tmp文件夹
        form.keepExtensions = true;
        form.parse(req, function (err, fields, file) {
            var filePath = '';
            if (file.tmpFile) {
                filePath = file.tmpFile.path;
            } else {
                for (var key in file) {
                    if (file[key].path && filePath === '') {
                        filePath = file[key].path;
                        break;
                    }
                }
            }

            var obj = xlsx.parse(filePath)[0];
            fs.unlinkSync(filePath)
            dataModule.importData(tableName,obj.data,function (err,isComplete,percent,detail) {
                if(err){
                    webSocket.wsSendFromUsername(req.session.token.username,"progress",{
                        detail:err,
                        percent:-1
                    })
                    webResult.createResponse(res,webResult.createResult(100,"导入失败"))
                }else{
                    if(isComplete){
                        webSocket.wsSendFromUsername(req.session.token.username,"progress",{
                            detail:"数据录入成功，共"+obj.data.length+"条",
                            percent:100
                        })
                        webResult.createResponse(res,webResult.createResult(200,"导入成功"))
                    }else{
                        webSocket.wsSendFromUsername(req.session.token.username,"progress",{
                            detail:detail,
                            percent:percent
                        })
                    }
                }
            })

        })
    })

module.exports = router;