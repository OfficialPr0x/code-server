"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const TodoContext_1 = require("../../context/TodoContext");
function TodoItem({ todo }) {
    const { toggleTodo, deleteTodo } = (0, TodoContext_1.useTodoContext)();
    return (react_1.default.createElement("div", { className: `todo-item ${todo.completed ? 'completed' : ''} ${todo.priority || 'low'}` },
        react_1.default.createElement("div", { className: "todo-info" },
            react_1.default.createElement("input", { type: "checkbox", checked: todo.completed, onChange: () => toggleTodo(todo.id) }),
            react_1.default.createElement("div", { className: "todo-text" },
                react_1.default.createElement("span", null, todo.text),
                react_1.default.createElement("div", { className: "todo-meta" },
                    react_1.default.createElement("span", { className: "priority" }, todo.priority),
                    react_1.default.createElement("span", { className: "date" }, new Date(todo.createdAt).toLocaleDateString())))),
        react_1.default.createElement("div", { className: "todo-actions" },
            react_1.default.createElement("button", { onClick: () => deleteTodo(todo.id), className: "delete-btn" }, "\uD83D\uDDD1\uFE0F"))));
}
exports.default = TodoItem;
