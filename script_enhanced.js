// Улучшенный обработчик данных с Material Design
class EnhancedDataProcessor {
    constructor() {
        this.lastProcessedData = null;
        this.processingHistory = [];
        this.isProcessing = false;
        this.debounceTimer = null;
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        try {
            // Автоматическое обновление статистики с debounce
            const inputData = document.getElementById('inputData');
            if (inputData) {
                inputData.addEventListener('input', () => {
                    this.debouncedUpdateStats();
                });
            }

            // Сохранение настроек
            const settingsElements = ['tags', 'caseSensitive', 'exactMatch'];
            settingsElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('change', () => {
                        this.saveSettings();
                        this.debouncedUpdateStats();
                    });
                }
            });

            // Горячие клавиши
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.processData();
                }
                if (e.ctrlKey && e.key === 'l') {
                    e.preventDefault();
                    this.loadExample();
                }
                if (e.key === 'Escape') {
                    this.clearAlerts();
                }
            });

            // Добавляем ripple эффект к кнопкам
            this.addRippleEffect();

            console.log('✅ Event listeners initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing event listeners:', error);
            this.showAlert('Ошибка инициализации интерфейса', 'warning');
        }
    }

    addRippleEffect() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.classList.add('ripple');
        });
    }

    debouncedUpdateStats() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updateQuickStats();
        }, 300);
    }

    updateQuickStats() {
        try {
            const inputData = document.getElementById('inputData')?.value || '';
            const tagsInput = document.getElementById('tags')?.value || '';
            
            if (!inputData.trim() || !tagsInput.trim()) {
                return;
            }

            const lines = inputData.split('\n').filter(line => line.trim());
            const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            let matches = 0;
            let sum = 0;

            lines.forEach(line => {
                tags.forEach(tag => {
                    const regex = new RegExp(`${this.escapeRegExp(tag)}:\\s*(\\d+)`, 'gi');
                    const matchResults = line.match(regex);
                    if (matchResults) {
                        matches += matchResults.length;
                        matchResults.forEach(m => {
                            const value = parseInt(m.split(':')[1].trim());
                            if (!isNaN(value)) {
                                sum += value;
                            }
                        });
                    }
                });
            });

            // Обновляем статистику в заголовке
            this.updateHeaderStats(lines.length, matches, sum);
        } catch (error) {
            console.warn('⚠️ Error updating quick stats:', error);
        }
    }

    updateHeaderStats(lines, matches, sum) {
        const headerP = document.querySelector('.header p');
        if (headerP) {
            headerP.textContent = `Строк: ${lines} | Совпадений: ${matches} | Сумма: ${sum}`;
        }
    }

    saveSettings() {
        try {
            const settings = {
                tags: document.getElementById('tags')?.value || '',
                caseSensitive: document.getElementById('caseSensitive')?.checked || false,
                exactMatch: document.getElementById('exactMatch')?.checked || false,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('dataProcessorSettings', JSON.stringify(settings));
            console.log('💾 Settings saved successfully');
        } catch (error) {
            console.error('❌ Error saving settings:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('dataProcessorSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                const tagsElement = document.getElementById('tags');
                const caseSensitiveElement = document.getElementById('caseSensitive');
                const exactMatchElement = document.getElementById('exactMatch');
                
                if (tagsElement) tagsElement.value = settings.tags || 'answered, no answer, busy, congestion, Статус ещё не получен';
                if (caseSensitiveElement) caseSensitiveElement.checked = settings.caseSensitive || false;
                if (exactMatchElement) exactMatchElement.checked = settings.exactMatch || false;
                
                console.log('📂 Settings loaded successfully');
            }
        } catch (error) {
            console.warn('⚠️ Error loading settings:', error);
            this.resetToDefaults();
        }
    }

    resetToDefaults() {
        const tagsElement = document.getElementById('tags');
        if (tagsElement) {
            tagsElement.value = 'answered, no answer, busy, congestion, Статус ещё не получен';
        }
    }

    async processData() {
        if (this.isProcessing) {
            this.showAlert('Обработка уже выполняется', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.setProcessingState(true);

            const inputData = document.getElementById('inputData')?.value || '';
            const tagsInput = document.getElementById('tags')?.value || '';
            const caseSensitive = document.getElementById('caseSensitive')?.checked || false;
            const exactMatch = document.getElementById('exactMatch')?.checked || false;

            // Валидация
            const validation = this.validateInput(inputData, tagsInput);
            if (!validation.isValid) {
                this.showAlert(validation.message, 'warning');
                return;
            }

            // Имитируем асинхронную обработку для лучшего UX
            await this.delay(200);

            const result = await this.performDataProcessing(inputData, tagsInput, caseSensitive, exactMatch);
            
            this.displayResults(result);
            this.showAlert('✅ Данные успешно обработаны', 'success');
            
            // Добавляем в историю
            this.addToHistory(result);
            
        } catch (error) {
            console.error('❌ Error processing data:', error);
            this.showAlert(`Ошибка обработки: ${error.message}`, 'warning');
        } finally {
            this.isProcessing = false;
            this.setProcessingState(false);
        }
    }

    validateInput(inputData, tagsInput) {
        if (!inputData.trim()) {
            return { isValid: false, message: 'Введите данные для обработки' };
        }

        if (!tagsInput.trim()) {
            return { isValid: false, message: 'Настройте параметры поиска' };
        }

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        if (tags.length === 0) {
            return { isValid: false, message: 'Добавьте хотя бы один параметр поиска' };
        }

        if (tags.length > 20) {
            return { isValid: false, message: 'Слишком много параметров (максимум 20)' };
        }

        return { isValid: true };
    }

    async performDataProcessing(inputData, tagsInput, caseSensitive, exactMatch) {
        return new Promise((resolve, reject) => {
            try {
                const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
                const totals = {};
                const foundItems = [];
                const detailedMatches = {};

                tags.forEach(tag => {
                    totals[tag] = 0;
                    detailedMatches[tag] = [];
                });

                const lines = inputData.split('\n');
                
                lines.forEach((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        tags.forEach(tag => {
                            const patterns = this.createSearchPatterns(tag, caseSensitive, exactMatch);
                            
                            patterns.forEach(regex => {
                                let match;
                                while ((match = regex.exec(trimmedLine)) !== null) {
                                    const value = parseInt(match[1]);
                                    if (!isNaN(value) && value >= 0) {
                                        totals[tag] += value;
                                        foundItems.push({
                                            tag: tag,
                                            value: value,
                                            line: lineIndex + 1,
                                            text: trimmedLine,
                                            timestamp: new Date().toISOString()
                                        });
                                        detailedMatches[tag].push({
                                            value: value,
                                            line: lineIndex + 1,
                                            context: trimmedLine
                                        });
                                    }
                                }
                            });
                        });
                    }
                });

                const values = tags.map(tag => totals[tag] === 0 ? '' : totals[tag]);
                const result = values.join('\t');

                resolve({
                    tags,
                    totals,
                    values,
                    result,
                    foundItems,
                    detailedMatches,
                    totalLines: lines.length,
                    processedLines: lines.filter(line => line.trim()).length,
                    processingTime: new Date().toISOString()
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    createSearchPatterns(tag, caseSensitive, exactMatch) {
        const escapedTag = this.escapeRegExp(tag);
        const flags = caseSensitive ? 'g' : 'gi';
        
        if (exactMatch) {
            return [
                new RegExp(`^${escapedTag}:\\s*(\\d+)$`, flags),
                new RegExp(`\\s${escapedTag}:\\s*(\\d+)\\s`, flags)
            ];
        } else {
            return [
                new RegExp(`${escapedTag}:\\s*(\\d+)`, flags),
                new RegExp(`\\b${escapedTag}\\s*:\\s*(\\d+)`, flags)
            ];
        }
    }

    displayResults(data) {
        try {
            this.lastProcessedData = data;

            // Показываем контейнер результатов с анимацией
            const resultsContainer = document.getElementById('resultsContainer');
            if (resultsContainer) {
                resultsContainer.classList.remove('hidden');
                resultsContainer.style.animation = 'slideUp 0.4s ease-out';
            }

            // Обновляем таблицу
            this.updatePreviewTable(data);

            // Обновляем результат для копирования
            const resultElement = document.getElementById('result');
            if (resultElement) {
                resultElement.textContent = data.result;
            }

            // Прокручиваем к результатам
            setTimeout(() => {
                resultsContainer?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);

            console.log('📊 Results displayed successfully');
        } catch (error) {
            console.error('❌ Error displaying results:', error);
            this.showAlert('Ошибка отображения результатов', 'warning');
        }
    }

    updatePreviewTable(data) {
        try {
            const tableHeaders = document.getElementById('tableHeaders');
            const tableData = document.getElementById('tableData');

            if (!tableHeaders || !tableData) return;

            tableHeaders.innerHTML = '';
            tableData.innerHTML = '';

            const headerRow = document.createElement('tr');
            const dataRow = document.createElement('tr');

            data.tags.forEach(tag => {
                const th = document.createElement('th');
                th.textContent = tag;
                headerRow.appendChild(th);

                const td = document.createElement('td');
                const value = data.totals[tag];
                td.textContent = value === 0 ? '—' : value;
                
                if (value > 0) {
                    td.style.color = 'var(--secondary-color)';
                    td.style.fontWeight = 'bold';
                }
                
                dataRow.appendChild(td);
            });

            tableHeaders.appendChild(headerRow);
            tableData.appendChild(dataRow);
        } catch (error) {
            console.error('❌ Error updating preview table:', error);
        }
    }

    setProcessingState(isProcessing) {
        try {
            const processBtn = document.getElementById('processBtn');
            if (!processBtn) return;

            if (isProcessing) {
                processBtn.disabled = true;
                processBtn.innerHTML = '<div class="loading"></div> Обработка...';
            } else {
                processBtn.disabled = false;
                processBtn.innerHTML = 'Обработать';
            }
        } catch (error) {
            console.error('❌ Error setting processing state:', error);
        }
    }

    showAlert(message, type = 'info') {
        try {
            // Удаляем предыдущие алерты
            this.clearAlerts();

            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <strong>${this.getAlertIcon(type)}</strong> ${message}
                <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2em;">&times;</button>
            `;

            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(alert, mainContent.firstChild);
            }

            // Автоматически удаляем через 5 секунд
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        } catch (error) {
            console.error('❌ Error showing alert:', error);
        }
    }

    getAlertIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || 'ℹ️';
    }

    clearAlerts() {
        const alerts = document.querySelectorAll('.alert:not(.permanent-alert)');
        alerts.forEach(alert => alert.remove());
    }

    async copyResult() {
        try {
            const resultDiv = document.getElementById('result');
            const resultText = resultDiv?.textContent || '';
            
            if (!resultText.trim()) {
                this.showAlert('Нет данных для копирования', 'warning');
                return;
            }

            await navigator.clipboard.writeText(resultText);
            this.showAlert('📋 Результат скопирован в буфер обмена', 'success');
            
        } catch (error) {
            // Fallback для старых браузеров
            try {
                const textarea = document.createElement('textarea');
                textarea.value = resultText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                
                this.showAlert('📋 Результат скопирован', 'success');
            } catch (fallbackError) {
                console.error('❌ Copy failed:', fallbackError);
                this.showAlert('Ошибка копирования', 'warning');
            }
        }
    }

    exportToCSV() {
        try {
            if (!this.lastProcessedData) {
                this.showAlert('Нет данных для экспорта', 'warning');
                return;
            }

            const data = this.lastProcessedData;
            let csv = data.tags.join(',') + '\n';
            csv += data.values.map(v => v === '' ? '0' : v).join(',');

            this.downloadFile(csv, 'text/csv', 'csv');
            this.showAlert('💾 CSV файл экспортирован', 'success');
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            this.showAlert('Ошибка экспорта CSV', 'warning');
        }
    }

    exportToJSON() {
        try {
            if (!this.lastProcessedData) {
                this.showAlert('Нет данных для экспорта', 'warning');
                return;
            }

            const data = this.lastProcessedData;
            const jsonData = {
                timestamp: new Date().toISOString(),
                results: data.totals,
                summary: {
                    totalMatches: data.foundItems.length,
                    totalSum: data.values.filter(v => v !== '').reduce((sum, val) => sum + parseInt(val), 0),
                    processedLines: data.processedLines
                },
                details: data.foundItems
            };

            const jsonString = JSON.stringify(jsonData, null, 2);
            this.downloadFile(jsonString, 'application/json', 'json');
            this.showAlert('📄 JSON файл экспортирован', 'success');
        } catch (error) {
            console.error('❌ JSON export failed:', error);
            this.showAlert('Ошибка экспорта JSON', 'warning');
        }
    }

    downloadFile(content, mimeType, extension) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 10);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `data_processor_${timestamp}.${extension}`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    clearAll() {
        if (confirm('🗑️ Очистить все данные и результаты?')) {
            try {
                const inputData = document.getElementById('inputData');
                const result = document.getElementById('result');
                const resultsContainer = document.getElementById('resultsContainer');
                
                if (inputData) inputData.value = '';
                if (result) result.textContent = '';
                if (resultsContainer) resultsContainer.classList.add('hidden');
                
                this.updateHeaderStats(0, 0, 0);
                this.showAlert('🧹 Все данные очищены', 'info');
            } catch (error) {
                console.error('❌ Error clearing data:', error);
                this.showAlert('Ошибка очистки данных', 'warning');
            }
        }
    }

    loadExample() {
        try {
            const exampleData = `busy: 13
no answer: 1
answered: 2
  12,5%  0  0  5  0    2025-07-01 14:13:43❗️ Низкий процент дозвона
UA Ваучер Мария (Анна Александр)  231261  24293  1  754  0  72  congestion: 8
busy: 35
answered: 1
no answer: 21
Статус ещё не получен: 7
answered: 5
busy: 2
congestion: 12`;
            
            const inputData = document.getElementById('inputData');
            if (inputData) {
                inputData.value = exampleData;
                this.debouncedUpdateStats();
                this.showAlert('📋 Пример данных загружен', 'info');
            }
        } catch (error) {
            console.error('❌ Error loading example:', error);
            this.showAlert('Ошибка загрузки примера', 'warning');
        }
    }

    addToHistory(data) {
        try {
            this.processingHistory.push({
                timestamp: new Date().toISOString(),
                data: data
            });
            
            // Ограничиваем историю 50 записями
            if (this.processingHistory.length > 50) {
                this.processingHistory = this.processingHistory.slice(-50);
            }
        } catch (error) {
            console.warn('⚠️ Error adding to history:', error);
        }
    }

    getUsageStats() {
        return {
            totalProcessings: this.processingHistory.length,
            lastProcessed: this.processingHistory.length > 0 ? 
                this.processingHistory[this.processingHistory.length - 1].timestamp : null,
            averageMatches: this.processingHistory.length > 0 ? 
                this.processingHistory.reduce((sum, item) => sum + item.data.foundItems.length, 0) / this.processingHistory.length : 0
        };
    }

    // Утилиты
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация приложения
let processor;

// Глобальные функции для совместимости с HTML
function processData() {
    processor?.processData();
}

function copyResult() {
    processor?.copyResult();
}

function exportToCSV() {
    processor?.exportToCSV();
}

function exportToJSON() {
    processor?.exportToJSON();
}

function clearAll() {
    processor?.clearAll();
}

function loadExample() {
    processor?.loadExample();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    try {
        processor = new EnhancedDataProcessor();
        console.log('🚀 Enhanced Data Processor initialized successfully');
        
        // Показываем приветственное сообщение
        setTimeout(() => {
            processor.showAlert('🎉 Добро пожаловать! Используйте Ctrl+Enter для быстрой обработки', 'info');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to initialize processor:', error);
        alert('Ошибка инициализации приложения. Перезагрузите страницу.');
    }
});

// Обработка глобальных ошибок
window.addEventListener('error', function(e) {
    console.error('🚨 Global error:', e.error);
    if (processor) {
        processor.showAlert('Произошла неожиданная ошибка', 'warning');
    }
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    if (processor) {
        processor.showAlert('Ошибка асинхронной операции', 'warning');
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedDataProcessor };
}