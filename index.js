/*jshint esnext:true*/
'use strict';
const http = require('http');
const https = require('https');
const fs = require('fs');
const Request = require('request');
const Mustache = require('mustache');

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
function getWeather(latitude, longitude) {
	let precipitation = "";
	let precipitationTotal = "";
	let temperature = "";
	let dailyTable = "";
	let windSpeed = "";
	let snowFall = "";
	let thunder = "";
	let allWeather = "";
	let cloud = "";
	let options = {
		"method": "GET",
		"url": `https://api.weather.gov/points/${latitude},${longitude}`,
		"headers": {
			"User-Agent": "node.js v14.4.0 (contact: gjkreider69@gmail.com)",
			"Accept": "application/geo+json"
		}
	};
	let r = new Request(options, (err, res) => {
		if(err) { throw err; }
		let body = JSON.parse(res.body);
		if(body === undefined || body.properties === undefined) {
			weather[latitude+","+longitude] = {
				failed: true,
				timer: Date.now() + 20000
			};
			return;
		}
		options = {
			"method": "GET",
			"url": body.properties.forecastGridData,
			"headers": { "User-Agent": "node.js v14.4.0 (contact: gjkreider69@gmail.com)", "Accept": "application/geo+json" }
		};
		let r2 = new Request(options, (err, res2) => {
			if(err) { throw err; }
			let properties = JSON.parse(res2.body).properties;
			for(let prop in properties) {
				console.log(prop);
			}
			if(properties === undefined) {
				weather[latitude+","+longitude] = {
					failed: true,
					timer: Date.now() + 20000
				}
				return;
			}
			//console.log(properties);
		/* +console.log(JSON.parse(res2.body).properties.probabilityOfPrecipitation);
		   +console.log(JSON.parse(res2.body).properties.probabilityOfThunder);
		    console.log(JSON.parse(res2.body).properties.hazards);
		    console.log(JSON.parse(res2.body).properties.quantitativePrecipitation);
		    console.log(JSON.parse(res2.body).properties.temperature);
		    console.log(JSON.parse(res2.body).properties.windSpeed);
		    console.log(JSON.parse(res2.body).properties.windDirection);
		    console.log(JSON.parse(res2.body).properties.windGust);
		    console.log(JSON.parse(res2.body).properties.iceAccumulation);
		    console.log(JSON.parse(res2.body).properties.snowfallAmount);
		    console.log(JSON.parse(res2.body).properties.snowLevel);
		    console.log(JSON.parse(res2.body).properties.visibility);
		    console.log(JSON.parse(res2.body).properties.pressure);
		*/
			for(let xyz in properties.probabilityOfPrecipitation.values) {
				if(properties.probabilityOfPrecipitation.values[xyz]) {
					let precip = properties.probabilityOfPrecipitation.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					precipitation+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },\n`;

				}
			}
			for(let xyz in properties.snowfallAmount.values) {
				if(properties.snowfallAmount.values[xyz]) {
					let precip = properties.snowfallAmount.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					snowFall+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },\n`;

				}
			}
			for(let xyz in properties.quantitativePrecipitation.values) {
				if(properties.quantitativePrecipitation.values[xyz]) {
					let precip = properties.quantitativePrecipitation.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					precipitationTotal+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },`;
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
					temperature+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },`;
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
					windSpeed+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },`;
				}
			}
			for(let xyz in properties.lightningActivityLevel.values) {
				if(properties.lightningActivityLevel.values[xyz]) {
					let precip = properties.lightningActivityLevel.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					thunder+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },`;
				}
			}
			for(let xyz in properties.skyCover.values) {
				if(properties.skyCover.values[xyz]) {
					let precip = properties.skyCover.values[xyz];
					let date = new Date(precip.validTime.replace(/\/.+/g, ''));
					let value = Math.floor(precip.value * 10)/10;
					cloud+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:${value} },`;
				}
			}
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
					let precipAccumValue = Math.floor(precip.value * 10)/10;
					
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
					if(closest[0] !== undefined) {
						closest = precipDatesArray.reduce(function(prev, curr) {
							return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
						});
						indexOf = precipDatesArray.indexOf(closest);
						precip = properties.windDirection.values[indexOf];
					}
					let windDirValue = properties.windDirection.values[indexOf].value;
					
					precipDatesArray = [];
					for(let xyz = 0; xyz < properties.skyCover.values.length; xyz++) {
						if(properties.skyCover.values[xyz]) {
							let precip = properties.skyCover.values[xyz];
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
						precip = properties.skyCover.values[indexOf];
					}
					let skyCoverValue = properties.skyCover.values[indexOf].value;
					allWeather+=`{ x: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), y:0, temperature:${value}, precipChance:${precipValue}, date: new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()}, ${date.getHours()}), precipAccum:'${precipAccumValue}', windSpeed:${windSpeedValue}, thunderChance:'${thunderChanceValue}', snowfall:${snowFallValue}, windDirection:${windDirValue}, cloudCover:${skyCoverValue} },\n`
				}
			}
			
			//console.log(precipitationTotal);
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
				timer: Date.now() + 1200000
			}
			console.log("Weather gotten!");
		});
	});
}
getWeather(38.466630, -78.880290);

let server = http.createServer(function (request, response) {
	if(request.url.startsWith('/forecast/')) {
		let longitude = request.url.split('/')[3];
		let latitude = request.url.split('/')[2];
		let forecast = weather[latitude+","+longitude];
		if(forecast === undefined || forecast.timer < Date.now()) {
			getWeather(latitude, longitude);
			send(response, {
				forecast: false,
				refresh: true
			});
		}else if(forecast.failed === true) {
			if(forecast.timer < Date.now()) {
				getWeather(latitude, longitude);
				send(response, {
					forecast: false,
					refresh: true
				});
			}else {
				send(response, {
					forecast: false,
					refresh: false,
					error: true,
					latitude: latitude,
					longitude: longitude
				});
			}
		}else {
			send(response, {
				forecast: true,
				precipitation: forecast.precipitation,
				precipitationTotal: forecast.precipitationTotal,
				temperature: forecast.temperature,
				dailyTable: forecast.dailyTable,
				windSpeed: forecast.windSpeed,
				thunder: forecast.thunder,
				allWeather: forecast.allWeather,
				snowFall: forecast.snowFall,
				cloud: forecast.cloud
			});
		}
	}else if(request.url.startsWith('/image/png/')) {
		response.writeHead(200, {'Content-Type': 'image'});
		fs.readFile('.'+request.url.replace('/image/png', '/'), 'utf8', function(err, data) {
			if (!err) {
				response.end(data);
			}else {
				console.log(err);
			}
		});
	}else {
		let values = {};
		response.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('./index.html', 'utf8', function(err, data) {
			if (err) { throw err; }
			response.end(Mustache.render(data, values));
		});
	}
}).listen(8080, "127.0.0.1");
console.log('Server running!');