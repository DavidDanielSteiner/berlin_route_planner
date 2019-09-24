sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
	"de/htwberlin/adbkt/basic1/Cred", "sap/ui/model/json/JSONModel"
], function (BaseController, Cred, JSONModel) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.UBahnNetzBerlinPro", {
		onInit: function () {
		
		},
/**
 * ===========================================================================
 *  Global Objects
 * ===========================================================================
 */
		oMap: {},
		oCoordinates: {
			LAN: null,
			LAT: null
			//oStart: {},
			//oEnd: {}
		},


/**
 * ===========================================================================
 * On Create Function
 * ===========================================================================
 */
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
			let map = new H.Map(
				document.getElementById("__component0---unetzPro--map"),
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
			this.moveMapToCurrentLocation();
		},

		getCurrentLocation: async function(){
			var oJSON = {};
			return new Promise(function(resolve, reject) {
				if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(position =>{
							oJSON['LAT'] = position.coords.latitude;
							oJSON['LNG'] = position.coords.longitude;
							resolve(oJSON);
						});
				} else { 
					sap.m.MessageToast.show( "Geolocation is not supported by this browser.");
				}
			});
		},

/**
 * ===========================================================================
 *  View functions
 * ===========================================================================
 */
		updateStartFieldWithCurrentAddress: async function(lat,lng){
			var start = this.getView().byId('address_start');
			var sAdress= await this.reverseGeocoding(lat,lng);
			start.setValue(sAdress);
		},
/**
 * ===========================================================================
 *  HERE Map functions
 * ===========================================================================
 */
		moveMapToCurrentLocation: async function () {
			var oJSON = await this.getCurrentLocation();
			this.oMap.setCenter({
				lat: oJSON['LAT'],
				lng: oJSON['LNG']
			});
			this.setMarker(oJSON['LAT'],oJSON['LNG']);
			this.oMap.setZoom(14);
			this.updateStartFieldWithCurrentAddress(oJSON['LAT'],oJSON['LNG']);

		},

		setMarker: function(lat, lng){
			var oMarker = new H.map.Marker({
				lat: lat,
				lng: lng
			});
			this.oMap.addObject(oMarker);
		},
/**
 * ===========================================================================
 *  Geocoding API Calls
 * ===========================================================================
 */
		reverseGeocoding: async function(lat,lng){
			var sAdress = null;
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: 'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json',
					type: 'GET',
					dataType: 'jsonp',
					jsonp: 'jsoncallback',
					data: {
						prox: lat+','+lng+',250',
						mode: 'retrieveAddresses',
						gen: '9',
						maxresults: '1',
						city: 'Berlin',
						app_id: Cred.getHereAppId(),
						app_code: Cred.getHereAppCode()
					},
					success: function (data) {
						sAdress = data.Response.View[0].Result[0].Location.Address.Label;
						resolve(sAdress);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
					}
			})

			});
		},
		reverseGeocoding: async function(oCoordinatesStart,oCoordinatesTarget){
			var sAdress = null;
			return new Promise(function(resolve, reject) {
				$.ajax({
					url: 'https://route.api.here.com/routing/7.2/calculateroute.json',
					type: 'GET',
					dataType: 'jsonp',
					jsonp: 'jsoncallback',
					data: {
						waypoint0: oCoordinatesStart.LAT+','+oCoordinatesStart.LNG,
    					waypoint1: oCoordinatesTarget.LAT+','+oCoordinatesTarget.LNG,
    					mode: 'ffastest;publicTransportTimeTable',
    					alternatives: '3',
						city: 'Berlin',
						app_id: Cred.getHereAppId(),
						app_code: Cred.getHereAppCode()
					},
					success: function (data) {
						sAdress = data.Response.View[0].Result[0].Location.Address.Label;
						resolve(sAdress);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						sap.m.MessageToast.show(textStatus + '\n' + jqXHR + '\n' + errorThrown);
					}
			})

			});
		},

/**
 * ===========================================================================
 *  HANA DB functions
 * ===========================================================================
 */
		

		onFindButtonPress_Re: function (oEvent) {
			sap.m.MessageToast.show('Die Umkreissuche wird durchgeführt.. ');
		},

		
	});
});