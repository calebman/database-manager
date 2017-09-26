var schedule = require("node-schedule");
var chartsModule = require("../../service/charts")
var logger = require("../logger/application")
exports.create = function () {
    var rule = new schedule.RecurrenceRule();
    rule.hour = 20;
    rule.minute = 0;
    //统计数据总量
    schedule.scheduleJob(rule, function(){
        chartsModule.addDataCount(function (err) {
            if(err){
                logger.error(err)
            }
        })
    });
}
