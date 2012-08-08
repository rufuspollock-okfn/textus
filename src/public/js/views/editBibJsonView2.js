/**
 * A lightweight editor over a BibJSON object (or in fact any object, configure by defining the
 * schema)
 */
define([ 'text!templates/editBibJsonView2.html' ], function(template) {

	var state = {};

	var listener = null;
	
	var simple = function(displayName) {
		return {
			name : displayName,
		};
	};

	var sized = function(displayName, size) {
		return {
			name : displayName,
			size : size
		};
	};

	var stringList = function(displayName, itemName) {
		return {
			name : displayName,
			many : true,
			itemName : itemName
		};
	};

	var personList = function(displayName) {
		return {
			name : displayName,
			many : true,
			type : {
				firstname : {
					name : "First Name",
					size : "150px"
				},
				lastname : {
					name : "Last Name",
					size : "150px"
				}
			}
		};
	};

	var schema = {

		title : sized("Title", "300px"),
		year : sized("Year", "80px"),
		author : personList("Author"),
		editor : personList("Editor"),
		booktitle : simple("Book Title"),
		chapter : sized("Chapter", "80px"),
		pages : sized("Pages", "80px"),
		series : simple("Series"),
		link : {
			name : "External Links",
			many : true,
			type : {
				url : {
					name : "URL"
				},
				anchor : {
					name : "Anchor"
				}
			}
		},
		identifier : {
			name : "Identifiers",
			many : true,
			type : {
				id : {
					name : "ID",
					size : "150px"
				},
				type : {
					name : "Type",
					size : "100px"
				},
				url : {
					name : "URL",
					size : "156px"
				}
			}
		}
	};

	/**
	 * Remove empty ('') fields ad lists from the supplied object.
	 */
	var prune = function(b) {
		$.each(b, function(name, value) {
			if ((value instanceof Array && value.length == 0) || (value instanceof Array == false && value == "")) {
				delete b[name];
				console.log("Removed empty property", name);
			}
		});
	};

	var addSchemaPropertyToState = function(key, def) {
		if (!def.type) {
			if (!def.many) {
				state[key] = "";
			} else {
				state[key] = [ "" ];
			}
		} else {

			var newObject = {};
			$.each(def.type, function(subKey, subDef) {
				newObject[subKey] = "";
			});
			if (!def.many) {
				state[key] = newObject;
			} else {
				state[key] = [ newObject ];
			}
		}
	};
	
	var valueChanged = function() {
		if (listener) {
			listener(state);
		}
	};

	return Backbone.View.extend({

		initialize : function() {
			_.bindAll(this);
			if (this.options.bibJson) {
				state = this.options.bibJson;
			}
			if (this.options.listener) {
				listener = this.options.listener;
			}
			prune(state);
		},

		render : function() {

			/* Load the layout */
			$(this.el).html(template);

			/* Stash useful values for use within iterator functions */
			var view = this;
			var addedAddOptions = false;
			var addedFormFields = false;

			$('#editBibJsonForm', this.el).submit(function() {
				return false;
			});

			$.each(schema, function(key, def) {
				if (!state.hasOwnProperty(key)) {
					/* Create an 'add foo' item in the dropdown */
					$('#addOptions', view.el).append(
							"<li><a href='#' id='addOption_" + key + "'>" + def.name + "</a></li>");
					$('#addOption_' + key, view.el).click(function() {
						prune(state);
						addSchemaPropertyToState(key, def);
						valueChanged();
						view.render();
						return false;
					});
					addedAddOptions = true;
				} else {
					$('#formFieldSet', view.el).append(
							"<div class='control-group'><label class='control-label'>" + def.name
									+ "</label><div class='controls' id='controlsForKey_" + key + "'></div></div>");
					if (def.many) {
						var tableId = 'controlsForKey_' + key + '_table';
						$('#controlsForKey_' + key, view.el).append(
								"<table class='textus-table' id='" + tableId + "'></table>");
						if (!def.type) {
							/* Simple control table */
							$.each(state[key], function(index, value) {
								var id = 'controlsForKey_' + key + '_' + index;
								var deleteTd = "<td><a class='btn btn-danger' href='#' id='" + id
										+ "_delete'>X</a></td>";
								var sizeStyle = def.size ? " style='width:" + def.size + "' " : "";
								var fieldTd = "<td><input " + sizeStyle + "type='text' value='" + value + "' id='" + id
										+ "' placeholder='" + (def.itemName ? def.itemName : def.name) + "'/></td>";
								$('#' + tableId, view.el).append("<tr>" + deleteTd + fieldTd + "</tr>");
								var input = $('#' + id, view.el);
								input.keyup(function() {
									console.log(key, index, input.val());
									state[key][index] = input.val();
									valueChanged();
								});
								$('#' + id + '_delete', view.el).click(function() {
									state[key].splice(index, 1);
									prune(state);
									valueChanged();
									view.render();
									return false;
								});
							});
							$('#controlsForKey_' + key, view.el).append(
									"<a class='btn btn-success' style='vertical-align:top' id='" + tableId
											+ "_addNew'>+</a>");
							$('#' + tableId + '_addNew', view.el).click(function() {
								state[key].push("");
								valueChanged();
								view.render();
								return false;
							});
						} else {
							$.each(state[key], function(index, value) {
								/*
								 * For each value create a new row with the appropriate editors
								 */
								var id = 'controlsForKey_' + key + '_' + index;
								var deleteTd = "<td><a class='btn btn-danger' href='#' id='" + id
										+ "_action_delete'>X</a></td>";
								var rowId = id + '_row';
								$('#' + tableId, view.el).append("<tr id='" + rowId + "'>" + deleteTd + "</tr>");
								$('#' + id + '_action_delete', view.el).click(function() {
									state[key].splice(index, 1);
									prune(state);
									valueChanged();
									view.render();
									return false;
								});
								$.each(def.type, function(subKey, subDef) {
									var sizeStyle = subDef.size ? " style='width:" + subDef.size + "' " : "";
									var editorId = id + "_" + subKey;
									var value = state[key][index][subKey];
									$('#' + rowId, view.el).append(
											"<td><input type='text' " + sizeStyle + "value='" + value
													+ "' placeholder='" + subDef.name + "' id='" + editorId
													+ "'/></td>");
									var input = $('#' + editorId, view.el);
									input.keyup(function() {
										state[key][index][subKey] = input.val();
										valueChanged();
									});
								});
							});
							var columns = 1;
							$.each(def.type, function(subKey, subDef) {
								columns++;
							});
							$('#controlsForKey_' + key, view.el).append(
									"<a style='vertical-align:top' class='btn btn-success' id='" + tableId
											+ "_addNew'>+</a>");
							$('#' + tableId + '_addNew', view.el).click(function() {
								var newObject = {};
								$.each(def.type, function(subKey, subDef) {
									newObject[subKey] = "";
								});
								state[key].push(newObject);
								valueChanged();
								view.render();
								return false;
							});
						}
					} else {
						if (!def.type) {
							/* Simple field, use a text editor */
							var id = 'controlsForKey_' + key + '_editor';
							var value = state[key];
							var sizeStyle = def.size ? " style='width:" + def.size + "' " : "";
							$('#controlsForKey_' + key, view.el).append(
									"<input type='text' " + sizeStyle + "value='" + value + "' placeholder='"
											+ def.name + "' id='" + id + "'/>");
							var input = $('#' + id, view.el);
							input.keyup(function() {
								state[key] = input.val();
								valueChanged();
							});
						} else {
							$.each(def.type, function(subKey, subDef) {
								var id = 'controlsForKey_' + key + '_' + subKey + '_editor';
								var value = state[key][subKey];
								var sizeStyle = subDef.size ? " style='width:" + subDef.size + "' " : "";
								$('#controlsForKey_' + key, view.el).append(
										"<input type='text' " + sizeStyle + "value='" + value + "' placeholder='"
												+ subDef.name + "' id='" + id + "'/><span> </span>");
								var input = $('#' + id, view.el);
								input.keyup(function() {
									state[key][subKey] = input.val();
									valueChanged();
								});
							});
						}
					}
					addedFormFields = true;
				}

			});
			/*
			 * If we added no options to the add.. button put a helper message in there
			 */
			if (!addedAddOptions) {

			}
			/*
			 * If we added no properties to the form, explain how to add some
			 */
			if (!addedFormFields) {
				$('#formFieldSet', view.el).append(
						"<div class='control-group'><div class='controls'><em>"
								+ "Use the 'Add Field' button above to add "
								+ "entries to your bibliographic reference" + "</em></div></div>");
			}

			return this;
		},

		getBibJson : function() {
			return state;
		},

		setBibJson : function(newState) {
			state = newState;
		}

	});

});