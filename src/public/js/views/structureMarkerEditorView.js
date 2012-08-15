define([ 'text!templates/structureMarkerEditorView.html', 'views/editBibJsonView2' ], function(template,
		EditBibJsonView) {

	var presenter;
	var state;
	var bibJsonEditor;

	return Backbone.View.extend({

		initialize : function() {
			_.bindAll(this);
			presenter = this.options.presenter;

		},

		render : function() {
			$(this.el).html(template);
			bibJsonEditor = new EditBibJsonView({
				el : $('#bibJsonEditorComponent', this.el),
				listener : function() {
					//
				}
			});
			bibJsonEditor.render();
			$('button', this.el).button();
			return this;
		},

		setValue : function(marker) {
			state = JSON.parse(JSON.stringify(marker));
			$('#label', this.el).val(state.label);
			$('#indexLevel', this.el).val(state.indexLevel);
			$('#discoverable', this.el).val(state.discoverable === true ? 1 : 0);
			bibJsonEditor.setBibJson(state.bibJson);
		},

		getValue : function() {
			state.discoverable = (parseInt($('#discoverable', this.el).val()) === 1);
			state.indexLevel = parseInt($('#indexLevel', this.el).val());
			state.label = $('#label', this.el).val();
			return state;
		}

	});

});