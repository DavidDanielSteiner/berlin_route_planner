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
	});

});
