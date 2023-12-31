const thumbnailsSettings = {
    thumbnail: true,

    animateThumb: true,
    currentPagerPosition: 'middle',
    alignThumbnails: 'middle',

    thumbWidth: 100,
    thumbHeight: '80px',
    thumbMargin: 5,

    appendThumbnailsTo: '.lg-components',
    toggleThumb: false,

    enableThumbDrag: true,
    enableThumbSwipe: true,
    thumbnailSwipeThreshold: 10,

    loadYouTubeThumbnail: true,
    youTubeThumbSize: 1,

    thumbnailPluginStrings: {
        toggleThumbnails: 'Toggle thumbnails',
    },
};

const lGEvents = {
    afterAppendSlide: 'lgAfterAppendSlide',
    init: 'lgInit',
    hasVideo: 'lgHasVideo',
    containerResize: 'lgContainerResize',
    updateSlides: 'lgUpdateSlides',
    afterAppendSubHtml: 'lgAfterAppendSubHtml',
    beforeOpen: 'lgBeforeOpen',
    afterOpen: 'lgAfterOpen',
    slideItemLoad: 'lgSlideItemLoad',
    beforeSlide: 'lgBeforeSlide',
    afterSlide: 'lgAfterSlide',
    posterClick: 'lgPosterClick',
    dragStart: 'lgDragStart',
    dragMove: 'lgDragMove',
    dragEnd: 'lgDragEnd',
    beforeNextSlide: 'lgBeforeNextSlide',
    beforePrevSlide: 'lgBeforePrevSlide',
    beforeClose: 'lgBeforeClose',
    afterClose: 'lgAfterClose',
    rotateLeft: 'lgRotateLeft',
    rotateRight: 'lgRotateRight',
    flipHorizontal: 'lgFlipHorizontal',
    flipVertical: 'lgFlipVertical',
    autoplay: 'lgAutoplay',
    autoplayStart: 'lgAutoplayStart',
    autoplayStop: 'lgAutoplayStop',
};

export default class Thumbnail {
    core;
    $thumbOuter;
    $lgThumb;
    thumbOuterWidth = 0;
    thumbTotalWidth = 0;
    translateX = 0;
    thumbClickable = false;
    settings;
    $LG;
    constructor(instance, $LG) {
        // get lightGallery core plugin instance
        this.core = instance;
        this.$LG = $LG;

        return this;
    }

    init() {
        // extend module default settings with lightGallery core settings
        this.settings = {
            ...thumbnailsSettings,
            ...this.core.settings,
        };
        this.thumbOuterWidth = 0;
        this.thumbTotalWidth =
            this.core.galleryItems.length *
            (this.settings.thumbWidth + this.settings.thumbMargin);

        // Thumbnail animation value
        this.translateX = 0;

        this.setAnimateThumbStyles();

        if (!this.core.settings.allowMediaOverlap) {
            // this.settings.toggleThumb = false;
        }

        if (this.settings.thumbnail) {
            this.build();
            if (this.settings.animateThumb) {
                if (this.settings.enableThumbDrag) {
                    this.enableThumbDrag();
                }

                if (this.settings.enableThumbSwipe) {
                    this.enableThumbSwipe();
                }

                this.thumbClickable = false;
            } else {
                this.thumbClickable = true;
            }

            this.toggleThumbBar();
            this.thumbKeyPress();
        }
    }

