class ContainerTool {
    constructor({ data, api, config, block }) {
        this.data = data || { 
            text: '',
            background: 'white',
            collapsible: false,
            collapsed: false
        };
        this.api = api;
        this.config = config;
        this.block = block; // Сохраняем ссылку на блок
        this.container = null;
        this.textElement = null;
        // Режим редактирования только для действительно новых блоков
        this.isEditMode = !data || !data.text || data.text.trim().length === 0;
        this.blockId = null; // Уникальный ID блока
        
        // Убираем локальный флаг, используем глобальный window.suppressAutoSave
    }

    // Получение данных для сохранения
    save() {
        const savedData = {
            text: this.textElement ? this.textElement.textContent : this.data.text,
            background: this.data.background || 'white',
            collapsible: this.data.collapsible || false,
            collapsed: this.data.collapsed || false,
            blockId: this.blockId // Сохраняем ID блока
        };
        
        console.log('Container save() called for:', this.blockId, 'data:', savedData);
        return savedData;
    }

    // Валидация данных
    validate(savedData) {
        return savedData.text && savedData.text.trim().length > 0;
    }

    // Конфигурация для автоматической очистки от опасного контента
    static get sanitize() {
        return {
            text: false,
            background: false,
            collapsible: false,
            collapsed: false,
            blockId: false
        };
    }

    // Настройки для Toolbox
    static get toolbox() {
        return {
            title: 'Контейнер',
            icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="15" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="3" y="3" width="11" height="3" rx="1" fill="currentColor"/><rect x="3" y="8" width="8" height="1" fill="currentColor"/><rect x="3" y="10" width="6" height="1" fill="currentColor"/></svg>'
        };
    }

