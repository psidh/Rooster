"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var index_1 = require("../index");
var words_1 = require("../words");
console.log("Adding stats to README");
// Populate slug count
var combos = index_1.totalUniqueSlugs().toLocaleString("en-US");
var readme = fs_1.default.readFileSync("./scripts/README_TEMPLATE.md", "utf-8");
// Populate categories
function listToUnique(list) {
    var unique = new Set();
    list.forEach(function (_a) {
        var categories = _a.categories;
        categories.forEach(function (category) {
            return unique.add(category);
        });
    });
    return "- " + __spread(unique).sort().join("\n- ");
}
var adjectiveCategories = listToUnique(words_1.wordList.adjective);
var nounCategories = listToUnique(words_1.wordList.noun);
var replaced = readme
    .replace("{{uniqueCombinations}}", combos)
    .replace("{{adjectiveCategories}}", adjectiveCategories)
    .replace("{{nounCategories}}", nounCategories);
// Write final README
fs_1.default.writeFileSync("./README.md", replaced);
