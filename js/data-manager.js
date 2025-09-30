// js/data-manager.js (เวอร์ชันสมบูรณ์)
const dataManager = (function() {
    const KEYS = {
        news: 'law_club_news',
        activities: 'law_club_activities',
        announcements: 'law_club_announcements',
        committee: 'law_club_committee',
        downloads: 'law_club_downloads'
    };
    const initialData = {
        news: [],
        activities: [],
        announcements: [],
        committee: [],
        downloads: []
    };
    function init() {
        for (const key in KEYS) {
            if (!localStorage.getItem(KEYS[key])) {
                localStorage.setItem(KEYS[key], JSON.stringify(initialData[key]));
            }
        }
    }
    function getData(type) {
        const key = KEYS[type];
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    function saveData(type, data) {
        localStorage.setItem(KEYS[type], JSON.stringify(data));
    }
    function addItem(type, item) {
        const data = getData(type);
        item.id = String(new Date().getTime());
        data.push(item);
        saveData(type, data);
    }
    function updateItem(type, id, updatedItem) {
        let data = getData(type);
        data = data.map(item => (item.id === id) ? { ...item, ...updatedItem } : item);
        saveData(type, data);
    }
    function findItemById(type, id) {
        return getData(type).find(item => item.id === id);
    }
    function deleteItem(type, id) {
        let data = getData(type).filter(item => item.id !== id);
        saveData(type, data);
    }
    init();
    return { getData, addItem, updateItem, deleteItem, findItemById };
})();