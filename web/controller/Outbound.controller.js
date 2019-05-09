sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
	"de/htwberlin/adbkt/basic1/Cred"
], function (BaseController, Cred) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Outbound", {
		onInit: function () {

		},

		//convert adress in lat and lng
		onFindButtonPress: function (oEvent) {
			sap.m.MessageToast.show('Die Umkreissuche wird durchgeführt.. ');

			var fueltype = this.getView().byId('fueltype').getSelectedKey();
			var address = this.getView().byId('address').getValue();
			var distance = this.getView().byId('distance').getValue();

			self = this;

			//Geocoding
			$.ajax({
				url: 'https://geocoder.api.here.com/6.2/geocode.json',
				type: 'GET',
				dataType: 'jsonp',
				jsonp: 'jsoncallback',
				data: {
					searchtext: address,
					app_id: Cred.getHereAppId(),
					app_code: Cred.getHereAppCode(),
					gen: '9'
				},
				success: function (data) {
					var lat = data.Response.View["0"].Result["0"].Location.DisplayPosition.Latitude;
					var lng = data.Response.View["0"].Result["0"].Location.DisplayPosition.Longitude;

					//self.requestTankerkoenigData(lat, lng, distance, fueltype)
					self.requestStationsHdb(lat, lng, distance)
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		},

		//get all stations in radius from lat/lng
		requestTankerkoenigData: function (lat, lng, distance, fueltype) {
			sap.m.MessageToast.show(lat + '\n' + lng + '\n' + fueltype);
			self = this;
			$.ajax({
				url: "https://creativecommons.tankerkoenig.de/json/list.php",
				data: {
					lat: lat,
					lng: lng,
					rad: distance,
					sort: "dist",
					type: fueltype,
					apikey: Cred.getTankerkoenigApiKey()
				},
				success: function (data) {
					var log = self.getView().byId('log');
					log.setValue(JSON.stringify(data, null, 2));
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}

			});
		},

        /**
        Aufgabe 2.1
        */
        onImportTestDataButtonPress: function () {
			sap.m.MessageToast.show('Import der Testdaten wird durchgeführt ');

            $.ajax({
                url: `http://localhost:3000/importTestData`,
                type: 'GET',
                success: function (data) {
                    sap.m.MessageToast.show('Import der Testdaten erfolgreich');
					var log = self.getView().byId('log');
					log.setValue(JSON.stringify(data, null, 2));

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
                }
            });
        },

        /**
        Aufgabe 2.2
        */
        onImportStationsButtonPress: function () {
            sap.m.MessageToast.show('Import der Stations wird durchgeführt ');

            $.ajax({
                url: `http://localhost:3000/importStations`,
                type: 'GET',
                success: function () {
                    sap.m.MessageToast.show('Import erfolgreich');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
                }
            });
        },

        /**
        Aufgabe 2.3
        */
		requestStationsHdb : function (lat, lng, distance) {
            sap.m.MessageToast.show('Suche wird gestartet ');

            $.ajax({
                url: `http://localhost:3000/stations?lat=${lat}&lng=${lng}&distance=${distance}`,
                type: 'GET',

                success: function (data) {
                    var log = self.getView().byId('log');
                    log.setValue(JSON.stringify(data, null, 2));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
                }
            });
        },


	});
});