    build() {
        try {
        console.log ('building thumbnail plugin')
        this.setThumbMarkup();
        this.manageActiveClassOnSlideChange();
        this.$lgThumb.first().on('click.lg touchend.lg', (e) => {
            const $target = this.$LG(e.target);
            if ($target.hasAttribute('data-lg-item-id')) {
                setTimeout(() => {
                    // In IE9 and bellow touch does not support
                    // Go to slide if browser does not support css transitions
                    if (this.thumbClickable && !this.core.lgBusy) {
                        const index = parseInt($target.attr('data-lg-item-id'));
                        this.core.slide(index, false, true, false);
                    }
                }, 50);
            }
            else if ($target.hasAttribute('data-lg-remove-id')) { 
                setTimeout(() => {
                    // In IE9 and bellow touch does not support
                    // Go to slide if browser does not support css transitions
                    if (this.thumbClickable && !this.core.lgBusy) {
                        const index = parseInt($target.attr('data-lg-remove-id'));
                        const $thumb = this.core.outer.find('.lg-thumb-item');
                        if (!this.core.galleryItems[index].remove) {
                            this.core.galleryItems[index].remove = true;
                            $thumb.eq(index).addClass('lg-item-selected');
                        } else {
                            this.core.galleryItems[index].remove = false;
                            $thumb.eq(index).removeClass('lg-item-selected');
                        }
                    }
                }, 50);
            }
            else if ($target.hasAttribute('data-lg-cover-id')) { 
                setTimeout(() => {
                    // In IE9 and bellow touch does not support
                    // Go to slide if browser does not support css transitions
                    if (this.thumbClickable && !this.core.lgBusy) {
                        const index = parseInt($target.attr('data-lg-cover-id'));
                        this.core.slide(index, false, true, false);
                        const $thumb = this.core.outer.find('.lg-thumb-item');
                        for (let i = 0; i < this.core.galleryItems.length; i++) {
                            if (i == index) {
                                this.core.galleryItems[i].selected = true;
                                $thumb.eq(i).addClass('lg-item-selected');
                            } else {
                                this.core.galleryItems[i].selected = false;
                                $thumb.eq(i).removeClass('lg-item-selected');
                            }
                        }
                    }
                }, 50);
            }
        });
    } catch (e) {
        console.log (e)
    }
        this.core.LGel.on(`${lGEvents.beforeSlide}.thumb`, (event) => {
            const { index } = event.detail;
            this.animateThumb(index);
        });
        this.core.LGel.on(`${lGEvents.beforeOpen}.thumb`, () => {
            this.thumbOuterWidth = this.core.outer.get().offsetWidth;
        });

        this.core.LGel.on(`${lGEvents.updateSlides}.thumb`, () => {
            this.rebuildThumbnails();
        });
        this.core.LGel.on(`${lGEvents.containerResize}.thumb`, () => {
            if (!this.core.lgOpened) return;
            setTimeout(() => {
                this.thumbOuterWidth = this.core.outer.get().offsetWidth;
                this.animateThumb(this.core.index);
                this.thumbOuterWidth = this.core.outer.get().offsetWidth;
            }, 50);
        });
    }

    setThumbMarkup() {
        let thumbOuterClassNames = 'lg-thumb-outer ';

        if (this.settings.alignThumbnails) {
            thumbOuterClassNames += `lg-thumb-align-${this.settings.alignThumbnails}`;
        }

        const html = `<div class="${thumbOuterClassNames}">
        <div class="lg-thumb lg-group">
        </div>
        </div>`;

        this.core.outer.addClass('lg-has-thumb');

        if (this.settings.appendThumbnailsTo === '.lg-components') {
            this.core.$lgComponents.append(html);
        } else {
            this.core.outer.append(html);
        }

        this.$thumbOuter = this.core.outer.find('.lg-thumb-outer').first();
        this.$lgThumb = this.core.outer.find('.lg-thumb').first();

        if (this.settings.animateThumb) {
            this.core.outer
                .find('.lg-thumb')
                .css('transition-duration', this.core.settings.speed + 'ms')
                .css('width', this.thumbTotalWidth + 'px')
                .css('position', 'relative');
        }

        this.setThumbItemHtml(
            (this.core.galleryItems)
        );
    }

