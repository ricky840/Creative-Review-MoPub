var mraidContainer = (function(global) {
	"use strict";

	function attach(html) {
		const mraid = `
			<!DOCTYPE html>
			<html>
				<head>
					<script src="${MRAID_CDN}"></script>
					<script>
						window.alert = console.log;
						document.addEventListener('DOMContentLoaded', function () {
							mraidbridge.fireChangeEvent({
								placementType: 'inline',
								supports: {
									sms: false,
									tel: false,
									calendar: false,
									storePicture: false,
									inlineVideo: true
								},
								state: 'default'
							});
							mraidbridge.fireChangeEvent({viewable: true});
							mraidbridge.setCurrentPosition(0.0, 0.0, 320, 50);
							mraidbridge.setDefaultPosition(0.0, 0.0, 320, 50);
							mraidbridge.setScreenSize(320.0, 480.0);
							mraidbridge.setMaxSize(320.0, 480.0);
							mraidbridge.notifySizeChangeEvent(320, 50);
							mraidbridge.fireReadyEvent();
						}, false );
					</script>
				</head>
				<body style="margin: 0; padding: 0;">
					${html}
				</body>
			</html>`;
		return $.trim(mraid);
	}

	function attachNative(jsonMarkUp) {
		const nativeAssetContainer = `
			<div class="native_ad" style="max-width: fit-content;">
				<div style="position: relative; width: 320px;">
					<img class="icon" style="width: 40px; border-radius: 25px;" src="${jsonMarkUp.iconimage}">
					<span class="title" style="top: 50%; position: absolute; transform: translateY(-50%); margin-left: 0.5em; font-weight: bold; word-break: break-all;">
						${jsonMarkUp.title}
					</span>
				</div>
				<div style="width: 320px;">
					<div class="text" style="text-align: center; margin-bottom: 0.3em; word-break: break-all;">
						${jsonMarkUp.text}
					</div>
				</div>
				<img class="main_image" style="width: 320px; border-radius: 3px;" src="${jsonMarkUp.mainimage}">
				<div style="text-align: center; margin-top: 0.2em;">
					<button>
						<span class="ctatext">${jsonMarkUp.ctatext}</span>
					</button>
				</div>
			</div>`;
		const mraid = `
			<!DOCTYPE html>
			<html>
				<head>
					<script src="${MRAID_CDN}"></script>
					<script>
						window.alert = console.log;
						document.addEventListener('DOMContentLoaded', function () {
							mraidbridge.fireChangeEvent({
								placementType: 'inline',
								supports: {
									sms: false,
									tel: false,
									calendar: false,
									storePicture: false,
									inlineVideo: true
								},
								state: 'default'
							});
							mraidbridge.fireChangeEvent({viewable: true});
							mraidbridge.setCurrentPosition(0.0, 0.0, 320, 50);
							mraidbridge.setDefaultPosition(0.0, 0.0, 320, 50);
							mraidbridge.setScreenSize(320.0, 480.0);
							mraidbridge.setMaxSize(320.0, 480.0);
							mraidbridge.notifySizeChangeEvent(320, 50);
							mraidbridge.fireReadyEvent();
						}, false );
					</script>
				</head>
				<body style="margin: 0; padding: 0;">${nativeAssetContainer}</body>
			</html>`;
		return $.trim(mraid);
	}
 
  return {
		attach: attach,
		attachNative: attachNative
  }
})(this);
