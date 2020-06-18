"use strict";
exports.__esModule = true;
exports.User = void 0;
var schema_1 = require("@nexus/schema");
exports.User = schema_1.objectType({
    name: 'User',
    definition: function (t) {
        t.model.accountId();
        t.model.id();
        t.model.uuid();
        t.model.name();
        t.model.email();
        t.model.emailVerified();
        t.model.phone();
        t.model.phoneVerified();
        t.model.active();
        t.model.posts({ pagination: false });
        t.model.picUrl();
        t.model.loginCount();
        t.model.lastLogin();
        t.model.lastLogin();
        t.model.createdAt();
        t.model.updatedAt();
        t.model.resetAt();
        t.model.active();
    }
});
