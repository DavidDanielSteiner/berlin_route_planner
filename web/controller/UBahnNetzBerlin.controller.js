sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
	"de/htwberlin/adbkt/basic1/Cred"
], function (BaseController, Cred) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.UBahnNetzBerlin", {

		onInit: function () {

		},

		onAfterRendering: function () {
			var that = this;
			const platform = new H.service.Platform({
				app_id: Cred.getHereAppId(),
				app_code: Cred.getHereAppCode(),
				useHTTPS: true
			});
			const defaultLayers = platform.createDefaultLayers({
				tileSize: pixelRatio === 1 ? 256 : 512,
				ppi: pixelRatio === 1 ? undefined : 320
			});
			var pixelRatio = window.devicePixelRatio || 1;
			let map = new H.Map(
				document.getElementById("__component0---unetz--map"),
				defaultLayers.normal.map, {
					zoom: 14,
					center: {
						lat: 52.5159,
						lng: 13.3777
					},
					pixelRatio: pixelRatio

				}
			);
			this.oMap = map;
			const mapEvents = new H.mapevents.MapEvents(map);
			const behavior = new H.mapevents.Behavior(mapEvents);
			var ui = H.ui.UI.createDefault(map, defaultLayers);

			const defaultMarker = new H.map.Marker({
				lat: 52.5159,
				lng: 13.3777
			});
			map.addObject(defaultMarker);
			//this.moveMapToLatLng(map,'52.5200','13.4050');
		},

		oMap: {},

		moveMapToBerlin: function (map) {
			map.setCenter({
				lat: 52.5159,
				lng: 13.3777
			});
			map.setZoom(14);
		},
		moveMapToLatLng: function (map, lat, lng) {
			//sap.m.MessageToast.show('begin');
			var coords = {
				lat: lat,

				lng: lng
			};
			var marker = new H.map.Marker(coords);
			map.addObject(marker);
			map.setCenter(coords);
		},

		performTextAnalysisHDB: function (input_text, callback) {
			$.ajax({
				url: 'http://localhost:3000/performTextAnalysis',
				type: 'GET',
				data: {
					input_text: input_text,
				},
				success: function (data) {
					callback(data);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		},

		getLanLng: async function (sAdress) {
		
			return new Promise(function(resolve, reject) {
				var oJSON = {};
				$.ajax({
					url: 'https://geocoder.api.here.com/6.2/geocode.json',
					type: 'GET',
					dataType: 'jsonp',
					jsonp: 'jsoncallback',
					data: {
						searchtext: sAdress + " Berlin",
						app_id: Cred.getHereAppId(),
						app_code: Cred.getHereAppCode(),
						city: 'Berlin',
						gen: '9'
					},
					success: function (data) {
						oJSON['LAT'] = data.Response.View["0"].Result["0"].Location.DisplayPosition.Latitude;
						oJSON['LNG'] = data.Response.View["0"].Result["0"].Location.DisplayPosition.Longitude;
						resolve(oJSON);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
					}
			})
				
			});
		},
		
		getStartAndEnd: async function (sAdressFrom,sAddressTo) {
			var oStart = await this.getLanLng(sAdressFrom);
			//sap.m.MessageToast.show("Inside: getStartAndEnd- start finished")
			var oEnd = await this.getLanLng(sAddressTo);
			this.moveMapToLatLng(this.oMap,oStart.LAT,oStart.LNG);
			this.moveMapToLatLng(this.oMap,oEnd.LAT,oEnd.LNG);
			//sap.m.MessageToast.show("Inside: getStartAndEnd- end finished")
			this.requestStationsDataFromHDB(oStart, oEnd);
		},
		

		onFindButtonPress: function (oEvent) {
			this.getView().byId('log').setValue("");
			sap.m.MessageToast.show('Es wird nach bestmöglicher Verbindung gesucht.. ');
			var sInput = this.getView().byId('request_path_berlin').getValue();
			var sAdressFrom = null;
			var sAdressTo = null;
			self = this;

			self.performTextAnalysisHDB(sInput, function (callback) {
				sAdressFrom = callback['FROM'];
				sAdressTo = callback['TO'];
				if (sAdressFrom == null || sAdressTo == null){
					sap.m.MessageToast.show('Adresse existiert nicht oder wurde falsch eingetragen..');
					return process.exit();
				} else {
					self.getStartAndEnd(sAdressFrom,sAdressTo);
				}
			})
		},


		oCoordinates: {
			startCoord: null,
			endCoord: null,
			oStart: {},
			oEnd: {}
		},

		/**
		 * 
		 * ===============================================
		 * 
		 * 
		 * 
		 * ===============================================
		 */


		requestStationsDataFromHDB: function (start, end) {
			//	sap.m.MessageToast.show(lat + '\n' + lng + '\n' + " wird gesucht im Umkreis von 2 km");
			var that = this;
			$.ajax({
				url: 'http://localhost:3000/unetz',
				type: 'GET',
				data: {
					distance: 2,
					lat: start.LAT,
					lng: start.LNG
				},
				success: function (data) {
					that.oCoordinates.oStart = data;
					that.oCoordinates.oEnd = data;
					console.log("requestStationsDataFromHDB", data);
					$.ajax({
						url: 'http://localhost:3000/unetz',
						type: 'GET',
						data: {
							distance: 2,
							lat: end.LAT,
							lng: end.LNG
						},
						success: function (data2) {		
							that.oCoordinates.oEnd = data2;
							console.log("requestStationsDataFromHDB", data2);
							console.log("oCoordinates", that.oCoordinates);
							that.requestShortestPathFromHDB(data[0].STATION_NAME, data2[0].STATION_NAME);
						},
						error: function (jqXHR, textStatus, errorThrown) {
							sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
							return;
						}
					});
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
					return;
				}
			});
		},

		/*	requestStationsDataFromHDB: function (lat, lng, tmp) {
			//	sap.m.MessageToast.show(lat + '\n' + lng + '\n' + " wird gesucht im Umkreis von 2 km");
				var that = this;
				var oData;
				$.ajax({
					url: 'http://localhost:3000/unetz',
					type: 'GET',
					data: {
						distance: 2,
						lng: lng,
						lat: lat,
					},
					success: function (data) {
						//	var log = self.getView().byId('log');
						//	log.setValue(JSON.stringify(data, null, 2));
						if(tmp === "from"){
							that.oCoordinates.oStart = data;
						} else if(tmp === "to"){
							that.oCoordinates.oEnd = data;
						}
					
						oData = data;
						console.log("requestStationsDataFromHDB" + tmp, oData);
					//	return oData;
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
						return;
					}
				});
				return oData;
			},*/


		requestShortestPathFromHDB: function (start, end) {
			self = this;
			$.ajax({
				url: 'http://localhost:3000/short_path',
				type: 'GET',
				data: {
					start: start, //'Deutsche Oper',
					end: end //'Jakob-Kaiser-Platz',
				},
				success: function (data) {
					var log = self.getView().byId('log');
					var str = "Einsteigen \n";
					for (var i = 1; i < data.length; i++) {
						str = str + data[i - 1].SEGMENT + ":   " + data[i - 1].LINE_NAME + " - " + data[i - 1].START + " \n";
						if (data[i].LINE_NAME !== data[i - 1].LINE_NAME) {
							
							str = str + data[i].SEGMENT + ":   " + data[i - 1].LINE_NAME + " - " + data[i].START + " \n";
							str = str + "Umsteigen\n";
						}
						if (i === (data.length - 1)) {
							var endsegment = data.length + 1;
							str = str + data[i].SEGMENT + ":   " + data[i].LINE_NAME + " - " + data[i].START + " \n";
							str = str + endsegment + ":   " + data[i].LINE_NAME + " - " + data[i].END + " \n";
							str = str + "Ziel ist erreicht!\n"
						}
					}
					log.setValue(str);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
					return;
				}
			});

		}
	});
});