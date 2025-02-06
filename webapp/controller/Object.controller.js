/*global location*/
sap.ui.define([
	"zsolped/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"zsolped/model/formatter"
], function(BaseController, JSONModel, History, formatter) {
	"use strict";
	var oThis;
	return BaseController.extend("zsolped.controller.Object", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {

			oThis = this;

			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay, oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
	/*		iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});*/



		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {

			//Limpia el log antes de volver a la vista worklist
		//	this.limpia_log();

			var oInput1 = this.getView().byId("input1");
			var lv = oInput1.getValue();

			var sPreviousHash = History.getInstance().getPreviousHash();
			if (lv == "1") { // 1 indica que se presion  el bot n "liberar"
				//
				if (sPreviousHash !== undefined) {
					//	history.go(-1);
					window.location.reload(history.back());
				} else {
					this.getRouter().navTo("worklist", true);

				}
				//
			} else {
				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", true);

				}
			}

		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {

			var sObjectId = oEvent.getParameter("arguments").objectId;
			oThis.sObjectId = sObjectId;


	/*		this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("TiSolpedSet", {
					number: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));

			// Detalle
			var hoja = oEvent.getParameter("arguments").COD_LIB;

			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV"; // ODATA URL
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setUseBatch(false);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			//oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

			var filtercod = new sap.ui.model.Filter("number", sap.ui.model.FilterOperator.EQ, sObjectId);

			// Se insertan los datos a la tabla de log con los datos seleccionados
			var gTable = this.byId("table3");
			//gTable.getBinding("items").refresh();
			gTable.setModel(oModel);
			gTable.getBinding("items").filter(filtercod);*/
			//oModel.refresh();
			oThis.obtenerAnexos();

		},
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			
	/*		var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});*/
		},
		_onBindingChange: function() {
		/*	debugger;

			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
						if (!oElementBinding.getBoundContext()) {
							this.getRouter().getTargets().display("objectNotFound");
							return;
						}*/
/*			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.number,
				sObjectName = oObject.number;
			// Everything went fine.
			oViewModel.setProperty("/busy", false);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));*/

		},
		/**
		 *@memberOf zsolped.controller.Object
		 */
		liberar: function() {

/*			debugger;
			var oInput1 = this.getView().byId("input1");
			oInput1.setValue("1"); // by hardcoding 1 atleast

			//This code was generated by the layout editor.
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
						if (!oElementBinding.getBoundContext()) {
							this.getRouter().getTargets().display("objectNotFound");
							return;
						}
			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.number,
				sObjectName = oObject.number,
				cod = oObject.cod;

			var afilters = new Array();

			var filterhoja = new sap.ui.model.Filter("number", sap.ui.model.FilterOperator.EQ, sObjectId);
			afilters.push(filterhoja);

			var filtercod = new sap.ui.model.Filter("cod", sap.ui.model.FilterOperator.EQ, cod);
			afilters.push(filtercod);

			// Se realizada el llamado a la entidad la cual est  seteada directamente el la vista xml ( TiOcReleaseSet)
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV"; // ODATA URL
			var oDModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oDModel.setUseBatch(false);
			oDModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oDModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

			// Se insertan los datos a la tabla de log con los datos seleccionados
			var oTable = this.byId("table2");
			oTable.setModel(oDModel);
			oTable.getBinding("items").filter(afilters);*/

		},

		limpia_log: function() {

			// Refresca la grilla de log
			// Se realizada el llamado a la entidad la cual est  seteada directamente el la vista xml ( TiOcReleaseSet)
			//debugger;
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV"; // ODATA URL
			var oDModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oDModel.setUseBatch(false);
			oDModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oDModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

			// Se insertan los datos a la tabla de log con los datos seleccionados
			var oTable = this.byId("table2");
			oTable.setModel(oDModel);
			oTable.getBinding("items");

		},
		onObtenerAnexo: function(oEvent) {
			var oItem = oEvent.getSource().getParent();
			var oTabla = oEvent.getSource().getParent().getParent();
			var oDatos = oTabla.getModel("Anexos").getProperty(oItem.getBindingContextPath());
			var oServicio = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV/";
			var lv_path = "";
			if (oDatos.Extension === "HTM" || oDatos.Extension === "HTML") {
				lv_path = oDatos.Anexo;
				window.open(lv_path, "_system");
			} else if (oDatos.Extension === "TEXT") {
				if (!this.dialogNota) {
					this.dialogNota = sap.ui.xmlfragment("zsolped.view.Nota", this);
					var i18nModel = new sap.ui.model.resource.ResourceModel({
						bundleUrl: "i18n/i18n.properties"
					});
					this.dialogNota.setModel(i18nModel, "i18n");
				}
				sap.ui.getCore().byId("_iNotaAdj").setValue(oDatos.Anexo);
				this.dialogNota.open();
			} else {
				lv_path = oServicio + "AnexoSet(NombreAnexo='" + oDatos.Anexo + "')/$value//";
				//window.open(lv_path, "_blank");
				$.get(lv_path, function (data) {
					var a = document.createElement("a");
					a.href = lv_path;
					a.download = oDatos.NombreArchivo;
					a.click();
				});
			}
		},
		
		onCancelarNota: function (oEvent) {
			sap.ui.getCore().byId("_iNotaAdj").setValue("");
			this.dialogNota.close();
		},
		
		obtenerAnexos: function() {
			var aFiltros = [];
			aFiltros.push(new sap.ui.model.Filter("Solped", sap.ui.model.FilterOperator.EQ, oThis.sObjectId));
			this.getView().getModel().read("/AnexoListadoSet", {
				filters: aFiltros,
				success: function(oData) {
					var oTableJSON = new sap.ui.model.json.JSONModel();
					var Anexos = {
						Datos: oData.results
					};
					oTableJSON.setData(Anexos);
					oThis.getView().byId("__tblAnexos").setModel(oTableJSON, "Anexos");
				}.bind(this)
			});
		}
	});
});