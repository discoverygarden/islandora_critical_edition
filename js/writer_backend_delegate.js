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
            callback.call(this.writer, data);
          } else {
            callback.call(this.writer, []);
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
            callback.call(this.writer, data);
          } else {
            callback.call(this.writer, null);
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
            callback.call(this.writer, data.result);
          } else {
            callback.call(this.writer, []);
          }
        },
        error: function() {
          callback.call(this.writer, null);
        }
      });
    }
  };
  
  this.validate = function(callback) {
    var docText = this.writer.fm.getDocumentContent(false);
    var schemaUrl = this.writer.schemas[this.writer.schemaId].url;
    var valid = 'pass';
    callback.call(this.writer, valid);
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
        callback.call(this.writer, doc);
        // Need to wait on response to initilize.
        $(document.body).append(''+
                  '<div id="annoMenuContext" class="contextMenu" style="display: none;"><ul>'+
                  '<li id="editAnno"><ins style="background:url('+islandoraCriticalEditionsUrl+'/CWRC-Writer/src/img/tag_blue_edit.png) center center no-repeat;" />Edit Annotation</li>'+
                  '<li id="removeAnno"><ins style="background:url('+islandoraCriticalEditionsUrl+'/CWRC-Writer/src/img/cross.png) center center no-repeat;" />Remove Annotation</li>'+
                  '</ul></div>'
                );
      },
      error: function(xhr, status, error) {
        this.writer.dialogs.show('message', {
          title: 'Error',
          msg: 'An error ('+status+') occurred and '+PID+' was not loaded.',
          type: 'error'
        });
        this.writer.currentDocId = null;
      }
    });
  };
  /**
   * Performs the server call to save the document.
   * @param callback Called with one boolean parameter: true for successful save, false otherwise
   */
  this.saveDocument = function(callback) {
    this.writer.mode == this.writer.XMLRDF;
    var docText = this.writer.fm.getDocumentContent(true);
    $.ajax({
      url : window.parent.Drupal.settings.basePath + 'islandora/cwrcwriter/save_data/' + PID,
      type: 'POST',
      async: false,
      dataType: 'text',
      data: {
        "text": docText
      },
      success: function(data, status, xhr) {
        this.writer.editor.isNotDirty = 1; // force clean state
        this.writer.dialogs.show('message', {
          title: 'Document Saved',
          msg: this.writer.currentDocId+' was saved successfully.'
        });
        window.location.hash = '#' + PID;
        if (callback) {
          callback.call(this.writer, true);
        }
      },
      error: function() {
        this.writer.dialogs.show('message', {
          title: 'Error',
          msg: 'An error occurred and ' + PID + ' was not saved.',
          type: 'error'
        });
        if (callback) {
          callback.call(this.writer, false);
        }
      }
    });
  };
  
  this.getHelp = function(tagName) {
    return this.writer.u.getDocumentationForTag(tagName);
  };
}
