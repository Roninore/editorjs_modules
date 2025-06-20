
class SliderTool {
    constructor({ data, api, config }) {
        this.data = data || { slides: [] };
        // Обеспечиваем, что slides всегда массив
        if (!this.data.slides || !Array.isArray(this.data.slides)) {
            this.data.slides = [];
        }
        // Устанавливаем режим отображения по умолчанию
        if (!this.data.displayMode) {
            this.data.displayMode = 'slider';
        }
        this.api = api;
        this.config = config;
        this.container = null;
        this.slidesContainer = null;
        this.input = null;
        this.addButton = null;
        this.deleteButton = null;
        this.saveButton = null;
        this.currentSlideIndex = 0;
        this.dots = [];
        this.isEditMode = true;
    }

    // Получение данных для сохранения
    save() {
        return { 
            slides: this.data.slides,
            displayMode: this.data.displayMode || 'slider'
        };
    }

    // Валидация данных
    validate(savedData) {
        if (!savedData.slides || !Array.isArray(savedData.slides)) {
            return false;
        }
        // Разрешаем сохранение даже пустой галереи
        return true;
    }

    // Конфигурация для автоматической очистки от опасного контента
    static get sanitize() {
        return {
            slides: false // Массив URL изображений не требует санитизации
        };
    }

    // Настройки для Toolbox
    static get toolbox() {
        return {
            title: 'Галерея',
            icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M15.833 6.342V2.5a1 1 0 0 0-1-1H2.167a1 1 0 0 0-1 1v3.842l3.104-3.104a1 1 0 0 1 1.414 0l2.5 2.5 1.293-1.293a1 1 0 0 1 1.414 0l5.941 5.941zM15.833 8.484l-5.232-5.232-1.293 1.293-2.5-2.5L1.167 7.687V12.5a1 1 0 0 0 1 1h12.666a1 1 0 0 0 1-1V8.484zM13.167 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>'
        };
    }

    // Регистрация Block Tunes (временно отключено)
    // static get tunes() {
    //     return ['displayMode'];
    // }

