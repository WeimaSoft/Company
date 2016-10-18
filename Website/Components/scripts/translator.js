(function($) {
    if (typeof Translator === "undefined") {
        Translator = {};
    }
    if (typeof Ale === "undefined") {
        Ale = {};
    }

    Ale.browser = (function () {
        var $html = $('html');
        var mobileRegEx = /iPhone|Andriod|BlackBerry|Nokia|SymbianOS/i;
        var msieVersion = function (v) {
            var isVersion;
            return function () {
                if (typeof isVersion === "undefined") {
                    isVersion = $html.hasClass(v);
                }
                return isVersion;
            };
        };

        // take from jQuery 1.8.3
        var uaMatch = (function (ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

            return {
                browser: match[1] || "",
                version: match[2] || "0"
            };
        })(navigator.userAgent);

        var browser = {
            version: uaMatch.version,
            msie6: msieVersion('ie6'),
            msie7: msieVersion('ie7'),
            msie8: msieVersion('ie8'),
            msie9: msieVersion('ie9'),
            isMobileDevice: function () {
                return navigator.userAgent.match(mobileRegEx) !== null;
            },
            isMobileSafari: function () {
                return navigator.userAgent.match(/iPad|iPhone|iPod/i) !== null;
            },
            supportsPng: function () {
                return !Ale.browser.msie6();
            },
            imageExtension: function () {
                return Ale.browser.supportsPng() ? '.png' : '.gif';
            },
            spriteCssClass: function () {
                return 'master_sprite_' + (Ale.browser.supportsPng() ? 'png' : 'gif');
            },
            iconCssClass: function () {
                return 'icon_' + (Ale.browser.supportsPng() ? 'png' : 'gif');
            },
            isHttps: function () {
                return (document.location.protocol || '').toLowerCase() === "https:";
            }
        };

        if (uaMatch.browser) {
            browser[uaMatch.browser] = true;
        }

        return browser;

    })();

    $.extend(Ale,
    {
        loadingImage: $(document.createElement('div')).append($(document.createElement('img')).attr({ 'id': 'information_loading', 'alt': '', 'src': 'images/status_loading_small.gif' })),
        minimumTimeout: 12,
        fadeDuration: 'fast',
        key: {
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            DELETE: 46,
            TAB: 9,
            ENTER: 13,
            ESCAPE: 27,
            COMMA: 188,
            PAGEUP: 33,
            PAGEDOWN: 34,
            BACKSPACE: 8,
            APOSTROPHE: 222,
            CAPSLOCK: 20,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            a: 97,
            b: 98,
            c: 99,
            d: 100,
            e: 101,
            f: 102,
            g: 103,
            h: 104,
            i: 105,
            j: 106,
            k: 107,
            l: 108,
            m: 109,
            n: 110,
            o: 111,
            p: 112,
            q: 113,
            r: 114,
            s: 115,
            t: 116,
            u: 117,
            v: 118,
            w: 119,
            x: 120,
            y: 121,
            z: 122

        },
    });

    (function (Ale, $) {
        'use strict';

        var $document = $(document);

        var FETCH_DEFAULTS = {
            method: 'post',
            body: {},
            displayError: true,
            prefetchCache: {}
        };

        /**
        * Based off of the Fetch API https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
        */
        function fetch(url, options, headers) {
            var opts = $.extend(true, {}, FETCH_DEFAULTS, options);
            if (options && options.prefetchCache && options.prefetchCache.cache) { // this is required as $.extend destroy Object reference to custom cahce required by the delete below
                opts.prefetchCache.cache = options.prefetchCache.cache;
            } 

            if (opts.method !== 'post') {
                alert('Fetch method is not implemented for: ' + opts.method);
                return reject();
            }

            // check the prefetch cache
            var oneOffCacheResponse = getResponseFromPrefetchCache(opts.prefetchCache);
            if (oneOffCacheResponse) {
                return resolve(oneOffCacheResponse);
            }

            var deferred = $.Deferred();
            var eventData = { url: url, data: opts };
            $document.trigger('ajaxStart.ale', [eventData]);

            $.postJSON(url, opts.body, undefined, opts.context || this, undefined, headers).then(function (json) {
                eventData.response = json;

                if (json && json.Exception) {
                    if (opts.displayError) {
                        $('#page_error').showPageError(json.Exception, { json: json });
                    }
                    eventData.success = false;
                    deferred.reject(json);
                } else {
                    eventData.success = true;
                    deferred.resolve(json);
                }

            }).fail(function () {
                eventData.success = false;
                eventData.errorResponse = Array.prototype.slice.call(arguments);

                deferred.reject.apply(deferred, arguments);
            }).always(function () {
                $document.trigger('ajaxEnd.ale', [eventData]);
            });

            return deferred.promise();
        }

        Ale.fetch = fetch;

        function getResponseFromPrefetchCache(options) {
            if (!options.key || !options.cache) {
                return undefined;
            }

            var cachedItem = options.cache[options.key];
            delete options.cache[options.key];
            return cachedItem;
        }

        /*
         * window.Promise pollyfils using jQuery.Deferred
         */
        function reject() {
            var deferred = $.Deferred();
            deferred.reject.apply(deferred, arguments);
            return deferred.promise();
        }

        function resolve() {
            var deferred = $.Deferred();
            deferred.resolve.apply(deferred, arguments);
            return deferred.promise();
        }

        function all() {
            if (arguments.length === 1 && $.isArray(arguments[0])) {
                return $.when.apply(window, arguments[0]);
            } else {
                return $.when.apply(window, arguments);
            }
        }

        function isPromise(obj) {
            return ($.isPlainObject(obj) && $.isFunction(obj.then));
        }

        var JQueryEs6Promise = (function () {

            function JQueryEs6Promise(fn) {
                var $def = $.Deferred();

                var resolveFn = function () {
                    $def.resolve.apply($def, arguments);
                };
                var rejectFn = function () {
                    $def.reject.apply($def, arguments);
                };
                setTimeout(function () {
                    fn(resolveFn, rejectFn);
                }, 4);

                return $def.promise();
            }

            JQueryEs6Promise.reject = reject;
            JQueryEs6Promise.resolve = resolve;
            JQueryEs6Promise.all = all;
            JQueryEs6Promise.isPromise = isPromise;
            return JQueryEs6Promise;
        })();

        Ale.Promise = JQueryEs6Promise;

    })(Ale, window.jQuery);

    $.extend(Translator,
    {
        currentImageIndex: 1,
        translatorItemContainer: {},
        interval: {},
        Options: {
            ImagesCollection: [],
            ImageWidth: 1000,
            ImageHeight: 564,
            TransitionDuration: 500,
            AutoPlay: true,
            AutoPlayDuration: 5000
        },
        Slide: function (translatorContainer, options) {
            var self = this;
            $.extend(this.Options, options);

            translatorContainer.addClass('translator overflowh');

            var translatorWrapper = $("<div class='translator-container overflowh'>").appendTo(translatorContainer);
            translatorWrapper.css("width", this.Options.ImageWidth + "px");
            translatorWrapper.css("height", this.Options.ImageHeight + "px");

            translatorItemContainer = $("<div class='translator-item-container overflowh'>").appendTo(translatorWrapper);
            translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
            translatorItemContainer.css('transform', 'translate3d(-' + this.Options.ImageWidth + 'px,0,0)');
            translatorItemContainer.css("width", this.Options.ImageWidth * (this.Options.ImagesCollection.length + 2) + "px");
            translatorItemContainer.css("height", this.Options.ImageHeight + "px");

            for (var imgItem in this.Options.ImagesCollection) {
                var img = this.Options.ImagesCollection[imgItem];
                translatorItemContainer.append("<div class='translator-item' style='width:" + this.Options.ImageWidth + "px;height:" + this.Options.ImageHeight + "'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }

            for (var i = 0; i < 2; i++) {
                var img = this.Options.ImagesCollection[i];
                translatorItemContainer.append("<div class='translator-item' style='width:" + this.Options.ImageWidth + "px;height:" + this.Options.ImageHeight + "'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }

            var btnPrevious = $("<div class='translator-btnpreview left0' style='top:" + (this.Options.ImageHeight - 70) / 2 + "px'><div></div></div>").appendTo(translatorWrapper);
            btnPrevious.click(function () { self.ViewPrevious(); })

            var btnNext = $("<div class='translator-btnpreview right0' style='top:" + (this.Options.ImageHeight - 70) / 2 + "px'><div></div></div>").appendTo(translatorWrapper);
            btnNext.click(function () { self.ViewNext(); })

            if (this.Options.AutoPlay) {
                this.AutoPlay();
            }
        },

        CreateImageItem: function (url, link) {
            var img = new Object();
            img.Url = url;
            img.Link = link;
            return img;
        },

        AutoPlay: function () {
            if (this.Options.AutoPlay) {
                this.interval = setInterval("Play(true)", this.Options.AutoPlayDuration);
            }
        },

        Play: function (autoPlay) {
            if (autoPlay) { this.currentImageIndex++; }
            var self = this;
            if (this.currentImageIndex == this.Options.ImagesCollection.length + 1) {
                translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
                this.currentImageIndex = 1;
                setTimeout(function () {
                    translatorItemContainer.css('transform', 'translate3d(-' + self.currentImageIndex * self.Options.ImageWidth + 'px,0,0)');
                    translatorItemContainer.css('transition-duration', '0s');
                }, 500);
            } else if (this.currentImageIndex == 0) {
                translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
                this.currentImageIndex = this.Options.ImagesCollection.length;
                setTimeout(function () {
                    translatorItemContainer.css('transform', 'translate3d(-' + self.currentImageIndex * self.Options.ImageWidth + 'px,0,0)');
                    translatorItemContainer.css('transition-duration', '0s');
                }, 500);
            }
            else {
                translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
            }
        },
        ViewPrevious: function () {
            clearInterval(this.interval);
            this.currentImageIndex++;
            this.Play();

        },
        ViewNext: function () {
            clearInterval(this.interval);
            this.currentImageIndex--;
            this.Play();

        }
    });
})(jQuery);

(function ($) {
    /* light box */
    $.extend(Ale, {

        /*
        * LightBox for display modal type window or message box;
        *   LightBox.showPage(url[, options]) to load lightbox with an external page inside an iframe. 
        *       url     : is the url of the page to load
        *       options : optional options (see options below)
        *
        *   LightBox.showProcessingMessageBox(message) to show a lightbox small system processing window with bright message
        *       message : short message to show after the animated gif
        *
        *   LightBox.showMessageBox(title, message[, options]) to show a message box. Height is automatically calculated on message size
        *       title   : title of the message box
        *       message : message can be straight text or html
        *       options : optional options (see options below)
        *   
        *       options : are class of options to describe how the LightBox displays/interacts,
        *                 if anything other than the default is required then you will need to pass it through.
        *                 
        *                 defaults are;
        *
        *                   showButtons: default true,  (This will hide/show the buttons footer bar)
        *                   showClose  : false,
        *                   showPrint  : false,
        *                   showAccept : false,
        *                   showDecline: false,
        *                   showOk     : false,
        *                   showSave   : false,
        *                   showAdd    : false,
        *                   showCancel : false,
        *                   showYes    : false,
        *                   showNo     : false,
        *                   showDelete : false,
            *                   showRedIgnore : false,
            *                   showSelect : false,
        *                   showChange : false,
        *                   afterShow  : function () {} (this gets called once the lightbox is loaded and is visible
        *                   beforeHide    : function () {return true;}   (this is where you place a callback function, OR { return jQuery Promise }
        *                                                  the signature is function (buttonPressed) where buttonPress = Ale.LightBox.buttonType (string).  Must return true or false; false meaning that it will stop processing and therefore
        *                                                   will not hide the LightBox.
        *                   afterHide    : function () {}   (this is where you place a callback function, 
        *                                                  the signature is function (buttonPressed) where buttonPress = Ale.LightBox.buttonType (string)
        *                   customButtons : Array of { isOk : true/false/undefined (captures the enter key and assigns it to this button), src : 'source of button image', buttonType : 'the key of the button that is returned during buttonpressed', width: number of pixels wide
        *                   params     : [] (This is where you can pass in an array of parameters to append to the querystring, passin as array of objects e.g. [ { name: 'flightid', value: 'ABC123' }, { name: 'Origin', value: 'AKL' } ]
            *                   orderButtons : Array of buttons to display in order. Specifying order buttons will ignore the showX flags
        *                   context    : (place holder to store calling object if nes)
        *                   messageBoxType : string default '', css class name for message box title e.g. 'warning', 'alert' (Message Box only)
        *                   width : number in px or 'max' for full width
        *                   height: number in px or 'max' to fit full window height screen
        *                   useQueue: default false, (if set to true the lightbox show(currently only showPage function) request will be push into a queue instead of show it immediately)
        *                   
        */
        LightBox: {
            buttonType: {
                Close: 'Close',
                Print: 'Print',
                Accept: 'Accept',
                Decline: 'Decline',
                Ok: 'Ok',
                Edit: 'Edit',
                Save: 'Save',
                Add: 'Add',
                Search: 'Search',
                Enable: 'Enable',
                Cancel: 'Cancel',
                Discard: 'Discard',
                Yes: 'Yes',
                No: 'No',
                Change: 'Change',
                RedIgnore: 'RedIgnore',
                Select: 'Select',
                Delete: 'Delete',
                Continue: 'Continue',
                Refresh: 'Refresh'
            },
            showMode: {
                page: 'page',
                message: 'message',
                processing: 'processing'
            },
            container: null,
            container_content: null,
            loading: null,
            footer_buttons: null,
            footer_nobuttons: null,
            footer_center: null,
            overlay: null,
            currentShowMode: null,
            toString: function () { return 'Ale.LightBox'; },
            context: undefined,
            requestQueue: [],
            queueCheckTimeOut: 500,
            currentQueueItem: null,

            initialize: function () {
                this.overlay = $(document.createElement('div')).attr({ 'id': 'lightbox_overlay' }).hide();
                this.overlay.click(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                this.overlay.dblclick(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                this.overlay.select(function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
                $(document.body).append(this.overlay);
                this.container = $(document.createElement('div')).attr({ 'id': 'lightbox' }).hide();
                this.container.append($(document.createElement('ul')).attr({ 'id': 'lightbox_header' }));
                this.defaultLoadingMessage = 'Connecting...';
                this.loading = $(document.createElement('div')).attr('id', 'lightbox_loading').attr('style', 'height: 20px; background-color:white;padding-left: 10px;').append(Ale.loadingImage.clone().append('<span class=\'small label\'>' + this.defaultLoadingMessage + '</span>'));
                this.container.append(this.loading);
                this.hideLoading();

                this.container_content = $(document.createElement('div')).attr({ 'id': 'lightbox_content' });
                this.message = $(document.createElement('div')).attr({ 'id': 'lightbox_message' }).hide();
                this.container.append(this.container_content.append(this.message));

                // buttons
                this.initializeButtons();

                this.footer_center = $(document.createElement('li')).attr({ 'id': 'lightbox_footer_center', 'class': 'float_left' });
                this.footer_buttons = $(document.createElement('ul')).attr({ 'id': 'lightbox_footer' }).append(this.footer_center);
                this.footer_nobuttons = $(document.createElement('ul')).attr({ 'id': 'lightbox_footer_nobuttons' })
                        .append($(document.createElement('li')).attr({ 'id': 'lightbox_footer_nobuttons_center' }).addClass('float_left'));

                this.container.append(this.footer_buttons);
                this.container.append(this.footer_nobuttons);
                $(document.body).append(this.container);
            },

            initializeButtons: function () {
                this.buttonClose = this.createEventButton("Close", "btn-default", this.buttonType.Close);
                this.buttonPrint = this.createEventButton("Print", "btn-default", this.buttonType.Print);
                this.buttonAccept = this.createEventButton("Accept", "btn-success", this.buttonType.Accept);
                this.buttonDecline = this.createEventButton("Decline", "btn-default", this.buttonType.Decline);
                this.buttonOk = this.createEventButton("Ok", "btn-primary", this.buttonType.Ok);
                this.buttonEdit = this.createEventButton("Edit", "btn-default", this.buttonType.Edit);
                this.buttonSave = this.createEventButton("Save", "btn-success", this.buttonType.Save);
                this.buttonAdd = this.createEventButton("Add", "btn-success", this.buttonType.Add);
                this.buttonSearch = this.createEventButton("Search", "btn-primary", this.buttonType.Search);
                this.buttonEnable = this.createEventButton("Enable", "btn-success", this.buttonType.Enable);
                this.buttonCancel = this.createEventButton("Cancel", "btn-default", this.buttonType.Cancel);
                this.buttonDiscard = this.createEventButton("Discard", "btn-primary", this.buttonType.Discard);
                this.buttonYes = this.createEventButton("Yes", "btn-primary", this.buttonType.Yes);
                this.buttonNo = this.createEventButton("No", "btn-default", this.buttonType.No);
                this.buttonChange = this.createEventButton("Change", "btn-primary", this.buttonType.Change);
                this.buttonRedIgnore = this.createEventButton("Ignore", "btn-danger", this.buttonType.RedIgnore);
                this.buttonSelect = this.createEventButton("Select", "btn-success", this.buttonType.Select);
                this.buttonDelete = this.createEventButton("Delete", "btn-warning", this.buttonType.Delete);
                this.buttonContinue = this.createEventButton("Continue", "btn-success", this.buttonType.Continue);
                this.buttonRefresh = this.createEventButton("Refresh", "btn-success", this.buttonType.Refresh);
            },

            defaultOptions: function () {
                return {
                    showButtons: true,
                    showClose: false,
                    showPrint: false,
                    showAccept: false,
                    showDecline: false,
                    showOk: false,
                    showEdit: false,
                    showSave: false,
                    showAdd: false,
                    showSearch: false,
                    showEnable: false,
                    showCancel: false,
                    showDiscard: false,
                    showYes: false,
                    showNo: false,
                    showChange: false,
                    showRedIgnore: false,
                    showSelect: false,
                    showDelete: false,
                    showContinue: false,
                    showRefresh: false,
                    afterShow: function () { },
                    beforeHide: function () { return true; },
                    afterHide: function () { },
                    customButtons: [],
                    params: [],
                    orderButtons: [],
                    context: undefined,
                    enableAfterShow: true,
                    useQueue: false
                };
            },

            // depricated: old image buttons
            createButton: function (buttonType, src, tooltip) {
                if (buttonType === null || buttonType === undefined) return;

                var button = $(document.createElement('input')).attr({ 'type': 'image', src: '/SOLV2/Images/transparent.gif' }).addClass('link float_right').val(buttonType);
                if (tooltip) { button.prop('title', tooltip); }

                // if not a custom button then use the standard background button image from the sprites
                button.attr('src', src);

                if (buttonType === this.buttonType.Print) {
                    return button.bind('click', this, function (event) {
                        event.data.print();
                    });
                }
                return button.bind('click', this, function (event) {
                    event.data.buttonClicked(buttonType);
                });
            },

            createEventButton: function (text, style, buttonType) {
                var button = this.createBaseButton(text, style);
                this.addButtonEvent(buttonType, button);
                return button;
            },

            // create a button with text and a layout style 
            // Style: btn-primary (blue), btn-default (gray), btn-success (green), btn-warning (orange), btn-danger (red)
            createBaseButton: function (text, style) {
                return $(document.createElement('button')).addClass('link float_right btn btn-lightbox').addClass(style).html(text);
            },

            // add click events to the button based on the button type
            addButtonEvent: function (buttonType, button) {
                if (buttonType === this.buttonType.Print) {
                    button.bind('click', this, function (event) {
                        event.data.print();
                    });
                    return;
                }
                button.bind('click', this, function (event) {
                    event.data.buttonClicked(buttonType);
                });
            },

            isVisible: function () {
                return this.container !== null && this.container.is(':visible');
            },

            // show message box with title, message, and checkbox with label
            showMessageBoxWithCheckbox: function (title, message, checkboxMessage) {
                this.preShow(Ale.LightBox.showMode.message);

                this.removeFrame();

                // set message box default options
                var messageBoxDefaults = {
                    width: 300, // content message width
                    messageBoxType: ''
                };
                this.options = jQuery.extend({}, this.defaultOptions(), messageBoxDefaults, arguments[3]);

                if (!$.isUndefined(title) && title.length > 0) {
                    this.message.append($(document.createElement('div')).attr('id', 'lightbox_message_title').html(title).addClass(this.options.messageBoxType));
                }

                var messageHtml = '<div id="lightbox_message_title">' + title + '</div><span id="lightbox_message_message">' + message + '</span><br/><br/><input type="checkbox" id="apiTestMode"><label for="apiTestMode">' + checkboxMessage + '</label>';
                this.message.html(messageHtml).show();
                this.show();
            },

            sortQueue: function () {
                this.requestQueue.sort(function (a, b) { return a.time - b.time; });
            },

            // shows a message box with a loading animated gif, and no buttons
            showProcessingMessageBox: function (message, lightBoxOptions) {
                this.preShow(Ale.LightBox.showMode.processing);

                this.removeFrame();

                // set processing box default options
                var processingDefaults = {
                    showButtons: false,
                    width: 300
                };
                this.options = jQuery.extend({}, this.defaultOptions(), processingDefaults, lightBoxOptions);

                this.processingMessage = message;

                var messageHtml = '<div id="lightbox_message_message"><img id="lightbox_processing_image" alt="" src="images/status_loading.gif" /><span id="lightbox_processing_message">' + message + '</span></div>';
                this.message.html(messageHtml).show();
                this.show();
            },

            // show message box, can pass in custom options as second parameter, automatically resizes height
            showMessageBox: function (title, message) {
                this.preShow(Ale.LightBox.showMode.message);

                this.removeFrame();

                // set message box default options
                var messageBoxDefaults = {
                    width: 300, // content message width
                    messageBoxType: ''
                };
                this.options = jQuery.extend({}, this.defaultOptions(), messageBoxDefaults, arguments[2]);

                this.message.empty();

                if (!$.isUndefined(title) && title.length > 0) {
                    this.message.append($(document.createElement('div')).attr('id', 'lightbox_message_title').html(title).addClass(this.options.messageBoxType));
                }

                var messageDiv = $(document.createElement('div')).attr('id', 'lightbox_message_message');
                if (message !== null && !$.isUndefined(message)) {
                    if ($.isUndefined(message.each)) {
                        messageDiv.html(message);
                    } else {
                        messageDiv.append(message);
                    }
                }
                this.message.append(messageDiv).show();
                this.show();
            },

            sortQueue: function () {
                this.requestQueue.sort(function (a, b) { return a.time - b.time; });
            },

            // show lightbox with iframe link to another page, can pass in custom options as second parameter
            showPage: function (url, options) {
                if (options === null || options === undefined) {
                    options = {};
                    options.useQueue = true;
                }

                if (options.useQueue) {
                    var requestItem = { type: 'Page', time: new Date().getTime(), url: url, options: options };

                    this.requestQueue.push(requestItem);

                    if (this.currentQueueItem !== null) {
                        return;
                    }

                    this.currentQueueItem = requestItem;
                }

                this.preShow(Ale.LightBox.showMode.page);

                this.hideButtons();
                this.message.html('').hide();

                var pageDefaults = {
                    width: 397, // _content width
                    height: 363  // _content height // set to 0 for no height
                };
                this.options = jQuery.extend({}, this.defaultOptions(), pageDefaults, options);

                if (this.options.height === 'max') {
                    this.options.height = $(window).height() - 40;
                }

                if (this.options.width === 'max') {
                    this.options.width = ($('#master > #page > #content').width() || $(window).width()) - 20;
                }

                this.removeFrame();
                for (var i = 0; i < this.options.params.length; i++) {
                    url += (url.toString().indexOf('?', 0) < 0) ? '?' : '&';
                    url += this.options.params[i].name + '=' + escape(this.options.params[i].value);
                }

                setTimeout(function () {
                    Ale.LightBox.loadFrame(url);
                }, Ale.minimumTimeout);

                if (Ale.browser.isMobileSafari()) {
                    this.container_content.css("cssText", "overflow:scroll !important");
                    this.container_content.css('-webkit-overflow-scrolling', 'touch');
                }
            },

            loadFrame: function (url) {

                var wcfPattern = /\.svc|\.asmx/i,
                    aspPattern = /\.asp/i,
                    mvcPattern = /\/Web\//i;

                var isMvc = mvcPattern.test((url)) && !aspPattern.test(url) && !wcfPattern.test(url);

                if (isMvc || aspPattern.test(url) || wcfPattern.test(url)) {
                    url.indexOf('?') === -1 ? url += '?' : url += '&';
                    url += 'lightbox=yes';
                }

                this.iframe = $(document.createElement('iframe'))
                                .attr({
                                    id: 'lightbox_iframe',
                                    name: 'lightbox_iframe',
                                    frameBorder: '0',
                                    src: url
                                })
                                .prependTo(this.container_content);
                this.show();

            },

            removeFrame: function () {
                if (this.iframe) {
                    this.iframe.remove();
                    this.iframe = undefined;
                }
            },

            afterShow: function () {
                this.options.afterShow.call(this);
            },

            preShow: function (showMode) {
                this.currentShowMode = showMode;
                this.loaded = false;
                this.buttonPressed = undefined;
                this.processingMessage = null;

                if (this.container === null) {
                    this.initialize();
                }
            },

            show: function () {

                // set context object placeholder that launched lightbox, not always used
                this.context = this.options.context;

                // setup 
                this.container_content.attr('class', '').addClass('showmode_' + this.currentShowMode);
                var buttonPanel = this.footer_center[0];

                // check for custom order buttons
                if (this.options.orderButtons.length === 0) {
                    // hide all buttons
                    this.hideButtons();
                    this.addButtons();

                    // show required buttons
                    this.buttonClose.toggle(this.options.showClose === true);
                    this.buttonPrint.toggle(this.options.showPrint === true);
                    this.buttonAccept.toggle(this.options.showAccept === true);
                    this.buttonDecline.toggle(this.options.showDecline === true);
                    this.buttonOk.toggle(this.options.showOk === true);
                    this.buttonEdit.toggle(this.options.showEdit === true);
                    this.buttonSave.toggle(this.options.showSave === true);
                    this.buttonAdd.toggle(this.options.showAdd === true);
                    this.buttonSearch.toggle(this.options.showSearch === true);
                    this.buttonEnable.toggle(this.options.showEnable === true);
                    this.buttonCancel.toggle(this.options.showCancel === true);
                    this.buttonDiscard.toggle(this.options.showDiscard === true);
                    this.buttonYes.toggle(this.options.showYes === true);
                    this.buttonNo.toggle(this.options.showNo === true);
                    this.buttonChange.toggle(this.options.showChange === true);
                    this.buttonRedIgnore.toggle(this.options.showRedIgnore === true);
                    this.buttonSelect.toggle(this.options.showSelect === true);
                    this.buttonDelete.toggle(this.options.showDelete === true);
                    this.buttonContinue.toggle(this.options.showContinue === true);
                    this.buttonRefresh.toggle(this.options.showRefresh === true);
                } else {
                    // remove all buttons
                    this.removeButtons();

                    // add buttons according to the order
                    for (var i = this.options.orderButtons.length - 1; i >= 0; i--) {
                        if (this.options.orderButtons[i]) {
                            this.options.orderButtons[i].appendTo(buttonPanel);
                        }
                    }
                }

                // add custom buttons
                for (var i = 0; i < this.options.customButtons.length; i++) {
                    this.addCustomButton(this.options.customButtons[i]);
                }

                // hide callbacks
                this.beforeHide = this.options.beforeHide;
                this.afterHide = this.options.afterHide;

                // show buttons footer
                if (this.options.showButtons) {
                    this.footer_buttons.show();
                    this.footer_nobuttons.hide();
                } else {
                    this.footer_buttons.hide();
                    this.footer_nobuttons.show();
                }

                this.setSizePosition();

                var self = this;

                // only call AfterShow for non iframes, the iframe AfterShow is called once the iframe has loaded
                function callAfterShow() {
                    if (self.currentShowMode === Ale.LightBox.showMode.page) {
                        self.setHeight();
                        return;
                    }
                    Ale.LightBox.options.afterShow.call(self);
                }

                function setLoaded() {
                    if (self.currentShowMode === Ale.LightBox.showMode.page) {
                        return;
                    }
                    self.loaded = true;
                }

                // IE6 bug - hide selects for IE6

                if (Ale.browser.msie6()) {
                    self.disableSelects();
                    self.overlay.show();
                    self.container.show();
                    callAfterShow();
                    if (self.options.enableAfterShow) {
                        self.enable();
                    }
                    setLoaded();
                } else {
                    this.overlay.fadeIn(Ale.fadeDuration, function () {
                        self.container.fadeIn(Ale.fadeDuration, function () {
                            callAfterShow();
                            if (self.options.enableAfterShow) {
                                self.enable();
                            }
                            setLoaded();
                        });
                    });
                }

                // attach events
                if (!Ale.browser.isMobileDevice()) {
                    $(document).bind('keydown.' + this.toString(), this, this.keyDown);
                    $(window).bind('resize.' + this.toString(), this, function (event) {
                        event.data.setSizePosition();
                        event.data.setHeight();
                    });
                }

            },

            addButtons: function () {
                var buttonPanel = this.footer_center[0];
                // only add the buttons if they haven't been added yet

                this.buttonClose.appendTo(buttonPanel);
                this.buttonPrint.appendTo(buttonPanel);
                this.buttonAccept.appendTo(buttonPanel);
                this.buttonDecline.appendTo(buttonPanel);
                this.buttonOk.appendTo(buttonPanel);
                this.buttonEdit.appendTo(buttonPanel);
                this.buttonSearch.appendTo(buttonPanel);
                this.buttonEnable.appendTo(buttonPanel);
                this.buttonSave.appendTo(buttonPanel);
                this.buttonAdd.appendTo(buttonPanel);
                this.buttonCancel.appendTo(buttonPanel);
                this.buttonDiscard.appendTo(buttonPanel);
                this.buttonYes.appendTo(buttonPanel);
                this.buttonNo.appendTo(buttonPanel);
                this.buttonChange.appendTo(buttonPanel);
                this.buttonRedIgnore.appendTo(buttonPanel);
                this.buttonSelect.appendTo(buttonPanel);
                this.buttonDelete.appendTo(buttonPanel);
                this.buttonContinue.appendTo(buttonPanel);
                this.buttonRefresh.appendTo(buttonPanel);
            },

            removeButtons: function () {
                var buttonPanel = this.footer_center[0];
                var buttons = buttonPanel.children;
                while (buttons && buttons.length > 0) {
                    $(buttons[0]).remove();
                }
            },

            hideButtons: function () {
                this.container.find('#lightbox_footer_center input').hide().removeData('hideVisible');
                this.container.find('#lightbox_footer_center button').hide().removeData('hideVisible');
            },

            hideEnabledButtons: function () {
                this.container.find('#lightbox_footer_center input:visible').each(function () {
                    var context = $(this);
                    context.data('hideVisible', true).hide();
                });
                this.container.find('#lightbox_footer_center button:visible').each(function () {
                    var context = $(this);
                    context.data('hideVisible', true).hide();
                });
            },

            showEnabledButtons: function () {
                this.container.find('#lightbox_footer_center input').each(function () {
                    var context = $(this);
                    if (!$.isUndefined(context.data('hideVisible'))) {
                        context.show();
                    }
                });
                this.container.find('#lightbox_footer_center button').each(function () {
                    var context = $(this);
                    if (!$.isUndefined(context.data('hideVisible'))) {
                        context.show();
                    }
                });
            },

            addCustomButton: function (customButton) {
                if (customButton.buttonType === null || customButton.buttonType === undefined) return;

                if (this.footer_center.find('input[value="' + customButton.buttonType + '"]').show().length > 0) {
                    return;
                }

                var button = this.createButton(customButton.buttonType, customButton.src, customButton.tooltip).data('customButton', customButton);
                if (!$.isUndefined(customButton.width)) {
                    button.width(customButton.width);
                }
                if ($.isUndefined(customButton.isOk) || customButton.isOk === true) {
                    this.footer_center.append(button);
                } else {
                    this.footer_center.prepend(button);
                }
            },

            showCustomButton: function (customButtonType) {
                this.footer_center.find('input[value="' + customButtonType + '"]').show();
            },

            hideCustomButton: function (customButtonType) {
                this.footer_center.find('input[value="' + customButtonType + '"]').hide();
            },

            enableButton: function (buttonType) {
                this.footer_center.find('input[value="' + buttonType + '"]').removeAttr('disabled').removeClass('lightbox_disabled').show();
            },

            disableSelects: function () {
                var container = this.message.get(0);

                $('select').each(function () {
                    if (!jQuery.contains(container, this)) {
                        $(this).addClass('lightbox_disabled');
                    }
                });

            },

            enableSelects: function () {
                $('select.lightbox_disabled').removeClass('lightbox_disabled');
            },

            setProcessingMessage: function (message) {
                this.message.find('#lightbox_processing_message').html(message);
            },

            setSizePosition: function () {
                var doc = $(document),
                    dimensions = {
                        width: doc.width(),
                        height: doc.height()
                    },
                    layout = this.container_content.layout(),
                    maxWidth = this.options.width + layout.border.left + layout.padding.left + layout.border.right + layout.padding.right;

                this.overlay.css({ width: dimensions.width + 'px', height: dimensions.height + 'px', opacity: 0.5 });
                this.container.width(maxWidth).find('#lightbox_header, #lightbox_footer, #lightbox_footer_nobuttons').width(maxWidth);
                this.container_content.width(this.options.width);
                if (this.currentShowMode === Ale.LightBox.showMode.page && this.options.height > 0) {
                    this.container_content.height(this.options.height);
                } else {
                    this.container_content.height('auto');
                }

                this.container.find('#lightbox_header_center, #lightbox_footer_center, #lightbox_footer_nobuttons_center').width(maxWidth - 16);
                this.setPosition();
            },

            setPosition: function () {
                // mobile devices will always show popups at top of screen, so position screen there after show
                var wnd = $(window),
                    doc = $(document),
                    top = Ale.browser.isMobileDevice() ? 20 : (doc.scrollTop() + (wnd.height() - this.container.height()) / 2);

                this.container.css({
                    'left': (doc.scrollLeft() + (wnd.width() - this.container.width()) / 2) + 'px',
                    'top': top + 'px'
                });

                if (Ale.browser.isMobileDevice()) {
                    window.scrollTo(0, 0);
                }

            },

            setMobileHeight: function () {
                if (!Ale.browser.isMobileDevice()) {
                    return;
                }
                if (this.iframe) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        this.iframe.css('height', $(this.currentFrame().document.body).height() + 'px');
                    } catch (e) { }
                }
            },

            setMobileSafariHeight: function (height) {
                if (!Ale.browser.isMobileSafari()) {
                    return;
                }
                if (this.iframe) {
                    this.iframe.height(height);
                    this.container_content.height(height);
                }
            },

            setHeight: function () {
                if (Ale.browser.isMobileDevice()) {
                    this.container.css('height', 'auto');
                    this.container_content.css('height', 'auto');
                    if (this.iframe) {
                        this.iframe.css('height', 'auto');
                    }
                    return;
                }

                var wnd = $(window);
                var wndHeight = wnd.height();
                var containerHeight = this.container.height();
                var contentHeight = this.container_content.height();

                if (wndHeight <= containerHeight) {
                    var diff = (containerHeight - wndHeight) + 10; // add 10px margin to allow window sit inside browser window
                    containerHeight = containerHeight - diff;
                    contentHeight = contentHeight - diff;
                    this.container_content.css('height', contentHeight + 'px');
                    this.container.css({
                        top: ($(document).scrollTop() + (wndHeight - containerHeight) / 2) + 'px',
                        height: containerHeight + 'px'
                    });
                }

                if (this.iframe) {
                    this.iframe.css('height', contentHeight + 'px');
                }
            },

            hide: function (callBack) {
                var self = this;

                return new Ale.Promise(function (resolve, reject) {
                    if (self.container !== null) {
                        if (Ale.browser.msie6()) {
                            self.container.hide();
                        } else {
                            self.container.fadeOut(Ale.fadeDuration);
                        }
                    }

                    var signalComplete = function () {
                        if ($.isFunction(callBack)) {
                            callBack.call(self);
                        }
                        resolve();
                    };
                    if (self.overlay !== null) {
                        if (Ale.browser.msie6()) {
                            self.overlay.hide();
                            signalComplete();
                        } else {
                            self.overlay.fadeOut(Ale.fadeDuration, signalComplete);
                        }
                    } else {
                        signalComplete();
                    }

                    $(document).unbind('keydown.' + self.toString());
                    $(window).unbind('resize.' + self.toString());

                    // IE6 bug - hide selects for IE6
                    if (Ale.browser.msie6()) {
                        self.enableSelects();
                    }

                    if (self.options && self.options.useQueue) {

                        var index = self.requestQueue.indexOf(self.currentQueueItem);
                        if (index > -1) {
                            self.requestQueue.splice(index, 1);
                        }
                        self.currentQueueItem = null;

                        if (self.requestQueue.length > 0) {
                            self.sortQueue();
                            var param = self.requestQueue[0];
                            self.requestQueue.shift();
                            switch (param.type) {
                                case 'Page':
                                    setTimeout(function () {
                                        Ale.LightBox.showPage(param.url, param.options);
                                    }, Ale.LightBox.queueCheckTimeOut);
                                default:
                            }
                        }
                    }

                    // Reset all buttons and events
                    self.initializeButtons();
                });
            },

            disable: function (opts) {
                var options = $.extend({ message: this.defaultLoadingMessage }, opts);

                this.updateLoading(options.message);
                this.showLoading();
                this.footer_center.find('input:visible,button:visible').attr('disabled', 'disabled');
                if (this.iframe && this.currentFrame()) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        $(this.currentFrame().document.body).find('input:image:visible:enabled, input:button:visible:enabled, input:file:visible:enabled, input:submit:visible:enabled, input:reset:visible:enabled').addClass('lightbox_temp_disabled').attr({ 'disabled': 'disabled' });
                    } catch (e) { }

                }
            },

            enable: function () {
                if (this.footer_center === null) {
                    return;
                }
                this.footer_center.find('input:visible,button:visible').removeAttr('disabled');
                if (this.iframe && this.currentFrame()) {
                    try { // this captures permission denied errors accessing iframes from another domain
                        $(this.currentFrame().document.body).find('.lightbox_temp_disabled').each(function () {
                            var context = $(this);
                            context.removeClass('lightbox_temp_disabled').removeAttr('disabled');
                        });
                    } catch (e) { }
                }
                this.hideLoading();
            },

            hideLoading: function () {
                this.loading.find('div').hide();
            },

            showLoading: function () {
                this.loading.find('div').show();
            },

            updateLoading: function (message) {
                this.loading.find('span.label').html(message);
            },

            print: function (event) {
                if (!this.iframe || !this.iframe.is(":visible") || typeof this.currentFrame() === "undefined") {
                    return;
                }

                this.currentFrame().focus();
                this.currentFrame().printPage();
            },

            currentFrame: function () {
                return this.iframe ? this.iframe.get(0).contentWindow : undefined;
            },

            increasePaddingBottom: function (paddingBottomToIncrease) {
                var currentPaddingBottom = parseInt(this.container_content.css('padding-bottom').replace('px', ''));
                this.container_content.css('padding-bottom', (currentPaddingBottom + paddingBottomToIncrease) + 'px');
            },

            /* events */
            _beforeHideResult: function (buttonPressed) {
                var self = this;
                var deferred = $.Deferred();

                if ($.isFunction(self.beforeHide)) {
                    var result = self.beforeHide.call(self, buttonPressed);
                    if (typeof result === 'object' && 'then' in result) {
                        result.then(function (data) {
                            deferred.resolve(data);
                        }).fail(function () {
                            deferred.reject();
                        });
                    } else {
                        deferred.resolve(result);
                    }
                } else {
                    deferred.resolve(true);
                }

                return deferred.promise();
            },

            buttonClicked: function (buttonPressed) {
                this.buttonPressed = buttonPressed;

                // beforeHide callback
                var self = this;
                self._beforeHideResult(buttonPressed).then(function (okToClose) {
                    if (okToClose) {
                        self.hide(function () {
                            if ($.isFunction(Ale.LightBox.afterHide)) {
                                Ale.LightBox.afterHide.call(Ale.LightBox, buttonPressed);
                            }
                        });
                    }
                });

            },

            keyDown: function (event) {
                if (event.data.toString() !== Ale.LightBox.toString()) {
                    return;
                }

                if (event.keyCode !== Ale.key.ENTER && event.keyCode !== Ale.key.ESCAPE) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();

                var context = event.data;

                // enter, check for default Ok, Close, Print, Yes,
                if (event.keyCode === Ale.key.ENTER) {
                    if (context.buttonPrint.is(":visible")) {
                        context.print();
                        return;
                    }

                    if (context.buttonOk.is(":visible")) {
                        context.buttonOk.click();
                        return;
                    }
                    if (context.buttonSave.is(":visible")) {
                        context.buttonSave.click();
                        return;
                    }
                    if (context.buttonAdd.is(":visible")) {
                        context.buttonAdd.click();
                        return;
                    }
                    if (context.buttonYes.is(":visible")) {
                        context.buttonYes.click();
                        return;
                    }
                    if (context.buttonAccept.is(":visible")) {
                        context.buttonAccept.click();
                        return;
                    }
                    if (context.buttonChange.is(":visible")) {
                        context.buttonChange.click();
                        return;
                    }
                    if (context.buttonRedIgnore.is(":visible")) {
                        context.buttonRedIgnore.click();
                        return;
                    }
                    if (context.buttonSelect.is(":visible")) {
                        context.buttonSelect.click();
                        return;
                    }
                    if (context.buttonContinue.is(":visible")) {
                        context.buttonContinue.click();
                        return;
                    }

                    /* check custom buttons */
                    context.footer_center.find('input:visible').each(function (index, input) {
                        var context = $(input);
                        if ($.isUndefined(context.data('customButton')) || context.data('customButton').isOk === false) return true; // continue the .each loop
                        context.click();
                        return false; //  break out of the .each loop
                    });

                    return;
                }

                // esc, then close lightbox
                if (context.buttonClose.is(":visible")) {
                    context.buttonClose.click();
                    return;
                }
                if (context.buttonCancel.is(":visible")) {
                    context.buttonCancel.click();
                    return;
                }
                if (context.buttonNo.is(":visible")) {
                    context.buttonNo.click();
                    return;
                }
                if (context.buttonDecline.is(":visible")) {
                    context.buttonDecline.click();
                    return;
                }
                if (context.buttonEdit.is(":visible")) {
                    context.buttonEdit.click();
                    return;
                }

                /* check custom buttons */
                context.footer_center.find('input:visible').each(function (index, input) {
                    var context = $(input);
                    if ($.isUndefined(context.data('customButton')) || context.data('customButton').isOk === true) return true; // continue the .each loop
                    context.click();
                    return false; //  break out of the .each loop
                });

            }
            /* end of events */

        }
    }
    );
})(jQuery);


$(document).ready(function () {
    var options = [];
    options.ImagesCollection = [];
    options.ImagesCollection.push(Translator.CreateImageItem('Images/1.jpg', '#'));
    options.ImagesCollection.push(Translator.CreateImageItem('Images/2.jpg', '#'));
    options.ImagesCollection.push(Translator.CreateImageItem('Images/3.jpg', '#'));
    options.DisplayPreview = false;
    options.AutoPlay = true;
    options.ImageWidth = 1000;
    options.ImageHeight = 600;

   // Translator.Slide($('#example'), options);

    //Ale.LightBox.showProcessingMessageBox('Selected route validation...',
    //        {
    //            afterShow: function () { return; }
    //        });
});
