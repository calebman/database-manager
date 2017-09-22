//导入所需模块
var mysql=require("mysql");
//导入配置文件
var env = 'dev'
var cfg  =require("../conf/db.json")[env];
var pool = mysql.createPool({
    host:cfg.host,
    user:cfg.user,
    password:cfg.password,
    database:cfg.database,
    port:cfg.port
});
//导出执行相关
var execute=function(sql,callback){
    //console.log("[sql] "+sql)
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(err,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err,vals);
            });
        }
    });
};

module.exports=execute;