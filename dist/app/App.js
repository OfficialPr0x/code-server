"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importStar(require("react"));
const TodoContext_1 = require("../context/TodoContext");
const TodoFilter_1 = __importDefault(require("./components/TodoFilter"));
const TodoItem_1 = __importDefault(require("./components/TodoItem"));
const TodoContext_2 = require("../context/TodoContext");
function TodoList() {
    const { filteredTodos, addTodo } = (0, TodoContext_2.useTodoContext)();
    const [newTodoText, setNewTodoText] = (0, react_1.useState)('');
    const [priority, setPriority] = (0, react_1.useState)('low');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTodoText.trim()) {
            addTodo(newTodoText, priority);
            setNewTodoText('');
            setPriority('low');
        }
    };
    return (react_1.default.createElement("div", { className: "todo-app" },
        react_1.default.createElement("h1", null, "Todo App"),
        react_1.default.createElement("form", { onSubmit: handleSubmit, className: "todo-form" },
            react_1.default.createElement("input", { type: "text", value: newTodoText, onChange: (e) => setNewTodoText(e.target.value), placeholder: "Add a new todo...", className: "todo-input" }),
            react_1.default.createElement("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "priority-select" },
                react_1.default.createElement("option", { value: "low" }, "Low"),
                react_1.default.createElement("option", { value: "medium" }, "Medium"),
                react_1.default.createElement("option", { value: "high" }, "High")),
            react_1.default.createElement("button", { type: "submit", className: "add-btn" }, "Add")),
        react_1.default.createElement(TodoFilter_1.default, null),
        react_1.default.createElement("div", { className: "todo-list" }, filteredTodos.length === 0 ? (react_1.default.createElement("div", { className: "empty-state" }, "No todos found")) : (filteredTodos.map(todo => (react_1.default.createElement(TodoItem_1.default, { key: todo.id, todo: todo })))))));
}
function App() {
    return (react_1.default.createElement(TodoContext_1.TodoContextProvider, null,
        react_1.default.createElement(TodoList, null)));
}
