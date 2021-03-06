sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController",
	"de/htwberlin/adbkt/basic1/Cred", "sap/ui/model/json/JSONModel","sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, Cred, JSONModel) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.UBahnNetzBerlinPro", {
		onInit: function () {
			var oSearchModel = new JSONModel({
				"Start": "",
				"Target": ""
			});
			this.setModel(oSearchModel, "s");
			var oModel = this.getOwnerComponent().getModel("searchList");
			oModel.setSizeLimit(10729);
		},
/**
 * ===========================================================================
 *  Global Objects
 * ===========================================================================
 */
		oMap: {},
		oMapUI:{},
		oMapPlatform: {},
		oMapRouteInstructionsContainer:{},
		oAdressToNearestStationLanLon:{},
		sAdressToNearestStation:String,
		oAdressFromLanLon:{},
		oAdressToLanLon:{},

/**
 * ===========================================================================
 * On Create Function
 * ===========================================================================
 */
		onAfterRendering: function () {
			//var routeInstructionsContainer = this.getView().byId('idHTMLContent');
			//var routeInstructionsContainer = document.getElementById("__component0---unetzPro--idHTMLContent");
			//console.log(routeInstructionsContainer)
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
			const mapEvents = new H.mapevents.MapEvents(map);
			const behavior = new H.mapevents.Behavior(mapEvents);
			var ui = H.ui.UI.createDefault(map, defaultLayers);
			this.oMap = map;
			this.oMapPlatform=platform;
			this.oMapUI=ui;
			//this.oMapRouteInstructionsContainer =routeInstructionsContainer;
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
			this.onPressEnterFrom();
		},
		handleSuggest: function(oEvent) {
			var oInput = oEvent.getSource();
			if (!oInput.getSuggestionItems().length) {
				oInput.bindAggregation("suggestionItems", {
					path: "search>/STREET",
					template: new sap.ui.core.Item({
						text: "{STREET_NAME}"
					})
				});
			}
		},

		onSelectionChange: function(){
			var oSearchFrom = this.getModel("s").getData();
			var oSelected = this.byId("searchTable").getSelectedItem();

			if (oSelected) {
				var aCells = oSelected.getCells();

				this.sAdressToNearestStation = aCells[1].getText();
				console.log(this.sAdressToNearestStation);

				this.oAdressToNearestStationLanLon['LAT'] = aCells[2].getText();
				this.oAdressToNearestStationLanLon['LNG'] = aCells[3].getText();
				console.log(this.oAdressToNearestStationLanLon);

				console.log(this.oAdressFromLanLon.LAT +","+ this.oAdressFromLanLon.LNG +"->"+this.oAdressToNearestStationLanLon.LAT +","+this.oAdressToNearestStationLanLon.LNG);
				
				this.drawPedestrianRouteFromAtoB(this.oAdressFromLanLon,this.oAdressToNearestStationLanLon);
				//this.oAdressFromLanLon=this.oAdressToLanLon;
				
				if(oSearchFrom.Target!=""){
					this.onSearch();
				}


			}

		},

		onPressEnterFrom: async function(){
			var oSearchFrom = this.getModel("s").getData();
			var log = this.getView().byId("log");
			this.sAdressToNearestStation ="";
			this.oAdressToNearestStationLanLon={};
			log.setValue("");
			this.oAdressFromLanLon = await this.getLanLng(oSearchFrom.Start);
			var oTable=this.getView().byId("searchTable");
			var serviceUrlJSON="https://hanaicla2.f4.htw-berlin.de:51026/xsjs/hdb.xsjs";
			
			var oHeaders ={
				user : "u553419",
				password : "Bcdefgh12"
		   };
			var oModelResults = new sap.ui.model.json.JSONModel();
			
			
			oModelResults.loadData(serviceUrlJSON, "cmd=findNearestStation&lat="+ this.oAdressFromLanLon.LAT+ "&lon="+this.oAdressFromLanLon.LNG,true, "GET", false, true, oHeaders);
			oTable.setModel(oModelResults);
			oTable.bindItems({
				path:"/",
				template: new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text:"{DISTANCE}"
					}),
					new sap.m.Text({
						text:"{STATION_NAME}"
					}),
					new sap.m.Text({
						text:"{LAT}"
					}),
					new sap.m.Text({
						text:"{LON}"
					})

				]
				})
			});
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

		moveMapToLatLng: function (lat, lng) {
			//sap.m.MessageToast.show('begin');
			var coords = {
				lat: lat,
				lng: lng
			};
			var marker = new H.map.Marker(coords);
			this.oMap.addObject(marker);
			this.oMap.setCenter(coords);
		},

		setMarker: function(lat, lng){
			var oMarker = new H.map.Marker({
				lat: lat,
				lng: lng
			});
			this.oMap.addObject(oMarker);
		},

		drawTransportRouteFromAtoB: function(oFromLatLng,oToLatLng){
			//var routeInstructionsContainer2 = document.getElementById('__component0---unetzPro--idHTMLContent');
			var routeInstructionsContainer = this.getView().byId('idHTMLContent');
			var map=this.oMap;
			var platform= this.oMapPlatform;
			var ui = this.oMapUI;
			var bubble;
			  
			var router = platform.getRoutingService(),
				  routeRequestParams = {
					mode: 'fastest;publicTransport',
					representation: 'display',
					waypoint0: oFromLatLng.LAT +","+oFromLatLng.LNG,
					waypoint1: oToLatLng.LAT +","+oToLatLng.LNG,  
					routeattributes: 'waypoints,summary,shape,legs',
					maneuverattributes: 'direction,action'
				  };
			  
			  
				router.calculateRoute(
				  routeRequestParams,
				  onSuccess,
				  onError
				);
			  
			  function onSuccess(result) {
				var route = result.response.route[0];
				map.removeObjects(map.getObjects());

				addRouteShapeToMap(route);
				addManueversToMap(route);
			  }
			  
			  function onError(error) {
				alert('Can\'t reach the remote server');
			  }

			  
			  function addRouteShapeToMap(route){
				var lineString = new H.geo.LineString(),
				  routeShape = route.shape,
				  polyline;
			  
				routeShape.forEach(function(point) {
				  var parts = point.split(',');
				  lineString.pushLatLngAlt(parts[0], parts[1]);
				});
			  
				polyline = new H.map.Polyline(lineString, {
				  style: {
					lineWidth: 4,
					strokeColor: 'rgba(0, 128, 255, 0.7)'
				  }
				});
				// Add the polyline to the map
				map.addObject(polyline);
				// And zoom to its bounding rectangle
				
			  }
			  
			  function addManueversToMap(route){
				var i;
				var j;
			  
				// Add a marker for each maneuver
				for (i = 0;  i < route.leg.length; i += 1) {
				  for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
					// Get the next maneuver.
					var maneuver = route.leg[i].maneuver[j];
					// Add a marker to the maneuvers group
					var marker =  new H.map.Marker({
					  lat: maneuver.position.latitude,
					  lng: maneuver.position.longitude});
					marker.instruction = maneuver.instruction;
					map.addObject(marker);
				  }
				}
			
			  }

		},
	
		drawPedestrianRouteFromAtoB: function(oFromLatLng,oToLatLng){
			this.oMap.removeObjects(this.oMap.getObjects());
			var platform = this.oMapPlatform;
			var router = platform.getRoutingService();
			var routeRequestParams = {
				mode: 'shortest;pedestrian',
				representation: 'display',
				waypoint0: oFromLatLng.LAT +","+oFromLatLng.LNG,
				waypoint1: oToLatLng.LAT +","+oToLatLng.LNG,  
				routeattributes: 'waypoints,summary,shape,legs',
				maneuverattributes: 'direction,action'
			  };

			this.setMarker(oFromLatLng.LAT,oFromLatLng.LNG);
			this.setMarker(oToLatLng.LAT,oToLatLng.LNG);

			router.calculateRoute(
				routeRequestParams,
				data => {
					if(data.response.route.length>0){
						let lineString =new H.geo.LineString(); 
						data.response.route[0].shape.forEach(point=>{
							let [lat,lng]= point.split(",");
							lineString.pushPoint({lat: lat,lng:lng});
						});
						let polyline = new H.map.Polyline (lineString,
							{
								style: {
									lineWidth: 5
								}
							}); 
						this.oMap.addObject(polyline);
					} 

				},
				error=>{
					console.error(error);
				}
			  );

		},

		onSearch: async function(oEvent){
			var that = this;
			var oSearchFrom = this.getModel("s").getData();
			var sNearestSt= this.sAdressToNearestStation;
			var sSelection = that.getView().byId('searchType').getSelectedKey();
			var serviceUrlJSON="https://hanaicla2.f4.htw-berlin.de:51026/xsjs/hdb.xsjs";
			var oHeaders ={
				user : "u553419",
				password : "Bcdefgh12"
		   };
			var oModelResultsFrom = new sap.ui.model.json.JSONModel();
			var oModelResultsTo = new sap.ui.model.json.JSONModel();

			this.oAdressFromLanLon = await this.getLanLng(oSearchFrom.Start);
			this.oAdressToLanLon = await this.getLanLng(oSearchFrom.Target);
			//this.drawTransportRouteFromAtoB(this.oAdressFromLanLon,this.oAdressToLanLon);
		
			console.log (this.oAdressFromLanLon,this.oAdressToLanLon);
			console.log(sNearestSt);

			oModelResultsFrom.loadData(serviceUrlJSON, "cmd=findNearestStation&lat="+ this.oAdressFromLanLon.LAT+ "&lon="+this.oAdressFromLanLon.LNG,true, "GET", false, true, oHeaders);
			oModelResultsFrom.attachRequestCompleted(function() {
				oModelResultsTo.loadData(serviceUrlJSON, "cmd=findNearestStation&lat="+ that.oAdressToLanLon.LAT+ "&lon="+that.oAdressToLanLon.LNG,true, "GET", false, true, oHeaders);
				oModelResultsTo.attachRequestCompleted(async function() {
	
					// am wenigsten Stationen
					if (sSelection =="lessHops"){
						if (sNearestSt!=""){

							that.requestShortestPathFromHDB(sNearestSt,oModelResultsTo.getData()[0].STATION_NAME);

						}else that.requestShortestPathFromHDB(oModelResultsFrom.getData()[0].STATION_NAME,oModelResultsTo.getData()[0].STATION_NAME);

					} // am wenigsten Umstiege
					else if (sSelection =="lessChange"){
						var sStartStationName=oModelResultsFrom.getData()[0].STATION_NAME;
						var changesCountMain = 0;
						var sLessChangesStationName="";
						console.log(sSelection);
						
						for(var i = 1; i < oModelResultsTo.getData().length; i++) {
							var changesCount = await that.requestPathWithLessChangesFromHDB(sStartStationName,oModelResultsTo.getData()[i].STATION_NAME);
							
							if (changesCountMain==0){
								changesCountMain=changesCount;
								sLessChangesStationName= oModelResultsTo.getData()[i].STATION_NAME;
								console.log(changesCountMain,sLessChangesStationName)
							}else if (changesCountMain>changesCount){
								changesCountMain=changesCount;
								sLessChangesStationName= oModelResultsTo.getData()[i].STATION_NAME;
							}else continue;

						}
						console.log("OUT of LOOP: ",changesCountMain,sLessChangesStationName)
						that.requestShortestPathFromHDB(sStartStationName,sLessChangesStationName);





					}// kürzeste Zeit
					else if (sSelection =="fastestPath"){
						$.ajax({
							type: "POST",
							url: "http://127.0.0.1:5000/routing_time",
							data: { time: that.getView().byId('timePicker').getValue() ,
								start: oModelResultsFrom.getData()[0].STATION_NAME,
								end: oModelResultsTo.getData()[0].STATION_NAME,
			
							}
						}).done(function( o ) {
							var oLogArrea = that.getView().byId('log');
							oLogArrea.setValue(JSON.stringify(o));
							//console.log(o);
							for (var i = 0; i < o.length; i++){
								console.log(o[i].from_stop_name);
							}

						});
						console.log(sSelection);

					}else{
						console.log("neee...");
					}
					console.log(oModelResultsFrom.getData()[0].STATION_NAME,oModelResultsTo.getData()[0].STATION_NAME);


				});
				
			});
		},

		

