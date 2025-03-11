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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoContextProvider = TodoContextProvider;
exports.useTodoContext = useTodoContext;
const react_1 = __importStar(require("react"));
const uuid_1 = require("uuid");
const TodoContext = (0, react_1.createContext)(undefined);
function TodoContextProvider({ children }) {
    const [todos, setTodos] = (0, react_1.useState)([
        {
            id: '1',
            text: 'Learn React',
            completed: true,
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            priority: 'high'
        },
        {
            id: '2',
            text: 'Build a Todo App',
            completed: false,
            createdAt: new Date(),
            priority: 'medium'
        },
        {
            id: '3',
            text: 'Deploy to production',
            completed: false,
            createdAt: new Date(),
            priority: 'low'
        }
    ]);
    const [filter, setFilter] = (0, react_1.useState)({
        status: 'all',
        priority: 'all',
        sort: 'newest'
    });
    const addTodo = (text, priority = 'low') => {
        const newTodo = {
            id: (0, uuid_1.v4)(),
            text,
            completed: false,
            createdAt: new Date(),
            priority
        };
        setTodos([...todos, newTodo]);
    };
    const toggleTodo = (id) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    };
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    const filteredTodos = (0, react_1.useMemo)(() => {
        return todos
            .filter(todo => {
            const matchesStatus = filter.status === 'all' ||
                (filter.status === 'completed' && todo.completed) ||
                (filter.status === 'active' && !todo.completed);
            const matchesPriority = filter.priority === 'all' ||
                todo.priority === filter.priority;
            return matchesStatus && matchesPriority;
        })
            .sort((a, b) => {
            if (filter.sort === 'newest')
                return b.createdAt.getTime() - a.createdAt.getTime();
            if (filter.sort === 'oldest')
                return a.createdAt.getTime() - b.createdAt.getTime();
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low'];
        });
    }, [todos, filter]);
    const value = {
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
        filter,
        setFilter,
        filteredTodos
    };
    return react_1.default.createElement(TodoContext.Provider, { value: value }, children);
}
function useTodoContext() {
    const context = (0, react_1.useContext)(TodoContext);
    if (context === undefined) {
        throw new Error('useTodoContext must be used within a TodoContextProvider');
    }
    return context;
}
