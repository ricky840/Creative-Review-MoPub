var vastContainer = (function(global) {
	"use strict";

	function attach(videoUrl) {
		const vast = `
		<!DOCTYPE html>
		<html>
			<head>
			<style type="text/css">
			.overlay {
				position: absolute;
				top: 0;
				left: 0;
				background-color: black;
				color: white;
				z-index: 1;
				width: 320px;
				height: 480px;
				text-align: center;
			}
			</style>	
			</head>
			<body style="margin: 0; padding: 0;">
			<div id="wrapper">
				<video width="320" height="480" id="vast-video" controls autoplay muted>
					<source id="sourceUrl">
				</video>
				<div id="overlay" class="overlay" style="display: none;">
					<span id="error-msg" style="margin-top: 50%; display: block;"></span>
				</div>
			</div>
			<script>
				const video = document.getElementById('vast-video');
				video.addEventListener('loadedmetadata', function() {
					let offset = parseInt(video.duration / 100 * ${SkipOffset});
					if (offset <= 0) {
						video.currentTime = 2;
					} else {
						video.currentTime = offset;
					}
					video.play();
				});
				video.addEventListener('error', onError, true);
				function onError(event) {
					document.getElementById('overlay').style.display = "block";
					document.getElementById('error-msg').innerHTML = "Error playing video :-( <br><br>Click here to preview instead.";
				}
			</script>
			</body>
		</html>`;
		// console.log(videoUrl);
		let parser = new DOMParser();
		let htmlDoc = parser.parseFromString($.trim(vast), 'text/html');
		htmlDoc.getElementById("sourceUrl").src = videoUrl;
		let markup = htmlDoc.documentElement.outerHTML;
		return markup;
	}
 
  return {
		attach: attach
  }
})(this);
