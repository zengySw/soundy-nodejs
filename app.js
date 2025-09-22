// app.js - Основной файл приложения
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const validator = require('validator');

const app = express();
const PORT = 3000;

// Настройка middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Настройка сессий
app.use(session({
    secret: 'fghijklmnopqrsHIJKLMYZ01234', // Замените на свой секретный ключ
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Для HTTPS установите в true
}));

const DATA_DIR = path.join(__dirname, 'data', 'UserData');

// Функция для генерации случайного ID
function generateRandomId(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// Функция для создания директории, если она не существует
async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.render('register', { error: '', success: '', formData: {} });
});

// Обработка регистрации
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    let error = '';
    let success = '';

    try {
        // Валидация
        if (!username?.trim() || !password?.trim() || !email?.trim()) {
            error = 'Пожалуйста, заполните все обязательные поля (логин, пароль и почта).';
        } else if (!validator.isEmail(email.trim())) {
            error = 'Введите корректный адрес электронной почты.';
        } else {
            const trimmedUsername = username.trim();
            const jsonFile = path.join(DATA_DIR, `${trimmedUsername}.json`);

            // Проверка существования пользователя
            try {
                await fs.access(jsonFile);
                error = 'Аккаунт с таким логином уже существует!';
            } catch {
                // Файл не существует, можно создавать пользователя
                const id = generateRandomId();
                const userData = {
                    user: {
                        username: trimmedUsername,
                        password: password.trim(), // В реальном приложении используйте хеширование!
                        email: email.trim(),
                        id: id
                    }
                };

                await ensureDirectoryExists(DATA_DIR);
                await fs.writeFile(jsonFile, JSON.stringify(userData, null, 2), 'utf8');
                
                success = `Регистрация успешна!`;
            }
        }
    } catch (err) {
        console.error('Ошибка при регистрации:', err);
        error = 'Ошибка при создании JSON файла.';
    }

    res.render('register', { 
        error, 
        success, 
        formData: { username: username || '', email: email || '' }
    });
});

// Страница входа
app.get('/login', (req, res) => {
    res.render('login', { error: '', formData: {} });
});

// Обработка входа
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let error = '';

    try {
        const jsonFile = path.join(DATA_DIR, 'admin.json'); // или `${username}.json` для конкретного пользователя
        
        try {
            const jsonData = await fs.readFile(jsonFile, 'utf8');
            const userData = JSON.parse(jsonData).user;

            if (username?.trim() === userData.username && password?.trim() === userData.password) {
                req.session.username = username.trim();
                
                // Небольшая задержка как в оригинале
                setTimeout(() => {
                    res.redirect('/');
                }, 1000);
                
                return res.send(`
                    <p style='color:green; text-align: center; margin-top: 50px; font-family: Arial;'>
                        Вход успешен! Добро пожаловать, ${username}.
                    </p>
                    <script>setTimeout(() => window.location.href = '/', 1000);</script>
                `);
            } else {
                error = 'Неверный логин или пароль.';
            }
        } catch (fileErr) {
            error = 'пользователь не найден.';
        }
    } catch (err) {
        console.error('Ошибка при входе:', err);
        error = 'Внутренняя ошибка сервера.';
    }

    res.render('login', { 
        error, 
        formData: { username: username || '' }
    });
});

// Страница удаления пользователя
app.get('/delete-user', (req, res) => {
    res.render('delete-user', { error: '', success: '' });
});

// Обработка удаления пользователя
app.post('/delete-user', async (req, res) => {
    const { email } = req.body;
    let error = '';
    let success = '';

    try {
        if (!email?.trim()) {
            error = 'Введите email для удаления пользователя.';
        } else if (!validator.isEmail(email.trim())) {
            error = 'Введите корректный адрес электронной почты.';
        } else {
            let found = false;
            const trimmedEmail = email.trim();

            try {
                await ensureDirectoryExists(DATA_DIR);
                const files = await fs.readdir(DATA_DIR);

                for (const file of files) {
                    if (path.extname(file) === '.json') {
                        try {
                            const filePath = path.join(DATA_DIR, file);
                            const jsonData = await fs.readFile(filePath, 'utf8');
                            const userData = JSON.parse(jsonData);

                            if (userData.user?.email === trimmedEmail) {
                                await fs.unlink(filePath);
                                success = `Пользователь с email ${trimmedEmail} удалён.`;
                                found = true;
                                break;
                            }
                        } catch (fileErr) {
                            console.error(`Ошибка при чтении файла ${file}:`, fileErr);
                        }
                    }
                }
            } catch (dirErr) {
                console.error('Ошибка при чтении директории:', dirErr);
            }

            if (!found) {
                error = `Пользователь не найден.`;
            }
        }
    } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
        error = 'Внутренняя ошибка сервера.';
    }

    res.render('delete-user', { error, success });
});

// Выход из системы
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Ошибка при выходе:', err);
        }
        res.redirect('/');
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

module.exports = app;