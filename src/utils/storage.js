const SELECTION_KEY = 'tokyoSelections';
const COMPLETION_KEY = 'tokyoCompletions';
const USER_NAME_KEY = 'userName';
const USER_DEV_KEY = 'userDeviation';
export function loadSelections() {
    try {
        const raw = localStorage.getItem(SELECTION_KEY);
        return raw ? JSON.parse(raw) : {};
    }
    catch {
        return {};
    }
}
export function saveSelections(sel) {
    localStorage.setItem(SELECTION_KEY, JSON.stringify(sel));
}
export function loadCompletions() {
    try {
        const raw = localStorage.getItem(COMPLETION_KEY);
        return raw ? JSON.parse(raw) : {};
    }
    catch {
        return {};
    }
}
export function saveCompletions(map) {
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(map));
}
export function schoolKey(record) {
    return `${record.examDate}__${record.schoolName}`;
}
export function loadUserName() {
    try {
        return localStorage.getItem(USER_NAME_KEY) || 'シア';
    }
    catch {
        return 'シア';
    }
}
export function saveUserName(name) {
    localStorage.setItem(USER_NAME_KEY, name);
}
export function loadUserDeviation() {
    try {
        const v = localStorage.getItem(USER_DEV_KEY);
        return v ? parseInt(v, 10) || 60 : 60;
    }
    catch {
        return 60;
    }
}
export function saveUserDeviation(dev) {
    localStorage.setItem(USER_DEV_KEY, String(dev));
}
