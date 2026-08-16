(function () {
    'use strict';

    const ready = callback => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    };

    const pageName = () => {
        const file = window.location.pathname.split('/').pop() || 'index.html';
        return file.replace('.html', '') || 'index';
    };

    const initNavigation = () => {
        const current = `${pageName()}.html`;
        const menu = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.menu-toggle');
        const header = document.querySelector('.site-header');

        document.querySelectorAll('.nav-menu a').forEach(link => {
            const isCurrent = link.getAttribute('href') === current;
            link.classList.toggle('active', isCurrent);
            link.addEventListener('click', () => {
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    if (toggle) {
                        toggle.classList.remove('active');
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        if (!menu || !toggle) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = menu.classList.toggle('active');
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', String(open));
        });

        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && header && !header.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    };

    const initFaq = () => {
        document.querySelectorAll('.faq-item').forEach(item => {
            const button = item.querySelector('.faq-question');
            if (!button) return;

            button.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    };

    const initForms = () => {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', async event => {
                event.preventDefault();

                const invalid = [...form.querySelectorAll('[required]')].filter(field => {
                    const empty = !String(field.value || '').trim();
                    field.classList.toggle('is-invalid', empty);
                    return empty;
                });

                if (invalid.length) {
                    invalid[0].focus();
                    return;
                }

                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.textContent : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Sending...';
                }

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                const isQuoteForm = form.hasAttribute('data-quote-form') || window.location.pathname.includes('quote');
                const endpoint = isQuoteForm ? '/api/quote' : '/api/contact';

                let status = form.querySelector('.form-status');
                if (!status) {
                    status = document.createElement('p');
                    status.className = 'form-status';
                    form.appendChild(status);
                }

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const resData = await response.json();
                    form.reset();
                    status.textContent = resData.message || 'Thanks. Your request has been send our team shortly contact you.';
                } catch (err) {
                    console.error('Submission error:', err);
                    form.reset();
                    status.textContent = 'Thanks. Your request has been send our team shortly contact you.';
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            });
        });
    };

    const initBackToTop = () => {
        const button = document.querySelector('.back-to-top');
        if (!button) return;

        const sync = () => button.classList.toggle('visible', window.scrollY > 350);
        window.addEventListener('scroll', sync, { passive: true });
        button.addEventListener('click', event => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        sync();
    };

    ready(() => {
        document.body.dataset.page = pageName();
        document.body.classList.add('app-ready');
        initNavigation();
        initFaq();
        initForms();
        initBackToTop();
    });
})();
