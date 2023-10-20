class LinkButtonsColor {
    static get toolbox() {
        return {
            title: 'Кнопки цветные',
            icon: '<svg width="17" height="17" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM7.414 16.586l-3.586-3.586 1.414-1.414 2.172 2.172 6.172-6.172 1.414 1.414-7.586 7.586z"/></svg>'
        };
    }

    constructor({ data, config, api }) {
        this.api = api;
        this.data = data.buttons || [];
        this.container = document.createElement('div');
        this.container.classList.add('link-button-container');

        this.inputText = this.createInput('text', '', 'Добавьте название');
        this.inputLink = this.createInput('link', '', 'Добавьте ссылку');

        this.addButton = document.createElement('button');
        this.addButton.innerHTML = 'Добавить кнопку';
        this.addButton.addEventListener('click', () => {
            const text = this.inputText.value.trim();
            const link = this.inputLink.value.trim();
            if (text && link) {
                this.data.push({ text, link });
                this.renderButtons();
                this.inputText.value = '';
                this.inputLink.value = '';
            }
        });

        this.saveAndHideButton = document.createElement('button');
        this.saveAndHideButton.innerHTML = 'Сохранить и скрыть инпуты';
        this.saveAndHideButton.addEventListener('click', () => {
            this.inputText.style.display = 'none';
            this.inputLink.style.display = 'none';
            this.addButton.style.display = 'none';
            this.saveAndHideButton.style.display = 'none';
        });

        this.container.appendChild(this.inputText);
        this.container.appendChild(this.inputLink);
        this.container.appendChild(this.addButton);
        this.container.appendChild(this.saveAndHideButton);

        this.renderButtons();
    }

    createInput(key, value, placeholder) {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', ` ${placeholder}`);
        input.classList.add('link-button-input');
        input.value = value;
        return input;
    }

    renderButtons() {
        this.container.innerHTML = ''; // Очистить контейнер перед отображением кнопок

        this.data.forEach(buttonData => {
            const button = document.createElement('a');
            button.href = buttonData.link;
            button.textContent = buttonData.text;
            button.classList.add('SimpleButton');
            this.container.appendChild(button);
        });

        this.container.appendChild(this.inputText);
        this.container.appendChild(this.inputLink);
        this.container.appendChild(this.addButton);
        this.container.appendChild(this.saveAndHideButton);
    }

    saveAllButtons() {
        this.data = this.data.filter(button => button.text && button.link);
        this.api.saveData({ buttons: this.data });
        alert('Кнопки сохранены!');
    }

    render() {
        return this.container;
    }

    save(blockContent) {
        const buttons = blockContent.querySelectorAll('a.SimpleButton');

        const data = Array.from(buttons).map(button => ({
            text: button.textContent,
            link: button.href
        }));

        return {
            buttons: data
        };
    }
}
