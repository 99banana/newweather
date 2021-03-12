/*jshint esnext:true*/
'use strict';
const http = require('http');
const https = require('https');
const Static = require('node-static');
const fs = require('fs');
const Request = require('request');
const Mustache = require('mustache');

const PORT   = process.env.PORT || 80;
const IPADDR = process.env.IPADDR || "127.0.0.1";

let options = {
	"method": "GET",
	"url": "https://api.weather.gov/points/38.466630,-78.880290",
	"headers": {
		"User-Agent": "node.js v14.4.0 (contact: gjkreider69@gmail.com)",
		"Accept": "application/geo+json"
	}
};
function send(response, values) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('./index.html', 'utf8', function(err, data) {
		if (err) { throw err; }
		response.end(Mustache.render(data, values));
	});
}
let weather = {};
let progress = {};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// wrap a request in an promise
function downloadPage(url) {
    return new Promise((resolve, reject) => {
        Request(url, (error, response, body) => {
            if (error) reject(error);
            /*if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }*/
            resolve(body);
        });
    });
}

function toCardinal(i) {
	if(i >= 348.75 || i < 11.25){
		return +i + ". -=- N";
	} else if (i >= 11.25 && i < 33.75) {
		return +i + ". -=- NNE";
	} else if (i >= 33.75 && i < 56.25) {
		return +i + ". -=- NE";
	} else if (i >= 56.25 && i < 78.75) {
		return +i + ". -=- ENE";
	} else if (i >= 78.25 && i < 101.25) {
		return +i + ". -=- E";
	} else if (i >= 101.25 && i < 123.75) {
		return +i + ". -=- ESE";
	} else if (i >= 123.75 && i < 146.25) {
		return +i + ". -=- SE";
	} else if (i >= 146.25 && i < 168.75) {
		return +i + ". -=- SSE";
	} else if (i >= 168.75 && i < 191.25) {
		return +i + ". -=- S";
	} else if (i >= 191.25 && i < 213.75) {
		return +i + ". -=- SSW";
	} else if (i >= 213.75 && i < 236.25) {
		return +i + ". -=- SW";
	} else if (i >= 236.25 && i < 258.75) {
		return +i + ". -=- WSW";
	} else if (i >= 258.75 && i < 281.25) {
		return +i + ". -=- W";
	} else if (i >= 281.25 && i < 303.75) {
		return +i + ". -=- WNW";
	} else if (i >= 303.75 && i < 326.25) {
		return +i + ". -=- NW";
	} else if (i >= 326.25 && i < 348.75) {
		return +i + ". -=- NNW";
	}
}