    // Основной метод рендеринга
    render() {
        // Генерируем уникальный ID для блока (улучшенная логика для старых контейнеров)
        if (!this.blockId) {
            this.blockId = this.data.blockId || `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Обновляем данные с новым ID если он был сгенерирован
            if (!this.data.blockId) {
                this.data.blockId = this.blockId;
            }
        }
        
        this.container = document.createElement('div');
        this.container.className = 'container-tool';
        this.container.setAttribute('data-container-id', this.blockId);
        
        // Связываем экземпляр с DOM элементом для дополнительных проверок
        this.container._containerInstance = this;

        // Добавляем стили
        this.addStyles();

        // Контейнер для управления
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'container-controls';

        // Кнопки выбора фона
        const backgroundContainer = document.createElement('div');
        backgroundContainer.className = 'container-background-controls';

        const whiteButton = document.createElement('button');
        whiteButton.innerText = '⚪ Белый';
        whiteButton.className = 'container-btn container-btn-bg';
        whiteButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setBackgroundSafely('white');
        });

        const grayButton = document.createElement('button');
        grayButton.innerText = '⚫ Серый';
        grayButton.className = 'container-btn container-btn-bg';
        grayButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setBackgroundSafely('gray');
        });

        const blueButton = document.createElement('button');
        blueButton.innerText = '🔵 Голубой';
        blueButton.className = 'container-btn container-btn-bg';
        blueButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.setBackgroundSafely('blue');
        });

        backgroundContainer.appendChild(whiteButton);
        backgroundContainer.appendChild(grayButton);
        backgroundContainer.appendChild(blueButton);

        // Кнопка скрываемости
        this.collapsibleButton = document.createElement('button');
        this.collapsibleButton.innerText = this.data.collapsible ? '✅ Скрываемый' : '❌ Не скрываемый';
        this.collapsibleButton.className = 'container-btn container-btn-collapsible';
        this.collapsibleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCollapsibleSafely();
        });

        // Кнопка завершения редактирования
        this.saveButton = document.createElement('button');
        this.saveButton.innerText = 'Завершить редактирование';
        this.saveButton.className = 'container-btn container-btn-save';
        this.saveButton.addEventListener('click', () => this.finishEditing());

        // Кнопка редактирования
        this.editButton = document.createElement('button');
        this.editButton.innerText = 'Редактировать';
        this.editButton.className = 'container-btn container-btn-edit';
        this.editButton.addEventListener('click', () => this.startEditing());

        controlsContainer.appendChild(backgroundContainer);
        controlsContainer.appendChild(this.collapsibleButton);
        controlsContainer.appendChild(this.saveButton);

        // Заголовок H1
        this.textElement = document.createElement('h1');
        this.textElement.className = 'container-title';
        this.textElement.contentEditable = true;
        this.textElement.textContent = this.data.text || 'Введите заголовок секции';
        this.textElement.addEventListener('input', () => {
            this.data.text = this.textElement.textContent;
        });

        // Кнопка сворачивания для пользователей (только в режиме просмотра)
        this.collapseToggle = document.createElement('button');
        this.collapseToggle.className = 'container-collapse-toggle';
        this.collapseToggle.innerHTML = this.data.collapsed ? '▶️' : '▼️';
        this.collapseToggle.style.display = 'none';
        this.collapseToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleCollapsedSafely();
        });

        // Контейнер заголовка с кнопкой сворачивания
        const titleContainer = document.createElement('div');
        titleContainer.className = 'container-title-wrapper';
        titleContainer.appendChild(this.textElement);
        titleContainer.appendChild(this.collapseToggle);

        // Применяем текущие настройки
        this.updateBackgroundButtons();
        this.applyContainerSettings();

        this.container.appendChild(controlsContainer);
        this.container.appendChild(titleContainer);
        this.container.appendChild(this.editButton); // Добавляем кнопку редактирования

        // Устанавливаем правильный режим
        if (!this.isEditMode) {
            setTimeout(() => this.finishEditing(), 0);
        } else {
            this.startEditing();
        }

        // Принудительно обновляем стили после инициализации
        setTimeout(() => {
            this.updateBackgroundButtons();
            this.applyContainerSettings();
            if (typeof window.updateContainerStyles === 'function') {
                window.updateContainerStyles();
            }
        }, 100);

        return this.container;
    }

    // Добавление CSS стилей
    addStyles() {
        if (!document.querySelector('#container-tool-styles')) {
            const style = document.createElement('style');
            style.id = 'container-tool-styles';
            style.textContent = `
                .container-tool {
                    border: 2px solid #4f8bd6;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    background: white;
                    position: relative;
                }

                .container-tool.read-only {
                    border: none;
                    border-radius: 0;
                    padding: 20px;
                    margin: 20px 0;
                }

                .container-tool.read-only .container-controls {
                    display: none;
                }

                .container-tool:hover .container-btn-edit {
                    opacity: 1;
                    visibility: visible;
                }

                .container-tool:not(.read-only) .container-btn-edit {
                    display: none;
                }

                .container-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                    align-items: center;
                    flex-wrap: wrap;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    position: relative;
                }

                .container-background-controls {
                    display: flex;
                    gap: 5px;
                }

                .container-btn {
                    padding: 8px 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .container-btn-bg {
                    background-color: #e9ecef;
                    color: #333;
                }

                .container-btn-bg.active {
                    background-color: #4f8bd6;
                    color: white;
                    transform: scale(1.05);
                }

                .container-btn-bg:hover {
                    transform: translateY(-1px);
                }

                .container-btn-collapsible {
                    background-color: #6c757d;
                    color: white;
                }

                .container-btn-collapsible:hover {
                    background-color: #5a6268;
                }

                .container-btn-save {
                    background-color: #28a745;
                    color: white;
                }

                .container-btn-save:hover {
                    background-color: #218838;
                }

                .container-btn-edit {
                    background-color: #007bff;
                    color: white;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s ease, visibility 0.2s ease;
                    z-index: 10;
                    padding: 4px 8px;
                    font-size: 10px;
                    border-radius: 3px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: none;
                    cursor: pointer;
                    height: auto;
                    line-height: 1.2;
                }

                .container-btn-edit:hover {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                }

                .container-title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .container-title {
                    margin: 0;
                    flex: 1;
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                    outline: none;
                    border: none;
                    background: transparent;
                }

                .container-title:focus {
                    background-color: rgba(79, 139, 214, 0.1);
                    border-radius: 4px;
                    padding: 4px 8px;
                }

                .container-collapse-toggle {
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }

                .container-collapse-toggle:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                .container-tool.read-only {
                    border-color: #dee2e6;
                }

                .container-tool.read-only .container-title {
                    cursor: default;
                }

                /* Стили для группировки блоков по ID контайнера */
                .container-styled-block {
                    transition: all 0.3s ease;
                    margin: 0;
                    position: relative;
                }

                .container-styled-block .ce-block__content {
                    padding: 10px 16px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }

                .container-styled-block.white-theme .ce-block__content {
                    background-color: #ffffff;
                }

                .container-styled-block.gray-theme .ce-block__content {
                    background-color: #f8f9fa;
                }

                .container-styled-block.blue-theme .ce-block__content {
                    background-color: #e3f2fd;
                }

                /* Стили для самого контейнера с фоном */
                .container-tool.container-bg-white {
                    background-color: #ffffff;
                    border-left: 4px solid #4f8bd6;
                }

                .container-tool.container-bg-gray {
                    background-color: #f8f9fa;
                    border-left: 4px solid #6c757d;
                }

                .container-tool.container-bg-blue {
                    background-color: #e3f2fd;
                    border-left: 4px solid #2196f3;
                }

                /* Скрытие блоков для свернутых контейнеров */
                .container-styled-block.collapsed {
                    display: none;
                }


            `;
            document.head.appendChild(style);
        }
    }

    // Безопасная установка фона без триггера автосохранения
    setBackgroundSafely(background) {
        console.log('setBackgroundSafely called for container:', this.blockId, 'background:', background);
        
        // Устанавливаем флаг подавления на более длительное время
        if (typeof window !== 'undefined') {
            window.suppressAutoSave = true;
        }
        
        // Дополнительная защита через временное отключение onChange
        this.temporarilyDisableAutoSave(() => {
            this.setBackground(background);
        });
        
        // Увеличиваем время подавления для старых контейнеров
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.suppressAutoSave = false;
                console.log('suppressAutoSave disabled for background change');
            }
        }, 300);
    }

    // Безопасное переключение collapsible без триггера автосохранения
    toggleCollapsibleSafely() {
        console.log('toggleCollapsibleSafely called for container:', this.blockId, 'current state:', this.data.collapsible);
        
        // Устанавливаем флаг подавления на более длительное время
        if (typeof window !== 'undefined') {
            window.suppressAutoSave = true;
        }
        
        // Дополнительная защита через временное отключение onChange
        this.temporarilyDisableAutoSave(() => {
            this.toggleCollapsible();
        });
        
        // Увеличиваем время подавления для старых контейнеров
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.suppressAutoSave = false;
                console.log('suppressAutoSave disabled for collapsible change');
            }
        }, 300);
    }

    // Безопасное переключение collapsed без триггера автосохранения
    toggleCollapsedSafely() {
        console.log('toggleCollapsedSafely called for container:', this.blockId, 'current state:', this.data.collapsed);
        
        if (typeof window !== 'undefined') {
            window.suppressAutoSave = true;
        }
        
        this.temporarilyDisableAutoSave(() => {
            this.toggleCollapsed();
        });
        
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.suppressAutoSave = false;
                console.log('suppressAutoSave disabled for collapsed change');
            }
        }, 300);
    }

    // Временное отключение автосохранения с дополнительными мерами предосторожности
    temporarilyDisableAutoSave(callback) {
        // Сохраняем оригинальный onChange если он есть
        const originalOnChange = this.api && this.api.blocks && this.api.blocks.onChange;
        
        try {
            // Временно отключаем onChange на уровне API
            if (this.api && this.api.blocks) {
                this.api.blocks.onChange = () => {
                    console.log('onChange temporarily disabled for container metadata change');
                };
            }
            
            // Устанавливаем дополнительный флаг
            this._metadataChanging = true;
            
            // Выполняем callback
            callback();
            
        } catch (error) {
            console.error('Error during metadata change:', error);
        } finally {
            // Восстанавливаем оригинальный onChange через небольшую задержку
            setTimeout(() => {
                if (this.api && this.api.blocks && originalOnChange) {
                    this.api.blocks.onChange = originalOnChange;
                }
                this._metadataChanging = false;
            }, 100);
        }
    }

    // Установка фона
    setBackground(background) {
        this.data.background = background;
        this.updateBackgroundButtons();
        this.applyContainerSettings();
        
        // Обновляем стили с задержкой, только если не подавляем автосохранение
        setTimeout(() => {
            if (typeof window.updateContainerStyles === 'function') {
                window.updateContainerStyles();
            }
        }, 50);
    }

    // Переключение возможности скрытия
    toggleCollapsible() {
        this.data.collapsible = !this.data.collapsible;
        this.collapsibleButton.innerText = this.data.collapsible ? '✅ Скрываемый' : '❌ Не скрываемый';
        this.applyContainerSettings();
        
        // Обновляем стили с задержкой, только если не подавляем автосохранение
        setTimeout(() => {
            if (typeof window.updateContainerStyles === 'function') {
                window.updateContainerStyles();
            }
        }, 50);
    }

    // Переключение состояния скрытия
    toggleCollapsed() {
        this.data.collapsed = !this.data.collapsed;
        this.collapseToggle.innerHTML = this.data.collapsed ? '▶️' : '▼️';
        this.applyContainerSettings();
        
        // Обновляем стили с задержкой
        setTimeout(() => {
            if (typeof window.updateContainerStyles === 'function') {
                window.updateContainerStyles();
            }
        }, 50);
    }

    // Обновление состояния кнопок фона
    updateBackgroundButtons() {
        const buttons = this.container.querySelectorAll('.container-btn-bg');
        buttons.forEach(button => button.classList.remove('active'));

        const currentBg = this.data.background || 'white';
        const activeButton = Array.from(buttons).find(btn => {
            if (currentBg === 'white' && btn.innerText.includes('Белый')) return true;
            if (currentBg === 'gray' && btn.innerText.includes('Серый')) return true;
            if (currentBg === 'blue' && btn.innerText.includes('Голубой')) return true;
            return false;
        });

        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Применение настроек контайнера
    applyContainerSettings() {
        // Устанавливаем data-атрибуты на родительский блок Editor.js
        const editorBlock = this.container.closest('.ce-block');
        if (editorBlock) {
            editorBlock.setAttribute('data-container-bg', this.data.background || 'white');
            editorBlock.setAttribute('data-container-collapsed', this.data.collapsed ? 'true' : 'false');
            editorBlock.setAttribute('data-container-id', this.blockId);
        }

        // Применяем фон к самому контейнеру
        this.container.classList.remove('container-bg-white', 'container-bg-gray', 'container-bg-blue');
        this.container.classList.add(`container-bg-${this.data.background || 'white'}`);

        // Показываем/скрываем кнопку сворачивания в зависимости от режима и настроек
        if (this.data.collapsible && !this.isEditMode) {
            this.collapseToggle.style.display = 'block';
        } else {
            this.collapseToggle.style.display = 'none';
        }

        // Применяем стили к последующим блокам
        this.styleFollowingBlocks();
    }

    // Новый метод для стилизации последующих блоков
    styleFollowingBlocks() {
        // Используем глобальную функцию обновления стилей, если она доступна
        if (typeof window.updateContainerStyles === 'function') {
            setTimeout(() => window.updateContainerStyles(), 10);
            return;
        }
        
        // Fallback для случаев, когда глобальная функция недоступна
        if (!this.api || !this.api.blocks) return;

        const currentBlockIndex = this.api.blocks.getCurrentBlockIndex();
        const allBlocks = this.api.blocks.getBlocksCount();
        
        // Удаляем старые стили для этого контейнера
        this.removeContainerStyles();
        
        // Применяем стили к блокам после текущего контейнера
        for (let i = currentBlockIndex + 1; i < allBlocks; i++) {
            const blockElement = this.getBlockElementByIndex(i);
            if (!blockElement) continue;
            
            // Проверяем, не является ли этот блок другим контейнером
            if (this.isContainerBlock(blockElement)) {
                break; // Останавливаемся, если встретили другой контейнер
            }
            
            // Применяем стили
            this.applyStylesToBlock(blockElement);
        }
    }

    // Получить DOM элемент блока по индексу
    getBlockElementByIndex(index) {
        try {
            const block = this.api.blocks.getBlockByIndex(index);
            if (block && block.holder) {
                return block.holder;
            }
        } catch (e) {
            console.warn('Не удалось получить блок по индексу:', index, e);
        }
        return null;
    }

    // Проверить, является ли блок контейнером
    isContainerBlock(blockElement) {
        return blockElement.querySelector('.container-tool') !== null ||
               blockElement.getAttribute('data-container-id') !== null;
    }

    // Применить стили к блоку
    applyStylesToBlock(blockElement) {
        if (!blockElement) return;
        
        // Добавляем общий класс и класс темы
        blockElement.classList.add('container-styled-block');
        blockElement.classList.add(`${this.data.background}-theme`);
        
        // Устанавливаем атрибут для связи с контейнером
        blockElement.setAttribute('data-styled-by-container', this.blockId);
        
        // Применяем состояние сворачивания
        if (this.data.collapsed) {
            blockElement.classList.add('collapsed');
        } else {
            blockElement.classList.remove('collapsed');
        }
    }

    // Удалить стили контейнера
    removeContainerStyles() {
        const styledBlocks = document.querySelectorAll(`[data-styled-by-container="${this.blockId}"]`);
        styledBlocks.forEach(block => {
            block.classList.remove('container-styled-block', 'white-theme', 'gray-theme', 'blue-theme', 'collapsed');
            block.removeAttribute('data-styled-by-container');
        });
    }

    // Завершение редактирования
    finishEditing() {
        this.isEditMode = false;
        this.container.classList.add('read-only');

        // Отключаем редактирование заголовка
        this.textElement.contentEditable = false;

        // Применяем настройки для отображения кнопки сворачивания
        this.applyContainerSettings();
    }

    // Начало редактирования
    startEditing() {
        this.isEditMode = true;
        this.container.classList.remove('read-only');

        // Включаем редактирование заголовка
        this.textElement.contentEditable = true;

        // Обновляем состояние кнопок фона
        this.updateBackgroundButtons();

        // Применяем настройки для скрытия кнопки сворачивания в режиме редактирования
        this.applyContainerSettings();
    }

    // Статический метод для создания блока из JSON данных
    static get conversionConfig() {
        return {
            import: 'text',
            export: 'text'
        };
    }

    // Конфигурация для обработки вставки
    static get pasteConfig() {
        return {
            tags: ['H1']
        };
    }

    // Обработка вставки
    onPaste(event) {
        const content = event.detail.data;
        this.data.text = content.textContent || content.innerHTML || '';
        if (this.textElement) {
            this.textElement.textContent = this.data.text;
        }
    }

    // Очистка при удалении блока
    destroy() {
        this.removeContainerStyles();
    }
}

// Делаем класс доступным в глобальной области для браузера
if (typeof window !== 'undefined') {
    window.ContainerTool = ContainerTool;
}

// Экспортируем класс для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContainerTool };
}
