class SliderTool {
    constructor({ data }) {
        this.data = data || { slides: [] };
        this.container = null;
        this.slidesContainer = null;
        this.fileInput = null;
        this.addButton = null;
        this.saveButton = null;
        this.currentSlideIndex = 0;
        this.dots = [];
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'slider-tool';

        this.urlInput = document.createElement('input');
        this.urlInput.type = 'text';
        this.container.appendChild(this.urlInput);
        this.addButton = document.createElement('button');
        this.addButton.innerText = 'Добавить';
        this.addButton.addEventListener('click', () => this.addSlide());
        this.container.appendChild(this.addButton);

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.multiple = true;
        this.fileInput.addEventListener('change', (event) => this.handleFileSelect(event));
        this.container.appendChild(this.fileInput);



        this.slidesContainer = document.createElement('div');
        this.slidesContainer.className = 'slides-container';
        this.container.appendChild(this.slidesContainer);
        this.slidesContainer.addEventListener('pointerdown', (event) => this.handleSlideClick(event));



        // Создаем контейнер для точек и добавляем его в основной контейнер
        this.dotsContainer = document.createElement('div');
        this.dotsContainer.className = 'slider-dots';
        this.container.appendChild(this.dotsContainer);

        this.saveButton = document.createElement('button');
        this.saveButton.innerText = 'Сохранить';
        this.saveButton.addEventListener('click', () => this.saveSlides());
        this.container.appendChild(this.saveButton);

        this.renderSlides();

        return this.container;
    }
    handleFileSelect(event) {
        const files = event.target.files;
        const urls = [];

        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises)
            .then(fileDataURLs => {
                urls.push(...fileDataURLs);

                // Обработка ссылок на фото
                const textAreaValue = this.urlInput.value;
                const urlsArray = textAreaValue.split('\n');
                urlsArray.forEach(url => {
                    if (url) {
                        urls.push(url.trim()); // Убираем возможные пробелы в начале или конце URL-адреса
                    }
                });

                if (urls.length > 0) {
                    this.addSlides(urls);
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    addSlides(sources) {
        if (Array.isArray(sources)) {
            const blobs = sources.map(source => {
                if (source.startsWith('http') || source.startsWith('https')) {
                    // Если источник - это URL, создаем Blob из него
                    return fetch(source)
                        .then(response => response.blob());
                } else {
                    // Иначе, это Data URL, создаем Blob из него
                    const byteString = atob(source.split(',')[1]);
                    const mimeString = source.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    return new Blob([ab], { type: mimeString });
                }
            });

            Promise.all(blobs)
                .then(blobArray => {
                    const blobURLs = blobArray.map(blob => URL.createObjectURL(blob));
                    this.data.slides = [...this.data.slides, ...blobURLs];
                    this.renderSlides();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }
    renderSlides() {
        this.dotsContainer.innerHTML = '';
        this.dots = [];

        if (!this.data.slides || !Array.isArray(this.data.slides)) {
            this.data.slides = [];
        }

        this.slidesContainer.innerHTML = '';

        this.data.slides.forEach((slide, index) => {
            const slideContainer = document.createElement('div');
            slideContainer.className = 'slide-container';

            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.style.backgroundImage = `url(${slide})`;

            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Удалить';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', (event) => {
                event.preventDefault();// Остановка всплытия события
                this.removeSlide(index);
            });

            const moveLeftButton = document.createElement('button');
            moveLeftButton.innerText = '← Переместить влево';
            moveLeftButton.className = 'left-button';
            moveLeftButton.addEventListener('click', () => this.moveSlideLeft(index));
            slideContainer.appendChild(moveLeftButton);

            // Кнопка "Переместить вправо"
            const moveRightButton = document.createElement('button');
            moveRightButton.innerText = 'Переместить вправо →';
            moveRightButton.className = 'right-button';
            moveRightButton.addEventListener('click', () => this.moveSlideRight(index));
            slideContainer.appendChild(moveRightButton);

            slideContainer.appendChild(slideElement);
            slideContainer.appendChild(deleteButton);

            this.slidesContainer.appendChild(slideContainer);

            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
        this.updateActiveDot();
    }

    moveSlideLeft() {
        if (this.currentSlideIndex > 0) {
            const removedSlide = this.data.slides.splice(this.currentSlideIndex, 1)[0];
            this.data.slides.splice(this.currentSlideIndex - 1, 0, removedSlide);
            this.renderSlides();
            this.goToSlide(this.currentSlideIndex - 1);
        }
    }

    moveSlideRight() {
        if (this.currentSlideIndex < this.data.slides.length - 1) {
            const removedSlide = this.data.slides.splice(this.currentSlideIndex, 1)[0];
            this.data.slides.splice(this.currentSlideIndex + 1, 0, removedSlide);
            this.renderSlides();
            this.goToSlide(this.currentSlideIndex + 1);
        }
    }
    removeSlide(index) {
        if (index === this.data.slides.length - 1) {
            // Если удаляемый слайд последний в массиве, переключаемся на предыдущий слайд
            this.currentSlideIndex = index - 1;
        }
        this.data.slides.splice(index, 1);
        this.renderSlides();
    }
    addSlide() {
        const newSlideURL = this.urlInput.value;
        if (newSlideURL) {
            // Проверяем, является ли введенное значение ссылкой
            if (newSlideURL.startsWith('http') || newSlideURL.startsWith('https')) {
                this.data.slides.push(newSlideURL);
                this.renderSlides();
                this.urlInput.value = '';
            } else {
                alert('Пожалуйста, введите правильный URL для изображения.');
                // Можно добавить пользовательский интерфейс для сообщения об ошибке
            }
        }
    }

    goToSlide(index) {
        this.currentSlideIndex = index;
        const translateValue = -index * 100 + '%';
        this.slidesContainer.style.transform = `translateX(${translateValue})`;
        this.updateActiveDot();
    }

    updateActiveDot() {
        this.dots.forEach((dot, index) => {
            if (index === this.currentSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    saveSlides() {
        this.urlInput.style.display = 'none';
        this.fileInput.style.display = 'none';
        this.addButton.style.display = 'none';
        this.saveButton.style.display = 'none';
    }

    handleSlideClick(event) {
        const target = event.target;

        // Проверяем, является ли целевой элемент кнопкой "Удалить"
        if (target.classList.contains('delete-button') || target.classList.contains('left-button') || target.classList.contains('right-button')) {
            // Если это кнопка "Удалить", обработку события не выполняем
            return;
        }
        const clickX = event.clientX;
        const slideRect = event.target.getBoundingClientRect();
        const slideCenterX = (slideRect.left + slideRect.right) / 2;

        if (clickX < slideCenterX && this.currentSlideIndex > 0) {
            // Нажатие на левую часть слайда (меньше чем середина), если не первый слайд
            this.goToSlide(this.currentSlideIndex - 1);
        } else if (clickX > slideCenterX && this.currentSlideIndex < this.data.slides.length - 1) {
            // Нажатие на правую часть слайда (больше чем середина), если не последний слайд
            this.goToSlide(this.currentSlideIndex + 1);
        }
        console.log('clickX:', clickX);
        console.log('slideCenterX:', slideCenterX);
    }
    save() {
        return { slides: this.data.slides };
    }

    static get toolbox() {
        return {
            title: 'Галерея',
        };
    }
}