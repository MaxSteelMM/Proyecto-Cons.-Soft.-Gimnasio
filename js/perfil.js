document.addEventListener('DOMContentLoaded', () => {
    const apiBase = `http://${window.location.hostname || 'localhost'}:3000`;
    const authPanel = document.getElementById('auth-panel');
    const accountPanel = document.getElementById('account-panel');
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const registrationMessage = document.getElementById('registration-message');
    const loginMessage = document.getElementById('login-message');
    const historyMessage = document.getElementById('history-message');
    const historyTableBody = document.getElementById('history-table-body');
    const registerTab = document.getElementById('show-register');
    const loginTab = document.getElementById('show-login');

    const request = async (path, options = {}) => {
        let response;
        try {
            response = await fetch(`${apiBase}${path}`, {
                ...options,
                credentials: 'include',
                headers: {
                    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                    ...options.headers
                }
            });
        } catch {
            throw new Error('No se pudo conectar con la API. Iniciá el servidor con npm start.');
        }

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || `El servidor respondió ${response.status}.`);
        }
        return result;
    };

    const showForm = (form) => {
        const registering = form === 'register';
        registrationForm.hidden = !registering;
        loginForm.hidden = registering;
        registerTab.setAttribute('aria-pressed', String(registering));
        loginTab.setAttribute('aria-pressed', String(!registering));
        registerTab.classList.toggle('btn-secondary', !registering);
        loginTab.classList.toggle('btn-secondary', registering);
        registrationMessage.textContent = '';
        loginMessage.textContent = '';
    };

    const displayHistory = (purchases) => {
        historyTableBody.replaceChildren();
        if (purchases.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'Todavía no tenés compras registradas.';
            row.append(cell);
            historyTableBody.append(row);
            return;
        }

        purchases.forEach((purchase) => {
            const row = document.createElement('tr');
            const values = [
                String(purchase.fecha).slice(0, 10),
                purchase.producto,
                String(purchase.cantidad),
                formatPrice(purchase.precio_unitario),
                formatPrice(purchase.total)
            ];
            values.forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });
            historyTableBody.append(row);
        });
    };

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(Number(price));

    const showAccount = async (user) => {
        authPanel.hidden = true;
        accountPanel.hidden = false;
        document.getElementById('account-title').textContent = `Hola, ${user.nombre}`;
        document.getElementById('account-email').textContent = user.email || '—';
        document.getElementById('account-contact').textContent = user.contacto || '—';
        document.getElementById('account-address').textContent = user.direccion || '—';
        document.getElementById('account-date').textContent =
            user.fecha_registro ? String(user.fecha_registro).slice(0, 10) : '—';
        historyMessage.textContent = 'Cargando historial...';
        try {
            const purchases = await request('/auth/purchases');
            if (!Array.isArray(purchases)) {
                throw new Error('El servidor devolvió un historial no válido.');
            }
            displayHistory(purchases);
            historyMessage.textContent = '';
        } catch (error) {
            historyMessage.textContent = error.message;
        }
    };

    const loadSession = async () => {
        try {
            const session = await request('/auth/session');
            if (session.authenticated && session.user) {
                await showAccount(session.user);
            }
        } catch (error) {
            (loginForm.hidden ? registrationMessage : loginMessage).textContent = error.message;
        }
    };

    registerTab.addEventListener('click', () => showForm('register'));
    loginTab.addEventListener('click', () => showForm('login'));

    registrationForm.addEventListener('reset', () => {
        registrationMessage.textContent = '';
    });

    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        registrationMessage.textContent = '';
        const submitButton = registrationForm.querySelector('[type="submit"]');
        const password = document.getElementById('new-password').value;
        if (password !== document.getElementById('confirm-password').value) {
            registrationMessage.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        submitButton.disabled = true;
        const details = Object.fromEntries(new FormData(registrationForm).entries());
        try {
            await request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(details)
            });
            const session = await request('/auth/session');
            if (!session.authenticated || !session.user) {
                throw new Error('La cuenta se creó, pero no se pudo iniciar la sesión.');
            }
            registrationForm.reset();
            await showAccount(session.user);
        } catch (error) {
            registrationMessage.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.textContent = '';
        const submitButton = loginForm.querySelector('[type="submit"]');
        submitButton.disabled = true;
        const credentials = Object.fromEntries(new FormData(loginForm).entries());
        try {
            await request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });
            loginForm.reset();
            const session = await request('/auth/session');
            if (!session.authenticated || !session.user) {
                throw new Error('No se pudo recuperar el perfil de la cuenta.');
            }
            await showAccount(session.user);
        } catch (error) {
            loginMessage.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    document.getElementById('logout-button').addEventListener('click', async (event) => {
        const button = event.currentTarget;
        button.disabled = true;
        try {
            await request('/auth/logout', { method: 'POST' });
            historyTableBody.replaceChildren();
            accountPanel.hidden = true;
            authPanel.hidden = false;
            showForm('login');
        } catch (error) {
            historyMessage.textContent = error.message;
        } finally {
            button.disabled = false;
        }
    });

    loadSession();
});
