var cardRender = (function(global) {
	"use strict";

	function createCardWithElement(creative, status) {
		let img = $("<img/>");
		// img.attr("loading", "lazy");

		if (status == "success") {
			img.attr("src", creative.getBase64Img());
		} else {
			img.attr("src", FAIL_IMG);
		} 

		// temp
		return img;

		// let parser = new DOMParser();
		// let creativeHtml = parser.parseFromString(htmlFactory.getCardHtml(), 'text/html');
		// console.log(creativeHtml);
		let creativeHtml = $.parseHTML(htmlFactory.getCardHtml());
		$(creativeHtml).find(".ad-image").html(img);
		$(creativeHtml).find(".card-ad-imp").html(creative.getImpressions());
		$(creativeHtml).find(".card-ad-click").html(creative.getClicks());
		$(creativeHtml).find(".card-ad-rev").html(creative.getPublisherRevenue().toFixed(6));
		$(creativeHtml).find(".card-ad-adomain").html(creative.getAdomain());
		$(creativeHtml).find(".card-ad-creative-id").html(creative.getCreativeId());
		$(creativeHtml).find(".card-ad-bidder-id").html(creative.getBidderId());

		if (creative.getBlocked() === undefined) {
			$(creativeHtml).find(".extra.content").addClass("noinfo-crt"); // no info
		} else if (creative.getBlocked() === true) {
			$(creativeHtml).find(".extra.content").addClass("blocked-crt"); // blocked
		} else if (creative.getBlocked() === false) {
			$(creativeHtml).find(".extra.content").addClass("allowed-crt"); // allowed
		}

		switch (creative.getType()) {
			case "banner":
				$(creativeHtml).find(".card-ad-size").html("BANNER");
				break;
			case "vast":
				$(creativeHtml).find(".card-ad-size").html("VAST XML");
				break;
			case "vast_tag":
				$(creativeHtml).find(".card-ad-size").html("VAST TAG");
				break;
			case "native":
				$(creativeHtml).find(".card-ad-size").html("NATIVE");
				break;
			case "html":
				$(creativeHtml).find(".card-ad-size").html(`${creative.getWidth()}x${creative.getHeight()}`);
				break;
		}
		return creativeHtml;
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
