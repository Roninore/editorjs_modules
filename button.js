class SimpleButton {
    static get toolbox() {
        return {
            title: 'Guest list',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 10.5L11 12.5L15.5 8M20 21V7.8C20 6.11984 20 5.27976 19.673 4.63803C19.3854 4.07354 18.9265 3.6146 18.362 3.32698C17.7202 3 16.8802 3 15.2 3H8.8C7.11984 3 6.27976 3 5.63803 3.32698C5.07354 3.6146 4.6146 4.07354 4.32698 4.63803C4 5.27976 4 6.11984 4 7.8V21L6.75 19L9.25 21L12 19L14.75 21L17.25 19L20 21Z" stroke="#C9C1D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
    }

    constructor({ data }) {
        this.data = data || { text: '' };
    }

    render() {
        const container = document.createElement('div');
        const button = document.createElement('div');
        button.contentEditable = true;
        button.innerText = this.data.text || '';
        button.classList.add('SimpleButton');
        container.appendChild(button);
        return container;
    }

    save(blockContent) {
        const button = blockContent.querySelector('div');
        const text = button.innerText;

        return {
            text: text
        };
    }
}
