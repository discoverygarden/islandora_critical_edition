/**
 * Our implementation of the CWRC-Writer
 * Delegator class. 
 * @param config
 * @returns {___anonymous83_84}
 */
function islandoraBackendDelegate(config) {
	var w = config.writer;
	
	/**
	 * @memberOf del
	 * @param params
	 * @param callback
	 */
	this.lookupEntity = function(params, callback) {
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
	
	this.validate = function(callback) {
		var docText = w.fm.getDocumentContent(false);
		var schemaUrl = w.schemas[w.schemaId].url;
		var valid = 'pass';
		callback.call(w, valid);
		//TODO: Implement true validator when/if cwrc makes this service available.
	};
	
	/**
	 * Loads a document based on the currentDocId
	 * TODO Move currentDocId system out of CWRCWriter
	 * @param docName
	 */
	this.loadDocument = function(callback) {
		$.ajax({
			url: Drupal.settings.basePath+'islandora/object/' + PID + '/datastream/CWRC/view',
			type: 'GET',
			async: false,
			dataType: 'xml',
			success: function(doc, status, xhr) {
				window.location.hash = '#'+PID;
				callback.call(w, doc);
			},
			error: function(xhr, status, error) {
				w.dialogs.show('message', {
					title: 'Error',
					msg: 'An error ('+status+') occurred and '+PID+' was not loaded.',
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
	this.saveDocument = function(callback) {
		w.mode == w.XMLRDF;
		var docText = w.fm.getDocumentContent(true);
		$.ajax({
			url : window.parent.Drupal.settings.basePath + 'islandora/cwrcwriter/save_data/' + PID,
			type: 'POST',
			async: false,
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
	
	this.getHelp = function(tagName) {
		return w.u.getDocumentationForTag(tagName);
	};
}
