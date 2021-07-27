"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.requestHandler = void 0;
const process_1 = require("process");
var RequestReplayTypes;
(function (RequestReplayTypes) {
    RequestReplayTypes["CapturedWrite"] = "captured_write";
    RequestReplayTypes["HttpMethod"] = "http_method";
    RequestReplayTypes["Threshold"] = "threshold";
})(RequestReplayTypes || (RequestReplayTypes = {}));
function inSecondaryRegion() {
    return process_1.env.FLY_REGION && process_1.env.PRIMARY_REGION && process_1.env.FLY_REGION !== process_1.env.PRIMARY_REGION;
}
function replayInPrimaryRegion(response, http_method) {
    response.append('Fly-Replay', `region=${process_1.env.PRIMARY_REGION}; state=${http_method}`);
    response.status(409).send(`Replaying in ${process_1.env.PRIMARY_REGION}`);
}
const requestHandler = (req, res, next) => {
    const replayableHttpMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (process_1.env.FLY_REGION) {
        res.append('Fly-Region', process_1.env.FLY_REGION);
    }
    if (inSecondaryRegion()) {
        if (replayableHttpMethods.includes(req.method)) {
            return replayInPrimaryRegion(res, RequestReplayTypes.HttpMethod);
        }
        console.log(req.cookies);
        if ((req === null || req === void 0 ? void 0 : req.cookies['fly-replay-threshold']) && parseInt(req.cookies['fly-replay-threshold']) - Date.now() > 0) {
            return replayInPrimaryRegion(res, RequestReplayTypes.Threshold);
        }
    }
    if (req.headers['Fly-Replay-Src']) {
        let matches = req.headers['Fly-Replay-Src'].toString().matchAll(/(.*?)=(.*?)($|;)/);
        if (Array.from(matches).some(match => match.toString() == 'threshold')) {
            let threshold = Date.now() + (60 * 5);
            res.cookie("fly-replay-threshold", threshold);
        }
    }
    next();
};
exports.requestHandler = requestHandler;
const errorHandler = (error, req, res, next) => {
    /* Prisma throws low-level errors as strings, and this is the only error we care about
       until we decide to support other database adapters
    */
    if (error.toString().includes('SqlState("25006")') && inSecondaryRegion()) {
        replayInPrimaryRegion(res, RequestReplayTypes.CapturedWrite);
    }
    else {
        next(error);
    }
};
exports.errorHandler = errorHandler;
