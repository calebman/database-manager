var treeModule = require('../service/tree')
var express = require('express');
var webResult = require('../util/webResult');
var router = express.Router();

router.route("/system/tree/edit")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        treeModule.edit(data.isAdd,data.parentNode,data.node,function (result) {
            webResult.createResponse(res,result)
        })
    })

router.route("/system/tree/del")
    .post(function(req, res){
        var data = JSON.parse(req.param("data"))
        treeModule.del(data.node,function (result) {
            webResult.createResponse(res,result)
        })
    })

module.exports = router;