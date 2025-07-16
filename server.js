const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'database.json');

// Middleware do obsługi danych JSON
app.use(express.json());
// Middleware do serwowania plików statycznych (naszego frontendu)
app.use(express.static(__dirname));

// Funkcja do odczytu bazy danych
const readDB = () => {
    const dbRaw = fs.readFileSync(DB_PATH);
    return JSON.parse(dbRaw);
};

// Funkcja do zapisu do bazy danych
const writeDB = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// === API ENDPOINTS ===

// Pobierz wszystkie produkty
app.get('/api/products', (req, res) => {
    const db = readDB();
    res.json(db.products);
});

// Pobierz wszystkich użytkowników
app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json(db.users);
});

// Pobierz wszystkie zamówienia
app.get('/api/orders', (req, res) => {
    const db = readDB();
    res.json(db.orders);
});

// Zapisz nowe zamówienie
app.post('/api/orders', (req, res) => {
    const db = readDB();
    const newOrder = {
        id: Date.now(), // Unikalne ID na podstawie czasu
        date: new Date().toISOString(),
        items: req.body.items,
        totalPrice: req.body.totalPrice,
        user: req.body.user
    };
    db.orders.push(newOrder);
    writeDB(db);
    res.status(201).json({ message: 'Zamówienie zapisane!', order: newOrder });
});

// Dodaj nowego użytkownika (z panelu admina)
app.post('/api/users', (req, res) => {
    const db = readDB();
    const newUser = req.body;

    if (db.users.some(u => u.login === newUser.login)) {
        return res.status(409).json({ message: 'Login jest już zajęty.' });
    }
    
    db.users.push(newUser);
    writeDB(db);
    res.status(201).json({ message: 'Użytkownik dodany!', user: newUser });
});


app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});