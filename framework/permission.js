var permission = require('./express-permission/application')
var admin = require('../service/admin')
//配置拦截URL
permission.config = {
    path:'admin/*'
}
//授权钩子
permission.authorize = function (token,next) {
    admin.getPermission(token.username,function (err,result,roleCode) {
        token.roleCode = roleCode
        var roles = []
        result.forEach((v,i)=>{
            roles.push(v.permissionUrl)
        })
        next(roles)
    })
}
//授权结束的钩子
permission.after = function (err, req, res, next) {
    if(err){
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.send({
            code:100,
            message:err
        });
    }else{
        next()
    }
}
module.exports = permission