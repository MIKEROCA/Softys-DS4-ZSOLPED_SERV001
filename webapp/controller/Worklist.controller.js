sap.ui.define([
	"zsolped/controller/BaseController",
        "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"zsolped/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"zsolped/model/grouper",
	"zsolped/model/GroupSortState",
	"sap/m/GroupHeaderListItem",
	"zsolped/utils/VariantHelper",
	"zsolped/model/models",
	"zsolped/utils/VariantEjecHelper"

], function (BaseController, History, JSONModel, formatter, Filter, FilterOperator, Sorter, grouper, GroupSortState, GroupHeaderListItem,
	VariantHelper, models, VariantEjecHelper) {
	"use strict";
	var oThis;
	return BaseController.extend("zsolped.controller.Worklist", {
		formatter: formatter,
		variantHelper: VariantHelper,
		variantEjecHelper: VariantEjecHelper,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {

			oThis = this;
			var iOriginalBusyDelay, oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			//		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			//		var oRouter, oTarget;
			//		oRouter = this.getRouter();
			//		oTarget = oRouter.getTarget("worklist1");
			//inicio sort
			//**************************************************
			//var oRouter = this.getRouter().getRoute("worklist");
			//var oRouter = this.getRouter().getRoute("worklist");

			var oRouter = this.getRouter();
			//debugger;
			this._oTable = this.byId("table");
			this._oVSD = null;
			this._sSortField = null;
			this._bSortDescending = false;
			this._aValidSortFields = [
				"preq_no",
				"preq_item",
				"material",
				//"materialt",
				"cantidad",
				"descripcion",
				"grupo_compras",
				//"grupo_comprast",				
				"usuario",
				"solicitante",
				"fecha_sol",
				"centro",
				"org_compras",
				"rel_cod",
				"cod",
				"rel_strat"

			];
			this._sSearchQuery = null;
			this._oRouterArgs = null;
			this._initViewSettingsDialog();
			//			debugger;
			// make the search bookmarkable
			sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("lista").attachPatternMatched(this._onObjectMatched, this);

			//************************************************************************+
			//fin sort			
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0

			});

			//this.variantHelper.init(this.byId("table"));
			this.variantHelper.init(this._oTable);
			this.variantEjecHelper.init(this.getView().byId("idFacetFilter"));
			this._oGroupSortState = new GroupSortState(oViewModel, grouper.group(this.getResourceBundle()));

			this.getOwnerComponent().setModel(this.variantEjecHelper.getVariantModel(), "DFiltros");
			//debugger;

			/*			this.getOwnerComponent().setModel(new JSONModel({
							Moneda: "M USD",
							Mes1: "",
							Mes2: "",
							Anio1: "",
							Anio2: ""
						}), "Titles");*/

			this.variantHelper.updateTableBinding();

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.setInitialVariant("I");
					/*					this.getView().byId("hoja").getBinding("items").attachEventOnce("dataReceived", function() {
											this.setInitialVariantEjec();
										}.bind(this));*/

				}.bind(this)
			});

			this.setModel(oViewModel, "worklistView");
			// cuenta antes para casos que tienen mayor cantidad de datos
			//	debugger;
			//	oTable.attachEventOnce("updateStarted", null);
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});

			this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");

		},

		onAfterRendering: function () {},

		_onObjectMatched: function (oEvent) {
			var codlib = oEvent.getParameter("arguments").COD_LIB;
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV";
			// ODATA URL
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setUseBatch(false);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			//oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			var filtercod = new sap.ui.model.Filter("cod", sap.ui.model.FilterOperator.EQ, codlib);
			// Se insertan los datos a la tabla de log con los datos seleccionados
			var gTable = this.byId("table");
			//gTable.getBinding("items").refresh();
			gTable.setModel(oModel);
			gTable.getBinding("items").filter(filtercod); //oModel.refresh();
			//*******************************************************************************************+
			//Completa los datos de Filtros
			//	this.getView().setModel(oModel);

			// sol. pedido
			var filterped = new sap.ui.model.Filter("preq_no", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("preq_no").getBinding("items").filter(filterped);

			//Posici n sol. pedido
			var filterposped = new sap.ui.model.Filter("preq_item", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("preq_item").getBinding("items").filter(filterposped);

			//material
			var filtermat = new sap.ui.model.Filter("material", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("material").getBinding("items").filter(filtermat);

			//cantidad
			//			var filtercant = new sap.ui.model.Filter("cantidad", sap.ui.model.FilterOperator.EQ, codlib);
			//			this.getView().byId("cantidad").getBinding("items").filter(filtercant);

			//descripci n
			var filterdescrip = new sap.ui.model.Filter("descripcion", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("descripcion").getBinding("items").filter(filterdescrip);

			//material descripci n
			/*			var filtermatt = new sap.ui.model.Filter("materialt", sap.ui.model.FilterOperator.EQ, codlib);
						this.getView().byId("materialt").getBinding("items").filter(filtermatt);*/

			//grupo_compras
			var filtergcompras = new sap.ui.model.Filter("grupo_compras", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("grupo_compras").getBinding("items").filter(filtergcompras);

			//grupo_comprast
			//var filtergcomprast = new sap.ui.model.Filter("grupo_comprast", sap.ui.model.FilterOperator.EQ, codlib);
			//this.getView().byId("grupo_comprast").getBinding("items").filter(filtergcomprast);		

			//usuario
			var filteruser = new sap.ui.model.Filter("usuario", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("usuario").getBinding("items").filter(filteruser);

			//solicitante
			var filtersoli = new sap.ui.model.Filter("solicitante", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("solicitante").getBinding("items").filter(filtersoli);

			//fecha solicitud
			var filterfecha = new sap.ui.model.Filter("fecha_sol", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("fecha_sol").getBinding("items").filter(filterfecha);

			//centro
			var filtercentro = new sap.ui.model.Filter("centro", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("centro").getBinding("items").filter(filtercentro);

			// Org. Compras
			var filterorgcompras = new sap.ui.model.Filter("org_compras", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("org_compras").getBinding("items").filter(filterorgcompras);

			//grupo liberaci n
			var filterrelcod = new sap.ui.model.Filter("rel_cod", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("rel_cod").getBinding("items").filter(filterrelcod);

			// 	Estrategia liberaci n	
			var filterest = new sap.ui.model.Filter("rel_strat", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("rel_strat").getBinding("items").filter(filterest);

			var filterdesc = new sap.ui.model.Filter("frgxt", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("frgxt").getBinding("items").filter(filterdesc);

			var filterpfijo = new sap.ui.model.Filter("provFijo", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("provFijo").getBinding("items").filter(filterpfijo);

			var filterpdesea = new sap.ui.model.Filter("provDeseado", sap.ui.model.FilterOperator.EQ, codlib);
			this.getView().byId("provDeseado").getBinding("items").filter(filterpdesea);
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total"),
				iActual = oEvent.getParameter("actual");
			//debugger;
			// only update the counter if the length is final and
			// the table is not empty
			// considerando el growing, se muestra simepre el total
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				//	sTitle = this.getResourceBundle().getText("worklistTableTitle");
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems - iActual]);
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			//limpia tabla de log en caso de contener data
			this.limpia_log();
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function () {
			//history.go(-1);
			//this.getRouter().navTo("inicio", {}, true /*no history*/ );
			//window.location.reload(history.back());
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				oThis.getRouter().navTo("inicio", {}, true);
			}
		},
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");
				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [
						new Filter("preq_no", FilterOperator.Contains, sQuery),
						new Filter("preq_item", FilterOperator.Contains, sQuery),
						new Filter("material", FilterOperator.Contains, sQuery),
						new Filter("cantidad", FilterOperator.Contains, sQuery),
						new Filter("descripcion", FilterOperator.Contains, sQuery),
						new Filter("grupo_compras", FilterOperator.Contains, sQuery),
						//new Filter("grupo_comprast", FilterOperator.Contains, sQuery),
						new Filter("usuario", FilterOperator.Contains, sQuery),
						new Filter("solicitante", FilterOperator.Contains, sQuery),
						new Filter("fecha_sol", FilterOperator.Contains, sQuery),
						new Filter("centro", FilterOperator.Contains, sQuery),
						new Filter("org_compras", FilterOperator.Contains, sQuery),
						new Filter("rel_cod", FilterOperator.Contains, sQuery),
						//new Filter("cod", FilterOperator.Contains, sQuery),
						new Filter("rel_strat", FilterOperator.Contains, sQuery),
						new Filter("frgxt", FilterOperator.Contains, sQuery),
						new Filter("provFijo", FilterOperator.Contains, sQuery),
						new Filter("provDeseado", FilterOperator.Contains, sQuery)
					];
				}
				this._applySearch(oTableSearchState);
			}
		},
		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("preq_no")
			});
		},
		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {object} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function (oTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		/**
		 *@memberOf zsolped.controller.Worklist
		 */
		//inicio sort
		//*************************************************************************+
		_onRouteMatched: function (oEvent) {
			// save the current query state
			//debugger;
			this._oRouterArgs = oEvent.getParameter("arguments");
			this._oRouterArgs.query = this._oRouterArgs["?query"] || {};
			if (this._oRouterArgs.query) {
				// search/filter via URL hash
				//	this._applySearchFilter(this._oRouterArgs.query.search);
				// sorting via URL hash
				this._applySorter(this._oRouterArgs.query.sortField, this._oRouterArgs.query.sortDescending);
			}
		},
		onSortPressed: function () {
			this._oVSD.open();
		},
		onSearchEmployeesTable: function (oEvent) {
			var oRouter = this.getRouter();
			// update the hash with the current search term
			this._oRouterArgs.query.search = oEvent.getSource().getValue();
			oRouter.navTo("worklist", this._oRouterArgs, true /*no history*/ );
		},
		_initViewSettingsDialog: function () {
			//se agrego
			//	debugger;
			//this.getRouter().getRoute("worklist").attachMatched(this._onRouteMatched, this);
			var oRouter = this.getRouter();
			if (!sap.ui.getCore().byId("vsd")) {
				this._oVSD = new sap.m.ViewSettingsDialog("vsd", {
					confirm: function (oEvent) {
						var oSortItem = oEvent.getParameter("sortItem");
						this._oRouterArgs.query.sortField = oSortItem.getKey();
						this._oRouterArgs.query.sortDescending = oEvent.getParameter("sortDescending");
						oRouter.navTo("worklist", this._oRouterArgs, true /*without history*/ );
					}.bind(this)
				});
				// init sorting (with simple sorters as custom data for all fields)
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "preq_no",
					text: "N° Pedido",
					selected: true // by default the MockData is sorted by EmployeeID
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "preq_item",
					text: "Pos. N° Ped.",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "material",
					text: "Material",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "cantidad",
					text: "Cantidad",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "descripcion",
					text: "Descripción",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "grupo_compras",
					text: "Grupo Compras",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "usuario",
					text: "Creado por",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "solicitante",
					text: "Solicitante",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "fecha_sol",
					text: "Fecha Solicitid",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "centro",
					text: "Centro",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "org_compras",
					text: "Org. Compras",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "rel_cod",
					text: "Grupo Lib.",
					selected: false
				}));
				/*			this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
								key: "cod",
								text: "C\xF3digo Liberaci\xF3n",
								selected: false
							}));*/

				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "rel_strat",
					text: "Estrategia Liberación",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "provFijo",
					text: "Prov.Fijo",
					selected: false
				}));
				this._oVSD.addSortItem(new sap.m.ViewSettingsItem({
					key: "provDeseado",
					text: "Prov.Deseado",
					selected: false
				}));
		} else {
			// Si ya existe se reutiliza
			this._oVSD = sap.ui.getCore().byId("vsd");
		  }			
		},
		/**
		 * Applies sorting on our table control.
		 * @param {string} sSortField		the name of the field used for sorting
		 * @param {string} sortDescending	true or false as a string or boolean value to specify a descending sorting
		 * @private
		 */
		_applySorter: function (sSortField, sortDescending) {
			var bSortDescending, oBinding, oSorter;
			// only continue if we have a valid sort field
			if (sSortField && this._aValidSortFields.indexOf(sSortField) > -1) {
				// convert  the sort order to a boolean value
				if (typeof sortDescending === "string") {
					bSortDescending = sortDescending === "true";
				} else if (typeof sortDescending === "boolean") {
					bSortDescending = sortDescending;
				} else {
					bSortDescending = false;
				}
				// sort only if the sorter has changed
				if (this._sSortField && this._sSortField === sSortField && this._bSortDescending === bSortDescending) {
					return;
				}
				this._sSortField = sSortField;
				this._bSortDescending = bSortDescending;
				oSorter = new Sorter(sSortField, bSortDescending);
				// sync with View Settings Dialog
				this._syncViewSettingsDialogSorter(sSortField, bSortDescending);
				oBinding = this._oTable.getBinding("items");
				oBinding.sort(oSorter);
			}
		},
		_syncViewSettingsDialogSorter: function (sSortField, bSortDescending) {
			// the possible keys are: "EmployeeID" | "FirstName" | "LastName"
			// Note: no input validation is implemented here
			this._oVSD.setSelectedSortItem(sSortField);
			this._oVSD.setSortDescending(bSortDescending);
		},
		//********************************************************************************
		//fin sort
		/*
		Logica de liberaci n de documentos
		Se obtienen los documentos seleccionados y se llama al entity TiHasReleaseSet del servicio para liberar
		los documentos.
		Posteriormente se refresca la grilla para obtener siempre la base de documentos por liberar para el usuario.
		*/
		liberar_sel: function () {
			//This code was generated by the layout editor.
			var oModel = this.getView().getModel();
			var table = this.getView().byId("table");
			var rowItems = table.getSelectedItems();
			//	debugger;
			var afilters = new Array();
			for (var i = 0; i < rowItems.length; i++) {
				if (rowItems[i].getSelected()) {
					var filterhoja = new sap.ui.model.Filter("preq_no", sap.ui.model.FilterOperator.EQ, oModel.getProperty("preq_no", rowItems[i].getBindingContext()));
					afilters.push(filterhoja);
					var filteritem = new sap.ui.model.Filter("preq_item", sap.ui.model.FilterOperator.EQ, oModel.getProperty("preq_item", rowItems[i]
						.getBindingContext()));
					afilters.push(filteritem);
					var filtercod = new sap.ui.model.Filter("cod", sap.ui.model.FilterOperator.EQ, oModel.getProperty("cod", rowItems[i].getBindingContext()));
					afilters.push(filtercod);
				}
			}
			// Se realizada el llamado a la entidad la cual est  seteada directamente el la vista xml ( TiHasReleaseSet)
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV";
			// ODATA URL
			var oDModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oDModel.setUseBatch(false);
			oDModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oDModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			// Se insertan los datos a la tabla de log con los datos seleccionados
			var oTable = this.byId("table2");
			oTable.setModel(oDModel);
			oTable.getBinding("items").filter(afilters);
			// Se refresca la grilla principal en el caso que se han seleccinado datos y si estos
			// fueron liberados exitosamente
			var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oModel.setUseBatch(false);
			oModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			// Se insertan los datos a la tabla de log con los datos seleccionados
			var gTable = this.byId("table");
			//gTable.getBinding("items").refresh();
			gTable.setModel(oModel);
			gTable.getBinding("items").filter(filtercod); //oModel.refresh();
		},
		limpia_log: function () {
			// Refresca la grilla de log
			// Se realizada el llamado a la entidad la cual est  seteada directamente el la vista xml ( TiOcReleaseSet)
			//debugger;
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV";
			// ODATA URL
			var oDModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oDModel.setUseBatch(false);
			oDModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oDModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			// Se insertan los datos a la tabla de log con los datos seleccionados
			var oTable = this.byId("table2");
			oTable.setModel(oDModel);
			oTable.getBinding("items");
		},

		//Bloque para variantes de visualizaci n	 	
		/**
		 *@memberOf zsolped.controller.Worklist
		 */
		onVariantChange: function (oEvent) {
			//This code was generated by the layout editor.
			this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");

			this._Variant = sap.ui.xmlfragment("zsolped.view.Variant", this);
			this.getView().addDependent(this._Variant);
			// forward compact/cozy style into Dialog
			this._Variant.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.variantHelper.setLastState();
			this._Variant.attachEvent("beforeOpen", this.onOpenVar.bind(this));
			this._Variant.open();
			this._oList = sap.ui.getCore().byId("VariantList");
			this.onGroup();

		},

		onAceptarVariant: function (oEvent) {
			this._Variant.close();
			this._Variant.destroy();
		},
		onCerrarVariant: function (oEvent) {
			this._Variant.close();
			this.variantHelper.refreshLastState();
			this._Variant.destroy();
		},
		onSelectAll: function (oEvent) {
			var aItems = sap.ui.getCore().byId("VariantList").getItems();
			var aSelected = aItems.filter(function (oItem) {
				return oItem.getSelected();
			});
			if (aSelected.length > 0) {
				var bSelected = false;
			} else {
				var bSelected = true;
			}
			for (var i = 0; i < aItems.length; i++) {
				aItems[i].setSelected(bSelected);
			}
		},

		onSearchVariant: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var oBinding = sap.ui.getCore().byId("VariantList").getBinding("items");
			if (sQuery) {
				oBinding.filter([new Filter("ColumnText", sap.ui.model.FilterOperator.Contains, sQuery)]);
			} else {
				oBinding.filter([]);
			}
		},

		onPressFiltro: function () {
			//This code was generated by the layout editor.
			this.getView().byId("idFacetFilter").openFilterDialog();
		},
		handleConfirm: function (oEvent) {
			var oFacetFilter = oEvent.getSource();
			this._filterModel(oFacetFilter);
		},
		_filterModel: function (oFacetFilter) {
			//debugger;
			var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
				return oList.getSelectedItems().length;
			});

			var aFilters = [];
			//var aFilterHoja = [];
			if (mFacetFilterLists.length) {
				for (var i = 0; i < mFacetFilterLists.length; i++) {
					//					if (mFacetFilterLists[i].getKey() !== "negocio") {
					var aFilter = this._BuildFilters(mFacetFilterLists[i]);
					aFilters = aFilters.concat(aFilter);
					//					} else {
					//						aFilterHoja = this._BuildFilters(mFacetFilterLists[i]);
					//					}
				}

				/*				if (this.getView().byId("HAS").getSelectedItem()) {
									aFilters.push(new Filter("HAS", "EQ", this.getView().byId("HAS").getSelectedItem().getKey()));
								}
								if (this.getView().byId("Anio2").getSelectedItem()) {
									aFilters.push(new Filter("Ejercicio2", "EQ", this.getView().byId("Anio2").getSelectedItem().getKey()));
								}*/
				this._applyFilter(aFilters);
				//this._applyFilterSociedad(aFilterHoja);

			} else {
				this._applyFilter(aFilters);
			}
		},

		_applyFilter: function (aFilters) {
			if (this.getView().byId("preq_no").getSelectedItems().length ||
				this.getView().byId("preq_item").getSelectedItems().length ||
				this.getView().byId("material").getSelectedItems().length ||
				//this.getView().byId("cantidad").getSelectedItems().length ||
				this.getView().byId("descripcion").getSelectedItems().length ||
				this.getView().byId("grupo_compras").getSelectedItems().length ||
				this.getView().byId("usuario").getSelectedItems().length ||
				this.getView().byId("solicitante").getSelectedItems().length ||
				this.getView().byId("fecha_sol").getSelectedItems().length ||
				this.getView().byId("centro").getSelectedItems().length ||
				this.getView().byId("org_compras").getSelectedItems().length ||
				this.getView().byId("rel_cod").getSelectedItems().length ||
				this.getView().byId("rel_strat").getSelectedItems().length ||
				this.getView().byId("frgxt").getSelectedItems().length ||
				this.getView().byId("provFijo").getSelectedItems().length ||
				this.getView().byId("provDeseado").getSelectedItems().length
			)

				this.getView().byId("table").getBinding("items").filter(aFilters);
			//	this.updateMonthTextsFilters();

			else {
				//		sap.m.MessageToast.show("Complete los filtros obligatorios");
				var oModel = this.getView().getModel();
				var table = this.getView().byId("table");
				var aItems = table.getItems();

				var filtro = oModel.getProperty("cod", aItems[0].getBindingContext());
				var filtercod = new sap.ui.model.Filter("cod", sap.ui.model.FilterOperator.EQ, filtro);
				this.getView().byId("table").getBinding("items").filter(filtercod);

			}

		},

		_BuildFilters: function (oList) {
			//debugger;

			//siempre debe llevar el código de liberación en el filtro que sea
			var oTable = this.byId("table"),
				oModel = oTable.getModel(),
				atitems = oTable.getItems();

			var aItems = oList.getItems();
			var aFilters = [];
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getSelected()) {
					//aFilters.push(new Filter(oList.getKey(), "EQ", aItems[i].getKey()));
					aFilters.push(new Filter(oList.getKey(), "EQ", aItems[i].getBindingContext().getProperty(oList.getKey())));
					aFilters.push(new Filter("cod", "EQ", oModel.getProperty("cod", atitems[0].getBindingContext())));
				}
			}
			return aFilters;
		},

		handleFacetFilterReset: function (oEvent) {

			//	this.getView().byId("ListaNotif").getBinding("items").filter([]);
			var aList = oEvent.getSource().getLists();
			//		this.DataHandler.setFacetFilters([]);
			for (var i = 0; i < aList.length; i++) {
				aList[i].removeSelectedKeys();
			}
		},

		/*		updateMonthTextsFilters: function() {
					var oModel = this.getView().getModel("Titles");
					if (this.getView().byId("Mes1").getSelectedItems().length !== 0) {
						oModel.setProperty("/Mes1", this.getView().byId("Mes1").getSelectedItems()[0].getText());
					} else {
						oModel.setProperty("/Mes1", "");
					}
					if (this.getView().byId("Mes2").getSelectedItems().length !== 0) {
						oModel.setProperty("/Mes2", this.getView().byId("Mes2").getSelectedItems()[0].getText());
					} else {
						oModel.setProperty("/Mes2", "");
					}
					if (this.getView().byId("Anio1").getSelectedItems().length !== 0) {
						oModel.setProperty("/Anio1", this.getView().byId("Anio1").getSelectedItems()[0].getText());
					} else {
						oModel.setProperty("/Anio1", "");
					}
					if (this.getView().byId("Anio2").getSelectedItems().length !== 0) {
						oModel.setProperty("/Anio2", this.getView().byId("Anio2").getSelectedItems()[0].getText());
					} else {
						oModel.setProperty("/Anio2", "");
					}
				},*/

		onGroup: function (oEvent) {
			//debugger;
			//	var sKey = oEvent.getSource().getSelectedItem().getKey(),
			var aSorters = this._oGroupSortState.group("Group");
			this._applyGroupSort(aSorters);
		},
		createGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},
		_applyGroupSort: function (aSorters) {
			// agregado
			//debugger;

			this._oList.getBinding("items").sort(aSorters);

		},

		/*		_applyFilterSociedad: function(aFilters) {
					if (this._NegocioChanged) {
						this.getView().byId("Sociedad").getBinding("items").filter(aFilters);
						this.getView().byId("Sociedad").getBinding("items").attachEventOnce("dataReceived", function() {
							var aItems = this.getView().byId("Sociedad").getItems();
							for (var i = 0; i < aItems.length; i++) {
								aItems[i].setSelected(true);

							}
							this.getView().byId("idFacetFilter").fireConfirm();
							this._NegocioChanged = false;
						}.bind(this));
					}
				},*/

		onHASChange: function (oEvent) {
			//	debugger;
			//al realizar una nueva selecci n de HAS y otros  se limpiando todos los otros filtros			
			//this._HasChanged = true;
			//var aItems = this.getView().byId("usuario").getItems();
			//for (var i = 0; i < aItems.length; i++) {
			//	aItems[i].setSelected(false);
			//}
		},

		oncodChange: function (oEvent) {
			//debugger;
			//al realizar una nueva selecci n de HAS se limpiando todos los otros filtros			
			//this._HasChanged = true;
			//var aItems = this.getView().byId("cod").getItems();
			/*			debugger;
						var aItems = this.byId("cod").getItems();
						for (var i = 0; i < aItems.length; i++) {
							aItems[i].setSelected(true);
						}*/
		},

		onGuardarVariant: function (oEvent) {
			this.oPopUp = new sap.m.Dialog({
				title: "Creación de Variante"
			});
			var sID = "";
			var sText = "";
			if (sap.ui.getCore().byId("VariantesC").getSelectedItem()) {
				sID = sap.ui.getCore().byId("VariantesC").getSelectedItem().getKey();
				sText = sap.ui.getCore().byId("VariantesC").getSelectedItem().getText();
			}
			this.oPopUp.addContent(new sap.m.Input({
				placeholder: "ID Variante",
				id: "IDVAR",
				value: sID
			}));
			this.oPopUp.addContent(new sap.m.Input({
				placeholder: "Texto Variante",
				id: "TVAR",
				value: sText
			}));
			this.oPopUp.addButton(new sap.m.Button({
				width: "auto",
				text: "Aceptar",
				type: sap.m.ButtonType.Accept,
				press: this.onGAceptar.bind(this)
			}));
			this.oPopUp.addButton(new sap.m.Button({
				width: "auto",
				text: "Cancelar",
				type: sap.m.ButtonType.Reject,
				press: this.onGCancelar.bind(this)
			}));
			this.oPopUp.open();
		},
		onGAceptar: function (oEvent) {
			var aCampos = this.getView().getModel("Variante").getData().filter(function (oVar) {
				//var aCampos = this.getView().getModel().getProperty("/"); //.filter(function(oVar) {
				return oVar.Visible === true;
			});

			//			this.getView().getModel("VariantesG").create("/VariantesGSet", {
			this.getView().getModel().create("/VariantesSet", {
				App: "ZSOLPED_APP",
				Variante: sap.ui.getCore().byId("IDVAR").getValue(),
				Texto: sap.ui.getCore().byId("TVAR").getValue()
			});
			//			this.getView().getModel("VariantesG").setDeferredGroups(["A1"]);
			this.getView().getModel().setDeferredGroups(["A1"]);
			for (var i = 0; i < aCampos.length; i++) {

				this.getView().getModel().create("/CamposVarianteSet", {
					App: "ZSOLPED_APP",
					Variante: sap.ui.getCore().byId("IDVAR").getValue(),
					Campo: aCampos[i].ColumnID
				}, {
					groupId: "A1"
				});
			}
			//this.getView().getModel("VariantesG").submitChanges({
			this.getView().getModel().submitChanges({
				success: function () {

					//se refresca la lista de variantes	
					this.updatelistVariant("1");

					sap.m.MessageToast.show("Se guardo la variante correctamente", {
						duration: 3000
					});

					sap.ui.getCore().byId("VariantesC").setSelectedKey(sap.ui.getCore().byId("IDVAR").getValue());
					this.oPopUp.close();
					this.oPopUp.destroy();
				}.bind(this)
			});

		},
		onGCancelar: function (oEvent) {
			this.oPopUp.close();
			this.oPopUp.destroy();
		},

		onVariantesChange: function (oEvent) {

			// agregado
			this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");

			var sVariante = oEvent.getParameters().selectedItem.getKey();
			//var sPath = this.getView().getModel("VariantesG").createKey("/VariantesSet", {
			var sPath = this.getView().getModel().createKey("/VariantesSet", {
				App: "ZSOLPED_APP",
				Variante: sVariante
			});

			sPath += "/CamposVariante";
			//this.getView().getModel("VariantesG").read(sPath, {
			this.getView().getModel().read(sPath, {
				success: function (oData) {
					var DVariantes = oData.results;
					var Variantes = this.getView().getModel("Variante").getData();
					for (var i = 0; i < Variantes.length; i++) {
						aEnc = [];
						var aEnc = DVariantes.filter(function (DVar) {
							return DVar.Campo === Variantes[i].ColumnID;
						});
						if (aEnc.length > 0) {
							Variantes[i].Visible = true;
						} else {
							Variantes[i].Visible = false;
						}
					}
					this.getView().getModel("Variante").setData(Variantes);
				}.bind(this)
			});
		},

		onFijarVariante: function (oEvent) {
			if (sap.ui.getCore().byId("VariantesC").getSelectedItem().getKey()) {
				//			this.getView().getModel("VariantesG").create("/VarianteUsuarioSet", {
				this.getView().getModel().create("/VarianteUsuarioSet", {
					App: "ZSOLPED_APP",
					Variante: sap.ui.getCore().byId("VariantesC").getSelectedItem().getKey()
				}, {
					success: function () {
						sap.m.MessageToast.show("Se fijo correctamente la variante");
					}
				});
			}
		},

		setLastPeriodFilters: function (sMonth, sYear) {
			var aLists = this.getView().byId("idFacetFilter").getLists();
			var aListPer2 = aLists.filter(function (oList) {
				return oList.getKey() === "Periodo2";
			});
			var aItemsPer2 = aListPer2[0].getItems();
			for (var i = 0; i < aItemsPer2.length; i++) {
				if (aItemsPer2[i].getKey() === sMonth) {
					aItemsPer2[i].setSelected(true);
				}
			}
			var aListAnio2 = aLists.filter(function (oList) {
				return oList.getKey() === "Ejercicio2";
			});
			var aItemsAnio2 = aListAnio2[0].getItems();
			for (var i = 0; i < aItemsAnio2.length; i++) {
				if (aItemsAnio2[i].getKey() === sYear) {
					aItemsAnio2[i].setSelected(true);
				}
			}
		},
		onPeriodChange: function (oEvent) {
			var sMonth = oEvent.getParameters().listItem.getKey();
			var sYear = parseInt(this.getView().byId("Anio1").getSelectedItem().getKey()) - 1;
			this.setLastPeriodFilters(sMonth, sYear.toString()); //	this.getView().byId("idFacetFilter").fireConfirm();
		},
		onEjerChange: function (oEvent) {
			var sYear = parseInt(oEvent.getParameters().listItem.getKey()) - 1;
			var sMonth = parseInt(this.getView().byId("Mes1").getSelectedItem().getKey());
			this.setLastPeriodFilters(sMonth, sYear.toString()); //	this.getView().byId("idFacetFilter").fireConfirm();
		},
		/**
		 *@memberOf zreporteventasacum.controller.Worklist
		 */
		onGuardarVarianteEjec: function (oEvent) {

			this._VariantEjec = sap.ui.xmlfragment("zsolped.view.VariantEjec", this);
			this.getView().addDependent(this._VariantEjec);
			// forward compact/cozy style into Dialog
			this._VariantEjec.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this._VariantEjec.open();
		},

		onSaverVariantEjec: function (oEvent) {

			if (!sap.ui.getCore().byId("NombreVarEjec").getValue() || !sap.ui.getCore().byId("TextVarEjec").getValue()) {
				sap.m.MessageBox.error("Por favor ingrese ID/Texto de variante");

			} else if (sap.ui.getCore().byId("NombreVarEjec").getValue() && sap.ui.getCore().byId("TextVarEjec").getValue()) {
				//	this.getView().getModel("VariantesEjec").create("/VariantesSet", {
				this.getView().getModel().create("/VariantesSet", {
					App: "ZSOLPED_APP",
					Variante: sap.ui.getCore().byId("NombreVarEjec").getValue(),
					Texto: sap.ui.getCore().byId("TextVarEjec").getValue()
				});

				// Esta era la lógica original, se deja ahora que siempre sea una variante ( ejecución y variante)
				//	this.getView().getModel("VariantesEjec").setDeferredGroups(["A1"]);
				this.getView().getModel().setDeferredGroups(["A1"]);
				var aFiltros = this.getView().getModel("DFiltros").getData().filter(function (oFiltro) {
					return oFiltro.Selected === true;
				});
				var aLists = this.getView().byId("idFacetFilter").getLists();
				for (var i = 0; i < aFiltros.length; i++) {
					var aFilterSel = aLists.filter(function (oList) {
						return oList.getKey() === aFiltros[i].Key;
					});
					var aItems = aFilterSel[0].getItems();
					for (var i2 = 0; i2 < aItems.length; i2++) {
						if (aItems[i2].getSelected()) {
							//this.getView().getModel("VariantesEjec").create("/CamposVariantesSet", {
							this.getView().getModel().create("/CamposVarianteSet", {
								App: "ZSOLPED_APP",
								Variante: sap.ui.getCore().byId("NombreVarEjec").getValue(),
								Campo: aFilterSel[0].getKey(),
								//Valor: aItems[i2].getKey()
							}, {
								groupId: "A1"
							});
						}
					}
				}

				//inicio nuevo
				/*debugger;
								//var aCampos = this.getView().getModel("Variante").getData().filter(function(oVar) {
								var aCampos =  this.getView().getModel("Variante").getData().filter(function(oVar) {&nbsp;
									return oVar.Visible === true;
								});

								//			this.getView().getModel("VariantesG").setDeferredGroups(["A1"]);
								this.getView().getModel().setDeferredGroups(["A1"]);
								for (var i = 0; i < aCampos.length; i++) {
									//				this.getView().getModel("VariantesG").create("/CamposVariantesSet", {
									this.getView().getModel().create("/CamposVarianteSet", {
										App: "ZHAS_APP",
										Variante: sap.ui.getCore().byId("IDVAR").getValue(),
										Campo: aCampos[i].ColumnID
									}, {
										groupId: "A1"
									});
								}*/
				//fin nuevo				

				//this.getView().getModel("VariantesEjec").submitChanges({
				this.getView().getModel().submitChanges({
					groupId: "A1",
					success: function (oEvent) {

						sap.m.MessageToast.show("Se guardo exitosamente la variante");
						sap.ui.getCore().byId("VariantesC").setSelectedKey(sap.ui.getCore().byId("IDVAR").getValue());
						this._VariantEjec.close();
						this._VariantEjec.destroy();

					}.bind(this)

				});
			}
		},

		onCerrarVariantEjec: function (oEvent) {
			this._VariantEjec.close();
			this._VariantEjec.destroy();
		},

		onVariantesejecChange: function (oEvent) {
			var oSelItem = oEvent.getParameters().selectedItem;
			var aItems2 = this.getView().byId("preq_no").getItems();
			var aFilters = [];
			for (var i3 = 0; i3 < aItems2.length; i3++) {

				aItems2[i3].setSelected(true);
				aFilters.push(new Filter("preq_no", "EQ", aItems2[i3].getKey()));
			}
			this.getView().byId("preq_no").fireSelectionChange();
			this._HasChanged = false;
			this.getView().byId("Sociedad").getBinding("items").filter(aFilters);
			this.getView().byId("Sociedad").getBinding("items").attachEventOnce("dataReceived", function () {

				//	var sPath = this.getView().getModel("VariantesEjec").createKey("/VariantesSet", {
				var sPath = this.getView().getModel("VariantesEjec").createKey("/VariantesJSet", {
					App: "ZSOLPED_APP",
					Variante: oSelItem.getKey()
				});
				sPath += "/CamposVarianteJ";
				this.getView().getModel().read(sPath, {
					success: function (oData) {
						var oFacet = this.getView().byId("idFacetFilter");
						var aLists = oFacet.getLists();
						var bNegociosChanged = false;

						for (var i = 0; i < aLists.length; i++) {
							var aItems = aLists[i].getItems();
							var aDSel = oData.results.filter(function (oResult) {
								return oResult.Campo === aLists[i].getKey();
							});
							for (var i2 = 0; i2 < aItems.length; i2++) {
								var aSelect = aDSel.filter(function (oDSel) {
									return oDSel.Valor === aItems[i2].getKey();
								});
								if (aDSel.length > 0) {
									if (aSelect.length > 0) {
										aItems[i2].setSelected(true);
										if (aLists[i].getKey() === "Negocio") {
											this.getView().byId("Negocio").fireSelectionChange();

										}

									} else {
										aItems[i2].setSelected(false);
									}
								}
							}
						}
						this.getView().byId("idFacetFilter").fireConfirm();
					}.bind(this)
				});
			}.bind(this));
		},
		/**
		 *@memberOf zreporteventasacum.controller.Worklist
		 */
		onFijarVarianteEjec: function () {
			if (this.getView().byId("VariantesCEjec").getSelectedItem().getKey()) {

				this.getView().getModel().create("/VarianteUsuarioJSet", {
					App: "ZSOLPED_APP",
					Variante: this.getView().byId("VariantesCEjec").getSelectedItem().getKey()
				}, {
					success: function () {
						sap.m.MessageToast.show("Se fijo correctamente la variante");
					}
				});
			}
		},
		setInitialVariant: function (value) {

			if (value === "J") {
				this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");
			};

			//Solo se setea la variante inicial si es que existen variantes para el usuario cargas
			// en el combobox VariantesCC
			var aItems2 = this.getView().byId("VariantesCC").getItems();
			var Largo = aItems2.length;

			if (Largo > 0) {

				/////(///	var sPath = this.getView().getModel("VariantesG").createKey("/VarianteUsuarioSet", {
				var sPath = this.getView().getModel().createKey("/VarianteUsuarioSet", {
					App: "ZSOLPED_APP",
					Uname: "G"
				});
				//			this.getView().getModel("VariantesG").read(sPath, {
				this.getView().getModel().read(sPath, {
					async: false,
					success: function (oData, response) {
						var sVariante = oData.Variante;
						this.getView().byId("VariantesCC").setSelectedKey(sVariante);

						//					var sPath = this.getView().getModel("VariantesG").createKey("/VariantesSet", {
						var sPath = this.getView().getModel().createKey("/VariantesSet", {
							App: "ZSOLPED_APP",
							Variante: sVariante
						});
						sPath += "/CamposVariante";
						//					this.getView().getModel("VariantesG").read(sPath, {
						this.getView().getModel().read(sPath, {
							async: false,
							success: function (oData, response) {
								var DVariantes = oData.results;

								/*							if (value === "I") {
																this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");
															};*/

								var Variantes = this.getView().getModel("Variante").getData();
								for (var i = 0; i < Variantes.length; i++) {
									aEnc = [];
									var aEnc = DVariantes.filter(function (DVar) {
										return DVar.Campo === Variantes[i].ColumnID;
									});
									if (aEnc.length > 0) {
										Variantes[i].Visible = true;
									} else {
										Variantes[i].Visible = false;
									}
								}
								this.getView().getModel("Variante").setData(Variantes);
							}.bind(this),
							error: {

							}
						});
					}.bind(this)
				});

			}

		},

		setInitialVariantEjec: function () {
			var aFilters = [];
			//var aItems2 = this.getView().byId("Negocio").getItems();
			var aItems2 = this.getView().byId("preq_no").getItems();

			for (var i3 = 0; i3 < aItems2.length; i3++) {

				aItems2[i3].setSelected(true);
				//aFilters.push(new Filter("Negocio", "EQ", aItems2[i3].getKey()));
				aFilters.push(new Filter("preq_no", "EQ", aItems2[i3].getKey()));
			}

			var aItems2 = this.getView().byId("fecha_sol").getItems();

			for (var i3 = 0; i3 < aItems2.length; i3++) {

				aItems2[i3].setSelected(true);
				//aFilters.push(new Filter("Negocio", "EQ", aItems2[i3].getKey()));
				aFilters.push(new Filter("fecha_sol", "EQ", aItems2[i3].getKey()));
			}

			/*			

						//this.getView().byId("Negocio").fireSelectionChange();
						this.getView().byId("hoja").fireSelectionChange();

						this._HasChanged = false;

						//this.getView().byId("Sociedad").getBinding("items").filter(aFilters);
						this.getView().byId("has").getBinding("items").filter(aFilters);

						//			this.getView().byId("Sociedad").getBinding("items").attachEventOnce("dataReceived", function() {
						this.getView().byId("has").getBinding("items").attachEventOnce("dataReceived", function() {
							var sPath = this.getView().getModel("VariantesEjec").createKey("/VarianteUsuarioSet", {
								App: "ZHAS_APP",
								Uname: "G"
							});
							this.getView().getModel("VariantesEjec").read(sPath, {
								success: function(oData) {
									var sVariante = oData.Variante;
									this.getView().byId("VariantesCEjec").setSelectedKey(sVariante);
									var sPath = this.getView().getModel("VariantesEjec").createKey("/VariantesSet", {
										App: "ZHAS_APP",
										Variante: sVariante
									});
									sPath += "/CamposVariantes";
									this.getView().getModel("VariantesEjec").read(sPath, {
										success: function(oData) {
											var oFacet = this.getView().byId("idFacetFilter");
											var aLists = oFacet.getLists();
											var bNegociosChanged = false;
											for (var i = 0; i < aLists.length; i++) {
												var aItems = aLists[i].getItems();
												var aDSel = oData.results.filter(function(oResult) {
													return oResult.Campo === aLists[i].getKey();
												});
												for (var i2 = 0; i2 < aItems.length; i2++) {
													var aSelect = aDSel.filter(function(oDSel) {
														return oDSel.Valor === aItems[i2].getKey();
													});
													if (aDSel.length > 0) {
														if (aSelect.length > 0) {
															aItems[i2].setSelected(true);
															if (aLists[i].getKey() === "Negocio") {
																this.getView().byId("Negocio").fireSelectionChange();

															}
															// if (aLists[i].getKey() === "Sociedad" && !bNegociosChanged) {
															// 	bNegociosChanged = true;
															// 	var aItems2 = this.getView().byId("Negocio").getItems();
															// 	for (var i3 = 0; i3 < aItems2.length; i3++) {

															// 		aItems2[i3].setSelected(false);
															// 	}

															// }
														} else {
															aItems[i2].setSelected(false);
														}
													}
												}
											}
											this.getView().byId("idFacetFilter").fireConfirm();
										}.bind(this)
									});
								}.bind(this)
							});
						}.bind(this));*/

		},

		onOpenVar: function () {
			sap.ui.getCore().byId("VariantesC").setSelectedKey(this.getView().byId("VariantesCC").getSelectedKey());

		},

		updatelistVariant: function (value) {

			var oCombo = this.byId("VariantesCC");

			// Se realizada el llamado a la entidad la cual est  seteada directamente el la vista xml ( TiHasReleaseSet)
			var sServiceUrl = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV";
			// ODATA URL
			var oDModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, true);
			oDModel.setUseBatch(false);
			oDModel.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
			oDModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			// Se insertan los datos a la tabla de log con los datos seleccionados
			oCombo.setModel(oDModel);
			oCombo.getBinding("items"); //.filter(afilters);

			if (value === "2") {
				//	this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");
				this.getOwnerComponent().setModel(this.variantHelper.getVariantModel(), "Variante");
			}

			//	var sPath = this.getView().getModel("VariantesG").createKey("/VarianteUsuarioSet", {
			var sPath = this.getView().getModel().createKey("/VarianteUsuarioSet", {
				App: "ZSOLPED_APP",
				Uname: "G"
			});
			//			this.getView().getModel("VariantesG").read(sPath, {
			this.getView().getModel().read(sPath, {
				success: function (oData) {
					var sVariante = oData.Variante;
					this.getView().byId("VariantesCC").setSelectedKey(sVariante);

					//					var sPath = this.getView().getModel("VariantesG").createKey("/VariantesSet", {
					var sPath = this.getView().getModel().createKey("/VariantesSet", {
						App: "ZSOLPED_APP",
						Variante: sVariante
					});

					sPath += "/CamposVariante";

					//					this.getView().getModel("VariantesG").read(sPath, {
					this.getView().getModel().read(sPath, {
						success: function (oData) {
							var DVariantes = oData.results;
							var Variantes = this.getView().getModel("Variante").getData();

							for (var i = 0; i < Variantes.length; i++) {
								aEnc = [];
								var aEnc = DVariantes.filter(function (DVar) {
									return DVar.Campo === Variantes[i].ColumnID;
								});
								if (aEnc.length > 0) {
									Variantes[i].Visible = true;
								} else {
									Variantes[i].Visible = false;
								}
							}
							this.getView().getModel("Variante").setData(Variantes);
						}.bind(this)
					});
				}.bind(this)
			});

		},

		onExportExcel: function () {

			var oModel = this.getView().byId("table").getModel();

			jQuery.sap.require("sap.ui.core.util.Export");
			jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
			var oExport = new sap.ui.core.util.Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new sap.ui.core.util.ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: oModel,

				// binding information for the rows aggregation&nbsp;
				rows: {
					path: "/TiSolpedSet"
				},

				// column definitions with column name and binding info for the content
				columns: [{
					name: "Solped",
					template: {
						content: {
							path: "preq_no"
						}
					}
				}, {
					name: "Pos. Sol. Pedido",
					template: {
						content: {
							path: "preq_item"
						}
					}
				}, {
					name: "Material",
					template: {
						content: {
							path: "material"
						}
					}
				}, {
					name: "Desc. material",
					template: {
						content: {
							path: "materialt"
						}
					}
				}, {
					name: "Cantidad",
					template: {
						content: {
							parts: ["cantidad"],
							formatter: function (value) {
								if (value) {
									return "    " + this.formatter.unidadMil(value);
								} else {
									return "0";
								}
							}.bind(this)
						}
					}
				}, {
					name: "Descripcion",
					template: {
						content: {
							path: "descripcion"
						}
					}
				}, {
					name: "Grupo Compras",
					template: {
						content: {
							path: "grupo_compras"
						}
					}
				}, {
					name: "Desc. Grupo Compras",
					template: {
						content: {
							path: "grupo_comprast"
						}
					}
				}, {
					name: "Creado Por",
					template: {
						content: {
							path: "usuario"
						}
					}
				}, {
					name: "Solicitante",
					template: {
						content: {
							path: "solicitante"
						}
					}
				}, {
					name: "Fecha Solicitud",
					template: {
						content: {
							path: "fecha_sol"
						}
					}
				}, {
					name: "Centro",
					template: {
						content: {
							path: "centro"
						}
					}
				}, {
					name: "Org. De Compra",
					template: {
						content: {
							path: "org_compras"
						}
					}
				}, {
					name: "Grupo Lib.",
					template: {
						content: {
							path: "rel_cod"
						}
					}
				}, {
					name: "Estrategia Lib.",
					template: {
						content: {
							path: "rel_strat"
						}
					}
				}, {
					name: "Desc. Estrategia Lib.",
					template: {
						content: {
							path: "frgxt"
						}
					}
				}, {
					name: "Codigo Lib.",
					template: {
						content: {
							path: "cod"
						}
					}
				}, {
					name: "Prov. Fijo",
					template: {
						content: {
							path: "descProvFijo"
						}
					}
				}, {
					name: "Prov. Deseado",
					template: {
						content: {
							path: "descProvDeseado"
						}
					}
				}]
			});

			var vTitleExcel = "Listado Solicitudes de Pedidos";
			oExport.saveFile(vTitleExcel).always(function () {
				this.destroy();
			});
		},

		onDetalleAnexos: function (oEvent) {
			oThis.obtenerInfoAnexos(oEvent);
		},

		obtenerInfoAnexos: function (oEvent) {

			var aFiltros = [];
			var Title = "";
			var bindingContext = oEvent.getSource().getBindingContext();
			oThis.Anexodoc = "";
			oThis.Anexodoc = bindingContext.getProperty("preq_no");
			Title = "Detalle de Anexos para Solped: " + oThis.Anexodoc;
			aFiltros.push(new sap.ui.model.Filter("Solped", sap.ui.model.FilterOperator.EQ, oThis.Anexodoc));
			oThis.getView().getModel().read("/AnexoListadoSet", {
				filters: aFiltros,
				success: function (oData) {
					var oTableSelectDialog = new sap.m.TableSelectDialog({
						noDataText: "Sin anexos",
						title: Title,
						columns: [
							new sap.m.Column({
								header: new sap.m.Label({
									text: "Nombre"
								})
							}),
							new sap.m.Column({
								header: new sap.m.Label({
									text: "Creador"
								})
							}),
							new sap.m.Column({
								header: new sap.m.Label({
									text: "Fecha"
								})
							})
						]
					});

					var oTabla = oTableSelectDialog._oTable;
					oTabla.setGrowing(false);
					oTabla.removeAllItems();
					oThis.TableAnexos = [];
					oThis.TableAnexos = oTableSelectDialog;
					for (var i = 0; i < oData.results.length; i++) {

						var oItem = new sap.m.ColumnListItem({
							cells: [new sap.m.ObjectAttribute({
								text: oData.results[i].NombreArchivo,
								active: true,
								press: function (oEvent) {
									oThis.onObtenerAnexo(oEvent);
								}
							}), new sap.m.Text({
								text: oData.results[i].Creador
							}), new sap.m.Text({
								text: oData.results[i].FechaCreacion
							}), new sap.m.Text({
								text: oData.results[i].Anexo,
								visible: false
							}), new sap.m.Text({
								text: oData.results[i].Extension,
								visible: false
							})]
						});
						oTabla.addItem(oItem);
					}

					oTabla.setMode("None");
					oTableSelectDialog._oCancelButton.setText("Cancelar");
					oTableSelectDialog._oSearchField.setVisible(false);
					oTableSelectDialog.open();
				}
			});

		},

		onObtenerAnexo: function (oEvent) {
			var iDClick = oEvent.getSource().getParent().getId();
			var Anexo = "";
			var Extension = "";
			var Nombre = "";
			var lv_path = "";
			for (var i = 0; i < this.TableAnexos.getItems().length; i++) {
				var value = this.TableAnexos.getItems()[i].getId();
				if (value === iDClick) {
					Nombre = this.TableAnexos.getItems()[i].getCells()[0].getText();
					Anexo = this.TableAnexos.getItems()[i].getCells()[3].getText();
					Extension = this.TableAnexos.getItems()[i].getCells()[4].getText();
					break;
				}
			}

			if (Anexo) {
				var oServicio = "/sap/opu/odata/sap/ZSOLPED_SERV_SRV/";
				if (Extension === "HTM" || Extension === "HTML") {
					lv_path = Anexo;
					window.open(lv_path, "_system");
				} else if (Extension === "TEXT") {
					if (!this.dialogNota) {
						this.dialogNota = sap.ui.xmlfragment("zsolped.view.Nota2", this);
						var i18nModel = new sap.ui.model.resource.ResourceModel({
							bundleUrl: "i18n/i18n.properties"
						});
						this.dialogNota.setModel(i18nModel, "i18n");
					}
					sap.ui.getCore().byId("_iNotaAdj2").setValue(Anexo);
					this.dialogNota.open();
				} else {
					lv_path = oServicio + "AnexoSet(NombreAnexo='" + Anexo + "')/$value//";
					//window.open(lv_path, "_system");
					$.get(lv_path, function (data) {
						var a = document.createElement("a");
						a.href = lv_path;
						a.download = Nombre;
						a.click();
					});
				}
			}
		},

		onCancelarNota: function (oEvent) {
			sap.ui.getCore().byId("_iNotaAdj2").setValue("");
			this.dialogNota.close();
		}

	});
});