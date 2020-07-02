var cardRender = (function(global) {
	"use strict";

	function createCardWithElement(creative, status) {

		let imgSrc = (status == "success") ? creative.getBase64Img() : FAIL_IMG;

		let blockStatusClass = "allowed-crt";
		if (creative.getBlocked() === undefined) {
			blockStatusClass = "noinfo-crt";
		} else if (creative.getBlocked() === true) {
			blockStatusClass = "blocked-crt";
		} else if (creative.getBlocked() === false) {
			blockStatusClass = "allowed-crt";
		}

		let type = "";
		switch (creative.getType()) {
			case "banner":
				type = "BANNER";
				break;
			case "vast":
				type = "VAST XML";
				break;
			case "vast_tag":
				type = "VAST TAG";
				break;
			case "native":
				type = "NATIVE";
				break;
			case "html":
				type = `${creative.getWidth()}x${creative.getHeight()}`;
				break;
		}

		let cardAssets = {
			imgSrc: imgSrc,
			impression: creative.getImpressions(),
			click: creative.getClicks(),
			revenue: creative.getPublisherRevenue().toFixed(6),
			adomain: creative.getAdomain(),
			creativeId: creative.getCreativeId(),
			bidderId: creative.getBidderId(),
			bidderName: creative.getBidderName(),
			type: type,
			blockStatusClass: blockStatusClass
		}

		let cardHtml = htmlFactory.getCardHtml(cardAssets);

		return cardHtml;
	}

	function attachCard(cardType, cardHtml) {
		switch (cardType) {
			case "banner":
				$(".ui.cards.banner-cards").append(cardHtml);
				break;
			case "vast":
				$(".ui.cards.vast-cards").append(cardHtml);
				break;
			case "vast_tag":
				$(".ui.cards.vast-cards").append(cardHtml);
				break;
			case "native":
				$(".ui.cards.native-cards").append(cardHtml);
				break;
			case "html":
				$(".ui.cards.html-cards").append(cardHtml);
				break;
			case "fail":
				$(".ui.cards.failed-cards").append(cardHtml);
				break;
		}
	}

	function removeAllCards() {
		$(".ui.cards.banner-cards").empty();
		$(".ui.cards.vast-cards").empty();
		$(".ui.cards.vast-cards").empty();
		$(".ui.cards.native-cards").empty();
		$(".ui.cards.html-cards").empty();
		$(".ui.cards.failed-cards").empty();
	}

  return {
		createCardWithElement: createCardWithElement,
		attachCard: attachCard,
		removeAllCards: removeAllCards
  }
})(this);
