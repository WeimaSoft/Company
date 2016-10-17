(function ($) {
    if (typeof Translator === "undefined") {
        Translator = {};
    }

    $.extend(Translator,
    {
        currentImageIndex: 1,
        translatorItemContainer: {},
        interval:{},
        Options: {
            ImagesCollection: [],
            ImageWidth: 1000,
			ImageHeight:564,
            TransitionDuration: 500,
            AutoPlay: true,
            AutoPlayDuration:5000
        },
        Slide: function (translatorContainer, options) {
        	var self = this;
            $.extend(this.Options, options);

            translatorContainer.addClass('translator overflowh');

            var translatorWrapper = $("<div class='translator-container overflowh'>").appendTo(translatorContainer);
			translatorWrapper.css("width",this.Options.ImageWidth + "px");
			translatorWrapper.css("height",this.Options.ImageHeight + "px");

            translatorItemContainer = $("<div class='translator-item-container overflowh'>").appendTo(translatorWrapper);
            translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
            translatorItemContainer.css('transform', 'translate3d(-' + this.Options.ImageWidth + 'px,0,0)');
			translatorItemContainer.css("width",this.Options.ImageWidth * (this.Options.ImagesCollection.length + 2) + "px");
			translatorItemContainer.css("height",this.Options.ImageHeight + "px");

            for (var imgItem in this.Options.ImagesCollection) {
                var img = this.Options.ImagesCollection[imgItem];
                translatorItemContainer.append("<div class='translator-item' style='width:" + this.Options.ImageWidth+"px;height:" +this.Options.ImageHeight + "'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }

            for (var i = 0; i < 2; i++) {
                var img = this.Options.ImagesCollection[i];
                translatorItemContainer.append("<div class='translator-item' style='width:" + this.Options.ImageWidth+"px;height:" +this.Options.ImageHeight + "'><a href='" + img.Link + "'><img src='" + img.Url + "'></a></div>");
            }
            
            var btnPrevious = $("<div class='translator-btnpreview left0' style='top:" + (this.Options.ImageHeight - 70)/2 + "px'><div></div></div>").appendTo(translatorWrapper);
            btnPrevious.click(function(){self.ViewPrevious();})
            
            var btnNext = $("<div class='translator-btnpreview right0' style='top:" + (this.Options.ImageHeight - 70)/2 + "px'><div></div></div>").appendTo(translatorWrapper);
            btnNext.click(function(){self.ViewNext();})

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
                this.interval = setInterval("Translator.Play(true)", this.Options.AutoPlayDuration);
            }
        },
        
        Play: function(autoPlay) {
        	if(autoPlay){this.currentImageIndex++;}
        	var self = this;
            if (this.currentImageIndex == this.Options.ImagesCollection.length + 1) {
                translatorItemContainer.css('transition-duration', this.Options.TransitionDuration + 'ms');
                translatorItemContainer.css('transform', 'translate3d(-' + this.currentImageIndex * this.Options.ImageWidth + 'px,0,0)');
                this.currentImageIndex = 1;
                setTimeout(function () {
                	translatorItemContainer.css('transform', 'translate3d(-' + self.currentImageIndex * self.Options.ImageWidth + 'px,0,0)');
                    translatorItemContainer.css('transition-duration', '0s');
                }, 500);
            } else if (this.currentImageIndex == 0){
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
        ViewPrevious: function()
        {
        	clearInterval(this.interval);
        	this.currentImageIndex++;
        	this.Play();
        	
        },
        ViewNext:function(){
        	clearInterval(this.interval);
        	this.currentImageIndex--;
        	this.Play();
        	
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
    options.AutoPlay = true;
	options.ImageWidth = 1000;
	options.ImageHeight = 600;

    Translator.Slide($('#example'), options);
    Translator.Slide($('#example1'), options);
});
