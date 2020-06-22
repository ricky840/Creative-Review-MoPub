class Creative {
	constructor(creativeId, bidderId) {
		this._creativeId = creativeId;
		this._bidderId = bidderId;
		this._type = ""; // banner(height 50 only) | vast | vast_tag | html | native
		this._markup = "";
		this._markUpWithContainer = "";
		this._blocked = undefined; // true, false, undefined (if no information returned)
		this._impressions = 0;
		this._publisherRevenue = 0;
		this._clicks = 0;
		this._adomain = "";
		this._width = 0;
		this._height = 0;
		this._didMarkUpLoaded = "yet"; // yet | loading | failed | loaded
		this._didMarkUpLoadedWithContainer = "yet"; // yet | loaded | failed
		this._base64Img = "";
		this._didBase64ImgLoaded = "yet"; // yet | loading | failed | loaded
		this._videoUrl = "";
	}

	export() {
		return {
			creativeId: this._creativeId,
			bidderId: this._bidderId,
			type: this._type,
			markup: this._markup,
			markUpWithContainer: this._markUpWithContainer,
			blocked: this._blocked,
			impression: this._impressions,
			click: this._clicks,
			revenue: this._publisherRevenue,
			adomain: this._adomain,
			width: this._width,
			height: this._height,
		}
	}

	setStats(creativeObj) {
		this._blocked = creativeObj.blocked;
		this._impressions = creativeObj.impressions;
		this._publisherRevenue = creativeObj.publisherRevenue;
		this._clicks = creativeObj.clicks;
	}

	loadScreenShot(requestUrl) {
		return new Promise((resolve, reject) => {
			// To be safe
			if (this._didMarkUpLoadedWithContainer != "loaded") {
				reject(false);
				return;
			}
			let request = {
				url: requestUrl,
				data: this._markUpWithContainer,
				headers: { 
					"Content-Type": "text/html",
					"X-API-Key": HEROKU_API_KEY 
				}
			};
			this._didBase64ImgLoaded = "loading";
			http.postRequestBinary(request).then(result => {
				let base64data = result.response;
				this._base64Img = base64data;
				this._didBase64ImgLoaded = "loaded";
				resolve(true);
			}).catch(error => {
				this._didBase64ImgLoaded = "failed";
				reject(false);
				console.log(`[Error] Failed to load creative screenshot: ${error.response} ${this._bidderId} ${this._creativeId}`);
			});
		});
	}

	getVideoUrlFromVastXml(vastXml) {
		let parser = new DOMParser();
		let xmlDoc = parser.parseFromString(vastXml, "text/xml");
		let vast = xmlDoc.getElementsByTagName("MediaFiles")[0];

		if (typeof vast != "object" || typeof vast.querySelector("MediaFile") != "object") {
			return false;
		}

		const mediaFileObjects = vast.querySelectorAll("MediaFile");
		let videoUrlFinal = false;

		for (let i=0; i < mediaFileObjects.length; i++) {
			let videoUrl = mediaFileObjects[i].innerHTML.trim();
			let videoType = mediaFileObjects[i].getAttribute("type");
			if (videoType != "video/mp4") continue;

			videoUrlFinal = removeCDATA(videoUrl);
			if (videoUrlFinal) break;
		}

		if (videoUrlFinal) {
			this._videoUrl = videoUrlFinal;
			return videoUrlFinal;
		} else {
			this._didMarkUpLoadedWithContainer = "failed"; // at this time, we know this was a VAST
			return false;
		}
	}

	setTypeVast(markUp) {
		let videoUrl = this.getVideoUrlFromVastXml(markUp);
		if (!videoUrl) return false; // for the next check
		this._type = "vast";
		this._markUpWithContainer = vastContainer.attach(videoUrl);
		this._didMarkUpLoadedWithContainer = "loaded";
		return true;
	}

	setTypeVastURI(markUp) {
		return new Promise((resolve, reject) => {
			// Check if it has Wrapper > VASTAdTagURI (VAST 2.0+)
			let parser = new DOMParser();
			let xmlDoc = parser.parseFromString(markUp, "text/xml");
			let vastURI = xmlDoc.getElementsByTagName("Wrapper")[0];
			if (typeof vastURI != "object" || typeof vastURI.querySelector("VASTAdTagURI") != "object") {
				reject(false);
				return;
			}

			// Here, at this point it is VAST Tag
			this._type = "vast_tag";

			let vastXmlURL = (vastURI.querySelector("VASTAdTagURI").innerHTML).trim();
			let vastXmlURLTrimmed = removeCDATA(vastXmlURL);
			if (_.isEmpty(vastXmlURLTrimmed)) {
				this._didMarkUpLoadedWithContainer = "failed"; // its VAST Tag but couldn't find xml URL
				reject(false);
				return;
			}

			// Get Vast XML
			http.getRequest({ url: vastXmlURLTrimmed }).then(result => {
				const vastXml = result.responseText;	
				const videoUrl = this.getVideoUrlFromVastXml(vastXml);
				if (_.isEmpty(videoUrl)) {
					this._didMarkUpLoadedWithContainer = "failed"; // its VAST Tag but couldn't find video URL.
					reject(false);
					return;
				}
				this._markUpWithContainer = vastContainer.attach(videoUrl);
				this._didMarkUpLoadedWithContainer = "loaded";
				resolve(true);
			}).catch(error => {
				this._didMarkUpLoadedWithContainer = "failed"; // its VAST Tag but couldn't find video URL.
				reject(false);
				return;
			});
		});
	}

	setTypeNative(markUp) {
		try {
			let jsonMarkUp = JSON.parse(markUp);
			this._type = "native";
			this._markUpWithContainer = mraidContainer.attachNative(jsonMarkUp);
			this._didMarkUpLoadedWithContainer = "loaded";
			return true;
		} catch(error) {
			return false;
		}
	}

	setType(markUp) {
		return new Promise((resolve, reject) => {
			if (this._height == 50) { // banner height 50 only
				this._type = "banner";
				this._markUpWithContainer = mraidContainer.attach(this._markup);
				this._didMarkUpLoadedWithContainer = "loaded";
				resolve(true);
				return true;
			}
			if (this.setTypeVast(markUp)) {
				resolve(true);
				return true;
			}	
			if (this.setTypeNative(markUp)) {
				resolve(true);
				return true;
			}
			this.setTypeVastURI(markUp).then(result => {
				resolve(true);
				return true;
			}).catch(error => {
				if (this._didMarkUpLoadedWithContainer == "failed") {
					// It was VAST but failed to have the VAST video URL.
					reject(false);
					return;
				} 
				// Then it is html
				this._type = "html";
				this._markUpWithContainer = mraidContainer.attach(this._markup);
				this._didMarkUpLoadedWithContainer = "loaded";
				resolve(true);
				return;
			});
		});
	}

	loadMarkUp() {
		return new Promise((resolve, reject) => {
		     let request = { url: API_BASE + API_GET_CREATIVE + `id=${this._bidderId}&creativeId=${this._creativeId}` };
			   // let request = { url: API_BASE + API_GET_CREATIVE + `id=f67445oEOC&creativeId=147220:02d931efee80a07618857bb661f04557` };
			this._didMarkUpLoaded = "loading";
			http.getRequest(request).then(result => { // if use function, (this) scope will change. Use (=>) function instead
				let creative = JSON.parse(result.responseText);
				if (!("body" in creative) || !("domain" in creative) || !("width" in creative) || !("height" in creative)) {
					throw `Creative information is in the wrong format`;
				}

				this._markup = creative.body;
				this._adomain = creative.domain;
				this._width = creative.width;
				this._height = creative.height;
				this._didMarkUpLoaded = "loaded";
				this.setType(this._markup).then(result => {
					resolve(true);
				}).catch(error => {
					reject(false);
				});

			}).catch(error => {
				console.log(error);
				this._didMarkUpLoaded = "failed";
				reject(false);
				console.log(`[Error] Failed to load creative markup from MoPub: ${error.responseText} ${this._bidderId} ${this._creativeId}`);
			});
		});
	}

	// Setters
	// setMarkUp(markUp) { this._markup = markUp; }
	// setAdomain(adomain) { this._adomain = adomain; }
	// setWidth(width) { this._width = width; }
	// setHeight(height) { this._height = height; }
	// setMarkUpLoaded(markUpLoaded) { this._didMarkUpLoaded = markUpLoaded; }

	// Getters
	getCreativeId() { return this._creativeId; }
	getBidderId() { return this._bidderId; }
	getType() { return this._type; }
	getMarkUp() { return this._markup; }
	getMarkUpWithContainer() { return this._markUpWithContainer; }
	getBlocked() { return this._blocked; }
	getImpressions() { return this._impressions; }
	getPublisherRevenue() { return this._publisherRevenue; }
	getClicks() { return this._clicks; }
	getAdomain() { return this._adomain; }
	getWidth() { return this._width; }
	getHeight() { return this._height; }

	getDidBase64ImgLoaded() { return this._didBase64ImgLoaded; }
	getBase64Img() { return this._base64Img; }
	getDidMarkUpLoaded() { return this._didMarkUpLoaded; }
}
