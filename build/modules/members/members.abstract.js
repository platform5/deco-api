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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../");
const members_controller_1 = require("./members.controller");
class Members extends __1.Model {
    constructor() {
        super(...arguments);
        this.superAdminRole = 'manager';
        // DO NOT DECORATE
        // Decoarting the property in the base class can corrupt the inherited classes
        // Please use the model_types property in type-decorator.ts to set the main class type properties
        this.roles = {};
        // DO NOT DECORATE
        // Decoarting the property in the base class can corrupt the inherited classes
        // Please use the model_types property in type-decorator.ts to set the main class type properties
        this.members = [];
    }
    actions() {
        return [];
    }
    toDocument(operation, properties = []) {
        return super.toDocument(operation, properties).then((query) => {
            if (!this.members || this.members.length === 0) {
                if (!this.response.locals.user) {
                    throw new Error('Access denied');
                }
                const members = [{
                        userId: this.response.locals.user._id,
                        roles: [this.superAdminRole]
                    }];
                query.set('members', members);
            }
            else {
                query.set('members', this.members);
            }
            query.set('roles', this.roles);
            return query;
        });
    }
    static instanceFromDocument(document, options = { keepCopyOriginalValues: false }) {
        return super.instanceFromDocument(document, options).then((instance) => {
            instance.set('members', document.members);
            instance.set('roles', document.roles);
            return instance;
        });
    }
    static fetchUserActionsWithElementId(addPolicyForActions) {
        return (req, res, next) => {
            if (!req.params.elementId) {
                res.locals.userAction = [];
                return next();
            }
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const instance = yield this.getOneWithId(req.params.elementId);
                    res.locals.instance = instance;
                    resolve(null);
                }
                catch (error) {
                    reject(error);
                }
            })).catch(next).then(() => {
                members_controller_1.MembersController.fetchUserActions('instance', addPolicyForActions)(req, res, next);
            });
        };
    }
}
exports.Members = Members;
//# sourceMappingURL=members.abstract.js.map