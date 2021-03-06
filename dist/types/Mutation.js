"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Mutation = void 0;
var schema_1 = require("@nexus/schema");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var utils_1 = require("../utils");
var uuid_1 = require("uuid");
var lodash_1 = require("lodash");
var path = require('path');
var result = require('dotenv').config({ path: path.resolve(__dirname, '../../prisma/.env') });
if (result.error) {
    throw result.error;
}
else {
    console.log('- .env loaded');
}
var mailgun = require('mailgun.js');
var mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY });
var omitFields = ['id', 'accountAndEmail', 'password', 'emailVerificationToken'];
// In Progress - build URL to verify email:
// const emailAfterSignUp = ({ accountName, toEmail }:{ accountName: string, toEmail: string }) => {
//   const url ='http://nothing.com';
//   mg.messages.create(process.env.MAILGUN_DOMAIN, {
//     from: `Registration <noreply@${process.env.MAILGUN_DOMAIN}>`,
//     to: [toEmail],
//     subject: "Thank you for registering",
//     text: `Thanks for registering with ${accountName} \n\nPlease click on the following link to verify your email address: \n${url}`
//     // html: "<h1>Testing some Mailgun awesomness!</h1>"
//   })
//   .then((msg: string) => console.log(msg)) // logs response data
//   .catch((err: any) => console.log(err)); // logs any error
// }
var emailForPasswordReset = function (_a) {
    var accountName = _a.accountName, toEmail = _a.toEmail, newPassword = _a.newPassword;
    mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: "Registration <noreply@" + process.env.MAILGUN_DOMAIN + ">",
        to: [toEmail],
        subject: "Your temporary password",
        text: "You have just made a request to reset your password for " + accountName + " \n\nBelow is your new password: \n" + newPassword
        // html: "<h1>Testing some Mailgun awesomness!</h1>"
    })
        .then(function (msg) { return console.log(msg); }) // logs response data
    ["catch"](function (err) { return console.log(err); }); // logs any error
};
var upsertAccount = function (_a) {
    var ctx = _a.ctx, accountId = _a.accountId, email = _a.email;
    return __awaiter(void 0, void 0, void 0, function () {
        var dbAccount, account;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ctx.prisma.account.findOne({
                        where: {
                            accountId: accountId
                        }
                    })];
                case 1:
                    dbAccount = _b.sent();
                    if (!!dbAccount) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.prisma.account.create({
                            data: {
                                accountId: accountId,
                                name: accountId,
                                ownerEmail: email.toLowerCase()
                            }
                        })];
                case 2:
                    account = _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.Mutation = schema_1.mutationType({
    definition: function (t) {
        var _this = this;
        t.field('signup', {
            type: 'AuthPayload',
            args: {
                accountId: schema_1.stringArg(),
                name: schema_1.stringArg(),
                email: schema_1.stringArg({ nullable: false }),
                password: schema_1.stringArg({ nullable: false })
            },
            resolve: function (_parent, _a, ctx) {
                var accountId = _a.accountId, name = _a.name, email = _a.email, password = _a.password;
                return __awaiter(_this, void 0, void 0, function () {
                    var hashedPassword, accessToken, user;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, bcryptjs_1.hash(password, 10)];
                            case 1:
                                hashedPassword = _b.sent();
                                accessToken = uuid_1.v4();
                                return [4 /*yield*/, upsertAccount({ ctx: ctx, accountId: accountId || '', email: email })
                                    // create new User
                                ];
                            case 2:
                                _b.sent();
                                return [4 /*yield*/, ctx.prisma.user.create({
                                        data: {
                                            accountId: accountId,
                                            name: name,
                                            email: email.toLowerCase(),
                                            accountAndEmail: accountId + "_" + email.toLowerCase(),
                                            accessToken: accessToken,
                                            password: hashedPassword
                                        }
                                    })];
                            case 3:
                                user = _b.sent();
                                return [2 /*return*/, {
                                        token: jsonwebtoken_1.sign(__assign(__assign({}, lodash_1.omit.apply(void 0, __spreadArrays([user], omitFields))), { accessToken: accessToken }), utils_1.APP_SECRET),
                                        user: user
                                    }];
                        }
                    });
                });
            }
        });
        t.field('login', {
            type: 'AuthPayload',
            args: {
                accountId: schema_1.stringArg({ nullable: false }),
                email: schema_1.stringArg({ nullable: false }),
                password: schema_1.stringArg({ nullable: false })
            },
            resolve: function (_parent, _a, ctx) {
                var accountId = _a.accountId, email = _a.email, password = _a.password;
                return __awaiter(_this, void 0, void 0, function () {
                    var user, passwordValid, accessToken, lastUA, lastReferer;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, ctx.prisma.user.findOne({
                                    where: {
                                        accountAndEmail: accountId + "_" + email.toLowerCase()
                                    }
                                })];
                            case 1:
                                user = _c.sent();
                                if (!user) {
                                    throw new Error("No user found for email: " + email);
                                }
                                if (!user.active) {
                                    throw new Error("User is not active.");
                                }
                                return [4 /*yield*/, bcryptjs_1.compare(password, user.password)];
                            case 2:
                                passwordValid = _c.sent();
                                if (!passwordValid) {
                                    throw new Error('Invalid password');
                                }
                                accessToken = uuid_1.v4();
                                lastUA = ctx.request.headers['user-agent'];
                                lastReferer = ctx.request.headers['referer'];
                                return [4 /*yield*/, ctx.prisma.user.update({
                                        where: { id: (_b = user.id) !== null && _b !== void 0 ? _b : -1 },
                                        data: {
                                            accessToken: accessToken,
                                            loginCount: (user.loginCount || 0) + 1,
                                            lastLogin: new Date(),
                                            lastUA: lastUA,
                                            lastReferer: lastReferer
                                        }
                                    })];
                            case 3:
                                _c.sent();
                                return [2 /*return*/, {
                                        token: jsonwebtoken_1.sign(__assign(__assign({}, lodash_1.omit.apply(void 0, __spreadArrays([user], omitFields))), { accessToken: accessToken }), utils_1.APP_SECRET),
                                        user: user
                                    }];
                        }
                    });
                });
            }
        });
        t.field('resetPassword', {
            type: 'AuthPayload',
            args: {
                accountId: schema_1.stringArg(),
                email: schema_1.stringArg({ nullable: false })
            },
            resolve: function (_parent, _a, ctx) {
                var accountId = _a.accountId, email = _a.email;
                return __awaiter(_this, void 0, void 0, function () {
                    var user, newPassword, _b, _c, _d, _e;
                    var _f;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0: return [4 /*yield*/, ctx.prisma.user.findOne({
                                    where: {
                                        accountAndEmail: accountId + "_" + email.toLowerCase()
                                    }
                                })];
                            case 1:
                                user = _g.sent();
                                if (!user) {
                                    throw new Error("No user found for email: " + email);
                                }
                                if (!user.active) {
                                    throw new Error("User is not active.");
                                }
                                newPassword = uuid_1.v4();
                                _c = (_b = ctx.prisma.user).update;
                                _d = {
                                    where: { id: (_f = user.id) !== null && _f !== void 0 ? _f : -1 }
                                };
                                _e = {};
                                return [4 /*yield*/, bcryptjs_1.hash(newPassword, 10)];
                            case 2: return [4 /*yield*/, _c.apply(_b, [(_d.data = (_e.password = _g.sent(),
                                        _e.resetAt = new Date(),
                                        _e),
                                        _d)])];
                            case 3:
                                _g.sent();
                                emailForPasswordReset({ accountName: (accountId || ''), toEmail: email, newPassword: newPassword });
                                return [2 /*return*/, {
                                        token: jsonwebtoken_1.sign(__assign(__assign({}, lodash_1.omit(user, 'id', 'accountAndEmail', 'password')), { accessToken: '' }), utils_1.APP_SECRET),
                                        user: user
                                    }];
                        }
                    });
                });
            }
        });
        t.field('createDraft', {
            type: 'Post',
            args: {
                title: schema_1.stringArg({ nullable: false }),
                content: schema_1.stringArg()
            },
            resolve: function (parent, _a, ctx) {
                var title = _a.title, content = _a.content;
                var userId = utils_1.getUserId(ctx);
                if (!userId)
                    throw new Error('Could not authenticate user.');
                return ctx.prisma.post.create({
                    data: {
                        title: title,
                        content: content,
                        published: false,
                        author: { connect: { id: Number(userId) } }
                    }
                });
            }
        });
        t.field('deletePost', {
            type: 'Post',
            nullable: true,
            args: { id: schema_1.intArg({ nullable: false }) },
            resolve: function (parent, _a, ctx) {
                var id = _a.id;
                return ctx.prisma.post["delete"]({
                    where: {
                        id: id
                    }
                });
            }
        });
        t.field('publish', {
            type: 'Post',
            nullable: true,
            args: { id: schema_1.intArg() },
            resolve: function (parent, _a, ctx) {
                var id = _a.id;
                return ctx.prisma.post.update({
                    where: { id: id !== null && id !== void 0 ? id : -1 },
                    data: { published: true }
                });
            }
        });
    }
});
