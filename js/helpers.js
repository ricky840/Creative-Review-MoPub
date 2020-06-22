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

function getCurrentDatetimeUTC(format) {
  obj_date = new Date();
  year = obj_date.getUTCFullYear();
  month = obj_date.getUTCMonth() + 1;
  date = obj_date.getUTCDate();
  hours = obj_date.getUTCHours();
  minutes = obj_date.getUTCMinutes();
  seconds = obj_date.getUTCSeconds();
	milseconds = obj_date.getMilliseconds();
  temp_arr = [year, month, date, hours, minutes, seconds, milseconds]
  for (i = 0; i < temp_arr.length; i++) {
    if (temp_arr[i] < 10) {
      temp_arr[i] = '0' + temp_arr[i];
    }
  }
  if(format == "ISO-8601") {
    return temp_arr[0] + '-' + temp_arr[1] + '-' + temp_arr[2] + 'T' 
			+ temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5] + '.' + temp_arr[6] + 'Z';
  } else {
    return temp_arr[0] + '/' + temp_arr[1] + '/' + temp_arr[2] + ' ' 
			+ temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5];
  }
}
