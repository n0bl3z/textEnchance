// Исправленный JavaScript для темной темы с фиксом полей ввода

// Функция переключения темы
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Обновляем Tailwind классы
    updateTailwindClasses(newTheme);
    
    // Показываем уведомление
    showNotification(
        newTheme === 'dark' ? '🌙 Темная тема включена' : '☀️ Светлая тема включена',
        'success'
    );
}

// Исправленная функция обновления классов
function updateTailwindClasses(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        // Обновляем body
        body.classList.remove('bg-gray-50');
        body.classList.add('bg-slate-900');
        
        // Обновляем все карточки
        updateClasses('.bg-white', ['bg-white'], ['bg-slate-800']);
        
        // Обновляем границы
        updateClasses('.border-gray-200', ['border-gray-200'], ['border-slate-700']);
        
        // Обновляем текст
        updateClasses('.text-gray-900', ['text-gray-900'], ['text-slate-100']);
        updateClasses('.text-gray-700', ['text-gray-700'], ['text-slate-300']);
        updateClasses('.text-gray-500', ['text-gray-500'], ['text-slate-400']);
        updateClasses('.text-gray-600', ['text-gray-600'], ['text-slate-400']);
        
        // Обновляем фоны таблиц и секций
        updateClasses('.bg-gray-50', ['bg-gray-50'], ['bg-slate-800']);
        
        // Обновляем hover состояния
        updateClasses('[class*="hover:bg-gray-50"]', ['hover:bg-gray-50'], ['hover:bg-slate-700']);
        updateClasses('[class*="hover:bg-red-50"]', ['hover:bg-red-50'], ['hover:bg-red-900']);
        
        // ИСПРАВЛЕНИЕ: Обновляем поля ввода для темной темы
        updateInputFields('dark');
        
    } else {
        // Возвращаем светлую тему
        body.classList.remove('bg-slate-900');
        body.classList.add('bg-gray-50');
        
        // Возвращаем все обратно
        updateClasses('.bg-slate-800', ['bg-slate-800'], ['bg-white']);
        updateClasses('.border-slate-700', ['border-slate-700'], ['border-gray-200']);
        updateClasses('.border-slate-600', ['border-slate-600'], ['border-gray-300']);
        updateClasses('.text-slate-100', ['text-slate-100'], ['text-gray-900']);
        updateClasses('.text-slate-300', ['text-slate-300'], ['text-gray-700']);
        updateClasses('.text-slate-400', ['text-slate-400'], ['text-gray-500']);
        updateClasses('[class*="hover:bg-slate-700"]', ['hover:bg-slate-700'], ['hover:bg-gray-50']);
        updateClasses('[class*="hover:bg-red-900"]', ['hover:bg-red-900'], ['hover:bg-red-50']);
        
        // ИСПРАВЛЕНИЕ: Обновляем поля ввода для светлой темы
        updateInputFields('light');
    }
}

// НОВАЯ ФУНКЦИЯ: Специальная обработка полей ввода
function updateInputFields(theme) {
    const inputs = document.querySelectorAll('input[type="text"], textarea, #tags, #inputData');
    
    inputs.forEach(input => {
        if (theme === 'dark') {
            // Темная тема - принудительно устанавливаем стили
            input.style.setProperty('background-color', '#1e293b', 'important');
            input.style.setProperty('color', '#f1f5f9', 'important');
            input.style.setProperty('border-color', '#475569', 'important');
            
            // Обновляем Tailwind классы
            input.classList.remove('bg-white', 'text-gray-900', 'border-gray-300');
            input.classList.add('bg-slate-800', 'text-slate-100', 'border-slate-600');
            
        } else {
            // Светлая тема
            input.style.setProperty('background-color', '#ffffff', 'important');
            input.style.setProperty('color', '#1f2937', 'important');
            input.style.setProperty('border-color', '#d1d5db', 'important');
            
            // Обновляем Tailwind классы
            input.classList.remove('bg-slate-800', 'text-slate-100', 'border-slate-600');
            input.classList.add('bg-white', 'text-gray-900', 'border-gray-300');
        }
        
        // Обновляем placeholder
        if (theme === 'dark') {
            input.style.setProperty('--tw-placeholder-color', '#94a3b8', 'important');
        } else {
            input.style.setProperty('--tw-placeholder-color', '#9ca3af', 'important');
        }
    });
    
    // Дополнительно обновляем focus состояния
    const style = document.createElement('style');
    style.id = 'dynamic-input-styles';
    
    // Удаляем предыдущие стили если есть
    const existingStyle = document.getElementById('dynamic-input-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    if (theme === 'dark') {
        style.textContent = `
            [data-theme="dark"] input[type="text"]:focus,
            [data-theme="dark"] textarea:focus {
                background-color: #1e293b !important;
                color: #f1f5f9 !important;
                border-color: #0ea5e9 !important;
            }
            [data-theme="dark"] input[type="text"]::placeholder,
            [data-theme="dark"] textarea::placeholder {
                color: #94a3b8 !important;
            }
        `;
    } else {
        style.textContent = `
            input[type="text"]:focus,
            textarea:focus {
                background-color: #ffffff !important;
                color: #1f2937 !important;
                border-color: #0ea5e9 !important;
            }
            input[type="text"]::placeholder,
            textarea::placeholder {
                color: #9ca3af !important;
            }
        `;
    }
    
    document.head.appendChild(style);
}

// Вспомогательная функция для безопасного обновления классов
function updateClasses(selector, removeClasses, addClasses) {
    try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Удаляем старые классы
            removeClasses.forEach(cls => {
                if (element.classList.contains(cls.replace(':', '\\:'))) {
                    element.classList.remove(cls);
                }
            });
            
            // Добавляем новые классы
            addClasses.forEach(cls => {
                element.classList.add(cls);
            });
        });
    } catch (error) {
        console.warn('Ошибка при обновлении классов:', selector, error);
    }
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Автоматически удаляем через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Функция показа горячих клавиш
function showKeyboardShortcuts() {
    showNotification('⌨️ Ctrl+Enter: Обработать | Ctrl+L: Пример | Ctrl+Shift+D: Тема', 'info');
}

// Инициализация темы при загрузке
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
    updateTailwindClasses(theme);
}

// Обработчики событий
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + D - переключение темы
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    // Добавляем плавные переходы после загрузки
    setTimeout(() => {
        document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Добавляем переходы для всех элементов
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }, 100);
});

// Слушаем изменения системной темы
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        updateTailwindClasses(theme);
    }
});

// Дополнительные исправления для специфических элементов
function fixSpecificElements() {
    // Исправляем статистические карточки
    const statsCards = document.querySelectorAll('.stats-card');
    const theme = document.documentElement.getAttribute('data-theme');
    
    statsCards.forEach(card => {
        if (theme === 'dark') {
            card.style.background = 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))';
        } else {
            card.style.background = 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))';
        }
    });
    
    // Исправляем таблицу
    const table = document.getElementById('previewTable');
    if (table) {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        
        if (theme === 'dark') {
            if (thead) thead.style.backgroundColor = 'var(--bg-tertiary)';
            if (tbody) tbody.style.backgroundColor = 'var(--bg-secondary)';
        } else {
            if (thead) thead.style.backgroundColor = '';
            if (tbody) tbody.style.backgroundColor = '';
        }
    }
}

// Вызываем исправления после каждого переключения темы
const originalToggleTheme = toggleTheme;
toggleTheme = function() {
    originalToggleTheme();
    setTimeout(fixSpecificElements, 50);
    setTimeout(() => updateInputFields(document.documentElement.getAttribute('data-theme')), 100);
};