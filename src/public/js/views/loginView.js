define([ 'text!templates/loginView.html' ], function(layoutTemplate) {
	return Backbone.View.extend({

		el : '.main',

		intialize : function() {
			_.bindAll(this);
			this.presenter = this.options.presenter;
		},

		render : function() {
			$(this.el).html(layoutTemplate);
		},

		getValue : function() {
			return {
				email : $('#email').val(),
				password : $('#password').val()
			};
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