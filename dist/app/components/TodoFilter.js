"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TodoFilter;
const react_1 = __importDefault(require("react"));
const TodoContext_1 = require("../../context/TodoContext");
function TodoFilter() {
    const { filter, setFilter } = (0, TodoContext_1.useTodoContext)();
    return (react_1.default.createElement("div", { className: "todo-filter" },
        react_1.default.createElement("select", { value: filter.status, onChange: (e) => setFilter({
                ...filter,
                status: e.target.value
            }) },
            react_1.default.createElement("option", { value: "all" }, "All"),
            react_1.default.createElement("option", { value: "completed" }, "Completed"),
            react_1.default.createElement("option", { value: "active" }, "Active")),
        react_1.default.createElement("select", { value: filter.priority, onChange: (e) => setFilter({
                ...filter,
                priority: e.target.value
            }) },
            react_1.default.createElement("option", { value: "all" }, "All Priorities"),
            react_1.default.createElement("option", { value: "high" }, "High"),
            react_1.default.createElement("option", { value: "medium" }, "Medium"),
            react_1.default.createElement("option", { value: "low" }, "Low"))));
}
