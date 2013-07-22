// Gets setup information from Islandora.
//var writer;
//$.noConflict(true);
$(function() {
				
				PID = null;
				cwrc_params = {};
				writer = null;
				$.ajax({
					url: 'http://apps.testing.cwrc.ca/editor/documents/info/projectname',
					success: function(data, status, xhr) {
						writer = new Writer({
							project: data,
							delegator: Delegator
						});
						writer.init();
						writer.layout.close('east');
					},
					error: function() {
						writer = new Writer({
							delegator: Delegator
						});
						writer.init();
						writer.layout.close('east');
					}
				});
			});
