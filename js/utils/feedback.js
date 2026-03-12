/* LP21 Lernwelt - Visuelles Feedback */

const Feedback = {
    /** Kurzes visuelles Feedback auf einem Element */
    flash(element, type) {
        element.classList.add(type); // 'correct' or 'wrong'
        if (type === 'wrong') {
            element.classList.add('animate-pop');
            setTimeout(() => element.classList.remove('animate-pop'), 300);
        }
    },

    /** Toast-Nachricht am oberen Rand */
    toast(message, type = 'info') {
        const existing = document.querySelector('.feedback-toast');
        if (existing) existing.remove();

        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };

        const toast = DOM.create('div', {
            class: 'feedback-toast',
            text: message,
            style: {
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%) translateY(-20px)',
                padding: '0.75rem 1.5rem',
                background: colors[type] || colors.info,
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                zIndex: '300',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                opacity: '0',
                transition: 'all 0.3s ease'
            }
        });

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    /** Sterne-HTML generieren (1-3) */
    starsHTML(earned, total = 3) {
        let html = '';
        for (let i = 0; i < total; i++) {
            html += i < earned
                ? '<span class="star-filled">★</span>'
                : '<span class="star-empty">☆</span>';
        }
        return html;
    },

    /** Konfetti-artiger Effekt (einfach mit CSS) */
    celebrate() {
        const container = DOM.create('div', {
            style: {
                position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '999'
            }
        });
        const colors = ['#ffc107', '#4caf50', '#2196f3', '#f44336', '#9c27b0', '#ff9800'];
        for (let i = 0; i < 30; i++) {
            const particle = DOM.create('div', {
                style: {
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    background: colors[i % colors.length],
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                    left: Math.random() * 100 + '%',
                    top: '-10px',
                    opacity: '1',
                    transition: `all ${1 + Math.random()}s ease-out`
                }
            });
            container.appendChild(particle);
            requestAnimationFrame(() => {
                particle.style.top = (50 + Math.random() * 50) + '%';
                particle.style.left = (Math.random() * 100) + '%';
                particle.style.opacity = '0';
                particle.style.transform = `rotate(${Math.random() * 360}deg)`;
            });
        }
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 2500);
    }
};
