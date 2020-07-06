var htmlFactory = (function(global) {
	"use strict";

	function getCardHtml(cardAssets) {
		const cardHtml = `
		<div class="ui link card ad-card">
			<div class="content image">
				<span class="ad-image">
					<img src="${cardAssets.imgSrc}">
				</span>
			</div>
			<div class="content text">
				<h4 class="ui sub header"><span class="card-ad-adomain">${cardAssets.adomain}</span></h4>
				<div class="description">
					<div class="card-ad-bidder-name">${cardAssets.bidderName}</div>
					<div class="card-ad-bidder-id">${cardAssets.bidderId}</div>
					<div class="card-ad-creative-id">${cardAssets.creativeId}</div>
				</div>
			</div>
			<div class="content stats">
				<div class="ui grid">
					<div class="row">
						<div class="five wide column stat-imp" style="padding: 0px;"><i class="eye icon"></i><span class="card-ad-imp">${cardAssets.impression}</span></div>
						<div class="four wide column" style="padding: 0px;"><i class="mouse pointer icon"></i><span class="card-ad-click">${cardAssets.click}</span></div>
						<div class="six wide column" style="padding: 0px;"><i class="icon dollar sign"></i><span class="card-ad-rev">${cardAssets.revenue}</span></div>
					</div>
				</div>
			</div>
			<div class="extra content ${cardAssets.blockStatusClass}">
				<span class="card-ad-size">${cardAssets.type}</span>
				<span class="card-ad-download right floated">Download</span>
			</div>
		</div>`;

		return $.trim(cardHtml);
	}

  return {
		getCardHtml: getCardHtml
  }
})(this);
