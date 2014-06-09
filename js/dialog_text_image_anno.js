/**
 * Produces a jQuery dialog box, used for
 * creating an image annotations in the
 * image annotation module and the critical
 * edition module.
 * @returns DialogBox(jQuery)
 */
function text_image_anno_dialog(data) {
  var img_base_path = Drupal.settings.islandora_image_annotation.images_path;
  var config_data = data;
  var anno_type = "create";
  var combo_value_array = new Array();
  var html_text = ''+
 '<div id="create_annotation_text_box">'+
 '<div id="hidden_annotation_type" type="hidden"></div>'+
    '<div id="create_annos_block" class="dragBlock">'+
      '<div class="element-wrap">'+
        '<div id="text_image_accordion">'+
          '<h3>Create New</h3>'+
          '<div id="anno_create_new_wrapper">'+
	          '<div style="display:inline; margin-top: 3px; padding-left: 5px;">'+
		          '<img id="annoShape_rect_text" class="annoShape_text" src="' + img_base_path + '/draw_rect.png" style="padding-left: 2px; padding-top: 1px;"/>'+
		          '<img id="annoShape_circ_text" class="annoShape_text" src="' + img_base_path + '/draw_circ.png" style="padding-left: 1px;"/>'+
		          '<img id="annoShape_poly_text" class="annoShape_text" src="' + img_base_path + '/draw_poly.png" style="padding: 2px;"/>'+
		          '<hr style="margin: 0px; padding: 0px; height: 1px;"/>'+
	          '</div>'+
	          '<div class="element-wrap">'+
		          '<label for="anno_classification1">Type:</label>'+
		          '<input id="anno_classification1" type="text" size="28"></input>'+
	          '</div>'+
          '</div>'+
          '<h3>Choose Existing</h3>'+
          '<div id="anno_combo_wrapper">'+
          '</div>'+
        '</div>'+
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
        init_for_create();
        
        build_combo();
        $('#anno_text1').val(config_data.query);
        $('#anno_title1').val("Text image annotation");
        $('#anno_classification1').val("TextImageLink");
        
        $('#img_anno_text').hide();
        $('#img_anno_title').hide();
        $("#text_image_accordion").accordion('activate', 0 );
        
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
          var save_result;
          var activeAccordionIndex = $( "#text_image_accordion" ).accordion( "option", "active");
          if(activeAccordionIndex == 0) {
            save_result = saveAndEndAnnotating();
            if(save_result == 0) {
                $("#cbo_image_anno").val('0');
                closeAndEndAnnotating();
                txt_image_anno_dialog.dialog('close');
                return;
            }
          } else {
            if(!topinfo['annotations']['comment'][canvas]){
              return alert("Ensure an annotation exists and is selected before saving.");
            }
            save_result = construct_result();
          }
          
          txt_image_anno_dialog.dialog('close');
          writer.finalizeEntity('txtimglnk', save_result);
          writer.fm.saveDocument();
          writer.removeHighlights();
        },
      'Cancel': function() {
         $("#cbo_image_anno").val('0');
         
         closeAndEndAnnotating();
         
         txt_image_anno_dialog.dialog('close');
        }
      }
    });
  } else {
    txt_image_anno_dialog = $('#create_annotation_text_box');
  }
  build_combo();
  return {
    show: function() {
      build_combo();
      //config_data = config;
      $('#anno_text1').val(config.query);
      $('#anno_title1').val("Text image annotation");
      $('#anno_classification1').val("TextImageLink");
      
      $('#img_anno_text').hide();
      $('#img_anno_title').hide();
      
      //txt_image_anno_dialog.dialog();
      $("#text_image_accordion").accordion('activate', 0 );
    },
    hide: function() {
      $("#cbo_image_anno").val('0');
      txt_image_anno_dialog.dialog('close');
    }
  };
};

function build_combo() {
	if($('#cbo_image_anno').length == 0) {
		$("#text_image_accordion").accordion();
		
		$("#text_image_accordion").on( "accordionactivate", 
			function( event, ui ) {
				$("#cbo_image_anno").val('0');
				switch ($(ui.newPanel).attr('id')) {
				case 'anno_combo_wrapper':
					closeAndEndAnnotating();
					break;
				case 'anno_create_new_wrapper':
					init_for_create();
					break;
				}
		});
		
		var cmbo = '<label for="cbo_image_anno">Choose Existing</label>'+'<select id="cbo_image_anno">';
		cmbo += '<option value="select">Select...</option>';
		var annos = topinfo['annotations']['comment'][canvas];
		if(annos) {
			for(var i = 0;i<annos.length;i++) {
				var cbo_value = annos[i].id + ',' + annos[i].targets[0].partOf.id;
				cmbo += '<option value="' + cbo_value + '">"' + annos[i].body.value + '"</option>';
			}
			cmbo += "</select>";
			$('#anno_combo_wrapper').append(cmbo);
			
			$('#cbo_image_anno').change(function() {
			
			var val = $(this).attr('value');
			combo_value_array = val.split(",");
			var uuid = combo_value_array[0].replace('urn:uuid:','');
			combo_value_array[0] = uuid;
			existing_uuid = uuid;
			construct_result();
			paint_commentAnnoTargets(
				$('#anno_' + uuid),
				'canvas_0',
				uuid,
				"TextImageLink");
			});
		}
		
		$('.annoShape_text').click(function() {
			topinfo['svgAnnoShape'] = $(this).attr('id').substr(10,4);
			$('.annoShape_text').css('border', '0px');
			$(this).css('border', '1px solid black');
		});
		var shp = $('.annoShape_text').filter(':first');
		shp.css('border', '1px solid black');
		if(shp != null) {
			topinfo['svgAnnoShape'] = shp.attr('id').substr(10,4);
		} 
			
	}
};

function init_for_create(){
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
};

function construct_result() {
	var type = $('#anno_classification').val();
    // add category to annoblock before saving annotation.  Fixes concurrency errors
    if(type == '') {
      type = 'unclassified';
    }
    var color = $('#anno_color').attr('value');
    
	var data = {};
	data.Target = combo_value_array[1];
	data.Type = 'TextImageLink';
	data.Colour = color;
	data.uuid = combo_value_array[0].replace('urn:uuid:','');
    return data;
};

