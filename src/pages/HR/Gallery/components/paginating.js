const paginatingSettings = {
    paginating: true,
    paginatingPluginStrings: {
        togglepaginating: 'Toggle paginating',
    },
};

export default class paginating {
    core;
    settings;
    order;
    $LG;
    constructor(instance, $LG) {
        // get lightGallery core plugin instance
        this.core = instance;
        this.$LG = $LG;
        this.order = false;
        // extend module default settings with lightGallery core settings
        this.settings = { ...paginatingSettings, ...this.core.settings };

        return this;
    }

    init () {
        if (this.settings.paginating) {
            // check for paginating browser support
            const data = this.core.settings.extraProps[0].metadata
            if (!data) return
            let paginating = `<div class='lg-counter-total'>${data.total}</div>`;
            this.core.LGel.on(`lgBeforeSlide.lg`, (event) => {
                if (document.querySelector ('.lg-counter-total'))
                    document.querySelector ('.lg-counter-total').innerHTML = (event.detail.index + 1) + ' of ' + this.core?.galleryItems?.length
            });
            let title = `<div class='lg-toolbar-title'></div>`;
            this.core.$toolbar.append(paginating);
            this.core.$toolbar.append(title);
            this.core.LGel.on(`lgAfterOpen.lg`, (event) => {
                let exdata = this.core.settings.extraProps[0].metadata
                if (document.querySelector ('.lg-toolbar-title'))
                    document.querySelector ('.lg-toolbar-title').innerHTML = 
                        `${exdata.name || ""} (${exdata.year || ""})`;
            });
            let button = `<button id="${this.core.getIdName(
                'lg-actual-size',
            )}" type="button" aria-label="${
                'sort-abc'
            }" class="${
                'sorting-button'
            } lg-icon"></button>`;
            this.core.$toolbar.append (button)
            this.core.outer.find ('.sorting-button').first().on ('click.lg', () => {
                this.core.outer.find ('.sorting-button').toggleClass ('lg-icon-sort-abc')
                this.core.outer.find ('.sorting-button').toggleClass ('lg-icon-sort-abc-desc')
                if (this.core.settings.onOrder !== undefined){
                    this.order = !this.order
                    this.core.settings.onOrder (this.order)
                }
            })
        }
    }
}