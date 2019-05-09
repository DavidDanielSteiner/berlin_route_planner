sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Mvc", {
		onInit: function () {
			var mvcData = {
				value: "Data1",
				enabled: true
			};

			var jsonModelMvc = new sap.ui.model.json.JSONModel(mvcData);
			this.getView().setModel(jsonModelMvc, "mvc");
		},

	});

});