    enableThumbDrag() {
        let thumbDragUtils = {
            cords: {
                startX: 0,
                endX: 0,
            },
            isMoved: false,
            newTranslateX: 0,
            startTime: new Date(),
            endTime: new Date(),
            touchMoveTime: 0,
        };

        let isDragging = false;

        this.$thumbOuter.addClass('lg-grab');

        this.core.outer
            .find('.lg-thumb')
            .first()
            .on('mousedown.lg.thumb', (e) => {
                if (this.thumbTotalWidth > this.thumbOuterWidth) {
                    // execute only on .lg-object
                    e.preventDefault();
                    thumbDragUtils.cords.startX = e.pageX;

                    thumbDragUtils.startTime = new Date();
                    this.thumbClickable = false;

                    isDragging = true;

                    // ** Fix for webkit cursor issue https://code.google.com/p/chromium/issues/detail?id=26723
                    this.core.outer.get().scrollLeft += 1;
                    this.core.outer.get().scrollLeft -= 1;

                    // *
                    this.$thumbOuter
                        .removeClass('lg-grab')
                        .addClass('lg-grabbing');
                }
            });

        this.$LG(window).on(
            `mousemove.lg.thumb.global${this.core.lgId}`,
            (e) => {
                if (!this.core.lgOpened) return;
                if (isDragging) {
                    thumbDragUtils.cords.endX = e.pageX;

                    thumbDragUtils = this.onThumbTouchMove(thumbDragUtils);
                }
            },
        );

        this.$LG(window).on(`mouseup.lg.thumb.global${this.core.lgId}`, () => {
            if (!this.core.lgOpened) return;
            if (thumbDragUtils.isMoved) {
                thumbDragUtils = this.onThumbTouchEnd(thumbDragUtils);
            } else {
                this.thumbClickable = true;
            }

            if (isDragging) {
                isDragging = false;
                this.$thumbOuter.removeClass('lg-grabbing').addClass('lg-grab');
            }
        });
    }

    enableThumbSwipe() {
        let thumbDragUtils = {
            cords: {
                startX: 0,
                endX: 0,
            },
            isMoved: false,
            newTranslateX: 0,
            startTime: new Date(),
            endTime: new Date(),
            touchMoveTime: 0,
        };

        this.$lgThumb.on('touchstart.lg', (e) => {
            if (this.thumbTotalWidth > this.thumbOuterWidth) {
                e.preventDefault();
                thumbDragUtils.cords.startX = e.targetTouches[0].pageX;
                this.thumbClickable = false;
                thumbDragUtils.startTime = new Date();
            }
        });

        this.$lgThumb.on('touchmove.lg', (e) => {
            if (this.thumbTotalWidth > this.thumbOuterWidth) {
                e.preventDefault();
                thumbDragUtils.cords.endX = e.targetTouches[0].pageX;
                thumbDragUtils = this.onThumbTouchMove(thumbDragUtils);
            }
        });

        this.$lgThumb.on('touchend.lg', () => {
            if (thumbDragUtils.isMoved) {
                thumbDragUtils = this.onThumbTouchEnd(thumbDragUtils);
            } else {
                this.thumbClickable = true;
            }
        });
    }

    // Rebuild thumbnails
    rebuildThumbnails() {
        // Remove transitions
        this.$thumbOuter.addClass('lg-rebuilding-thumbnails');
        setTimeout(() => {
            this.thumbTotalWidth =
                this.core.galleryItems.length *
                (this.settings.thumbWidth + this.settings.thumbMargin);
            this.$lgThumb.css('width', this.thumbTotalWidth + 'px');
            this.$lgThumb.empty();
            this.setThumbItemHtml(
                (this.core.galleryItems),
            );
            this.animateThumb(this.core.index);
        }, 50);
        setTimeout(() => {
            this.$thumbOuter.removeClass('lg-rebuilding-thumbnails');
        }, 200);
    }

    // @ts-check

    setTranslate(value) {
        this.$lgThumb.css(
            'transform',
            'translate3d(-' + value + 'px, 0px, 0px)',
        );
    }

