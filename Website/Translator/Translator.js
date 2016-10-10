self.setInterval("setupTransform()",5000);
var imageCount = 1;

function setupTransform() {
	imageCount++;
	if(imageCount > 3){
		imageCount = 0;
	}
	document.getElementById("translator").style.transform = 'translate3d(-' + imageCount * 1000 + 'px,0,0)';
}