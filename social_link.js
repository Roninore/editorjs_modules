class SocialLinkTool {
    constructor({ data }) {
        this.data = data || {};
        this.container = null;
        this.addButton = null;
        this.saveButton = null;
        this.linksContainer = null;
        this.socialNetworks = [

            { name: 'whatsapp', icon: 'https://cdn.jsdelivr.net/gh/Roninore/editorjs_modules@1.5/icon/whatsapp.png' },
            { name: 'facebook', icon: 'https://cdn.jsdelivr.net/gh/Roninore/editorjs_modules@1.5/icon/Facebook.svg' },
            { name: 'instagram', icon: 'https://cdn.jsdelivr.net/gh/Roninore/editorjs_modules@1.5/icon/instagram.svg' },
            { name: 'web', icon: 'https://cdn.jsdelivr.net/gh/Roninore/editorjs_modules@1.5/icon/web.svg' }

        ];
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'social-link-tool';

        this.addButton = document.createElement('button');
        this.addButton.innerText = 'Добавить ссылку';
        this.addButton.addEventListener('click', () => this.insertSocialLink());
        this.container.appendChild(this.addButton);

        this.linksContainer = document.createElement('div');
        this.container.appendChild(this.linksContainer);

        this.saveButton = document.createElement('button');
        this.saveButton.innerText = 'Сохранить';
        this.saveButton.addEventListener('click', () => this.saveLinks());
        this.container.appendChild(this.saveButton);

        // Отрисовываем существующие ссылки
        this.renderLinks();

        return this.container;
    }
    renderLinks() {
        for (const socialNetwork in this.data) {
            if (this.data.hasOwnProperty(socialNetwork)) {
                const link = this.data[socialNetwork];
                this.renderLink(socialNetwork, link);
            }
        }
    }
    renderLink(socialNetwork, link) {
        const socialLink = document.createElement('a');
        socialLink.href = link;
        socialLink.target = '_blank';

        const socialIcon = document.createElement('img');
        const selectedSocialNetwork = this.socialNetworks.find(network => network.name.toLowerCase() === socialNetwork.toLowerCase());
        if (selectedSocialNetwork) {
            socialIcon.src = selectedSocialNetwork.icon;
            socialIcon.alt = socialNetwork;
        }

        socialLink.appendChild(socialIcon);
        this.linksContainer.appendChild(socialLink);
    }

    insertSocialLink() {
        const socialNetwork = prompt('Выберите социальную сеть (whatsapp, web, facebook, instagram):');
        if (socialNetwork) {
            const link = prompt(`Введите ссылку на ${socialNetwork}:`);
            if (link) {
                this.data[socialNetwork.toLowerCase()] = link;
                this.renderLink(socialNetwork, link);
            }
        }
    }
    saveLinks() {
        this.addButton.style.display = 'none';
        this.saveButton.style.display = 'none';
    }
    save() {
        return this.data;
    }

    static get toolbox() {
        return {
            title: 'Ссылки на соц. сети',
        };
    }
}
