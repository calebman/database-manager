var userMoudle = require('../service/user')
var express = require('express');
var webResult = require('../util/webResult');
var router = express.Router();

router.route("/system/user/create")
    .get(function(req, res){
        userMoudle.create(req.session.token.username,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/user/add")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        userMoudle.add(data.username,data.realname,data.roleCode,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/user/del")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        userMoudle.del(data.userCode,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/user/edit")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        userMoudle.edit(data.userCode,data.roleCode,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/user/enabled")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        userMoudle.enabled(data.userCode,function (result) {
            webResult.createResponse(res,result)
        })
    })
router.route("/system/user/disabled")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        userMoudle.disabled(data.userCode,function (result) {
            webResult.createResponse(res,result)
        })
    })
module.exports = router;