async function getWeather(latitude, longitude) {
	
	// progress 0%
	progress[latitude+","+longitude] = {
		num: 0,
		txt: "Starting to get weather ...",
	};
	
	let precipitation = "";
	let precipitationTotal = "";
	let temperature = "";
	let dailyTable = "";
	let windSpeed = "";
	let snowFall = "";
	let thunder = "";
	let allWeather = "";
	let cloud = "";
	let humidity = "";
	let pressure = "";
	let options = {
		"method": "GET",
		"url": `https://api.weather.gov/points/${latitude},${longitude}`,
		"headers": {
			"User-Agent": "node.js v14.4.0 (contact: gjkreider69@gmail.com)",
			"Accept": "application/geo+json"
		}
	};
	weather[latitude+","+longitude] = {
		inProgress: true,
		timer: Date.now() + 5000
	};
	
	let r = new Request(options, (err, res) => {
		// progress 0%
		progress[latitude+","+longitude] = {
			num: 1,
			txt: "Getting forecast station and grid ID ...",
		};
		if(err) { throw err; }
		if(!isJsonString(res.body)) {
			//console.log(res.body);
			weather[latitude+","+longitude] = {
				failed: true,
				message: res.body,
				timer: Date.now() + 5000
			}
			return;
		}
		let body = JSON.parse(res.body);
		if(body === undefined || body.properties === undefined) {
			weather[latitude+","+longitude] = {
				failed: true,
				timer: Date.now() + 5000
			};
			return;
		}
		//console.log(body.properties);
		console.log(body.properties);
		options = {
			"method": "GET",
			"url": body.properties.forecastGridData,
			"headers": { "User-Agent": "node.js v14.4.0 (website: newweather.openode.io contact: gjkreider69@gmail.com)", "Accept": "application/json,application/geo+json" }
		};
		let r2 = new Request(options, (err, res2) => {
			// progress 0%
			progress[latitude+","+longitude] = {
				num: 2,
				txt: "Getting forecast for gridpoint ...",
			};
			if(err) { throw err; }
			if(!isJsonString(res2.body)) {
				//console.log(res2.body);
				weather[latitude+","+longitude] = {
					failed: true,
					message: res2.body,
					timer: Date.now() + 5000
				}
				return;
			}
			let properties = JSON.parse(res2.body).properties;
			if(properties === undefined) {
				weather[latitude+","+longitude] = {
					failed: true,
					message: "Properties missing",
					timer: Date.now() + 5000
				}
				return;
			}
			for (let prop in properties) {
				let match = /.+/
				if(prop.match(match)) {
					//console.log(prop.match(match));
				}
			}
			// progress 0%
			progress[latitude+","+longitude] = {
				num: 3,
				txt: "Parsing weather data ...",
			};
			for(let xyz in properties.probabilityOfPrecipitation.values) {
				if(properties.probabilityOfPrecipitation.values[xyz]) {
					let precip = properties.probabilityOfPrecipitation.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					precipitation+=`{ x: new Date(${date.getTime()}), y:${value} },\n`;

				}
			}
			for(let xyz in properties.snowfallAmount.values) {
				if(properties.snowfallAmount.values[xyz]) {
					let precip = properties.snowfallAmount.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					snowFall+=`{ x: new Date(${date.getTime()}), y:${value} },\n`;

				}
			}
			for(let xyz in properties.quantitativePrecipitation.values) {
				if(properties.quantitativePrecipitation.values[xyz]) {
					let precip = properties.quantitativePrecipitation.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value*0.0393700787 * 1000)/1000;
					precipitationTotal+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			for(let xyz in properties.temperature.values) {
				if(properties.temperature.values[xyz]) {
					let precip = properties.temperature.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					if(properties.temperature.uom === 'wmoUnit:degC') {
						value = value*1.8+32;
					}
					temperature+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			for(let xyz in properties.windSpeed.values) {
				if(properties.windSpeed.values[xyz]) {
					let precip = properties.windSpeed.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					//if(properties.windSpeed.uom === 'wmoUnit:km_h-1') {
					//	value = (value+1) * 1.60934;
					//}
					windSpeed+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			for(let xyz in properties.lightningActivityLevel.values) {
				if(properties.lightningActivityLevel.values[xyz]) {
					let precip = properties.lightningActivityLevel.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					thunder+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			for(let xyz in properties.skyCover.values) {
				if(properties.skyCover.values[xyz]) {
					let precip = properties.skyCover.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					cloud+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			for(let xyz in properties.relativeHumidity.values) {
				if(properties.relativeHumidity.values[xyz]) {
					let precip = properties.relativeHumidity.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					humidity+=`{ x: new Date(${date.getTime()}), y:${value} },`;
				}
			}
			// progress 0%
			progress[latitude+","+longitude] = {
				num: 4,
				txt: "Preparing tooltip...",
			};
			for(let xyz in properties.temperature.values) {
				if(properties.temperature.values[xyz]) {
					let temp = properties.temperature.values[xyz];
					let date = new Date(temp.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(temp.value * 10)/10;
					if(properties.temperature.uom === 'wmoUnit:degC') {
						value = value*1.8+32;
					}
					let precipDatesArray = [];
					for(let xyz = 0; xyz < properties.probabilityOfPrecipitation.values.length; xyz++) {
						if(properties.probabilityOfPrecipitation.values[xyz]) {
							let precip = properties.probabilityOfPrecipitation.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					let goal = date;
					var closest = precipDatesArray.reduce(function(prev, curr) {
						return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
					});
					let indexOf = precipDatesArray.indexOf(closest);
					let precip = properties.probabilityOfPrecipitation.values[indexOf];
					let precipValue = Math.floor(precip.value * 10)/10;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.quantitativePrecipitation.values.length; xyz++) {
						if(properties.quantitativePrecipitation.values[xyz]) {
							let precip = properties.quantitativePrecipitation.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					closest = precipDatesArray.reduce(function(prev, curr) {
						return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
					});
					indexOf = precipDatesArray.indexOf(closest);
					precip = properties.quantitativePrecipitation.values[indexOf];
					let precipAccumValue = Math.floor(precip.value*0.0393700787 * 100)/100;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.windSpeed.values.length; xyz++) {
						if(properties.windSpeed.values[xyz]) {
							let precip = properties.windSpeed.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					closest = precipDatesArray.reduce(function(prev, curr) {
						return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
					});
					indexOf = precipDatesArray.indexOf(closest);
					precip = properties.windSpeed.values[indexOf];
					let windSpeedValue = Math.floor(precip.value * 10)/10;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.lightningActivityLevel.values.length; xyz++) {
						if(properties.lightningActivityLevel.values[xyz]) {
							let precip = properties.lightningActivityLevel.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					if(closest[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
						precip = properties.lightningActivityLevel.values[indexOf];
					}else {
						precip = {
							value:0
						}
					}
					//console.log(properties.lightningActivityLevel.values[indexOf]);
					let thunderChanceValue = Math.floor(precip.value * 10)/10;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.snowfallAmount.values.length; xyz++) {
						if(properties.snowfallAmount.values[xyz]) {
							let precip = properties.snowfallAmount.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					if(closest[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
						precip = properties.snowfallAmount.values[indexOf];
					}else {
						precip = {
							value:0
						}
					}
					let snowFallValue = precip.value;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.windDirection.values.length; xyz++) {
						if(properties.windDirection.values[xyz]) {
							let precip = properties.windDirection.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					if(precipDatesArray[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
						precip = properties.windDirection.values[indexOf];
					}
					let windDirValue = toCardinal(properties.windDirection.values[indexOf].value).replace(/\d+. -=- /g, '');
					//console.log(windDirValue);
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.skyCover.values.length; xyz++) {
						if(properties.skyCover.values[xyz]) {
							let precip = properties.skyCover.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					if(precipDatesArray[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
					}
					let skyCoverValue = properties.skyCover.values[indexOf].value;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.relativeHumidity.values.length; xyz++) {
						if(properties.relativeHumidity.values[xyz]) {
							let precip = properties.relativeHumidity.values[xyz];
							let precipDate = new Date(precip.validTime.replace(/\/.+/g, ''));
							precipDatesArray.push(precipDate);
						}
					}
					goal = date;
					if(precipDatesArray[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
					}
					let humidValue = properties.relativeHumidity.values[indexOf].value;
					
					//console.log(humidValue);
					//console.log(indexOf+'-'+(Date.parse(goal)-Date.parse(precip.validTime.replace(/\/.+/g, '')))/1000/60);
					if(skyCoverValue == 80) console.log('---------------------------');
					allWeather+=`{ x: new Date(${date.getTime()}), temperature:${value}, precipChance:${precipValue}, date: new Date(${date.getTime()}), precipAccum:'${precipAccumValue}', windSpeed:${windSpeedValue}, thunderChance:'${thunderChanceValue}', snowfall:${snowFallValue}, windDirection:"${windDirValue}", cloudCover:${skyCoverValue}, humidity:${humidValue} },\n`
				}
			}
			
			options = {
				"method": "GET",
				"url": body.properties.forecast,
				"headers": { "User-Agent": "node.js v14.4.0 (contact: gjkreider69@gmail.com)", "Accept": "application/geo+json" }
			};
			let table = "";
			let today = "";
			
			progress[latitude+","+longitude] = {
				num: 5,
				txt: "Preparing table...",
			};
			
			let r2 = new Request(options, async function(err, res2) {
				if(err) { throw err; }
				//console.log(res2.body);
				if(!isJsonString(res2.body)) {
					//console.log(res2.body);
					weather[latitude+","+longitude] = {
						failed: true,
						message: res2.body,
						timer: Date.now() + 5000
					}
					today = `Error: API outage`;
					table = `<tr><td>Error</td><td>0</td><td>Error getting table data.</td></tr>`;
				}else {
					let properties = JSON.parse(res2.body).properties;
					if(properties === undefined) {
						weather[latitude+","+longitude] = {
							message: 'Weather Properties Missing.\n'+res2.body,
							timer: Date.now() + 5000
						}
						return;
					}
					for(let period in properties.periods) {
						period = properties.periods[period];
						table+=`<tr><td>${period.name}</td><td>${period.temperature}</td><td>${period.detailedForecast}</td></tr>`;
					}
					today = `${properties.periods[0].name}: ${properties.periods[0].shortForecast}`;
				}
				progress[latitude+","+longitude] = {
					num: 6,
					txt: "Getting sunrise/set data...",
				};
				
				let now = new Date(Date.now());
				now.setDate(now.getDate() - 1);
				let sunRiseSet = "";
				for(let xyzz = 0; xyzz < 8; xyzz++) {
					progress[latitude+","+longitude].num++;
					now.setDate(now.getDate() + 1);
					let times = await getSunriseTimes(latitude, longitude, now.toUTCString());
					//console.log(times);
					sunRiseSet += `{
			startValue: new Date(${Date.parse(times.results.sunrise)}),
			endValue: new Date(${Date.parse(times.results.sunset)}),
			color: stripColor
		},`;
				}
				weather[latitude+","+longitude] = {
					precipitation: precipitation,
					precipitationTotal: precipitationTotal,
					temperature: temperature,
					dailyTable: dailyTable,
					windSpeed: windSpeed,
					thunder: thunder,
					allWeather: allWeather,
					snowFall: snowFall,
					cloud: cloud,
		    		humidity: humidity,
					table: {
						today: today,
						table: table
					},
					sunTimes: sunRiseSet,
					timer: Date.now() + 1200000
				}
				console.log("Weather gotten!");
				progress[latitude+","+longitude] = {
					num: 7,
					txt: "Done!",
				};
				
			});
		});
	});
}
async function getSunriseTimes(latitude, longitude, date) {
	let url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`;
	let html;
	try {
        html = await downloadPage(url);
		html = JSON.parse(html);
    } catch (error) {
        console.error(error);
    }
	return html;
}

//getWeather(38.466630, -78.880290);
//getSunriseTimes(38.466630, -78.880290, 'Today');

var StaticServer = new(Static.Server)();
let server = http.createServer(function (request, response) {
	let theme = '';
	if(request.url.endsWith('/dark')) {
		theme = 'dark';
	}
	if(request.url.startsWith('/forecast/')) {
		let longitude = request.url.split('/')[3];
		let latitude = request.url.split('/')[2];
		let forecast = weather[latitude+","+longitude];
		let Wprogress = progress[latitude+","+longitude];
		if(forecast === undefined || forecast.timer < Date.now()) {
			getWeather(latitude, longitude);
			if(Wprogress) {
				send(response, {
					forecast: false,
					refresh: true,
					time: Wprogress.num,
					message: Wprogress.txt,
					theme:theme
				});
			}else {
				send(response, {
					forecast: false,
					refresh: true,
					theme:theme
				});
			}
		}else if(forecast.inProgress === true) {
			if(forecast.timer < Date.now()) {
				getWeather(latitude, longitude);
			}
			if(Wprogress) {
				send(response, {
					forecast: false,
					refresh: true,
					time: Wprogress.num,
					message: Wprogress.txt,
					theme:theme
				});
			}else {
				send(response, {
					forecast: false,
					refresh: true,
					theme:theme
				});
			}
		}else if(forecast.failed === true) {
			console.log(forecast.message);
			if(forecast.timer < Date.now()) {
				getWeather(latitude, longitude);
				send(response, {
					forecast: false,
					refresh: true,
					theme:theme
				});
			}else {
				send(response, {
					forecast: false,
					refresh: false,
					error: true,
					latitude: latitude,
					longitude: longitude,
					theme:theme
				});
			}
		}else {
			send(response, {
				forecast: true,
				refresh: false,
				precipitation: forecast.precipitation,
				precipitationTotal: forecast.precipitationTotal,
				temperature: forecast.temperature,
				dailyTable: forecast.dailyTable,
				windSpeed: forecast.windSpeed,
				thunder: forecast.thunder,
				allWeather: forecast.allWeather,
				snowFall: forecast.snowFall,
				cloud: forecast.cloud,
				humidity: forecast.humidity,
				daylightStrips: forecast.sunTimes,
				sevenDay: {
					table: forecast.table.table,
					today: forecast.table.today
				},
				theme:theme
			});
		}
	}else if(request.url.startsWith('/static/')) {
		request.url = request.url.replace('/static/', '/');
		StaticServer.serve(request, response);
	}else if(request.url.startsWith('/data')) {
		let values = {theme:theme, refresh:false, data:true};
		response.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('./index.html', 'utf8', function(err, data) {
			if (err) { throw err; }
			response.end(Mustache.render(data, values));
		});
	}else {
		let values = {theme:theme, refresh:false};
		response.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('./index.html', 'utf8', function(err, data) {
			if (err) { throw err; }
			response.end(Mustache.render(data, values));
		});
	}
}).listen(PORT);
console.log('Server running on port '+PORT+' and IP address '+IPADDR);