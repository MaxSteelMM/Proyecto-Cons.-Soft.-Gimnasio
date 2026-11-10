document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const productsMessage = document.getElementById('products-message');
    const productsCount = document.getElementById('products-count');
    const categoryList = document.getElementById('category-list');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('nav-search');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const inStockOnly = document.getElementById('in-stock-only');
    const favoritesOnly = document.getElementById('favorites-only');
    const favoritesToggle = document.getElementById('favorites-toggle');
    const favoritesCount = document.getElementById('favorites-count');
    const sortSelect = document.getElementById('sort-products');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-btn');
    const checkoutSection = document.getElementById('checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutError = document.getElementById('checkout-error');
    const checkoutSteps = Array.from(document.querySelectorAll('.checkout-step'));
    const addressStep = checkoutSteps.find((fieldset) => fieldset.dataset.step === '3');
    const checkoutBack = document.getElementById('checkout-back');
    const checkoutCancel = document.getElementById('checkout-cancel');
    const checkoutNext = document.getElementById('checkout-next');
    const confirmOrder = document.getElementById('confirm-order');
    const orderConfirmation = document.getElementById('order-confirmation');
    const productDialog = document.getElementById('product-dialog');
    const detailContent = document.getElementById('detail-content');
    const toast = document.getElementById('toast');
    const cart = new Map();
    const favorites = new Set();
    const cartStorageKey = 'gym-mls-cart';
    const favoritesStorageKey = 'gym-mls-favorites';
    const imageAssets = {
        clothing: {
            src: 'Img/productos/remera-deportiva.jpg',
            alt: 'Persona usando una remera de entrenamiento',
            source: 'https://commons.wikimedia.org/wiki/File:Beige-t-shirt-front.jpg',
            credit: 'Jonnybigbig',
            license: 'CC BY-SA 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
        },
        supplement: {
            src: 'Img/productos/suplemento-proteina.jpg',
            alt: 'Envase de suplemento de proteína',
            source: 'https://commons.wikimedia.org/wiki/File:Bodybuilding_supplement_high_protein_drink_mix_700g.jpg',
            credit: 'Mike1024',
            license: 'Dominio público'
        },
        weights: {
            src: 'Img/productos/mancuernas-gimnasio.jpg',
            alt: 'Persona entrenando con una mancuerna en el gimnasio',
            source: 'https://commons.wikimedia.org/wiki/File:Close-up_Hand_holding_dumbbell_in_gym.jpg',
            credit: 'Nenad Stojkovic',
            license: 'CC BY 2.0',
            licenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
        },
        barbell: {
            src: 'Img/productos/barra-olimpica.jpg',
            alt: 'Barra de pesas preparada para un ejercicio de hombros',
            source: 'https://commons.wikimedia.org/wiki/File:Watch_me_lift_(5048019).jpg',
            credit: 'Airman 1st Class Jovante Johnson / U.S. Air Force',
            license: 'Dominio público'
        },
        resistanceBands: {
            src: 'Img/productos/bandas-elasticas.png',
            alt: 'Ilustración de un ejercicio con bandas elásticas de resistencia',
            source: 'https://commons.wikimedia.org/wiki/File:Back-flyes-with-resistance-bands-1.png',
            credit: 'Everkinetic',
            license: 'CC BY-SA 3.0',
            licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/'
        },
        accessories: {
            src: 'Img/productos/cuerda-saltar.jpg',
            alt: 'Cuerda para saltar junto a otros accesorios de entrenamiento',
            source: 'https://commons.wikimedia.org/wiki/File:Exercise_equipment_(rubber_ball,_light-weight_dumbbells,_jump_rope).jpg',
            credit: 'CDC / Debora Cartagena',
            license: 'Dominio público'
        }
    };
    const descriptions = {
        indumentaria: 'Prendas cómodas y resistentes para acompañar tus entrenamientos.',
        suplementos: 'Suplementación deportiva para complementar tu rutina.',
        equipamiento: 'Elementos confiables para entrenar en el gimnasio o en casa.',
        accesorios: 'Accesorios prácticos para sumar variedad a tu entrenamiento.'
    };
    let products = [];
    let searchTerm = '';
    let checkoutStep = 1;
    let toastTimer;
    let pendingCheckout = null;
    let checkoutBlocked = false;
    let catalogLoadError = '';
    let catalogReady = false;
    const apiBase = 'http://localhost:3000';

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(price);

    const categoryKey = (category) => (category || '').trim().toLocaleLowerCase('es');

    const getImage = (product) => {
        const productImage = window.GymProductImages?.get(product);
        if (productImage) return productImage;

        const description = `${product.categoria || ''} ${product.nombre}`.toLocaleLowerCase('es');
        if (/ropa|indumentaria|remera|camiseta|legging|calza|short|clothing/.test(description)) {
            return imageAssets.clothing;
        }
        if (/suplement|prote[ií]na|creatina|whey/.test(description)) {
            return imageAssets.supplement;
        }
        if (/banda|el[aá]stica|resistencia/.test(description)) {
            return imageAssets.resistanceBands;
        }
        if (/cuerda|saltar|accesorios|botella|guantes|colchoneta/.test(description)) {
            return imageAssets.accessories;
        }
        if (/barra|discos|ol[ií]mpic/.test(description)) {
            return imageAssets.barbell;
        }
        return imageAssets.weights;
    };

    const describeProduct = (product) => {
        const key = categoryKey(product.categoria);
        return descriptions[key] || `Producto seleccionado para acompañar tu entrenamiento${product.categoria ? ` de ${product.categoria.toLocaleLowerCase('es')}` : ''}.`;
    };

    const getPrice = (product) => Number(product.precio);

    const requestJson = async (url, options) => {
        let response;
        try {
            response = await fetch(`${apiBase}${url}`, options);
        } catch (error) {
            error.isNetworkError = true;
            throw error;
        }

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(result.error || `El servidor respondió ${response.status}.`);
            error.status = response.status;
            throw error;
        }
        return result;
    };

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
    };

    const setOrderLocked = (locked) => {
        document.getElementById('productos').inert = locked;
        document.getElementById('carrito').inert = locked;
    };

    const saveCart = () => {
        try {
            localStorage.setItem(cartStorageKey, JSON.stringify({
                items: Array.from(cart, ([id, item]) => ({ id, cantidad: item.cantidad }))
            }));
        } catch (error) {
            showToast('No se pudo guardar el carrito en este navegador.');
            console.error('No se pudo guardar el carrito:', error);
        }
    };

    const restoreCart = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(cartStorageKey) || '{}');
            if (!stored || !Array.isArray(stored.items)) return;
            stored.items.forEach((item) => {
                const id = Number(item.id);
                const cantidad = Number(item.cantidad);
                if (Number.isInteger(id) && Number.isInteger(cantidad) && cantidad > 0) {
                    cart.set(id, { cantidad });
                }
            });
        } catch (error) {
            try {
                localStorage.removeItem(cartStorageKey);
            } catch (storageError) {
                console.error('No se pudo limpiar el carrito guardado:', storageError);
            }
            showToast('El carrito guardado estaba dañado y se limpió.');
            console.error('No se pudo recuperar el carrito:', error);
        }
    };

    const saveFavorites = () => {
        try {
            localStorage.setItem(favoritesStorageKey, JSON.stringify(Array.from(favorites)));
        } catch (error) {
            console.error('No se pudieron guardar los favoritos:', error);
            showToast('No se pudieron guardar los favoritos en este navegador.');
        }
    };

    const restoreFavorites = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(favoritesStorageKey) || '[]');
            if (!Array.isArray(stored)) {
                throw new Error('El formato guardado no es una lista.');
            }
            stored.forEach((value) => {
                const id = Number(value);
                if (Number.isSafeInteger(id) && id > 0) favorites.add(id);
            });
        } catch (error) {
            console.error('No se pudieron recuperar los favoritos:', error);
            try {
                localStorage.removeItem(favoritesStorageKey);
            } catch (storageError) {
                console.error('No se pudieron limpiar los favoritos guardados:', storageError);
            }
            showToast('Los favoritos guardados no eran válidos y se limpiaron.');
        }
    };

    const renderFavoritesCount = () => {
        favoritesCount.textContent = String(favorites.size);
        favoritesToggle.setAttribute('aria-pressed', String(favoritesOnly.checked));
        favoritesToggle.setAttribute(
            'aria-label',
            `${favoritesOnly.checked ? 'Mostrar todos los productos' : 'Filtrar por favoritos'}, ${favorites.size} guardados`
        );
    };

    const toggleFavorite = (id) => {
        if (favorites.has(id)) {
            favorites.delete(id);
            showToast('Producto quitado de tus guardados.');
        } else {
            favorites.add(id);
            showToast('Producto guardado en tus favoritos.');
        }
        saveFavorites();
        renderFavoritesCount();
        renderProducts();
    };

    const getVisibleProducts = () => {
        const category = categoryFilter.value;
        const min = minPriceInput.value === '' ? null : Number(minPriceInput.value);
        const max = maxPriceInput.value === '' ? null : Number(maxPriceInput.value);
        const filtered = products.filter((product) => {
            const matchesSearch = `${product.nombre} ${product.categoria || ''} ${describeProduct(product)}`
                .toLocaleLowerCase('es')
                .includes(searchTerm);
            const matchesCategory = !category || categoryKey(product.categoria) === category;
            const price = getPrice(product);
            const matchesMin = min === null || price >= min;
            const matchesMax = max === null || price <= max;
            const matchesStock = !inStockOnly.checked || Number(product.stock) > 0;
            const matchesFavorites = !favoritesOnly.checked || favorites.has(Number(product.id_producto));
            return matchesSearch && matchesCategory && matchesMin && matchesMax &&
                matchesStock && matchesFavorites;
        });

        if (sortSelect.value === 'price-asc') filtered.sort((a, b) => getPrice(a) - getPrice(b));
        if (sortSelect.value === 'price-desc') filtered.sort((a, b) => getPrice(b) - getPrice(a));
        if (sortSelect.value === 'name') {
            filtered.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
        }
        return filtered;
    };

    const appendImageCredit = (container, image) => {
        if (!image.source) return;
        const credit = document.createElement('p');
        credit.className = 'image-credit';
        const source = document.createElement('a');
        source.href = image.source;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = `Foto: ${image.credit}`;
        credit.append(source);
        credit.append(document.createTextNode(` — ${image.license}`));
        if (image.licenseUrl) {
            const license = document.createElement('a');
            license.href = image.licenseUrl;
            license.target = '_blank';
            license.rel = 'noopener noreferrer';
            license.textContent = ' (licencia)';
            credit.append(license);
        }
        container.append(credit);
    };

    const appendProductImage = (container, product, className = 'product-image') => {
        const image = getImage(product);
        const wrapper = document.createElement('div');
        wrapper.className = 'product-visual';
        const imageElement = document.createElement('img');
        imageElement.className = className;
        imageElement.src = image.src;
        imageElement.alt = image.alt;
        imageElement.loading = 'lazy';
        wrapper.append(imageElement);
        container.append(wrapper);
        return image;
    };

    const renderCategories = () => {
        const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))];
        categoryFilter.replaceChildren(new Option('Todas', ''));
        categoryList.replaceChildren();

        categories.forEach((category) => {
            const option = new Option(category, categoryKey(category));
            categoryFilter.append(option);

            const card = document.createElement('article');
            card.className = 'category-card';
            const sample = products.find((product) => product.categoria === category);
            card.style.backgroundImage = `url("${getImage(sample).src}")`;
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = category;
            const hint = document.createElement('span');
            const amount = products.filter((product) => product.categoria === category).length;
            hint.textContent = `${amount} producto${amount === 1 ? '' : 's'} · Ver productos`;
            button.append(hint);
            button.addEventListener('click', () => {
                categoryFilter.value = categoryKey(category);
                renderProducts();
                document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
            });
            card.append(button);
            categoryList.append(card);
        });
    };

    const renderProducts = () => {
        const visible = getVisibleProducts();
        productsGrid.replaceChildren();
        productsCount.textContent = `${visible.length} de ${products.length} productos`;
        renderFavoritesCount();

        if (products.length === 0) {
            productsMessage.textContent = catalogLoadError || 'No hay productos disponibles.';
            productsMessage.hidden = false;
            return;
        }
        if (visible.length === 0) {
            productsMessage.textContent = favoritesOnly.checked && favorites.size === 0
                ? 'Todavía no guardaste productos. Marcá el corazón de un producto para encontrarlo acá.'
                : 'No encontramos productos con esos filtros. Probá cambiar los filtros.';
            productsMessage.hidden = false;
            return;
        }
        productsMessage.hidden = true;

        visible.forEach((product) => {
            const card = document.createElement('article');
            card.className = 'product-card';
            const image = appendProductImage(card, product);
            appendImageCredit(card, image);

            const favoriteButton = document.createElement('button');
            favoriteButton.className = 'favorite-toggle';
            favoriteButton.type = 'button';
            favoriteButton.dataset.productId = String(product.id_producto);
            favoriteButton.setAttribute('aria-pressed', String(favorites.has(Number(product.id_producto))));
            favoriteButton.setAttribute(
                'aria-label',
                `${favorites.has(Number(product.id_producto)) ? 'Quitar' : 'Guardar'} ${product.nombre} ${favorites.has(Number(product.id_producto)) ? 'de' : 'en'} favoritos`
            );
            favoriteButton.textContent = favorites.has(Number(product.id_producto)) ? '♥' : '♡';
            card.append(favoriteButton);

            const name = document.createElement('h3');
            name.textContent = product.nombre;
            card.append(name);

            const category = document.createElement('p');
            category.className = 'product-category';
            category.textContent = product.categoria || 'Entrenamiento';
            card.append(category);

            const description = document.createElement('p');
            description.className = 'product-description';
            description.textContent = describeProduct(product);
            card.append(description);

            const stock = document.createElement('p');
            stock.className = 'product-stock';
            stock.textContent = Number(product.stock) > 0
                ? `${product.stock} disponibles`
                : 'Sin stock';
            card.append(stock);

            const priceRow = document.createElement('div');
            priceRow.className = 'product-price-row';
            const price = document.createElement('span');
            price.className = 'product-price';
            price.textContent = formatPrice(getPrice(product));
            priceRow.append(price);
            card.append(priceRow);

            const selected = cart.get(Number(product.id_producto));
            const inCart = document.createElement('p');
            inCart.className = 'product-in-cart';
            inCart.textContent = selected ? `En el carrito: ${selected.cantidad}` : '';
            card.append(inCart);

            const actions = document.createElement('div');
            actions.className = 'product-card-actions';
            const quantity = document.createElement('input');
            quantity.className = 'quantity-input';
            quantity.type = 'number';
            quantity.min = '1';
            quantity.max = String(product.stock);
            quantity.value = Number(product.stock) > 0 ? '1' : '0';
            quantity.disabled = Number(product.stock) <= 0;
            quantity.setAttribute('aria-label', `Cantidad de ${product.nombre}`);
            actions.append(quantity);

            const addButton = document.createElement('button');
            addButton.className = 'button button-primary btn-add';
            addButton.type = 'button';
            addButton.dataset.productId = String(product.id_producto);
            addButton.textContent = Number(product.stock) > 0 ? 'Agregar' : 'Sin stock';
            addButton.disabled = Number(product.stock) <= 0;
            actions.append(addButton);
            card.append(actions);

            const detailsButton = document.createElement('button');
            detailsButton.className = 'details-button';
            detailsButton.type = 'button';
            detailsButton.dataset.productId = String(product.id_producto);
            detailsButton.textContent = 'Ver detalles';
            card.append(detailsButton);
            productsGrid.append(card);
        });
    };

    const renderCart = () => {
        cartItems.replaceChildren();
        let subtotal = 0;
        let totalItems = 0;

        cart.forEach((item, id) => {
            const product = products.find((entry) => Number(entry.id_producto) === id);
            if (!product) return;
            const quantity = item.cantidad;
            const itemSubtotal = getPrice(product) * quantity;
            subtotal += itemSubtotal;
            totalItems += quantity;

            const row = document.createElement('li');
            row.className = 'cart-item';
            const image = document.createElement('img');
            image.className = 'cart-item-image';
            image.src = getImage(product).src;
            image.alt = '';
            row.append(image);

            const name = document.createElement('span');
            name.className = 'cart-item-name';
            name.textContent = product.nombre;
            row.append(name);

            const quantityControl = document.createElement('div');
            quantityControl.className = 'cart-quantity-control';
            const decreaseButton = document.createElement('button');
            decreaseButton.className = 'quantity-stepper';
            decreaseButton.type = 'button';
            decreaseButton.dataset.action = 'decrease';
            decreaseButton.dataset.productId = String(id);
            decreaseButton.disabled = quantity <= 1;
            decreaseButton.setAttribute('aria-label', `Reducir cantidad de ${product.nombre}`);
            decreaseButton.textContent = '−';
            quantityControl.append(decreaseButton);

            const quantityInput = document.createElement('input');
            quantityInput.className = 'cart-quantity';
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.max = String(product.stock);
            quantityInput.value = String(quantity);
            quantityInput.dataset.productId = String(id);
            quantityInput.setAttribute('aria-label', `Cantidad de ${product.nombre}`);
            quantityControl.append(quantityInput);

            const increaseButton = document.createElement('button');
            increaseButton.className = 'quantity-stepper';
            increaseButton.type = 'button';
            increaseButton.dataset.action = 'increase';
            increaseButton.dataset.productId = String(id);
            increaseButton.disabled = quantity >= Number(product.stock);
            increaseButton.setAttribute('aria-label', `Aumentar cantidad de ${product.nombre}`);
            increaseButton.textContent = '+';
            quantityControl.append(increaseButton);
            row.append(quantityControl);

            const itemSubtotalLabel = document.createElement('span');
            itemSubtotalLabel.className = 'cart-item-subtotal';
            itemSubtotalLabel.textContent = formatPrice(itemSubtotal);
            row.append(itemSubtotalLabel);

            const removeButton = document.createElement('button');
            removeButton.className = 'btn-remove';
            removeButton.type = 'button';
            removeButton.dataset.productId = String(id);
            removeButton.textContent = 'Quitar';
            removeButton.setAttribute('aria-label', `Quitar ${product.nombre} del carrito`);
            row.append(removeButton);
            cartItems.append(row);
        });

        cartEmpty.hidden = totalItems > 0;
        cartEmpty.textContent = cart.size > 0 && !catalogReady
            ? 'No se pudo verificar la disponibilidad del carrito. Intentá cargar el catálogo nuevamente.'
            : 'Tu carrito está vacío. ¡Sumá algo para entrenar!';
        cartCount.textContent = String(totalItems);
        cartSubtotal.textContent = formatPrice(subtotal);
        cartTotal.textContent = formatPrice(subtotal);
        checkoutButton.disabled = cart.size === 0 || !catalogReady || Array.from(cart).some(([id, item]) => {
            const product = products.find((entry) => Number(entry.id_producto) === id);
            return !product || item.cantidad > Number(product.stock);
        });
        document.getElementById('empty-cart').disabled = cart.size === 0;
        saveCart();
    };

    const addToCart = (product, quantity) => {
        const id = Number(product.id_producto);
        const existing = cart.get(id)?.cantidad || 0;
        if (!Number.isInteger(quantity) || quantity < 1) {
            showToast('Elegí una cantidad válida.');
            return false;
        }
        if (existing + quantity > Number(product.stock)) {
            showToast(`Solo quedan ${product.stock} unidades de ${product.nombre}.`);
            return false;
        }
        cart.set(id, { cantidad: existing + quantity });
        renderCart();
        renderProducts();
        showToast(`${product.nombre} se agregó al carrito.`);
        return true;
    };

    const openProductDetails = (product) => {
        const image = getImage(product);
        detailContent.replaceChildren();
        const layout = document.createElement('div');
        layout.className = 'detail-layout';
        const picture = document.createElement('img');
        picture.src = image.src;
        picture.alt = image.alt;
        layout.append(picture);

        const copy = document.createElement('div');
        copy.className = 'detail-copy';
        const title = document.createElement('h2');
        title.id = 'detail-name';
        title.textContent = product.nombre;
        copy.append(title);
        appendImageCredit(copy, image);

        const category = document.createElement('p');
        category.textContent = product.categoria || 'Entrenamiento';
        copy.append(category);

        const description = document.createElement('p');
        description.textContent = describeProduct(product);
        copy.append(description);

        const price = document.createElement('p');
        price.className = 'product-price';
        price.textContent = formatPrice(getPrice(product));
        copy.append(price);

        const stock = document.createElement('p');
        stock.textContent = Number(product.stock) > 0 ? `${product.stock} unidades disponibles` : 'Sin stock disponible';
        copy.append(stock);

        const features = document.createElement('ul');
        features.className = 'detail-features';
        [
            'Producto seleccionado para tu rutina.',
            'Disponibilidad sujeta al stock informado.',
            'Consultá las opciones de entrega con el gimnasio.'
        ].forEach((feature) => {
            const item = document.createElement('li');
            item.textContent = feature;
            features.append(item);
        });
        copy.append(features);

        const quantity = document.createElement('input');
        quantity.className = 'quantity-input';
        quantity.type = 'number';
        quantity.min = '1';
        quantity.max = String(product.stock);
        quantity.value = Number(product.stock) > 0 ? '1' : '0';
        quantity.disabled = Number(product.stock) <= 0;
        quantity.setAttribute('aria-label', `Cantidad de ${product.nombre}`);
        copy.append(quantity);

        const addButton = document.createElement('button');
        addButton.className = 'button button-primary';
        addButton.type = 'button';
        addButton.disabled = Number(product.stock) <= 0;
        addButton.textContent = addButton.disabled ? 'Sin stock' : 'Agregar al carrito';
        addButton.addEventListener('click', () => {
            if (addToCart(product, Number(quantity.value))) productDialog.close();
        });
        copy.append(addButton);
        layout.append(copy);
        detailContent.append(layout);
        productDialog.showModal();
    };

    const renderCheckoutSummary = () => {
        const data = new FormData(checkoutForm);
        const summary = document.getElementById('checkout-summary');
        summary.replaceChildren();

        const addSummarySection = (title, lines) => {
            const heading = document.createElement('h3');
            heading.textContent = title;
            summary.append(heading);
            lines.forEach(([label, value]) => {
                if (!value) return;
                const line = document.createElement('p');
                line.className = 'summary-line';
                const labelElement = document.createElement('span');
                labelElement.textContent = label;
                const valueElement = document.createElement('strong');
                valueElement.textContent = value;
                line.append(labelElement, valueElement);
                summary.append(line);
            });
        };

        addSummarySection('Productos', Array.from(cart, ([id, item]) => {
            const product = products.find((entry) => Number(entry.id_producto) === id);
            return product
                ? [`${product.nombre} × ${item.cantidad}`, formatPrice(getPrice(product) * item.cantidad)]
                : null;
        }).filter(Boolean));
        const address = data.get('entrega') === 'domicilio'
            ? `${data.get('calle')} ${data.get('numero')}, ${data.get('ciudad')}, ${data.get('provincia')} (${data.get('codigo_postal')})${data.get('adicional') ? ` · ${data.get('adicional')}` : ''}`
            : 'Retiro en sucursal GYM-MLS · Centro';
        addSummarySection('Comprador', [
            ['Nombre', `${data.get('nombre')} ${data.get('apellido')}`],
            ['Correo', data.get('email')],
            ['Teléfono', data.get('telefono')]
        ]);
        addSummarySection('Entrega y pago', [
            ['Entrega', address],
            ['Pago', 'No se procesa en el sitio; coordiná el pago con el gimnasio.']
        ]);
        addSummarySection('Total', [['Total del pedido', cartTotal.textContent]]);
    };

    const showCheckoutStep = (step) => {
        checkoutStep = step;
        checkoutSteps.forEach((fieldset) => {
            fieldset.hidden = Number(fieldset.dataset.step) !== step;
        });
        document.querySelectorAll('.checkout-progress li').forEach((indicator) => {
            const current = Number(indicator.dataset.progress) === step;
            if (current) indicator.setAttribute('aria-current', 'step');
            else indicator.removeAttribute('aria-current');
        });
        checkoutBack.hidden = step === 1;
        checkoutNext.hidden = step === 5;
        confirmOrder.hidden = step !== 5;
        checkoutError.textContent = '';
        if (step === 5) renderCheckoutSummary();
    };

    const validateCurrentStep = () => {
        const active = checkoutSteps.find((fieldset) => Number(fieldset.dataset.step) === checkoutStep);
        const fields = Array.from(active.querySelectorAll('input, textarea'));
        const invalid = fields.find((input) => !input.checkValidity());
        if (invalid) {
            invalid.reportValidity();
            return false;
        }
        return true;
    };

    const loadProducts = async () => {
        let catalogLoaded = false;
        const notice = document.getElementById('catalog-notice');
        const noticeText = document.getElementById('catalog-notice-text');
        const retryButton = document.getElementById('retry-catalog');
        catalogReady = false;
        retryButton.disabled = true;
        if (products.length === 0) {
            noticeText.textContent = 'Conectando con el catálogo...';
            notice.hidden = false;
        }
        try {
            const result = await requestJson('/productos');
            if (!Array.isArray(result)) {
                throw new Error('La respuesta de productos no tiene el formato esperado.');
            }
            products = result.map((product) => ({
                ...product,
                id_producto: Number(product.id_producto),
                precio: Number(product.precio),
                stock: Number(product.stock)
            }));
            if (products.some((product) =>
                !Number.isInteger(product.id_producto) || product.id_producto <= 0 ||
                !Number.isFinite(product.precio) || product.precio < 0 ||
                !Number.isInteger(product.stock) || product.stock < 0
            )) {
                throw new Error('El catálogo contiene datos de productos inválidos.');
            }
            catalogLoaded = true;
            catalogReady = true;
            catalogLoadError = '';
            notice.hidden = true;
            favorites.forEach((id) => {
                if (!products.some((product) => Number(product.id_producto) === id)) {
                    favorites.delete(id);
                }
            });
            saveFavorites();
        } catch (error) {
            console.error('No se pudo cargar el catálogo de la base de datos:', error);
            products = [];
            catalogLoadError = 'No se pudieron cargar los productos. Verificá la conexión con el servidor e intentá recargar la página.';
            noticeText.textContent = `No se pudo cargar el catálogo desde el servidor. ${error.message}`;
            notice.hidden = false;
        } finally {
            retryButton.disabled = false;
        }

        const availableIds = new Set(products.map((product) => Number(product.id_producto)));
        let removedItems = false;
        if (catalogLoaded) {
            cart.forEach((item, id) => {
                if (!availableIds.has(id)) {
                    cart.delete(id);
                    removedItems = true;
                } else {
                    const product = products.find((entry) => Number(entry.id_producto) === id);
                    if (!product || Number(product.stock) <= 0) {
                        cart.delete(id);
                        removedItems = true;
                    } else {
                        item.cantidad = Math.min(item.cantidad, Number(product.stock));
                    }
                }
            });
        }
        if (removedItems) showToast('Se quitaron del carrito productos que ya no están disponibles.');

        renderCategories();
        renderProducts();
        renderCart();
    };

    productsGrid.addEventListener('click', (event) => {
        const favoriteButton = event.target.closest('.favorite-toggle');
        if (favoriteButton) {
            toggleFavorite(Number(favoriteButton.dataset.productId));
            return;
        }
        const addButton = event.target.closest('.btn-add');
        if (addButton) {
            const id = Number(addButton.dataset.productId);
            const product = products.find((entry) => Number(entry.id_producto) === id);
            const quantityInput = addButton.closest('.product-card-actions').querySelector('.quantity-input');
            if (product && addToCart(product, Number(quantityInput.value))) {
                quantityInput.value = '1';
            }
            return;
        }
        const detailsButton = event.target.closest('.details-button');
        if (detailsButton) {
            const product = products.find(
                (entry) => Number(entry.id_producto) === Number(detailsButton.dataset.productId)
            );
            if (product) openProductDetails(product);
        }
    });

    cartItems.addEventListener('change', (event) => {
        if (!event.target.matches('.cart-quantity')) return;
        const id = Number(event.target.dataset.productId);
        const item = cart.get(id);
        const product = products.find((entry) => Number(entry.id_producto) === id);
        const quantity = Number(event.target.value);
        if (!item || !product || !Number.isInteger(quantity) || quantity < 1 ||
            quantity > Number(product.stock)) {
            showToast('La cantidad debe estar dentro del stock disponible.');
            renderCart();
            return;
        }
        item.cantidad = quantity;
        renderCart();
        renderProducts();
    });

    cartItems.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-remove');
        if (button) {
            cart.delete(Number(button.dataset.productId));
            renderCart();
            renderProducts();
            showToast('Producto quitado del carrito.');
            return;
        }

        const stepper = event.target.closest('.quantity-stepper');
        if (!stepper || stepper.disabled) return;
        const id = Number(stepper.dataset.productId);
        const item = cart.get(id);
        const product = products.find((entry) => Number(entry.id_producto) === id);
        if (!item || !product) return;
        const change = stepper.dataset.action === 'increase' ? 1 : -1;
        const nextQuantity = item.cantidad + change;
        if (nextQuantity < 1 || nextQuantity > Number(product.stock)) return;
        item.cantidad = nextQuantity;
        renderCart();
        renderProducts();
    });

    document.getElementById('empty-cart').addEventListener('click', () => {
        cart.clear();
        renderCart();
        renderProducts();
        showToast('Carrito vaciado.');
    });

    [categoryFilter, minPriceInput, maxPriceInput, sortSelect, inStockOnly, favoritesOnly].forEach((control) => {
        control.addEventListener('input', renderProducts);
        control.addEventListener('change', renderProducts);
    });

    favoritesToggle.addEventListener('click', () => {
        favoritesOnly.checked = !favoritesOnly.checked;
        renderProducts();
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });

    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLocaleLowerCase('es');
        renderProducts();
    });

    document.getElementById('nav-search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        searchTerm = searchInput.value.trim().toLocaleLowerCase('es');
        renderProducts();
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        categoryFilter.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        inStockOnly.checked = false;
        favoritesOnly.checked = false;
        sortSelect.value = 'featured';
        renderProducts();
    });

    document.getElementById('retry-catalog').addEventListener('click', loadProducts);
    document.getElementById('detail-close').addEventListener('click', () => productDialog.close());
    productDialog.addEventListener('click', (event) => {
        if (event.target === productDialog) productDialog.close();
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.size === 0) {
            showToast('Agregá productos antes de continuar.');
            return;
        }
        if (!catalogReady) {
            showToast('No se pudo verificar el catálogo. Volvé a intentarlo cuando se restablezca la conexión.');
            return;
        }
        checkoutSection.hidden = false;
        orderConfirmation.hidden = true;
        showCheckoutStep(1);
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
    });

    checkoutNext.addEventListener('click', () => {
        if (!validateCurrentStep()) return;
        showCheckoutStep(Math.min(5, checkoutStep + 1));
    });

    checkoutBack.addEventListener('click', () => {
        if (checkoutStep === 1) {
            checkoutSection.hidden = true;
            document.getElementById('carrito').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        showCheckoutStep(checkoutStep - 1);
    });

    checkoutCancel.addEventListener('click', () => {
        if (pendingCheckout?.customerId || checkoutBlocked) {
            showToast('Completá o verificá el pedido en curso antes de salir.');
            return;
        }
        checkoutSection.hidden = true;
        document.getElementById('carrito').scrollIntoView({ behavior: 'smooth' });
    });

    checkoutForm.querySelectorAll('[name="entrega"]').forEach((option) => {
        option.addEventListener('change', () => {
            const requiresAddress = option.value === 'domicilio' && option.checked;
            addressStep.querySelectorAll('input, textarea').forEach((field) => {
                field.required = requiresAddress && field.name !== 'adicional';
            });
        });
    });

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (checkoutStep !== 5 || !validateCurrentStep()) return;
        if (cart.size === 0) {
            checkoutError.textContent = 'El carrito está vacío. Agregá productos para continuar.';
            return;
        }

        if (checkoutBlocked) {
            checkoutError.textContent = 'No se puede confirmar el estado del último envío. Revisá las compras del cliente antes de volver a intentarlo.';
            return;
        }

        if (!pendingCheckout) {
            pendingCheckout = {
                customerId: null,
                items: Array.from(cart, ([id, item]) => ({ id, cantidad: item.cantidad })),
                purchases: []
            };
        }

        setOrderLocked(true);
        confirmOrder.disabled = true;
        checkoutNext.disabled = true;
        checkoutCancel.disabled = true;
        checkoutBack.disabled = true;
        confirmOrder.textContent = 'Registrando...';
        checkoutError.textContent = '';

        try {
            if (!pendingCheckout.customerId) {
                const formData = new FormData(checkoutForm);
                const delivery = formData.get('entrega');
                const address = delivery === 'domicilio'
                    ? `${formData.get('calle')} ${formData.get('numero')}, ${formData.get('ciudad')}, ${formData.get('provincia')} (${formData.get('codigo_postal')})${formData.get('adicional') ? ` · ${formData.get('adicional')}` : ''}`
                    : 'Retiro en sucursal GYM-MLS · Centro';
                if (address.length > 255) {
                    throw new Error('La dirección supera los 255 caracteres permitidos.');
                }

                const today = new Date();
                const registrationDate = [
                    today.getFullYear(),
                    String(today.getMonth() + 1).padStart(2, '0'),
                    String(today.getDate()).padStart(2, '0')
                ].join('-');
                const customer = await requestJson('/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: `${formData.get('nombre').trim()} ${formData.get('apellido').trim()}`,
                        contacto: formData.get('telefono').trim(),
                        direccion: address,
                        fecha_registro: registrationDate,
                        email: formData.get('email').trim()
                    })
                });
                if (!Number.isInteger(Number(customer.id_usuario)) || Number(customer.id_usuario) <= 0) {
                    checkoutBlocked = true;
                    throw new Error('El servidor no devolvió un identificador de cliente válido.');
                }
                pendingCheckout.customerId = Number(customer.id_usuario);
                checkoutBack.disabled = true;
                checkoutCancel.disabled = true;
            }

            for (const item of pendingCheckout.items) {
                if (pendingCheckout.purchases.some((purchase) => purchase.id_producto === item.id)) {
                    continue;
                }
                const purchase = await requestJson('/compras', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_usuario: pendingCheckout.customerId,
                        id_producto: item.id,
                        cantidad: item.cantidad
                    })
                });
                if (!Number.isInteger(Number(purchase.id_compra)) || Number(purchase.id_compra) <= 0) {
                    checkoutBlocked = true;
                    throw new Error('El servidor no confirmó el identificador de una compra.');
                }
                pendingCheckout.purchases.push({
                    id_producto: item.id,
                    id_compra: Number(purchase.id_compra)
                });
            }

            document.getElementById('order-number').textContent =
                `Cliente ${pendingCheckout.customerId} · Compras ${pendingCheckout.purchases.map((purchase) => purchase.id_compra).join(', ')}`;
            const confirmationSummary = document.getElementById('confirmation-summary');
            confirmationSummary.replaceChildren(...Array.from(
                document.getElementById('checkout-summary').childNodes,
                (node) => node.cloneNode(true)
            ));
            pendingCheckout = null;
            checkoutBlocked = false;
            setOrderLocked(false);
            cart.clear();
            checkoutSection.hidden = true;
            orderConfirmation.hidden = false;
            renderCart();
            renderProducts();
            orderConfirmation.scrollIntoView({ behavior: 'smooth' });
            loadProducts();
        } catch (error) {
            console.error('No se pudo completar el pedido:', error);
            if (error.isNetworkError) checkoutBlocked = true;
            const completedCount = pendingCheckout?.purchases.length || 0;
            const totalCount = pendingCheckout?.items.length || 0;
            const purchaseRefs = pendingCheckout?.purchases
                .map((purchase) => purchase.id_compra)
                .join(', ') || 'ninguna';
            if (checkoutBlocked) {
                confirmOrder.textContent = 'Pedido pendiente de verificación';
                checkoutError.textContent = `No se pudo confirmar el resultado del último envío. ${completedCount} de ${totalCount} compras tienen confirmación (referencias: ${purchaseRefs})${pendingCheckout?.customerId ? ` para el cliente ${pendingCheckout.customerId}` : ''}. No reenvíes el pedido hasta verificar su estado.`;
            } else if (pendingCheckout?.customerId) {
                confirmOrder.textContent = `Reintentar compras pendientes (${completedCount}/${totalCount})`;
                checkoutError.textContent = `No se completaron todas las compras: ${completedCount} de ${totalCount} registradas (referencias: ${purchaseRefs}) para el cliente ${pendingCheckout.customerId}. ${error.message}`;
            } else {
                pendingCheckout = null;
                setOrderLocked(false);
                checkoutError.textContent = error.message || 'No se pudo registrar el pedido.';
            }
        } finally {
            confirmOrder.disabled = checkoutBlocked;
            checkoutNext.disabled = false;
            checkoutCancel.disabled = Boolean(checkoutBlocked || pendingCheckout?.customerId);
            checkoutBack.disabled = Boolean(checkoutBlocked || pendingCheckout?.customerId);
            if (pendingCheckout?.customerId && !checkoutBlocked) {
                confirmOrder.textContent = `Reintentar compras pendientes (${pendingCheckout.purchases.length}/${pendingCheckout.items.length})`;
            } else if (!checkoutBlocked && !pendingCheckout) {
                confirmOrder.textContent = 'Registrar pedido';
            }
        }
    });

    restoreCart();
    restoreFavorites();
    loadProducts();
});
