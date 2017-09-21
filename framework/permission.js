var permission = require('./permission/application')
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
        switch (err){
            case "permission denied":
                res.send({
                    code:100,
                    message:"权限不足"
                });
                break
            case "unknow account":
                res.send({
                    code:300,
                    message:"请登录系统"
                });
                break
        }
    }else{
        next()
    }
}
module.exports = permission