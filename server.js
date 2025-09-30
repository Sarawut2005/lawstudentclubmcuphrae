// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(__dirname));

// Helper function to read from the database file
const readDB = () => {
    const dbData = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(dbData);
};

// Helper function to write to the database file
const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- API Endpoints ---

// GET all items of a type (e.g., /api/news)
app.get('/api/:type', (req, res) => {
    const db = readDB();
    const type = req.params.type;
    res.json(db[type] || []);
});

// ADD a new item
app.post('/api/:type', (req, res) => {
    const db = readDB();
    const type = req.params.type;
    const newItem = req.body;
    newItem.id = String(new Date().getTime());
    db[type].push(newItem);
    writeDB(db);
    res.status(201).json(newItem);
});

// UPDATE an item
app.put('/api/:type/:id', (req, res) => {
    const db = readDB();
    const { type, id } = req.params;
    const updatedItemData = req.body;
    db[type] = db[type].map(item => (item.id === id) ? { ...item, ...updatedItemData } : item);
    writeDB(db);
    res.json({ message: 'Item updated successfully' });
});

// DELETE an item
app.delete('/api/:type/:id', (req, res) => {
    const db = readDB();
    const { type, id } = req.params;
    db[type] = db[type].filter(item => item.id !== id);
    writeDB(db);
    res.json({ message: 'Item deleted successfully' });
});

// --- Serve HTML Pages ---
// This makes sure that refreshing any page works correctly
app.get('*', (req, res) => {
    // Check if the request is for a file with an extension (like .css, .js)
    if (path.extname(req.path).length > 0) {
        return res.sendFile(path.join(__dirname, req.path));
    }
    // Otherwise, assume it's a route and send the main HTML file
    // In a more complex app, you might send specific HTML files per route.
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});