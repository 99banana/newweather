function xmlToJson(xml) {
	
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};
xmlHttp = undefined;

function getLocationData(name, elem) {
    queryUrl = "https://nominatim.openstreetmap.org/search?format=json&q=" + name + " /"
    console.log(queryUrl)
    if (xmlHttp) { xmlHttp.abort(); }
    xmlHttp = undefined;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            let data = xmlHttp.responseText
            elem.innerHTML = "";
            index = 0;
            parsed = JSON.parse(data)
            for (l in parsed) {
                entry = parsed[l]
                console.log(entry)
                if (entry.display_name.includes("United States")) {
                    if (index > 4) { break; }
                    console.log(entry)
                    hLink = '/forecast/' +  entry.lat + '/' + entry.lon + "/" + darkThemeVar
                    elem.innerHTML += `
                        <a class="search-result" href="${hLink}">${entry.display_name}</a>
                    `
                    index += 1
                }
            }
            if (elem.innerHTML == "") {
                elem.innerHTML += `
                    <a class="search-result greyed">No results in the United States<br>Check your spelling.</a>
                `
            }
            
        }
    }
    xmlHttp.onerror = () => {
        elem.innerHTML = `
            <a class="search-result" href="/">Error getting results.</a>
        `;
    }
    xmlHttp.open("GET", queryUrl, true); // true for asynchronous 
    xmlHttp.send(null);



    /*
    let xhr = new XMLHttpRequest();
    xhr.open("GET", )

    xhr.onload = () => {
        let data = xhr.response
        console.log(data)
    }
    xhr.onerror = () => {
        elem.innerHTML = `
            <a class="search-result" href="/">Error getting results.</a>
        `;
    }*/
}

