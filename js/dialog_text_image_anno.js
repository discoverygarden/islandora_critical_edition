/**
 * Produces a jQuery dialog box, used for
 * creating an image annotations in the
 * image annotation module and the critical
 * edition module.
 * @returns DialogBox(jQuery)
 */
function text_image_anno_dialog() {
  var img_base_path = Drupal.settings.islandora_image_annotation.images_path;
  var config_data;
  var html_text = ''+
 '<div id="create_annotation_text_box">'+
 '<div id="hidden_annotation_type" type="hidden"></div>'+
    '<div style="display:inline; margin-top: 3px; padding-left: 5px;">'+
      '<img id="annoShape_rect1" class="annoShape" src="' + img_base_path + '/draw_rect.png" style="padding-left: 2px; padding-top: 1px;"/>'+
      '<img id="annoShape_circ2" class="annoShape" src="' + img_base_path + '/draw_circ.png" style="padding-left: 1px;"/>'+
      '<img id="annoShape_poly3" class="annoShape" src="' + img_base_path + '/draw_poly.png" style="padding: 2px;"/>'+
      '<hr style="margin: 0px; padding: 0px; height: 1px;"/>'+
    '</div>'+
    '<div id="create_annos_block" class="dragBlock">'+
      '<div class="element-wrap">'+
        '<label for="anno_classification1">Type:</label>'+
        '<input id="anno_classification1" type="text" size="28"></input>'+
      '</div>'+
    '</div>'+
    '<div id="img_anno_text" class="element-wrap">'+
      '<label for="anno_text1">Annotation:</label>'+
      '<textarea id="anno_text1" cols="40" rows="5"></textarea>'+
    '</div>'+
    '<div id="img_anno_title" class="element-wrap">'+
      '<label for="anno_title1">Title:</label>'+
      '<input id="anno_title1" type="text" size="28"></input>'+
    '</div>'+
  '</div>';
  var txt_image_anno_dialog;
  
  if(document.getElementById('create_annotation_text_box') == null) {
    $(document.body).append(html_text);
    $('#islandora_classification').addClass("dialog-entity-group");
    txt_image_anno_dialog = $('#create_annotation_text_box');
    txt_image_anno_dialog.dialog({
      modal: true,
      open: function() {
        if ($('#create_annotation').text() == 'Annotating') {
          txt_image_anno_dialog.dialog('close');
          return;
        }
        $('#saveAnno').html('<span class="ui-button-text">Save</span>');
        $('#create_annotation').css({
            color:'#808080'
        });
        $('#create_annotation').empty().append('Annotating');
        $('.ui-widget-overlay').remove();
        $('#canvases .canvas').each(function() {
          var cnv = $(this).attr('canvas');
          initForCreate(cnv);
        });
      },
      title: 'Image/Text Annotation',
      resizable: false,
      closeOnEscape: false,
      height: 'auto',
      width: 380,
      buttons: {
      'Save': function() {
          $('#anno_title').val($('#anno_title1').val());
          $('#anno_text').val($('#anno_text1').val());
          $('#anno_classification').val($('#anno_classification1').val());
          var save_result = saveAndEndAnnotating();
          txt_image_anno_dialog.dialog('close');
          writer.finalizeEntity('txtimglnk', save_result);
          writer.fm.saveDocument();
          writer.removeHighlights();
        },
      'Cancel': function() {
         closeAndEndAnnotating();
         txt_image_anno_dialog.dialog('close');
        }
      }
    });
  } else {
    txt_image_anno_dialog = $('#create_annotation_text_box');
  }

  return {
    show: function(config) {
      config_data = config;
      $('#anno_text1').val(config.query);
      $('#anno_title1').val("Text image annotation");
      $('#anno_classification1').val("TextImageLink");
      
      $('#img_anno_text').hide();
      $('#img_anno_title').hide();
      txt_image_anno_dialog.dialog();
    },
    hide: function() {
      txt_image_anno_dialog.dialog('close');
    }
  };
};
