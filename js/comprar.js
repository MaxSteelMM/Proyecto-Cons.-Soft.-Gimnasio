document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const productsMessage = document.getElementById('products-message');
    const productsCount = document.getElementById('products-count');
    const categoryList = document.getElementById('category-list');
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('nav-search');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortSelect = document.getElementById('sort-products');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDiscount = document.getElementById('cart-discount');
    const discountRow = document.getElementById('discount-row');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-btn');
    const couponInput = document.getElementById('coupon-input');
    const couponButton = document.getElementById('coupon-btn');
    const couponResult = document.getElementById('coupon-result');
    const checkoutSection = document.getElementById('checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutError = document.getElementById('checkout-error');
    const checkoutSteps = Array.from(document.querySelectorAll('.checkout-step'));
    const checkoutBack = document.getElementById('checkout-back');
    const checkoutCancel = document.getElementById('checkout-cancel');
    const checkoutNext = document.getElementById('checkout-next');
    const confirmOrder = document.getElementById('confirm-order');
    const orderConfirmation = document.getElementById('order-confirmation');
    const productDialog = document.getElementById('product-dialog');
    const detailContent = document.getElementById('detail-content');
    const toast = document.getElementById('toast');
    const cart = new Map();
    const cartStorageKey = 'gym-mls-cart';
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
        }
    };
    const descriptions = {
        indumentaria: 'Prendas cómodas y resistentes para acompañar tus entrenamientos.',
        suplementos: 'Suplementación deportiva para complementar tu rutina.',
        equipamiento: 'Elementos confiables para entrenar en el gimnasio o en casa.'
    };
    const demoProducts = [
        {
            id_producto: 1,
            nombre: 'Proteína Whey 2kg',
            precio: 45,
            stock: 20,
            categoria: 'Suplementos',
            popularidad: 1
        },
        {
            id_producto: 2,
            nombre: 'Mancuernas 5kg',
            precio: 25,
            stock: 10,
            categoria: 'Equipamiento',
            popularidad: 0
        },
        {
            id_producto: 3,
            nombre: 'Remera deportiva MLS',
            precio: 30,
            stock: 15,
            categoria: 'Indumentaria',
            popularidad: 0
        }
    ];
    let products = [];
    let searchTerm = '';
    let appliedCoupon = false;
    let checkoutStep = 1;
    let toastTimer;

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(price);

    const categoryKey = (category) => (category || '').trim().toLocaleLowerCase('es');

    const getImage = (product) => {
        const description = `${product.categoria || ''} ${product.nombre}`.toLocaleLowerCase('es');
        if (/ropa|indumentaria|remera|camiseta|legging|short|clothing/.test(description)) {
            return imageAssets.clothing;
        }
        if (/suplement|prote[ií]na|creatina|whey/.test(description)) {
            return imageAssets.supplement;
        }
        return imageAssets.weights;
    };

    const describeProduct = (product) => {
        const key = categoryKey(product.categoria);
        return descriptions[key] || `Producto seleccionado para acompañar tu entrenamiento${product.categoria ? ` de ${product.categoria.toLocaleLowerCase('es')}` : ''}.`;
    };

    const getPrice = (product) => Number(product.precio);

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
    };

    const saveCart = () => {
        try {
            localStorage.setItem(cartStorageKey, JSON.stringify({
                items: Array.from(cart, ([id, item]) => ({ id, cantidad: item.cantidad })),
                coupon: appliedCoupon ? 'MLS2026' : ''
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
            appliedCoupon = stored.coupon === 'MLS2026';
            couponInput.value = appliedCoupon ? 'MLS2026' : '';
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
            return matchesSearch && matchesCategory && matchesMin && matchesMax;
        });

        if (sortSelect.value === 'price-asc') filtered.sort((a, b) => getPrice(a) - getPrice(b));
        if (sortSelect.value === 'price-desc') filtered.sort((a, b) => getPrice(b) - getPrice(a));
        if (sortSelect.value === 'popular') {
            filtered.sort((a, b) => Number(b.popularidad || 0) - Number(a.popularidad || 0));
        }
        return filtered;
    };

    const appendImageCredit = (container, image) => {
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

        if (products.length === 0) {
            productsMessage.textContent = 'No hay productos disponibles.';
            productsMessage.hidden = false;
            return;
        }
        if (visible.length === 0) {
            productsMessage.textContent = 'No encontramos productos con esos filtros.';
            productsMessage.hidden = false;
            return;
        }
        productsMessage.hidden = true;

        visible.forEach((product) => {
            const card = document.createElement('article');
            card.className = 'product-card';
            const image = appendProductImage(card, product);
            appendImageCredit(card, image);

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

            const rating = document.createElement('p');
            rating.className = 'product-rating';
            if (Number.isFinite(Number(product.valoracion)) && Number(product.valoracion) > 0) {
                const value = Number(product.valoracion);
                rating.textContent = `${'★'.repeat(Math.max(0, Math.min(5, Math.round(value))))}${'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(value))))} `;
                const ratingLabel = document.createElement('span');
                ratingLabel.textContent = `${value.toFixed(1)}${product.cantidad_resenas ? ` (${product.cantidad_resenas} reseñas)` : ''}`;
                rating.append(ratingLabel);
            } else {
                rating.textContent = '☆☆☆☆☆ ';
                const ratingLabel = document.createElement('span');
                ratingLabel.textContent = 'Sin reseñas';
                rating.append(ratingLabel);
            }
            card.append(rating);

            const popularity = document.createElement('p');
            popularity.className = 'product-popularity';
            const unitsSold = Number(product.popularidad || 0);
            popularity.textContent = `${unitsSold} ${unitsSold === 1 ? 'unidad vendida' : 'unidades vendidas'}`;
            card.append(popularity);

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
            const hasDiscount = Number(product.precio_anterior) > getPrice(product);
            price.textContent = formatPrice(getPrice(product));
            priceRow.append(price);
            if (hasDiscount) {
                const oldPrice = document.createElement('span');
                oldPrice.className = 'old-price';
                oldPrice.textContent = formatPrice(Number(product.precio_anterior));
                priceRow.append(oldPrice);
                const badge = document.createElement('span');
                badge.className = 'discount-badge';
                badge.textContent = `-${Math.round((1 - getPrice(product) / Number(product.precio_anterior)) * 100)}%`;
                priceRow.append(badge);
            }
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

            const quantityInput = document.createElement('input');
            quantityInput.className = 'cart-quantity';
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.max = String(product.stock);
            quantityInput.value = String(quantity);
            quantityInput.dataset.productId = String(id);
            quantityInput.setAttribute('aria-label', `Cantidad de ${product.nombre}`);
            row.append(quantityInput);

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

        const discount = appliedCoupon ? subtotal * 0.2 : 0;
        cartEmpty.hidden = cart.size > 0;
        cartCount.textContent = String(totalItems);
        cartSubtotal.textContent = formatPrice(subtotal);
        cartDiscount.textContent = `−${formatPrice(discount)}`;
        discountRow.hidden = !appliedCoupon;
        cartTotal.textContent = formatPrice(subtotal - discount);
        checkoutButton.disabled = cart.size === 0;
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
            'Envío o retiro disponibles en el flujo de demostración.'
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
            ['Método de pago', data.get('pago')]
        ]);
        addSummarySection('Total', [['Total de demostración', cartTotal.textContent]]);
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
        const invalid = Array.from(active.querySelectorAll('input, textarea'))
            .find((input) => !input.checkValidity());
        if (invalid) {
            invalid.reportValidity();
            return false;
        }
        return true;
    };

    const loadProducts = async () => {
        restoreCart();
        try {
            const response = await fetch('http://localhost:3000/productos');
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || `El servidor respondió ${response.status}.`);
            }
            if (!Array.isArray(result)) {
                throw new Error('La respuesta de productos no tiene el formato esperado.');
            }
            products = result.map((product) => ({
                ...product,
                id_producto: Number(product.id_producto),
                precio: Number(product.precio),
                precio_anterior: product.precio_anterior == null ? null : Number(product.precio_anterior),
                stock: Number(product.stock),
                popularidad: Number(product.popularidad || 0),
                valoracion: product.valoracion == null ? null : Number(product.valoracion)
            }));
            if (products.some((product) =>
                !Number.isInteger(product.id_producto) || product.id_producto <= 0 ||
                !Number.isFinite(product.precio) || product.precio < 0 ||
                !Number.isInteger(product.stock) || product.stock < 0
            )) {
                throw new Error('El catálogo contiene datos de productos inválidos.');
            }
        } catch (error) {
            console.warn('Se activa el catálogo de demostración porque falló la conexión:', error);
            products = demoProducts;
            const notice = document.getElementById('catalog-notice');
            notice.textContent = `No se pudo conectar con el catálogo de MySQL (${error.message}). Se muestran productos de ejemplo; el checkout no registra compras reales.`;
            notice.hidden = false;
        }

        const availableIds = new Set(products.map((product) => Number(product.id_producto)));
        let removedItems = false;
        cart.forEach((item, id) => {
            if (!availableIds.has(id)) {
                cart.delete(id);
                removedItems = true;
            } else {
                const product = products.find((entry) => Number(entry.id_producto) === id);
                item.cantidad = Math.min(item.cantidad, Number(product.stock));
                if (item.cantidad <= 0) cart.delete(id);
            }
        });
        if (removedItems) showToast('Se quitaron del carrito productos que ya no están disponibles.');

        renderCategories();
        renderProducts();
        renderCart();
    };

    productsGrid.addEventListener('click', (event) => {
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
        if (!button) return;
        cart.delete(Number(button.dataset.productId));
        renderCart();
        renderProducts();
        showToast('Producto quitado del carrito.');
    });

    document.getElementById('empty-cart').addEventListener('click', () => {
        cart.clear();
        appliedCoupon = false;
        couponInput.value = '';
        couponResult.textContent = '';
        renderCart();
        renderProducts();
        showToast('Carrito vaciado.');
    });

    couponButton.addEventListener('click', () => {
        if (couponInput.value.trim().toUpperCase() !== 'MLS2026') {
            appliedCoupon = false;
            couponResult.textContent = 'Cupón inválido. Revisá el código e intentá de nuevo.';
            couponResult.classList.add('error');
        } else {
            appliedCoupon = true;
            couponInput.value = 'MLS2026';
            couponResult.textContent = '¡Cupón aplicado! Se descontó el 20% del subtotal.';
            couponResult.classList.remove('error');
        }
        renderCart();
    });

    [categoryFilter, minPriceInput, maxPriceInput, sortSelect].forEach((control) => {
        control.addEventListener('input', renderProducts);
        control.addEventListener('change', renderProducts);
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
        sortSelect.value = 'featured';
        renderProducts();
    });

    document.getElementById('offers-link').addEventListener('click', () => {
        couponInput.value = 'MLS2026';
        couponButton.click();
    });

    document.getElementById('detail-close').addEventListener('click', () => productDialog.close());
    productDialog.addEventListener('click', (event) => {
        if (event.target === productDialog) productDialog.close();
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.size === 0) {
            showToast('Agregá productos antes de continuar.');
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
        checkoutSection.hidden = true;
        document.getElementById('carrito').scrollIntoView({ behavior: 'smooth' });
    });

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (checkoutStep !== 5 || !validateCurrentStep()) return;
        if (cart.size === 0) {
            checkoutError.textContent = 'El carrito está vacío. Agregá productos para continuar.';
            checkoutSection.hidden = true;
            return;
        }

        const orderNumber = `MLS-DEMO-${Date.now().toString().slice(-8)}`;
        document.getElementById('order-number').textContent = orderNumber;
        const confirmationSummary = document.getElementById('confirmation-summary');
        confirmationSummary.replaceChildren(...Array.from(
            document.getElementById('checkout-summary').childNodes,
            (node) => node.cloneNode(true)
        ));
        cart.clear();
        appliedCoupon = false;
        couponInput.value = '';
        couponResult.textContent = '';
        checkoutSection.hidden = true;
        orderConfirmation.hidden = false;
        renderCart();
        renderProducts();
        orderConfirmation.scrollIntoView({ behavior: 'smooth' });
    });

    renderCart();
    loadProducts();
});
