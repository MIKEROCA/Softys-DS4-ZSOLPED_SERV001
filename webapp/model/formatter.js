sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		// numberUnit: function(sValue) {
		// 	if (!sValue) {
		// 		return "";
		// 	}

		// 	//jQuery.sap.require("sap.ui.core.format.NumberFormat");
		// 	var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
		// 		maxFractionDigits: 2,
		// 		groupingEnabled: true,
		// 		groupingSeparator: ".",
		// 		decimalSeparator: ","
		// 	});
		// 	//oNumberFormat = sValue;
		// 	//return parseFloat(sValue).toFixed(2);
		// 	var temp = oNumberFormat.format(sValue); 
		// 	return temp;
		// },

		visibleAnexos: function(sValue) {
			if (sValue === "X") {
				return true;
			}else{
				return false;
			}
		},
		
		priceState: function(iPrice) {
			if (iPrice > 0) {
				return "Success";
				/*			} else if (iPrice >= 50 && iPrice < 250) {
								return "None";
							} else if (iPrice >= 250 && iPrice < 2000) {
								return "Warning";*/
			} else {
				return "Error";
			}
		},

		unidadMil: function(sValue) {
			if (!sValue) {
				return "";
			}

			//jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				minFractionDigits: 2,
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});
			//oNumberFormat = sValue;
			//return parseFloat(sValue).toFixed(2);
			var temp = oNumberFormat.format(sValue);
			return temp;
		},
		
		numberUnit: function (sValue, sMoneda) {
			if (!sValue) {
				return "0";
			}
			var iValue = parseFloat(sValue);
			// La API de UI5 presenta problemas , se remplaza por codigo estandar JS
			// var oFormatter = new sap.ui.model.type.Currency();
			// return oFormatter.formatValue(["USD",iValue]);
			// var oFormatter = sap.ui.core.format.NumberFormat.getCurrencyInstance({
			// 	decimals: 2
			// });
			// return oFormatter.format(iValue);
			// Se utiliza la localización de chile
			if (sMoneda === "CLP") {
				// iValue = iValue * 100;
				var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					minFractionDigits: 0,
					maxFractionDigits: 0,
					groupingEnabled: true,
					groupingSeparator: ".",
					decimalSeparator: ","
				});
				var temp = oNumberFormat.format(iValue);
				return temp.toLocaleString("es-CL", {
					style: 'decimal',
					maximumFractionDigits: '2'
				});

				// return iValue.toLocaleString("es-CL", {
				// 	style: 'decimal',
				// 	maximumFractionDigits: '0'
				// });
			} else {
				var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					minFractionDigits: 2,
					maxFractionDigits: 2,
					groupingEnabled: true,
					groupingSeparator: ".",
					decimalSeparator: ","
				});
				var temp = oNumberFormat.format(sValue);
				return temp.toLocaleString("es-CL", {
					style: 'decimal',
					maximumFractionDigits: '2'
				});
				// return iValue.toLocaleString("es-CL", {
				// 	style: 'decimal',
				// 	maximumFractionDigits: '2'
				// });
			}

		}

	};

});