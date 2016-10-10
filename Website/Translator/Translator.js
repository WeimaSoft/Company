self.setInterval("setupTransform()",5000);
var imageCount = 0;
var repeatCount = false;

function setupTransform() {
	imageCount++;
	
	if(repeatCount){
		repeatCount = false;
	}
	
	if(imageCount > 3){
		imageCount = 1;
		repeatCount = true;
	}
	if(repeatCount){
		document.getElementById("translator").style.transitionDuration = "0ms";
	}
	else{
		document.getElementById("translator").style.transitionDuration = "500ms";
	}
	document.getElementById("translator").style.transform = 'translate3d(-' + imageCount * 1000 + 'px,0,0)';
}