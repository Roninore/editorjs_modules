class SliderTool {
    constructor({ data }) {
        this.data = data || { slides: [] };
        this.container = null;
        this.slidesContainer = null;
        this.input = null;
        this.addButton = null;
        this.saveButton = null;
        this.currentSlideIndex = 0;
        this.dots = []; // Инициализация массива для точек навигации
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'slider-tool';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.container.appendChild(this.input);

        this.addButton = document.createElement('button');
        this.addButton.innerText = 'Добавить';
        this.addButton.addEventListener('click', () => this.addSlide());
        this.container.appendChild(this.addButton);

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


    renderSlides() {
        this.dotsContainer.innerHTML = ''; // Очищаем контейнер точек
        this.dots = []; // Очищаем массив точ

        if (!this.data.slides || !Array.isArray(this.data.slides)) {
            this.data.slides = [];
        }

        this.slidesContainer.innerHTML = '';

        this.data.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.style.backgroundImage = `url(${slide})`;
            this.slidesContainer.appendChild(slideElement);

            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot); // Добавляем точку в массив
        });

        this.updateActiveDot();
    }

    addSlide() {
        const newSlide = this.input.value;
        if (newSlide) {
            this.data.slides.push(newSlide);
            this.renderSlides();
            this.input.value = '';
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
        this.input.style.display = 'none';
        this.addButton.style.display = 'none';
        this.saveButton.style.display = 'none';
    }
    handleSlideClick(event) {
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
            title: 'Slider',
        };
    }
}
