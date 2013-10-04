/**
 * Our implementation of the CWRC-Writer
 * Delegator class. 
 * @param config
 * @returns {___anonymous83_84}
 */
function islandoraBackendDelegate(config) {
  this.writer = config.writer;

  /**
   * @param params
   * @param callback
   */
  this.lookupEntity = function(params, callback) {
    var type = params.type;
    var query = params.query;
    var lookupService = params.lookupService;
    
    if (lookupService == 'project') {
      $.ajax({
        url: cwrc_params['entities_search_callback'] + '/' + params.type + '?entities_query=' + query,
        dataType: 'json',
        success: function(data, status, xhr) {
          if ($.isPlainObject(data)) data = [data];
          if (data != null) {
            callback.call(writer, data);
          } else {
            callback.call(writer, []);
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
            callback.call(writer, data);
          } else {
            callback.call(writer, null);
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
            callback.call(writer, data.result);
          } else {
            callback.call(writer, []);
          }
        },
        error: function() {
          callback.call(writer, null);
        }
      });
    }
  };
  
  this.validate = function(callback) {
    var docText = writer.fm.getDocumentContent(false);
    var schemaUrl = writer.schemas[writer.schemaId].url;
    var valid = 'pass';
    callback.call(writer, valid);
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
        window.location.hash = '#' + PID;
        callback.call(writer, doc);
      },
      error: function(xhr, status, error) {
        writer.dialogs.show('message', {
          title: 'Error',
          msg: 'An error ('+status+') occurred and '+PID+' was not loaded.',
          type: 'error'
        });
        writer.currentDocId = null;
      }
    });
  };
  /**
   * Performs the server call to save the document.
   * @param callback Called with one boolean parameter: true for successful save, false otherwise
   */
  this.saveDocument = function(callback) {
    writer.mode == writer.XMLRDF;
    var docText = writer.fm.getDocumentContent(true);
    $.ajax({
      url : window.parent.Drupal.settings.basePath + 'islandora/cwrcwriter/save_data/' + PID,
      type: 'POST',
      async: false,
      dataType: 'text',
      data: {
        "text": docText
      },
      success: function(data, status, xhr) {
        writer.editor.isNotDirty = 1; // force clean state
        writer.dialogs.show('message', {
          title: 'Document Saved',
          msg: PID+' was saved successfully.'
        });
        window.location.hash = '#' + PID;
        if (callback) {
          callback.call(writer, true);
        }
      },
      error: function() {
        writer.dialogs.show('message', {
          title: 'Error',
          msg: 'An error occurred and ' + PID + ' was not saved.',
          type: 'error'
        });
        if (callback) {
          callback.call(writer, false);
        }
      }
    });
  };
  
  this.getHelp = function(tagName) {
    return this.writer.u.getDocumentationForTag(tagName);
  };
}