    getPossibleTransformX(left) {
        if (left > this.thumbTotalWidth - this.thumbOuterWidth) {
            left = this.thumbTotalWidth - this.thumbOuterWidth;
        }

        if (left < 0) {
            left = 0;
        }
        return left;
    }

    animateThumb(index) {
        this.$lgThumb.css(
            'transition-duration',
            this.core.settings.speed + 'ms',
        );
        if (this.settings.animateThumb) {
            let position = 0;
            switch (this.settings.currentPagerPosition) {
                case 'left':
                    position = 0;
                    break;
                case 'middle':
                    position =
                        this.thumbOuterWidth / 2 - this.settings.thumbWidth / 2;
                    break;
                case 'right':
                    position = this.thumbOuterWidth - this.settings.thumbWidth;
            }
            this.translateX =
                (this.settings.thumbWidth + this.settings.thumbMargin) * index -
                1 -
                position;
            if (this.translateX > this.thumbTotalWidth - this.thumbOuterWidth) {
                this.translateX = this.thumbTotalWidth - this.thumbOuterWidth;
            }

            if (this.translateX < 0) {
                this.translateX = 0;
            }

            this.setTranslate(this.translateX);
        }
    }

    onThumbTouchMove(thumbDragUtils) {
        thumbDragUtils.newTranslateX = this.translateX;
        thumbDragUtils.isMoved = true;

        thumbDragUtils.touchMoveTime = new Date().valueOf();

        thumbDragUtils.newTranslateX -=
            thumbDragUtils.cords.endX - thumbDragUtils.cords.startX;

        thumbDragUtils.newTranslateX = this.getPossibleTransformX(
            thumbDragUtils.newTranslateX,
        );

        // move current slide
        this.setTranslate(thumbDragUtils.newTranslateX);
        this.$thumbOuter.addClass('lg-dragging');

        return thumbDragUtils;
    }

    onThumbTouchEnd(thumbDragUtils) {
        thumbDragUtils.isMoved = false;
        thumbDragUtils.endTime = new Date();
        this.$thumbOuter.removeClass('lg-dragging');

        const touchDuration =
            thumbDragUtils.endTime.valueOf() -
            thumbDragUtils.startTime.valueOf();
        let distanceXnew =
            thumbDragUtils.cords.endX - thumbDragUtils.cords.startX;
        let speedX = Math.abs(distanceXnew) / touchDuration;
        // Some magical numbers
        // Can be improved
        if (
            speedX > 0.15 &&
            thumbDragUtils.endTime.valueOf() - thumbDragUtils.touchMoveTime < 30
        ) {
            speedX += 1;

            if (speedX > 2) {
                speedX += 1;
            }
            speedX =
                speedX +
                speedX * (Math.abs(distanceXnew) / this.thumbOuterWidth);
            this.$lgThumb.css(
                'transition-duration',
                Math.min(speedX - 1, 2) + 'settings',
            );

            distanceXnew = distanceXnew * speedX;

            this.translateX = this.getPossibleTransformX(
                this.translateX - distanceXnew,
            );
            this.setTranslate(this.translateX);
        } else {
            this.translateX = thumbDragUtils.newTranslateX;
        }
        if (
            Math.abs(thumbDragUtils.cords.endX - thumbDragUtils.cords.startX) <
            this.settings.thumbnailSwipeThreshold
        ) {
            this.thumbClickable = true;
        }

        return thumbDragUtils;
    }

