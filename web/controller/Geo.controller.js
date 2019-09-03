sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
    "de/htwberlin/adbkt/basic1/Cred"
], function (BaseController, Cred) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Geo", {
		onInit: function () {},

		moveMapToBerlin: function (map) {
			map.setCenter({
				lat: 52.5159,
				lng: 13.3777
			});
			map.setZoom(14);
		},
//test
		onAfterRendering: function () {
			//Step 1: initialize communication with the platform
			var platform = new H.service.Platform({
				app_id: Cred.getHereAppId(),
				app_code: Cred.getHereAppCode(),
				useHTTPS: true
			});
			var pixelRatio = window.devicePixelRatio || 1;
			var defaultLayers = platform.createDefaultLayers({
				tileSize: pixelRatio === 1 ? 256 : 512,
				ppi: pixelRatio === 1 ? undefined : 320
			});

			//Step 2: initialize a map  - not specificing a location will give a whole world view.
			var map = new H.Map(document.getElementById("__component0---geo--map"), defaultLayers.normal.map, {
				pixelRatio: pixelRatio
			});

			//Step 3: make the map interactive
			// MapEvents enables the event system
			// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
			var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

			// Create the default UI components
			var ui = H.ui.UI.createDefault(map, defaultLayers);

			// Now use the map as required...
			this.moveMapToBerlin(map);
			var coords = {
				lat: 52.5159,
				lng: 13.3777
			};
			var marker = new H.map.Marker(coords);
			map.addObject(marker);

		},

		performGeocoding: function (sAddress) {
			var log= self.getView().byId('log');
				
			$.ajax({
				url: 'https://geocoder.api.here.com/6.2/geocode.json',
				type: 'GET',
				dataType: 'jsonp',
				jsonp: 'jsoncallback',
				data: {
					searchtext: sAddress,
					app_id: Cred.getHereAppId(),
					app_code: Cred.getHereAppCode(),
					gen: '9'
				},
				success: function (data) {
					var lat = data.Response.View["0"].Result["0"].Location.DisplayPosition.Latitude;
					var lng = data.Response.View["0"].Result["0"].Location.DisplayPosition.Longitude;
					//self.requestTankDataFromHDB(lat, lng, distance)
					log.setValue('Address: '+ sAddress +' - '+lat+' : '+lng);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		},

		onFindButtonPress: function (oEvent) {
			sap.m.MessageToast.show('Es wird nach bestmöglicher Verbindung gesucht.. ');
			self = this;
			self.performTextAnalysisHDB(this.getView().byId('request_path_berlin').getValue());	
			/** var log = this.getView().byId('log').getValue();
			console.log(log);*/
			//self.performGeocoding (this.getView().byId('from').getValue());
			self.performGeocoding ('Treskowallee 8');

			
		},

		performTextAnalysisHDB: function (input_text) {
			self = this;
			$.ajax({
				url: 'http://localhost:3000/performTextAnalysis',
				type: 'GET',
				data: {
					input_text: input_text,    
				},
				success: function (data) {
					var from = self.getView().byId('from');
					var to = self.getView().byId('to');
					//var log= self.getView().byId('log');
					//log.setValue(JSON.stringify(data));
					from.setValue(data['FROM']); 
					to.setValue(data['TO']);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		}
	});
});
