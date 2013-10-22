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
      var results = lookup_entity(params.type + '?entities_query=' + query);
      callback.call(this.writer,results);
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

  /**
   * Validates a document based on the document schema.
   * @param callback function.
   */
    this.validate = function(callback) {
    var docText = writer.fm.getDocumentContent(false);
    var schemaUrl = writer.schemas[writer.schemaId].url;
    $.ajax({
      url: Drupal.settings.basePath+ 'validator/validate.html',
      type: 'POST',
      dataType: 'XML',
      data: {
        sch: window.location.protocol+'//'+window.location.host+ schemaUrl,
        type: 'RNG_XML',
        content: docText
      },
      success: function(data, status, xhr) {
        console.log("success");
        if (callback) {
          var valid = $('status', data).text() == 'pass';
          callback.call(writer, valid);
        } else {
          writer.validation.showValidationResult(data, docText);
        }
      },
      error: function() {
        writer.dialogs.show('message', {
          title: 'Error',
          msg: 'An error occurred while trying to validate the document.',
          type: 'error'
        });
      }
    });
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
