"use strict";
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
exports.__esModule = true;
exports.Mutation = void 0;
var schema_1 = require("@nexus/schema");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var utils_1 = require("../utils");
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
                    var hashedPassword, user;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, bcryptjs_1.hash(password, 10)];
                            case 1:
                                hashedPassword = _b.sent();
                                return [4 /*yield*/, ctx.prisma.user.create({
                                        data: {
                                            accountId: accountId,
                                            name: name,
                                            email: email,
                                            password: hashedPassword
                                        }
                                    })];
                            case 2:
                                user = _b.sent();
                                return [2 /*return*/, {
                                        token: jsonwebtoken_1.sign({ userId: user.uuid, email: user.email }, utils_1.APP_SECRET),
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
                email: schema_1.stringArg({ nullable: false }),
                password: schema_1.stringArg({ nullable: false })
            },
            resolve: function (_parent, _a, ctx) {
                var email = _a.email, password = _a.password;
                return __awaiter(_this, void 0, void 0, function () {
                    var user, passwordValid;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, ctx.prisma.user.findOne({
                                    where: {
                                        email: email
                                    }
                                })];
                            case 1:
                                user = _b.sent();
                                if (!user) {
                                    throw new Error("No user found for email: " + email);
                                }
                                return [4 /*yield*/, bcryptjs_1.compare(password, user.password)];
                            case 2:
                                passwordValid = _b.sent();
                                if (!passwordValid) {
                                    throw new Error('Invalid password');
                                }
                                return [2 /*return*/, {
                                        token: jsonwebtoken_1.sign({ userId: user.uuid, email: user.email }, utils_1.APP_SECRET),
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