    // Основной метод рендеринга
    render() {
        this.container = document.createElement('div');
        this.container.className = 'gallery-tool';

        // Добавляем стили
        this.addStyles();

        // Контейнер для управления
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'gallery-controls';

        // Поле ввода URL
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Введите URL изображения';
        this.input.className = 'gallery-input';
        this.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.addSlide();
            }
        });

        // Кнопка добавления
        this.addButton = document.createElement('button');
        this.addButton.innerText = 'Добавить';
        this.addButton.className = 'gallery-btn gallery-btn-add';
        this.addButton.addEventListener('click', () => this.addSlide());

        // Кнопка удаления текущего слайда
        this.deleteButton = document.createElement('button');
        this.deleteButton.innerText = 'Удалить текущий';
        this.deleteButton.className = 'gallery-btn gallery-btn-delete';
        this.deleteButton.addEventListener('click', () => this.deleteCurrentSlide());

        // Кнопка сохранения (завершение редактирования)
        this.saveButton = document.createElement('button');
        this.saveButton.innerText = 'Завершить редактирование';
        this.saveButton.className = 'gallery-btn gallery-btn-save';
        this.saveButton.addEventListener('click', () => this.finishEditing());

        // Кнопка редактирования (для возврата в режим редактирования)
        this.editButton = document.createElement('button');
        this.editButton.innerText = 'Редактировать';
        this.editButton.className = 'gallery-btn gallery-btn-edit';
        this.editButton.style.display = 'none';
        this.editButton.addEventListener('click', () => this.startEditing());

        // Кнопка переключения режима отображения
        this.modeToggleButton = document.createElement('button');
        this.modeToggleButton.innerText = '🔲 Таблица';
        this.modeToggleButton.className = 'gallery-btn gallery-btn-mode';
        this.modeToggleButton.title = 'Переключить режим отображения';
        this.modeToggleButton.addEventListener('click', () => this.toggleDisplayMode());

        controlsContainer.appendChild(this.input);
        controlsContainer.appendChild(this.addButton);
        controlsContainer.appendChild(this.deleteButton);
        controlsContainer.appendChild(this.modeToggleButton);
        controlsContainer.appendChild(this.saveButton);
        controlsContainer.appendChild(this.editButton);

        // Основной контейнер слайдера
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'gallery-slider-wrapper';

        // Контейнер для слайдов
        this.slidesContainer = document.createElement('div');
        this.slidesContainer.className = 'gallery-slides';

        // Стрелки навигации
        const prevButton = document.createElement('button');
        prevButton.className = 'gallery-arrow gallery-arrow-prev';
        prevButton.innerHTML = '‹';
        prevButton.addEventListener('click', () => this.previousSlide());

        const nextButton = document.createElement('button');
        nextButton.className = 'gallery-arrow gallery-arrow-next';
        nextButton.innerHTML = '›';
        nextButton.addEventListener('click', () => this.nextSlide());

        sliderWrapper.appendChild(prevButton);
        sliderWrapper.appendChild(this.slidesContainer);
        sliderWrapper.appendChild(nextButton);

        // Контейнер для точек навигации
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'gallery-dots';

        this.container.appendChild(controlsContainer);
        this.container.appendChild(sliderWrapper);
        this.container.appendChild(this.dotsContainer);



        // Сохраняем ссылку на экземпляр
        this.container.__galleryTool = this;

        this.renderSlides();

        return this.container;
    }

    // Добавление CSS стилей
    addStyles() {
        if (!document.querySelector('#gallery-tool-styles')) {
            const style = document.createElement('style');
            style.id = 'gallery-tool-styles';
            style.textContent = `
                .gallery-tool {
                    border: 1px solid #e8e8eb;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 15px 0;
                    background: white;
                }

                .gallery-controls {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .gallery-input {
                    flex: 1;
                    min-width: 250px;
                    padding: 10px 12px;
                    border: 1px solid #e8e8eb;
                    border-radius: 6px;
                    font-size: 14px;
                    outline: none;
                }

                .gallery-input:focus {
                    border-color: #4f8bd6;
                    box-shadow: 0 0 0 2px rgba(79, 139, 214, 0.2);
                }

                .gallery-btn {
                    padding: 10px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .gallery-btn-add {
                    background-color: #4f8bd6;
                    color: white;
                }

                .gallery-btn-add:hover {
                    background-color: #3d7bc6;
                    transform: translateY(-1px);
                }

                .gallery-btn-delete {
                    background-color: #e74c3c;
                    color: white;
                }

                .gallery-btn-delete:hover {
                    background-color: #c0392b;
                    transform: translateY(-1px);
                }

                .gallery-btn-save {
                    background-color: #27ae60;
                    color: white;
                }

                .gallery-btn-save:hover {
                    background-color: #229954;
                    transform: translateY(-1px);
                }

                .gallery-btn-edit {
                    background-color: #f39c12;
                    color: white;
                }

                .gallery-btn-edit:hover {
                    background-color: #e67e22;
                    transform: translateY(-1px);
                }

                .gallery-btn-mode {
                    background-color: #9b59b6;
                    color: white;
                    font-size: 12px;
                }

                .gallery-btn-mode:hover {
                    background-color: #8e44ad;
                    transform: translateY(-1px);
                }

                .gallery-slider-wrapper {
                    position: relative;
                    width: 100%;
                    height: 350px;
                    margin-bottom: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                .gallery-slides {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .gallery-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }

                .gallery-slide.active {
                    opacity: 1;
                }

                .gallery-slide.empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                    font-size: 16px;
                    background-color: #f8f9fa;
                }

                .gallery-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .gallery-arrow:hover {
                    background: rgba(0, 0, 0, 0.7);
                    transform: translateY(-50%) scale(1.1);
                }

                .gallery-arrow-prev {
                    left: 15px;
                }

                .gallery-arrow-next {
                    right: 15px;
                }

                .gallery-dots {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                }

                .gallery-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: #ddd;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .gallery-dot:hover {
                    background-color: #bbb;
                    transform: scale(1.2);
                }

                .gallery-dot.active {
                    background-color: #4f8bd6;
                    transform: scale(1.3);
                }

                .gallery-tool.read-only .gallery-controls {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }

                .gallery-tool.read-only .gallery-arrow {
                    display: none;
                }

                /* Скрываем стрелки если слайд один или нет слайдов */
                .gallery-tool.single-slide .gallery-arrow,
                .gallery-tool.no-slides .gallery-arrow {
                    display: none;
                }



                /* Стили для режима таблицы */
                .gallery-tool.grid-mode .gallery-slider-wrapper {
                    height: auto;
                    min-height: 200px;
                    padding: 20px;
                }

                .gallery-tool.grid-mode .gallery-slides {
                    position: static;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    width: 100%;
                    height: auto;
                }

                .gallery-tool.grid-mode .gallery-slide {
                    position: static;
                    opacity: 1;
                    height: 200px;
                    border-radius: 8px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .gallery-tool.grid-mode .gallery-slide:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .gallery-tool.grid-mode .gallery-slide.empty {
                    border: 2px dashed #ddd;
                    background-color: #f8f9fa;
                }

                .gallery-tool.grid-mode .gallery-arrow {
                    display: none;
                }

                .gallery-tool.grid-mode .gallery-dots {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Рендеринг слайдов
    renderSlides() {
        console.log('Rendering slides:', this.data.slides, 'Mode:', this.data.displayMode);
        
        // Очищаем контейнеры
        this.slidesContainer.innerHTML = '';
        this.dotsContainer.innerHTML = '';
        this.dots = [];

        // Обновляем CSS классы контейнера
        this.container.classList.remove('no-slides', 'single-slide', 'grid-mode');
        
        // Устанавливаем режим отображения
        const displayMode = this.data.displayMode || 'slider';
        if (displayMode === 'grid') {
            this.container.classList.add('grid-mode');
        }
        
        if (this.data.slides.length === 0) {
            this.container.classList.add('no-slides');
            const emptySlide = document.createElement('div');
            emptySlide.className = 'gallery-slide empty active';
            emptySlide.textContent = 'Добавьте изображения для создания галереи';
            this.slidesContainer.appendChild(emptySlide);
            
            // Скрываем кнопки управления при отсутствии слайдов
            this.deleteButton.style.display = 'none';
            if (this.isEditMode) {
                this.modeToggleButton.style.display = 'inline-block';
            } else {
                this.modeToggleButton.style.display = 'none';
            }
            return;
        }

        if (this.data.slides.length === 1 && displayMode === 'slider') {
            this.container.classList.add('single-slide');
        }

        // Показываем кнопки только в режиме редактирования
        if (this.isEditMode) {
            this.deleteButton.style.display = 'inline-block';
            this.modeToggleButton.style.display = 'inline-block';
        } else {
            this.deleteButton.style.display = 'none';
            this.modeToggleButton.style.display = 'none';
        }

        // Обновляем текст кнопки удаления
        if (displayMode === 'grid') {
            this.deleteButton.innerText = 'Удалить последний';
        } else {
            this.deleteButton.innerText = 'Удалить текущий';
        }

        // Обновляем текст кнопки переключения режима
        if (displayMode === 'grid') {
            this.modeToggleButton.innerText = '📱 Слайдер';
            this.modeToggleButton.title = 'Переключить на слайдер';
        } else {
            this.modeToggleButton.innerText = '🔲 Таблица';
            this.modeToggleButton.title = 'Переключить на таблицу';
        }

        // Создаем слайды
        this.data.slides.forEach((slide, index) => {
            console.log(`Creating slide ${index}:`, slide);
            
            const slideElement = document.createElement('div');
            slideElement.className = 'gallery-slide';
            slideElement.setAttribute('data-index', index);
            
            // В режиме слайдера показываем только активный слайд
            if (displayMode === 'slider') {
                if (index === this.currentSlideIndex) {
                    slideElement.classList.add('active');
                }
            } else {
                // В режиме таблицы показываем все слайды
                slideElement.classList.add('active');
            }

            // Проверяем и загружаем изображение
            const img = new Image();
            img.onload = () => {
                console.log(`Image loaded: ${slide}`);
                slideElement.style.backgroundImage = `url("${slide}")`;
            };
            img.onerror = () => {
                console.log(`Image failed: ${slide}`);
                slideElement.classList.add('empty');
                slideElement.textContent = 'Ошибка загрузки изображения';
            };
            img.src = slide;

            // В режиме таблицы добавляем обработчик клика для удаления
            if (displayMode === 'grid') {
                slideElement.addEventListener('click', () => {
                    if (this.isEditMode) {
                        this.deleteSlide(index);
                    }
                });
                slideElement.style.cursor = this.isEditMode ? 'pointer' : 'default';
                slideElement.title = this.isEditMode ? 'Нажмите для удаления' : '';
            }

            this.slidesContainer.appendChild(slideElement);

            // Создаем точки навигации только для режима слайдера
            if (displayMode === 'slider') {
                const dot = document.createElement('div');
                dot.className = 'gallery-dot';
                if (index === this.currentSlideIndex) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => this.goToSlide(index));
                this.dotsContainer.appendChild(dot);
                this.dots.push(dot);
            }
        });

        // Корректируем текущий индекс
        if (this.currentSlideIndex >= this.data.slides.length) {
            this.currentSlideIndex = Math.max(0, this.data.slides.length - 1);
        }
    }

    // Добавление слайда
    addSlide() {
        const newSlide = this.input.value.trim();
        if (newSlide) {
            this.data.slides.push(newSlide);
            this.input.value = '';
            this.renderSlides();
            // Переходим к новому слайду
            this.goToSlide(this.data.slides.length - 1);
        }
    }

    // Удаление текущего слайда
    deleteCurrentSlide() {
        if (this.data.slides.length === 0) {
            return;
        }

        const displayMode = this.data.displayMode || 'slider';
        
        if (displayMode === 'grid') {
            // В режиме таблицы удаляем последний слайд
            this.data.slides.pop();
        } else {
            // В режиме слайдера удаляем текущий активный слайд
            this.data.slides.splice(this.currentSlideIndex, 1);
            
            // Корректируем индекс
            if (this.currentSlideIndex >= this.data.slides.length && this.data.slides.length > 0) {
                this.currentSlideIndex = this.data.slides.length - 1;
            } else if (this.data.slides.length === 0) {
                this.currentSlideIndex = 0;
            }
        }

        this.renderSlides();
    }

    // Удаление конкретного слайда (для режима таблицы)
    deleteSlide(index) {
        if (index < 0 || index >= this.data.slides.length) {
            return;
        }

        this.data.slides.splice(index, 1);

        // Корректируем текущий индекс если нужно
        if (this.currentSlideIndex >= this.data.slides.length && this.data.slides.length > 0) {
            this.currentSlideIndex = this.data.slides.length - 1;
        } else if (this.data.slides.length === 0) {
            this.currentSlideIndex = 0;
        } else if (index <= this.currentSlideIndex) {
            this.currentSlideIndex = Math.max(0, this.currentSlideIndex - 1);
        }

        this.renderSlides();
    }

    // Переход к слайду
    goToSlide(index) {
        if (index < 0 || index >= this.data.slides.length) {
            return;
        }

        console.log(`Going to slide ${index}`);

        // Убираем активный класс со всех слайдов и точек
        const slides = this.slidesContainer.querySelectorAll('.gallery-slide');
        slides.forEach(slide => slide.classList.remove('active'));

        this.dots.forEach(dot => dot.classList.remove('active'));

        // Добавляем активный класс к текущему слайду и точке
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }

        this.currentSlideIndex = index;
    }

    // Предыдущий слайд
    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.goToSlide(this.currentSlideIndex - 1);
        }
    }

    // Следующий слайд
    nextSlide() {
        if (this.currentSlideIndex < this.data.slides.length - 1) {
            this.goToSlide(this.currentSlideIndex + 1);
        }
    }

    // Завершение редактирования
    finishEditing() {
        this.isEditMode = false;
        this.container.classList.add('read-only');
        
        // Переключаем видимость кнопок
        this.input.style.display = 'none';
        this.addButton.style.display = 'none';
        this.deleteButton.style.display = 'none';
        this.modeToggleButton.style.display = 'none';
        this.saveButton.style.display = 'none';
        this.editButton.style.display = 'inline-block';
        
        // Обновляем рендеринг для скрытия интерактивности
        this.renderSlides();
    }

    // Начало редактирования
    startEditing() {
        this.isEditMode = true;
        this.container.classList.remove('read-only');
        
        // Переключаем видимость кнопок
        this.input.style.display = 'block';
        this.addButton.style.display = 'inline-block';
        this.deleteButton.style.display = this.data.slides.length > 0 ? 'inline-block' : 'none';
        this.modeToggleButton.style.display = 'inline-block';
        this.saveButton.style.display = 'inline-block';
        this.editButton.style.display = 'none';
        
        // Обновляем рендеринг для восстановления интерактивности
        this.renderSlides();
    }

    // Переключение режима отображения
    toggleDisplayMode() {
        const currentMode = this.data.displayMode || 'slider';
        const newMode = currentMode === 'slider' ? 'grid' : 'slider';
        
        this.data.displayMode = newMode;
        
        // Обновляем текст кнопки
        if (newMode === 'grid') {
            this.modeToggleButton.innerText = '📱 Слайдер';
            this.modeToggleButton.title = 'Переключить на слайдер';
        } else {
            this.modeToggleButton.innerText = '🔲 Таблица';
            this.modeToggleButton.title = 'Переключить на таблицу';
        }
        
        this.renderSlides();
    }

    // Статический метод для создания блока из JSON данных
    static get conversionConfig() {
        return {
            import: 'slides',
            export: 'slides'
        };
    }

    // Конфигурация для обработки вставки
    static get pasteConfig() {
        return {
            patterns: {
                image: /https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)/i
            }
        };
    }

    // Обработка вставки
    onPaste(event) {
        switch (event.type) {
            case 'pattern':
                const url = event.detail.data;
                if (url) {
                    this.data.slides.push(url);
                    this.renderSlides();
                    this.goToSlide(this.data.slides.length - 1);
                }
                break;
        }
    }
}

// Делаем класс доступным в глобальной области для браузера
if (typeof window !== 'undefined') {
    window.SliderTool = SliderTool;
}

// Экспортируем класс для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SliderTool };
}