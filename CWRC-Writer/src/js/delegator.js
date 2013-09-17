function Delegator(config) {
	var w = config.writer;
	
	var del = {};
	
	/**
	 * @memberOf del
	 * @param params
	 * @param callback
	 */
	del.lookupEntity = function(params, callback) {
		var type = params.type;
		var query = params.query;
		var lookupService = params.lookupService;
		
		if (lookupService == 'project') {
			$.ajax({
				url: cwrc_params['entities_search_callback']+ '/' + query,
				dataType: 'json',
				success: function(data, status, xhr) {
					if ($.isPlainObject(data)) data = [data];
					if (data != null) {
						callback.call(w, data);
					} else {
						callback.call(w, []);
					}
				},
				error: function(xhr, status, error) {
					if (status == 'parsererror') {
						var lines = xhr.responseText.split(/\n/);
						if (lines[lines.length-1] == '') {
							lines.pop();
						}
						var string = lines.join(',');
						var data = $.parseJSON('['+string+']');
						callback.call(w, data);
					} else {
						callback.call(w, null);
					}
				}
			});
		} else if (lookupService == 'viaf') {
			$.ajax({
				url: 'http://viaf.org/viaf/AutoSuggest',
				data: {
					query: query
				},
				dataType: 'jsonp',
				success: function(data, status, xhr) {
					if (data != null && data.result != null) {
						callback.call(w, data.result);
					} else {
						callback.call(w, []);
					}
				},
				error: function() {
					callback.call(w, null);
				}
			});
		}
	};
	
	del.validate = function(callback) {
		console.log('hit delegator validate document');
		var docText = w.fm.getDocumentContent(false);
		var schemaUrl = w.schemas[w.schemaId].url;
		
		var valid = 'pass';
		callback.call(w, valid);
		
//		$.ajax({
//			url: w.baseUrl+'services/validator/validate.html',
//			type: 'POST',
//			dataType: 'XML',
//			data: {
//				sch: schemaUrl,
//				type: 'RNG_XML',
//				content: docText
//			},
//			success: function(data, status, xhr) {
//				if (callback) {
//					var valid = $('status', data).text() == 'pass';
//					callback.call(w, valid);
//				} else {
//					w.validation.showValidationResult(data, docText);
//				}
//			},
//			error: function() {
////				 $.ajax({
////					url : 'xml/validation.xml',
////					success : function(data, status, xhr) {
////						if (callback) {
////							var valid = $('status', data).text() == 'pass';
////							callback(valid);
////						} else {
////							w.validation.showValidationResult(data, docText);
////						}
////					}
////				}); 
//				w.dialogs.show('message', {
//					title: 'Error',
//					msg: 'An error occurred while trying to validate the document.',
//					type: 'error'
//				});
//			}
//		});
	};
	
	/**
	 * Loads a document based on the currentDocId
	 * TODO Move currentDocId system out of CWRCWriter
	 * @param docName
	 */
	del.loadDocument = function(callback) {
		console.log('hit delegator load document');
	    var baseUrl = window.location.protocol+'//'+window.location.host;
	    
		$.ajax({
			url: baseUrl+Drupal.settings.basePath+'islandora/object/' + PID + '/datastream/CWRC/view',
			type: 'GET',
			dataType: 'xml',
			success: function(doc, status, xhr) {
				window.location.hash = '#'+w.currentDocId;
				//w.fm.loadDocumentFromXml(doc);
				callback.call(w, doc);
				writer.layout.enableResizable("east");
			    writer.layout.options.east.resizable = true;
			},
			error: function(xhr, status, error) {
				w.dialogs.show('message', {
					title: 'Error',
					msg: 'An error ('+status+') occurred and '+w.currentDocId+' was not loaded.',
					type: 'error'
				});
				w.currentDocId = null;
			}
		});
	};
	
	/**
	 * Performs the server call to save the document.
	 * @param callback Called with one boolean parameter: true for successful save, false otherwise
	 */
	del.saveDocument = function(callback) {
		console.log('hit delegator save document');
		var docText = w.fm.getDocumentContent(false);
		$.ajax({
			url : window.parent.Drupal.settings.basePath + 'islandora/cwrcwriter/save_data/' + PID,
			type: 'POST',
			dataType: 'text',
			data: {
				"text": docText
			},
			success: function(data, status, xhr) {
				w.editor.isNotDirty = 1; // force clean state
				w.dialogs.show('message', {
					title: 'Document Saved',
					msg: w.currentDocId+' was saved successfully.'
				});
				window.location.hash = '#'+w.currentDocId;
				if (callback) {
					callback.call(w, true);
				}
			},
			error: function() {
				w.dialogs.show('message', {
					title: 'Error',
					msg: 'An error occurred and '+w.currentDocId+' was not saved.',
					type: 'error'
				});
				if (callback) {
					callback.call(w, false);
				}
			}
		});
	};
	
	del.getHelp = function(tagName) {
		return w.u.getDocumentationForTag(tagName);
	};
	
	return del;
}