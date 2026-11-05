document.addEventListener('DOMContentLoaded', () => {
    const navigation = document.querySelector('.main-nav');
    const toggle = navigation?.querySelector('.nav-menu-toggle');
    const links = navigation?.querySelectorAll('.nav-links a');

    if (!navigation || !toggle) return;

    const closeMenu = () => {
        navigation.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('.nav-menu-label').textContent = 'Menú';
    };

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') !== 'true';
        navigation.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.querySelector('.nav-menu-label').textContent = isOpen ? 'Cerrar' : 'Menú';
    });

    links.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });
});
