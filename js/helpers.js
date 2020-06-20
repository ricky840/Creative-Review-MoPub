function decodeHtml(html) {
	var txt = document.createElement("textarea");
	txt.innerHTML = html;
	return txt.value;
}

function removeCDATA(string) {
	let result = string.replace("<!\[CDATA\[", "").replace("\]\]>", "");
	if (_.isEmpty(result)) {
		return false;
	} else {
		return result;
	}
}
