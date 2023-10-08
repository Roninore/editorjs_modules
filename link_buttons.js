class LinkButtons {
    static get toolbox() {
        return {
            title: 'Ссылки',
            icon: '<svg width="17" height="17" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM7.414 16.586l-3.586-3.586 1.414-1.414 2.172 2.172 6.172-6.172 1.414 1.414-7.586 7.586z"/></svg>'
        };
    }

    constructor({ data, config, api }) {
        this.api = api;
        this.data = {
            text1: data.text1 || '',
            link1: data.link1 || '',
            text2: data.text2 || '',
            link2: data.link2 || ''
        };
        this.container = document.createElement('div');
        this.container.classList.add('link-button-container');

        this.inputText1 = this.createInput('text1', this.data.text1);
        this.inputLink1 = this.createInput('link1', this.data.link1);
        this.inputText2 = this.createInput('text2', this.data.text2);
        this.inputLink2 = this.createInput('link2', this.data.link2);

        this.saveButton = document.createElement('button');
        this.saveButton.innerHTML = 'Сохранить';
        this.saveButton.classList.add('link-button-button');
        this.saveButton.addEventListener('click', () => {
            const savedData = this.getData();
            this.container.innerHTML = ''; // Очистить контейнер от инпутов и кнопки "Сохранить"
            this.displayButtons(savedData);
        });

        this.container.appendChild(this.inputText1);
        this.container.appendChild(this.inputLink1);
        this.container.appendChild(this.inputText2);
        this.container.appendChild(this.inputLink2);
        this.container.appendChild(this.saveButton);
    }
    displayButtons(data) {
        const button1 = document.createElement('a');
        button1.href = data.link1;
        button1.textContent = data.text1;
        button1.classList.add('link-button-display-button');

        const button2 = document.createElement('a');
        button2.href = data.link2;
        button2.textContent = data.text2;
        button2.classList.add('link-button-display-button');

        this.container.appendChild(button1);
        this.container.appendChild(button2);
    }
    createInput(key, value) {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', ` ${key}`);
        input.classList.add('link-button-input');
        input.value = value;
        input.addEventListener('input', () => {
            this.data[key] = input.value;
        });
        return input;
    }

    getData() {
        return this.data;
    }

    render() {
        return this.container;
    }

    save() {
        return this.data;
    }
}