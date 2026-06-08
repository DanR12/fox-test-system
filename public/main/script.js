const AUTH_KEY = 'admin_authorized';

// 1. Перевірка: чи ми вже в системі?
function isAuthorized() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

// 2. Універсальна авторизація (запитує пароль тільки якщо треба)
async function ensureAdminAccess() {
    if (isAuthorized()) return true;

    const pass = prompt("Введіть пароль адміністратора:");
    if (!pass) return false;

    try {
        const res = await fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });

        if (res.ok) {
            localStorage.setItem(AUTH_KEY, 'true');
            return true;
        } else {
            alert("❌ Невірний пароль!");
            return false;
        }
    } catch (err) {
        alert("Помилка зв'язку з сервером.");
        return false;
    }
}

// --- ФУНКЦІЇ КНОПОК ---

async function openCreator() {
    if (await ensureAdminAccess()) {
        window.location.href = 'create.html';
    }
}

async function openAdmin() {
    if (await ensureAdminAccess()) {
        window.location.href = 'admin.html';
    }
}

async function openEditor() {
    // Тепер спочатку перевіряємо доступ через нашу функцію ensureAdminAccess
    if (await ensureAdminAccess()) {
        window.location.href = 'edit.html';
    }
}

async function deleteTest() {
    if (await ensureAdminAccess()) {
        const code = prompt("Введіть КОД тесту для ПОВНОГО видалення:").toUpperCase();
        if (!code) return;

        if (confirm(`Ви впевнені, що хочете видалити тест ${code}?`)) {
            const res = await fetch('/api/delete-test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ code, password: "admin123" }) // Пароль береться з сервера
            });

            if (res.ok) {
                alert("🗑️ Тест видалено успішно!");
                location.reload();
            } else {
                alert("❌ Помилка видалення.");
            }
        }
    }
}

function logoutAdmin() {
    localStorage.removeItem(AUTH_KEY);
    alert("Ви вийшли з режиму адміністратора.");
    location.reload();
}

// --- ЛОГІКА СТУДЕНТА ---

async function checkCode() {
    const code = document.getElementById('test-code').value.trim().toUpperCase();
    const name = document.getElementById('student-name').value.trim();
    const surname = document.getElementById('student-surname').value.trim();

    if (!code || !name || !surname) {
        alert("Будь ласка, заповніть усі поля!");
        return;
    }

    const res = await fetch(`/api/check-code/${code}`);
    const data = await res.json();

    if (data.exists) {
        window.location.href = `test.html?code=${code}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}`;
    } else {
        document.getElementById('msg').innerText = "❌ Код тесту не знайдено!";
    }
}