    getThumbHtml(thumb, index) {
        const slideVideoInfo =
            this.core.galleryItems[index].__slideVideoInfo || {};
        let thumbImg;

        if (slideVideoInfo.youtube) {
            if (this.settings.loadYouTubeThumbnail) {
                thumbImg =
                    '//img.youtube.com/vi/' +
                    slideVideoInfo.youtube[1] +
                    '/' +
                    this.settings.youTubeThumbSize +
                    '.jpg';
            } else {
                thumbImg = thumb;
            }
        } else {
            thumbImg = thumb;
        }

        return `<div data-lg-item-id="${index}" class="lg-thumb-item ${
            index === this.core.index ? ' active' : ''
        }" 
        style="width:${this.settings.thumbWidth}px; height: ${
            this.settings.thumbHeight
        };
            margin-right: ${this.settings.thumbMargin}px;">
            <img data-lg-item-id="${index}" src="${thumbImg}" />
            <div class='lg-thumb-action'>
                <div class='lg-thumb-action-close' data-lg-remove-id="${index}">
                    <i class='mdi mdi-close' data-lg-remove-id='${index}'></i>
                </div>
                <div class='lg-thumb-action-check' data-lg-cover-id="${index}">
                    
                </div>
            </div>
        </div>`;
    }

    getThumbItemHtml(items) {
        let thumbList = '';
        for (let i = 0; i < items.length; i++) {
            thumbList += this.getThumbHtml(items[i].thumb, i);
        }

        return thumbList;
    }

    setThumbItemHtml(items) {
        const thumbList = this.getThumbItemHtml(items);
        this.$lgThumb.html(thumbList);
    }

    setAnimateThumbStyles() {
        if (this.settings.animateThumb) {
            this.core.outer.addClass('lg-animate-thumb');
        }
    }

    // Manage thumbnail active calss
    manageActiveClassOnSlideChange() {
        // manage active class for thumbnail
        this.core.LGel.on(
            `${lGEvents.beforeSlide}.thumb`,
            (event) => {
                const $thumb = this.core.outer.find('.lg-thumb-item');
                const { index } = event.detail;
                $thumb.removeClass('active');
                $thumb.eq(index).addClass('active');
            },
        );
    }

