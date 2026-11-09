document.addEventListener('DOMContentLoaded', () => {
    const apiBase = `http://${window.location.hostname}:3000`;
    const loginPanel = document.getElementById('login-panel');
    const managementPanel = document.getElementById('management-panel');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const productForm = document.getElementById('product-form');
    const productMessage = document.getElementById('product-message');
    const inventoryMessage = document.getElementById('inventory-message');
    const productsTableBody = document.getElementById('products-table-body');
    const providerSelect = document.getElementById('product-provider');
    const productId = document.getElementById('product-id');
    const productFormTitle = document.getElementById('product-form-title');
    const saveProductButton = document.getElementById('save-product');
    const cancelEditButton = document.getElementById('cancel-edit');
    let products = [];

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
        } catch (error) {
            throw new Error('No se pudo conectar con la API. Iniciá MySQL y el servidor con npm start; verificá las credenciales DB_* del archivo .env.');
        }

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(result.error || `El servidor respondió ${response.status}.`);
        }
        return result;
    };

    const showLogin = () => {
        loginPanel.hidden = false;
        managementPanel.hidden = true;
    };

    const showManagement = (username) => {
        loginPanel.hidden = true;
        managementPanel.hidden = false;
        document.getElementById('admin-username').textContent = username;
    };

    const setInventoryMessage = (message) => {
        inventoryMessage.textContent = message;
    };

    const makeActionButton = (label, action, productIdValue, secondary = false) => {
        const button = document.createElement('button');
        button.className = `admin-button ${secondary ? 'admin-button-secondary' : 'admin-button-primary'}`;
        button.type = 'button';
        button.textContent = label;
        button.dataset.action = action;
        button.dataset.productId = String(productIdValue);
        return button;
    };

    const renderProducts = () => {
        productsTableBody.replaceChildren();
        if (products.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'Todavía no hay productos registrados.';
            row.append(cell);
            productsTableBody.append(row);
            return;
        }

        products.forEach((product) => {
            const row = document.createElement('tr');
            const values = [
                product.nombre,
                new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 2
                }).format(Number(product.precio)),
                String(product.stock),
                product.categoria || '—',
                product.proveedor || 'Sin proveedor'
            ];
            values.forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            });

            const actionsCell = document.createElement('td');
            const actions = document.createElement('div');
            actions.className = 'admin-row-actions';
            actions.append(
                makeActionButton('Editar', 'edit', product.id_producto, true),
                makeActionButton('Eliminar', 'delete', product.id_producto)
            );
            actionsCell.append(actions);
            row.append(actionsCell);
            productsTableBody.append(row);
        });
    };

    const loadProducts = async () => {
        setInventoryMessage('Cargando productos...');
        try {
            const [catalog, providers] = await Promise.all([
                request('/productos'),
                request('/proveedores')
            ]);
            if (!Array.isArray(catalog) || !Array.isArray(providers)) {
                throw new Error('El servidor devolvió datos de inventario no válidos.');
            }
            products = catalog.map((product) => ({
                ...product,
                id_producto: Number(product.id_producto),
                id_proveedor: product.id_proveedor === null ? null : Number(product.id_proveedor),
                precio: Number(product.precio),
                stock: Number(product.stock)
            }));

            const selectedProvider = providerSelect.value;
            providerSelect.replaceChildren(new Option('Sin proveedor', ''));
            providers.forEach((provider) => {
                providerSelect.add(new Option(provider.nombre_empresa, String(provider.id_proveedor)));
            });
            providerSelect.value = selectedProvider;
            renderProducts();
            setInventoryMessage('');
        } catch (error) {
            setInventoryMessage(error.message);
        }
    };

    const clearProductForm = () => {
        productForm.reset();
        productId.value = '';
        productFormTitle.textContent = 'Agregar producto';
        saveProductButton.textContent = 'Agregar producto';
        cancelEditButton.hidden = true;
        productMessage.textContent = '';
    };

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.textContent = '';
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        try {
            const result = await request('/admin/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })
            });
            loginForm.reset();
            showManagement(result.username);
            await loadProducts();
        } catch (error) {
            loginMessage.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    document.getElementById('logout-button').addEventListener('click', async (event) => {
        event.currentTarget.disabled = true;
        try {
            await request('/admin/logout', { method: 'POST' });
            clearProductForm();
            showLogin();
        } catch (error) {
            setInventoryMessage(error.message);
        } finally {
            event.currentTarget.disabled = false;
        }
    });

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        productMessage.textContent = '';
        saveProductButton.disabled = true;
        const product = {
            nombre: document.getElementById('product-name').value,
            precio: document.getElementById('product-price').valueAsNumber,
            stock: document.getElementById('product-stock').valueAsNumber,
            categoria: document.getElementById('product-category').value,
            id_proveedor: providerSelect.value ? Number(providerSelect.value) : null
        };
        const editingId = productId.value;

        try {
            const result = editingId
                ? await request(`/productos/${encodeURIComponent(editingId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(product)
                })
                : await request('/productos', {
                    method: 'POST',
                    body: JSON.stringify(product)
                });
            clearProductForm();
            productMessage.textContent = result.mensaje;
            await loadProducts();
        } catch (error) {
            productMessage.textContent = error.message;
        } finally {
            saveProductButton.disabled = false;
        }
    });

    cancelEditButton.addEventListener('click', clearProductForm);

    productsTableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const id = Number(button.dataset.productId);
        const product = products.find((entry) => entry.id_producto === id);
        if (!product) return;

        if (button.dataset.action === 'edit') {
            productId.value = String(product.id_producto);
            document.getElementById('product-name').value = product.nombre;
            document.getElementById('product-price').value = String(product.precio);
            document.getElementById('product-stock').value = String(product.stock);
            document.getElementById('product-category').value = product.categoria || '';
            providerSelect.value = product.id_proveedor === null ? '' : String(product.id_proveedor);
            productFormTitle.textContent = `Editar producto #${product.id_producto}`;
            saveProductButton.textContent = 'Guardar cambios';
            cancelEditButton.hidden = false;
            productMessage.textContent = '';
            document.getElementById('product-name').focus();
            return;
        }

        if (!window.confirm(`¿Eliminar "${product.nombre}" del catálogo?`)) return;
        button.disabled = true;
        setInventoryMessage('');
        try {
            const result = await request(`/productos/${encodeURIComponent(product.id_producto)}`, {
                method: 'DELETE'
            });
            if (productId.value === String(product.id_producto)) clearProductForm();
            productMessage.textContent = result.mensaje;
            await loadProducts();
        } catch (error) {
            setInventoryMessage(error.message);
            button.disabled = false;
        }
    });

    request('/admin/session')
        .then(async (result) => {
            if (!result.authenticated) return;
            showManagement(result.username);
            await loadProducts();
        })
        .catch((error) => {
            loginMessage.textContent = error.message;
        });
});
