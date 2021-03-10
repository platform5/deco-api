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
class ModelHelper {
    static fetchTags(model, query, order = 'alpha') {
        return __awaiter(this, void 0, void 0, function* () {
            const sort = order === 'alpha'
                ? { _id: 1 }
                : { counts: -1, _id: 1 };
            const tags = yield model.deco.db.collection(model.deco.collectionName).aggregate([{
                    $match: query.onlyQuery()
                },
                {
                    $project: {
                        tags: 1
                    }
                }, {
                    $match: {
                        "tags.0": { $exists: true }
                    }
                }, {
                    $unwind: {
                        path: "$tags", preserveNullAndEmptyArrays: false
                    }
                }, {
                    $group: {
                        _id: "$tags",
                        tag: { $first: "$tags" },
                        count: { $sum: 1 }
                    }
                }, {
                    $sort: sort
                }]).toArray();
            return tags;
        });
    }
}
exports.ModelHelper = ModelHelper;
//# sourceMappingURL=model.helper.js.map