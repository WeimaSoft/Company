(function($) {
	var imageCount = 0;

	$.extend({
		setupTransform : function(translator, imageArrayLength) {
			imageCount++;
			if (imageCount == imageArrayLength - 1) {
				$('#' + translator).css('transition-duration', '500ms');
				$('#' + translator).css('transform',
						'translate3d(-' + imageCount * 1000 + 'px,0,0)');
				imageCount = 0;
				setTimeout(function() {
					$('#' + translator).css('transform',
							'translate3d(-' + imageCount * 1000 + 'px,0,0)');
					$('#' + translator).css('transition-duration', '0s');
				}, 500);
			} else {
				$('#' + translator).css('transition-duration', '500ms');
				$('#' + translator).css('transform',
						'translate3d(-' + imageCount * 1000 + 'px,0,0)');
			}
		}
	})

})(jQuery);

setInterval("$.setupTransform('translator',4)", 5000);