'use strict';

exports.permissionMatch = function (userRoles,requestUrl) {
    //对请求的URL进行验证
    let isValidateSuccess = false
    let requsetRoles = []
    requsetRoles.push(requestUrl+"/*")
    while(requestUrl.lastIndexOf("/") > -1){
        requestUrl = requestUrl.substr(0,requestUrl.lastIndexOf("/"))
        requsetRoles.splice(0,0,requestUrl+"/*")
    }
    requsetRoles.forEach((requsetRole,index)=>{
        userRoles.forEach((value,index)=>{
            var role = value
            if(role.indexOf("/") != 0){
                role = "/"+role
            }
            if(requsetRole == role){
                isValidateSuccess = true
            }
        })
    })
    return isValidateSuccess
}

exports.urlMatch = function (path,requestUrl) {
   if(path.indexOf("/") != 0){
       path = "/"+path
   }
    //对请求的URL进行验证
    let isMatch = false
    let requsetRoles = []
    requsetRoles.push(requestUrl+"/*")
    while(requestUrl.lastIndexOf("/") > -1){
        requestUrl = requestUrl.substr(0,requestUrl.lastIndexOf("/"))
        requsetRoles.splice(0,0,requestUrl+"/*")
    }
    requsetRoles.forEach((requsetRole,index)=>{
        if(path == requsetRole){
            isMatch = true
        }
    })
    return isMatch
}