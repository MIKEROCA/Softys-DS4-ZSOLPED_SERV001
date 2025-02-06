sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		_VariantJSON: [],
		_VariantModel: {},
		_oTable: {},
		_LastState: {},
		_Device: Device,
		_FinishedRes: {},
		_Finished: {},

		init: function(oTable) {
		//	debugger;

			this._oTable = oTable;
			this._Finished = new Promise(function(resolve) {
				this._FinishedRes = resolve;
			}.bind(this));

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {

				var sText = aColumns[i].getHeader().getText();
				if (!sText) {
					sText = this.getCustomDataVar(aColumns[i], "TextoVar");
				}

				this._VariantJSON.push({
					ColumnID: aColumns[i].getId(),
					ColumnText: sText,
					Visible: this.checkDefault(aColumns[i]),
					Group: this.getCustomDataVar(aColumns[i], "Group"),
					index: i

				});
			}

			this._VariantModel = new JSONModel(this._VariantJSON);
			this._VariantModel.setDefaultBindingMode("TwoWay");
		},
		getVariantJSON: function() {
			return this._VariantJSON;
		},
		getVariantModel: function(oModel) {
			return this._VariantModel;

		},

		updateTableBinding: function() {

		//	debugger;

			var aColumns = this._oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				var sPath = "Variante>/" + i + "/Visible";
				aColumns[i].bindProperty("visible", sPath);
	
				}
			this._FinishedRes();

		},
		
		setLastState: function() {
			this._LastState = JSON.parse(JSON.stringify(this._VariantJSON));

		},
		refreshLastState: function() {
			this._VariantJSON = JSON.parse(JSON.stringify(this._LastState));
			this._VariantModel.setData(this._VariantJSON);

		},
		checkDefault: function(oColumn) {
			var aCustomData = oColumn.getCustomData();
			var sSystem = this.checkSystem();
			var bDefault = false;
			for (var i = 0; i < aCustomData.length; i++) {
				if (aCustomData[i].getKey() === sSystem && aCustomData[i].getValue() === "true") {
					bDefault = true;
				}
			}
			return bDefault;
		},
		checkSystem: function() {
			switch (true) {
				case this._Device.system.desktop:
					return "Desktop";

				case this._Device.system.phone:
					return "Phone";

				case this._Device.system.tablet:
					return "Tablet";

			}
		},
		getCustomDataVar: function(oControl, sVar) {

			var aCustom = oControl.getCustomData().filter(function(oCustoms) {
				return oCustoms.getKey() === sVar;
			});
			if (aCustom.length > 0) {
				return aCustom[0].getValue();
			} else {
				return "";
			}
		}

	};
});