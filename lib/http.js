var http = (function(global) {
  'use strict';

  function getRequest(request) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: request.url,
        type: 'GET',
        headers: request.headers,
        success: function(response, status, xhr) {
          resolve({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        error: function(xhr, status, error) {
          reject({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        complete: function (xhr, status) {
          // console.log(status);
        }
      });
    });
  }

  function postRequest(request) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: request.url,
        type: 'POST',
        data: JSON.stringify(request.data),
        headers: request.headers,
        success: function(response, status, xhr) {
          resolve({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        error: function(xhr, status, error) {
          reject({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        complete: function (xhr, status) {
          // console.log(status);
        }
      });
    });
  }

	function postRequestBinary(request) {
		return new Promise(function(resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.open("POST", request.url, true);
			xhr.responseType = "arraybuffer";

			if ("headers" in request) {
				let headers = request.headers;
				for (const header in headers) {
					xhr.setRequestHeader(header, headers[header]);
				}	
			}

			// Loaded
			xhr.onload = function(event) {
				if (xhr.status == 200) {
					let arrayBuffer = xhr.response;
					let byteArray = new Uint8Array(arrayBuffer);
					let blob = new Blob([arrayBuffer], {type: "image/jpeg"});
					let reader = new FileReader();
					reader.onloadend = function() {
						let base64data = reader.result;
						resolve({
							statusCode: xhr.status,
							response: base64data,
							responseHeaders: xhr.getAllResponseHeaders().trim()
						});
					}
					reader.readAsDataURL(blob); 
				} else {
          reject({
            statusCode: xhr.status,
            response: xhr.response,
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
				}
			};

			// Error
			xhr.onerror = function(event) {
				reject({
					statusCode: xhr.status,
					response: xhr.response,
					responseHeaders: xhr.getAllResponseHeaders().trim()
				});
			};

			// send request
			xhr.send(request.data);
		});
	}

  return {
    getRequest: getRequest,
    postRequest: postRequest,
		postRequestBinary: postRequestBinary
  }
})(this);
