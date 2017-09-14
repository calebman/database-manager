function createResult(code,message,data) {
    let result = {
        code:code,
        message:message,
        data:data
    }
    return result
}

function createResponse(res,result) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.send(result);
}

exports.createResult = createResult;
exports.createResponse = createResponse;