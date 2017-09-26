var log4js = require("log4js");
var config = require("../../conf/log4js.json")

log4js.configure(config)
var logger = log4js.getLogger("app")
module.exports = {
    info:function (info) {
        logger.info(info)
    },
    error:function (error) {
        log4js.getLogger("cheese").error(error)
    },
    log:function (log) {
        log4js.getLogger("cheese").log(log)
    }
}