/**
 * ===========================================================================
 *  Geocoding API Calls
 * ===========================================================================
 */
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
		routeFast: async function(oCoordinatesStart,oCoordinatesTarget){
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
    					mode: 'fastest;publicTransportTimeTable',
    					alternatives: '3',
						city: 'Berlin',
						app_id: Cred.getHereAppId(),
						app_code: Cred.getHereAppCode()
					},
					success: function (data) {
						sAdress = data.Response.View[0].Result[0].Location.Address.Label;
						sap.m.MessageToast.show(sAdress);
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
		
requestPathWithLessChangesFromHDB: async function (sStart, sEnd) {
	self = this;
	return new Promise(function(resolve, reject) {
		$.ajax({
			url: 'http://localhost:3000/get_changes_su',
			type: 'GET',
			data: {
				start: sStart, //'Deutsche Oper',
				end: sEnd //'Jakob-Kaiser-Platz',
			},
			success: function (data) {
				console.log(data);
				var count= data.totalChanges;
				console.log("COUNT: ",count)
				resolve(count);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				sap.m.MessageToast.show(textStatus + '\n' + JSON.stringify(jqXHR) + '\n' + JSON.stringify(errorThrown));
				return;
			}
		});
	});

},

requestShortestPathFromHDB: function (sStart, sEnd) {
	self = this;
	$.ajax({
		url: 'http://localhost:3000/short_path_su',
		type: 'GET',
		data: {
			start: sStart, //'Deutsche Oper',
			end: sEnd //'Jakob-Kaiser-Platz',
		},
		success: function (data) {
			var oLogArrea = self.getView().byId('log');
			var sLog = "Einsteigen \n";
			for (var i = 1; i < data.length; i++) {
				sLog = sLog + data[i - 1].SEGMENT + ":   " + data[i - 1].route_name + " - " + data[i - 1].from_stop_name + " \n";
				if (data[i].route_name !== data[i - 1].route_name) {
					
					sLog = sLog + data[i].SEGMENT + ":   " + data[i - 1].route_name + " - " + data[i].from_stop_name + " \n";
					sLog = sLog + "Umsteigen\n";
				}
				if (i === (data.length - 1)) {
					var endsegment = data.length + 1;
					sLog = sLog + data[i].SEGMENT + ":   " + data[i].route_name + " - " + data[i].from_stop_name + " \n";
					sLog = sLog + endsegment + ":   " + data[i].route_name + " - " + data[i].to_stop_name + " \n";
					sLog = sLog + "Ziel ist erreicht!\n"
				}
			}
			oLogArrea.setValue(sLog);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			sap.m.MessageToast.show(textStatus + '\n' + JSON.stringify(jqXHR) + '\n' + JSON.stringify(errorThrown));
			return;
		}
	});

}

		
	});
});