"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["Login"] = 282] = "Login";
    StatusCode[StatusCode["Logout"] = 283] = "Logout";
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["Redirect"] = 301] = "Redirect";
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    StatusCode[StatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
    StatusCode[StatusCode["UnknownError"] = 600] = "UnknownError";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
