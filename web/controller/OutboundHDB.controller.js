sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
	"de/htwberlin/adbkt/basic1/Cred"
], function (BaseController, Cred) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Outbound", {
		onInit: function () {

		},

		onFindButtonPress_Re: function (oEvent) {
			sap.m.MessageToast.show('Die Umkreissuche wird durchgeführt.. ');

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

					self.requestTankDataFromHDB(lat, lng, distance)
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		},

		requestTankDataFromHDB: function (lat, lng, distance) {
			sap.m.MessageToast.show(lat + '\n' + lng + '\n' + distance + " km");
			self = this;
			$.ajax({
				url: 'http://localhost:3000/outbound',
				type: 'GET',
				data: {
					distance: distance,
					lng: lng,
					lat: lat,      
				},
				success: function (data) {
					var log = self.getView().byId('log');
					log.setValue(JSON.stringify(data, null, 2));
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
				}
			});
		}
	});
});