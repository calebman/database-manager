var roleMoudle = require('../service/role')
var express = require('express');
var webResult = require('../util/webResult');
var router = express.Router();

router.route("/system/role/create")
    .get(function(req, res){
        roleMoudle.create(function (result) {
           webResult.createResponse(res,result)
        })
    })
router.route("/system/role/add")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        roleMoudle.add(data.nickName,data.description,function (result) {
            webResult.createResponse(res,result)
        })
    })
router.route("/system/role/del")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        roleMoudle.del(data.roleCode,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/role/edit")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        console.log(data)
        roleMoudle.edit(data.roleCode,data.roles,function (result) {
            webResult.createResponse(res,result)
        })
    })
module.exports = router;