"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionalDatabaseUrl = void 0;
const url_1 = require("url");
const process_1 = require("process");
function inSecondaryRegion() {
    return process_1.env.FLY_REGION && process_1.env.PRIMARY_REGION && process_1.env.FLY_REGION !== process_1.env.PRIMARY_REGION;
}
function regionalDatabaseUrl() {
    if (!process_1.env.DATABASE_URL)
        return;
    let url = new url_1.URL(process_1.env.DATABASE_URL);
    if (inSecondaryRegion()) {
        url.host = `${process_1.env.FLY_REGION}.${url.host}`;
        url.port = "5433";
    }
    return url.toString();
}
exports.regionalDatabaseUrl = regionalDatabaseUrl;
