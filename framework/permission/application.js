'use strict';
var permissionMatch = require('./match').permissionMatch
var urlMatch = require('./match').urlMatch

var app = module.exports ={
    filter:function (req, res, next) {
        if(urlMatch(app.config.path,decodeURI(req.url))){
            if(req.session.token){
                app.authorize(req.session.token,function (authenticationInfo) {
                    if(permissionMatch(authenticationInfo,decodeURI(req.url))){
                        app.after(null,req,res,next)
                    }else{
                        app.after("permission denied",req,res,next)
                    }
                })
            }else{
                app.after("unknow account",req,res,next)
            }
        }else{
            next()
        }
    },
    login:function (seesion,token) {
        seesion.token = token
    }
}