    // Toggle thumbnail bar
    toggleThumbBar() {
        if (this.settings.toggleThumb) {
            this.core.outer.addClass('lg-can-toggle');
            this.core.outer.find('.lg-thumb-outer').append(
                '<button type="button" aria-label="' +
                    this.settings.thumbnailPluginStrings['toggleThumbnails'] +
                    '" class="lg-toggle-thumb lg-icon"></button>',
            );
            this.core.outer
                .find('.lg-toggle-thumb')
                .first()
                .on('click.lg', () => {
                    this.core.outer.toggleClass('lg-components-open');
                });
        }

        
            
        if (this.settings.canEdit) {
            this.core.outer.find('.lg-thumb-outer').append(
                '<div type="button" aria-label="' +
                    this.settings.thumbnailPluginStrings['toggleThumbnails'] +
                    '" class="lg-toggle-remove lg-icon"><i class="fa fa-trash"></i> <span>Remove Photo</span><button class="btn-save">OK</button> </div>',
            );

            
            this.core.outer.find('.lg-thumb-outer').append(
                '<button type="button" aria-label="' +
                    this.settings.thumbnailPluginStrings['toggleThumbnails'] +
                    '" class="lg-toggle-settings lg-icon"><i class="fa fa-list"></i></button>',
            );

            this.core.outer
                .find('.lg-toggle-settings')
                .first()
                .on('click.lg', () => {
                    this.core.outer.toggleClass('lg-settings-on')
                });

            this.core.outer
                .find('.lg-toggle-remove')
                .first()
                .on('click.lg', () => {
                    const removeIds = [];
                    removeIds.length = 0;
                    this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                    this.core.outer.removeClass('lg-cover-on');
                    if (this.core.outer.hasClass('lg-remove-on')) {
                        removeIds.length = 0;
                        for(let i = 0; i < this.core.galleryItems.length; i++) {
                            if (this.core.galleryItems[i].remove) {
                                removeIds.push(this.core.galleryItems[i].alt);
                            }
                        }
                        if (!removeIds.length) {
                            this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                            this.core.outer.removeClass('lg-remove-on');
                            removeIds.length = 0;
                        }
                        else if (this.settings?.removeAction) {
                            this.settings.removeAction ([...removeIds], ((res)=>{
                                if (res) {
                                    this.core.updateSlides (this.core.galleryItems.filter((item)=>!item.remove), this.core.index);
                                } else {
                                    this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                                    this.core.outer.removeClass('lg-remove-on');
                                }
                                removeIds.length = 0;
                                for(let i = 0; i < this.core.galleryItems.length; i++) {
                                    if (this.core.galleryItems[i].remove) {
                                        this.core.galleryItems[i].remove = undefined
                                    }
                                }
                            }))
                        }
                    } else {
                        this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                        this.core.outer.addClass('lg-remove-on');
                        removeIds.length = 0;
                    }
                });

            this.core.outer.find('.lg-thumb-outer').append(
                '<div type="button" aria-label="' +
                    this.settings.thumbnailPluginStrings['toggleThumbnails'] +
                    '" class="lg-toggle-cover lg-icon"><i class="fa fa-image"></i> <span>Set Cover Image</span> <button class="btn-save">OK</button> </div>',
            );

            this.core.outer
                .find('.lg-toggle-cover')
                .first()
                .on('click.lg', () => {
                    const coverId = this.core.settings.galleryMetadata?.cover?._id;
                    const $thumb = this.core.outer.find('.lg-thumb-item');
                    this.core.outer.removeClass('lg-remove-on');

                    if (this.core.outer.hasClass('lg-cover-on')) {
                        let _coverId = null
                        for(let i = 0; i < this.core.galleryItems.length; i++) {
                            if (this.core.galleryItems[i].selected) {
                                _coverId = (this.core.galleryItems[i].alt);
                                break;
                            }
                        }
                        if (!_coverId || _coverId === this.core.settings.galleryMetadata?.cover?._id) {
                            this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                            this.core.outer.removeClass('lg-cover-on');
                        } else {
                            if (this.settings.setCoverAction) {
                                this.settings.setCoverAction (_coverId, ((res)=>{
                                    if (res) {
                                        this.core.settings.galleryMetadata.cover = res;
                                        this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                                        this.core.outer.removeClass('lg-cover-on');
                                    }
                                }))
                            }
                        }
                    } else {
                        this.core.outer.find('.lg-thumb-item').removeClass('lg-item-selected')
                        this.core.outer.addClass('lg-cover-on');
                  
                        if (this.core.settings.galleryMetadata.cover) {
                            for (let i = 0; i < this.core.galleryItems.length; i++) {
                                if (this.core.galleryItems[i].alt === this.core.settings.galleryMetadata.cover._id) {
                                    $thumb.eq(i).addClass('lg-item-selected')
                                    this.core.galleryItems[i].cover = true;
                                    break;
                                }
                            }
                        }
                        // for (let i = 0; i < this.core.galleryItems.length; i++) {
                        //     if (this.core.galleryItems[i].alt === coverId) {
                        //         this.core.galleryItems[i].cover = true;
                        //         $thumb.eq(i).addClass('lg-item-selected');
                        //     } else {
                        //         this.core.galleryItems[i].cover = undefined;
                        //         $thumb.eq(i).remove('lg-item-selected');
                        //     }
                        // }
                    }
                });
        }
    }

    thumbKeyPress() {
        this.$LG(window).on(`keydown.lg.thumb.global${this.core.lgId}`, (e) => {
            if (!this.core.lgOpened || !this.settings.toggleThumb) return;

            if (e.keyCode === 38) {
                e.preventDefault();
                this.core.outer.addClass('lg-components-open');
            } else if (e.keyCode === 40) {
                e.preventDefault();
                this.core.outer.removeClass('lg-components-open');
            }
        });
    }

    destroy() {
        if (this.settings.thumbnail) {
            this.$LG(window).off(`.lg.thumb.global${this.core.lgId}`);
            this.core.LGel.off('.lg.thumb');
            this.core.LGel.off('.thumb');
            this.$thumbOuter.remove();
            this.core.outer.removeClass('lg-has-thumb');
        }
    }
}