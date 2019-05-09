sap.ui.define(["de/htwberlin/adbkt/basic1/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("de.htwberlin.adbkt.basic1.controller.Service", {
		onInit: function () {
			var model = new sap.ui.model.json.JSONModel({
				num1: 0,
				num2: 0,
				result: 0
			});
			this.setModel(model, "nums");
		},
		onLiveChange1: function (oEvent) {
			var data = this.getModel("nums").getData();
			var num1 = escape(oEvent.getParameters().newValue)
			this.multiply(num1, data.num2);
		},

		onLiveChange2: function (oEvent) {
			var data = this.getModel("nums").getData();
			var num2 = escape(oEvent.getParameters().newValue)
			this.multiply(data.num1, num2);
		},

		multiply: function (num1, num2) {
			var aUrl = 'http://localhost:3000/mult?' + '&num1=' + num1 + '&num2=' + num2
			jQuery.ajax({
				url: aUrl,
				method: 'GET',
				dataType: 'json',
				context: this,
				success: this.onCompleteMultiply,
				error: this.onErrorCall
			})
		},

		onCompleteMultiply: function (myTxt) {
			this.getModel("nums").setData({
				result: myTxt
			}, true); // true means merge
		},

		onErrorCall1: function (jqXHR, textStatus, errorThrown) {
			sap.ui.commons.MessageBox.show(jqXHR.responseText, "ERROR", "Service Call Error");
			return;
		},

	});

});