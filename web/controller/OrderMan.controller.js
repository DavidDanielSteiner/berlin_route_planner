sap.ui.define(
	["de/htwberlin/adbkt/basic1/controller/BaseController", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
	function (BaseController, MessageToast, JSONModel) {
		"use strict";

		return BaseController.extend("de.htwberlin.adbkt.basic1.controller.OrderMan", {
			onInit: function () {
				var oCustomerModel = new JSONModel({
					"KID": "k",
					"Name": "Name"
				});
				this.setModel(oCustomerModel, "c");
			},

			onCreateUser: function (oEvent) {
				var oOdataModel = this.getModel("orderMan");
				var oNewCustomer = this.getModel("c").getData();
				var oBinding = this.byId("tableCustomers").getBinding("items");
				var oContext = oBinding.create(oNewCustomer);

				oContext.created().then(
					function () {
						MessageToast.show('Kunde "' + oNewCustomer.Name + '" angelegt.');
					},
					function (error) {
						MessageToast.show(error.responseText);
					}
				);
				this.onUpdate();
			},

			onRefreshUser: function () {
				var oBinding = this.byId("tableCustomers").getBinding("items");

				if (oBinding.hasPendingChanges()) {
					MessageBox.error("Refresh nicht möglich");
					return;
				}
				oBinding.refresh();
				MessageToast.show("Refresh erfolgreich");
			},

			onDeleteUser: function () {
				var oSelected = this.byId("tableCustomers").getSelectedItem();

				if (oSelected) {
					oSelected.getBindingContext("orderMan").delete("$auto").then(function () {
						MessageToast.show("Löschen erfolgreich");
					}.bind(this), function (oError) {
						MessageBox.error(oError.message);
					});
				}
			},

			onCustomerSelectionChange: function () {
				var oSelected = this.byId("tableCustomers").getSelectedItem();

				if (oSelected) {
					var aCells = oSelected.getCells();
					var sKID = aCells[0].getText();

					var oTable = this.byId("tableOrders");
					var oBinding = oTable.getBinding("items");

					var oFilter = new sap.ui.model.Filter({
						path: "KID_KID",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: sKID
					});
					oBinding.filter(oFilter);
				}
			}
		});

	});