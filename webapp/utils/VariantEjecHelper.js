sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		oFacet: {},
		_VariantJSON: [],
		_VariantModel: {},

		init: function(oFacet) {
			//debugger;
			this.oFacet = oFacet;
			var aLists = this.oFacet.getLists();

			for (var i = 0; i < aLists.length; i++) {
				if (aLists[i].getKey() === "preq_no" || aLists[i].getKey() === "preq_item" ||
				    aLists[i].getKey() === "fecha_sol" || aLists[i].getKey() === "rel_cod" ||
				    aLists[i].getKey() === "usuario" || aLists[i].getKey() === "solicitante" ||
				    aLists[i].getKey() === "org_compras" || aLists[i].getKey() === "descripcion" ||
				    aLists[i].getKey() === "material" || aLists[i].getKey() === "grupo_compras" ||
				    aLists[i].getKey() === "centro" || aLists[i].getKey() === "cantidad" || 
				    aLists[i].getKey() === "cod"  ) {
					this._VariantJSON.push({
						Key: aLists[i].getKey(),
						Text: aLists[i].getTitle(),
						Selected: false //true
					});
				}

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
	};
});