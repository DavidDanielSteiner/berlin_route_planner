sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
    "de/htwberlin/adbkt/basic1/Cred"
], function (BaseController, Cred) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Geo", {

		onInit: function () {},

		oMap:{},

		moveMapToBerlin: function (map) {
			map.setCenter({
				lat: 52.5159,
				lng: 13.3777
			});
			map.setZoom(14);
		},
		moveMapToLatLng: function (map,lat,lng) {
			sap.m.MessageToast.show('begin');
			var coords = {
				lat: lat,
				lng: lng
			};
			var marker = new H.map.Marker(coords);
			map.addObject(marker);
			map.setCenter(coords);
		},

		onAfterRendering: function () {
		
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
		var oMap = this.getView().byId("map");
		let map = new H.Map(
		document.getElementById("__component0---geo--map"), 
			defaultLayers.normal.map, 
			{
				zoom: 14,
				center: {lat:52.5159,lng:13.3777},
				pixelRatio: pixelRatio
				
			}
		);
		this.oMap=map;
		const mapEvents = new H.mapevents.MapEvents(map);
		const behavior =new H.mapevents.Behavior (mapEvents);
		var ui = H.ui.UI.createDefault(map, defaultLayers);

		const defaultMarker = new H.map.Marker({lat:52.5159,lng:13.3777});
		map.addObject(defaultMarker);
		//this.moveMapToLatLng(map,'52.5200','13.4050');
		},
		
		/** addLocationsToMap: function (map,locations){
			var group = new  H.map.Group(),
			  position,
			  i;
		  
			// Add a marker for each location found
			for (i = 0;  i < locations.length; i += 1) {
			  position = {
				lat: locations[i]['LAT'],
				lng: locations[i]['LNG']
			  };
			  sap.m.MessageToast.show(position);
			  marker = new H.map.Marker(position);
			  marker.label = locations[i].location.address.label;
			  group.addObject(marker);
			}
		  
			group.addEventListener('tap', function (evt) {
			map.setCenter(evt.target.getGeometry());
			  openBubble(
				 evt.target.getGeometry(), evt.target.label);
			}, false);
			  // Add the locations group to the map
			map.addObject(group);
			map.getViewModel().setLookAtData({
				bounds: group.getBoundingBox()
			});
},*/

		/** onAfterRendering: function () {

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

		},*/

		onFindButtonPress: function (oEvent) {
			sap.m.MessageToast.show('Es wird nach bestmöglicher Verbindung gesucht.. ');
			var sInput = this.getView().byId('request_path_berlin').getValue();
			var oJSONFromLatLng={};
			var oJSONToLatLng={};
			var sAdressFrom='';
			var sAdressTo='';
			self = this;
			var map1 =this.oMap;

			//self.moveMapToBerlin(map);

			self.performTextAnalysisHDB(sInput,function(callback){
				sap.m.MessageToast.show('drin');
				//self.moveMapToLatLng(map1,'52.5200','13.4050');
				sAdressFrom=callback['FROM'];
				sAdressTo=callback['TO'];
				//sap.m.MessageToast.show('drin'+sAdressFrom+sAdressTo);
				
				self.getLanLng(sAdressFrom,function(oJSONLatLng){
					oJSONFromLatLng=oJSONLatLng;
					self.moveMapToLatLng(map1,oJSONLatLng['LAT'],oJSONLatLng['LNG']);
					//this.map.moveMapToLatLng('52.5200','13.4050');
					
					//sap.m.MessageToast.show("From: "+JSON.stringify(oJSONFromLatLng));
				}),
				self.getLanLng(sAdressTo,function(oJSONLatLng){
					oJSONToLatLng=oJSONLatLng;
					self.moveMapToLatLng(map1,oJSONLatLng['LAT'],oJSONLatLng['LNG']);
					//sap.m.MessageToast.show("To: "+JSON.stringify(oJSONToLatLng));

				});

			})

		},

		getLanLng:function(sAdress,oJSONLatLng){
			var oJSON={};
			$.ajax({
				     url: 'https://geocoder.api.here.com/6.2/geocode.json',
				     type: 'GET',
				     dataType: 'jsonp',
				     jsonp: 'jsoncallback',
				     data: {
				             searchtext: sAdress,
				             app_id: Cred.getHereAppId(),
				             app_code: Cred.getHereAppCode(),
				             city: 'Berlin',
				             gen: '9'
				            },
				     success: function (data) {
				            oJSON['LAT'] = data.Response.View["0"].Result["0"].Location.DisplayPosition.Latitude;
				            oJSON['LNG'] = data.Response.View["0"].Result["0"].Location.DisplayPosition.Longitude;
							oJSONLatLng(oJSON);
				            },
				     error: function (jqXHR, textStatus, errorThrown) {
				              sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				               }
				                    });
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
					/** var from = self.getView().byId('from');
					var to = self.getView().byId('to');
					from.setValue(data['FROM']); 
					to.setValue(data['TO']);*/					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		}
	});
});
