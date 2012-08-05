define([ 'text!templates/createPasswordView.html' ], function(layoutTemplate) {

	return Backbone.View.extend({

		intialize : function() {
			_.bindAll(this);

		},

		render : function() {
			$('.main').html(layoutTemplate);
			return this;
		},
		
		showMessage : function(response) {
			$('#messages').html(
					'<div class="alert alert-block ' + (response.success ? 'alert-success' : 'alert-error')
							+ '"><a class="close" data-dismiss="alert" href="#">x</a>' + response.message + '</div>');
			$(".alert").alert();
		},
		
		clearMessage : function() {
			$('#messages').empty();
		}

	});

});