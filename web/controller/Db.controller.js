sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Db", {
		onInit: function () {

		},
		onButton1Press: function (oEvent) {
			sap.m.MessageToast.show('Read from DB ... ');
			self = this;
			var dbid = self.getView().byId('dbid').getValue();
			$.ajax({
				url: `http://localhost:3000/db?dbid=${dbid}`,
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