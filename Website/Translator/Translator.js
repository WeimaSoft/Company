(function ($) {
    if (typeof Translator === "undefined") {
        Translator = {};
    }

    $.extend(Translator,
    {
        currentImageIndex: 0,
        translatorItemContainer: {},
        Options: {
            ImagesCollection: [],
            ImageWidth: 1000,
            TransitionDuration: 500,
            DisplayPreview: true,
            AutoPlay: true,
            AutoPlayDuration:5000
        },
        Slide: function (translatorContainer, options) {
            $.extend(this.Options, options);

            translatorContainer.addClass('translator overflowh');

            var translatorWrapper = $("<div class='translator-container overflowh'>").appendTo(translatorContainer);

            translatorItemContainer = $("<div class='translator-item-container overflowh'></div>").appendTo(translatorWrapper);

            for (var imgItem in this.Options.ImagesCollection) {
                var img = this.Options.ImagesCollection[imgItem];
                translatorItemContainer.append("<div class='translator-item'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }

            for (var i = 0; i < 2; i++) {
                var img = this.Options.ImagesCollection[i];
                translatorItemContainer.append("<div class='translator-item'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }
            
            translatorWrapper.append("<div class='translator-btnpreview left0'><div></div></div><div class='translator-btnpreview right0'><div></div></div>");

            if (this.Options.DisplayPreview) {
                translatorWrapper.append("<div class='translator-item-preview' style='right:" + this.Options.ImageWidth + "' ></div><div class='translator-item-preview' style='left:" + this.Options.ImageWidth + "'></div>");
            }

            if (this.Options.AutoPlay) {
                this.AutoPlay();
            }
        },

        CreateImageItem: function(url, link) {
            var img = new Object();
            img.Url = url;
            img.Link = link;
            return img;
        },

        AutoPlay:function() {
            if (this.Options.AutoPlay) {
                setInterval("Translator.Play()", this.Options.AutoPlayDuration);
            }
        },
        Play: function() {
            this.currentImageIndex++;
            if (this.currentImageIndex == this.Options.ImagesCollection.length) {
                translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
                this.currentImageIndex = 0;
                setTimeout(function () {
                    translatorItemContainer.css('transform', 'translate3d(0px,0,0)');
                    translatorItemContainer.css('transition-duration', '0s');
                }, 500);
            } else {
                translatorItemContainer.css('transition-duration', '500ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
            }
        }         
    });
})(jQuery);

$(document).ready(function () {
    var options = [];
    options.ImagesCollection = [];
    options.ImagesCollection.push(Translator.CreateImageItem('Images/1.jpg', '#'));
    options.ImagesCollection.push(Translator.CreateImageItem('Images/2.jpg', '#'));
    options.ImagesCollection.push(Translator.CreateImageItem('Images/3.jpg', '#'));
    options.DisplayPreview = false;

    Translator.Slide($('#example'), options);
});
