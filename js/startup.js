<<<<<<< HEAD
  $('document').ready(function() {

    // Functionality is wrapped up in 'writer_wrapper.js.
    islandoraCWRCWriter.init_writer();
  });

  function init_ui() {
	  $(this).attr("title", cwrc_params.title);
      setHeader();
      if (cwrc_params.position == 1) {
          $('#page-prev').css('opacity', '.6').addClass('disabled');
        }
        if (cwrc_params.position == cwrc_params.pages_count) {
          $('#page-next').css('opacity', '.6').addClass('disabled');
        }
        // build and populate page choice dropdown
        $('#page_selector').html('<select id="page_choose"></select>');
        $.each(cwrc_params.pages, function(key, value) {
          $('#page_choose').append('<option  value="' + key + '">Seq# ' + key + '</option>');
        });

        // Synchronize displayed page with dropdown.
        var selector = "#page_choose option[value='" + cwrc_params.position + "']";
        $(selector).attr('selected', 'selected');

        // add page choice behavior to dropdown
        $('#page_choose').change(function(e) {
          if (!writer.editor.isDirty()) {
            answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave page");
            if (!answer) {
              selector = "#page_choose option[value='" + cwrc_params.position + "']";
              $(selector).removeAttr('selected');
              w.editor.isNotDirty = 1;
              $('#page_choose').val('10');
              return;
            }
          }
          
          selector = "#page_choose option[value='" + cwrc_params.position + "']";
          
          setReturnParams();
          cwrc_params.position = $('#page_choose :selected').attr('value');
          openColumn();
          PID = cwrc_params.pages[ cwrc_params.position];
          
          islandoraCWRCWriter.Writer.load_next_anno_page();
          
          setHeader();
          
          $('#page-prev').css('opacity', '1').removeClass('disabled');
          $('#page-next').css('opacity', '1').removeClass('disabled');

          if (cwrc_params.position == 1) {
            $('#page-prev').css('opacity', '.6').addClass('disabled');
          }
          if (cwrc_params.position == cwrc_params.page_count) {
            $('#page-next').css('opacity', '.2').addClass('disabled');
          }
          selector = "#page_choose option[value='" + cwrc_params.position + "']";
          $(selector).attr('selected', 'selected');
          
        });

        $('#page-prev').click(function(e) {
          e.preventDefault();
          if (!writer.editor.isDirty()) {
            answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave.");
            if (!answer) {
              return;
            }
          }
          if (cwrc_params.position > 1) {
            $('#page-next').css('opacity', '1').removeClass('disabled');
            
            var selector = "#page_choose option[value='" + cwrc_params.position + "']";
            $(selector).removeAttr('selected');
            cwrc_params.position--;
            setReturnParams();
            
            openColumn();
            
            selector = "#page_choose option[value='" + cwrc_params.position + "']";
            $(selector).attr('selected', 'selected');
            PID = cwrc_params.pages[ cwrc_params.position];
            islandoraCWRCWriter.Writer.load_next_anno_page();
            setHeader();
            if (cwrc_params.position == 0) {
              $('#page-prev').css('opacity', '.6').addClass('disabled');
            }
          }
        });
        $('#page-next').click(function(e) {
          e.preventDefault();
          if (!writer.editor.isDirty()) {
            answer = confirm("You have unsaved changes.  Click Cancel to stay on page, OK to leave");
            if (!answer) {
              return;
            }
          }

          if (cwrc_params.position < cwrc_params.page_count) {
            $('#page-prev').css('opacity', '1').removeClass('disabled');
            
            var selector = "#page_choose option[value='" + cwrc_params.position + "']";
            $(selector).removeAttr('selected');
            cwrc_params.position++;
            setReturnParams();
            
            openColumn();
            
            selector = "#page_choose option[value='" + cwrc_params.position + "']";
            $(selector).attr('selected', 'selected');
            PID = cwrc_params.pages[ cwrc_params.position];
            islandoraCWRCWriter.Writer.load_next_anno_page();
            setHeader();
            if (cwrc_params.position == cwrc_params.page_count) {
              $('#page-next').css('opacity', '.2').addClass('disabled');
            }
          }
        });
        
        var cnt = 0;
        $('#relations').children().each(function() {
        	if(cnt == 0) {
        		$(this).css('height: 500px; !important');
        	}
          $(this).css('position','relative');
          cnt++;
        });
        $.contextMenu({
          selector: '.comment_title',
          callback: function(key, options) {
            var urn = $(this).parent('div').attr('urn');
            var title = $(this).text().substring(2, 100);
            title = title.trim();

            var comment_text = $(this).next('.comment_text');
            var anno_type = comment_text.find('.comment_type').text();

            if (key == 'delete') {
              if (confirm("Permananently Delete Annotation '" + title + "'")) {
                islandora_deleteAnno(urn);
              }

            }

            if (key == 'edit') {
              $(this).addClass('annotation-opened').next().show();
              var annotation = comment_text.find('.comment_content').text();
              var pm = $(this).find('.comment_showhide');
              if (pm.text() == '+ ') {
                pm.empty().append('- ');
                var id = $(this).attr('id').substring(5, 100);
                var canvas = $(this).attr('canvas');
                paint_commentAnnoTargets(this, canvas, id);
              }
              $('#hidden_annotation_type').attr('anno_type','Update Annotation');
              $('#hidden_annotation_type').attr('urn',urn);
              startEditting(title, annotation, anno_type, urn);
            }
          },
          items: {
            "edit": {
              name: "Edit",
              icon: "edit",
              accesskey: "e"
            },
            "delete": {
              name: "Delete annotation",
              icon: "delete"
            }
          }
        });
        // Initialize image annotation dialog.
        var anno_d = annotation_dialog();
        anno_d.dialog('close');
        
        // Initialize text/image annotations dialog.
//        var anno_text = text_image_anno_dialog();
//        anno_text.hide;
        
        maybe_config_create_annotation();
        
  }

  var init_canvas_div = function(islandora_canvas_params) {
    if (islandora_canvas_params.no_edit == true) {
      $('#create_annotation').hide();
    }
    opts.base = islandora_canvas_params.object_base;
    // build and populate page choice dropdown
    $('#canvas_page_selector').html('<select id="canvas_page_choose"></select>');
    $.each(islandora_canvas_params.pages, function(key, value) {
      $('#canvas_page_choose').append('<option  value="' + key + '">Page ' + (key + 1) + '</option>');
    });
    if (islandora_canvas_params.use_dropdown == 1) {
        $('#islandora_classification').empty();
        var sel = $('<select  id="anno_classification">').appendTo('#islandora_classification');
        $(islandora_canvas_params.categories).each(function() {
          value = this.toString();
          sel.append($("<option>").attr('value', value).text(value));
        });
      } else {
        $("#anno_classification").autocomplete({
          source: islandora_canvas_params.categories
        });
      }

    // RDF Initializationc
    var rdfbase = $.rdf(opts);
    topinfo['query'] = rdfbase;
    
    var l = $(location).attr('hash');
    var uriparams = {};
    var nCanvas = 1;
    var start = 0;
    if (l[0] == '#' && l[1] == '!') {
      // Process initialization
      var params = l.substr(2, l.length).split('&');
      for (var p = 0, prm; prm = params[p]; p++) {
        var tup = prm.split('=');
        var key = tup[0];
        var val = tup[1];
        if (key == 's') {
          start = parseInt(val);
          uriparams['s'] = start;
        } else if (key == 'n') {
          nCanvas = parseInt(val);
          uriparams['n'] = nCanvas;
        }
      }
    }
    topinfo['uriParams'] = uriparams;

    // Setup a basic Canvas with explicit width to scale to from browser width
   initCanvas(nCanvas);
    // Manifest initialization.
   fetchTriples(islandora_canvas_params.manifest_url,
        rdfbase,
        cb_process_manifest);
   //islandoraCWRCWriter.ContextMenu.init();
    $('#color-picker-wrapper').click(function() {
      $('#anno_color_activated').attr('value', 'active');
    });
    $('.color-picker').miniColors();
    var stroke_widths = islandora_canvas_params.islandora_anno_stroke_widths.split(" ");
    var s_options = "";
    for (var i = 0; i < stroke_widths.length; i++) {
      s_options += '<option value="'+ stroke_widths[i] + '">' + stroke_widths[i] + '</option>';
    }
    $('#stroke-width-wrapper').empty();
    $('#stroke-width-wrapper').append('<label for"stroke_width">Stroke Width:</label>');
    $('#stroke-width-wrapper').append('<select id="stroke_width" />');
    $('#stroke_width').append(s_options);
    $('#shared-canvas-logo-img').attr('src',Drupal.settings.basePath +
      Drupal.settings.islandora_critical_edition.image_anno_img + 'small-logo.png')
      
  }

  // @XXX openColumn and setReturnParams may not be necessary dependent on theme
  //   need more investigation. Noticed different results with Garland and
  //   Bartik.
  /**
   * This will set the annoation panes' sizes and separator position.
   */
  function openColumn() {
    $('.col3').css("display", "block");
    $('.col1').css("width", cwrc_params.text_annotation_width);
    $('#column-separator').css("left", cwrc_params.separator_pos);
  }

  /**
   * Used to preserve the width of the text annotation pane
   * and the leftedness of the seperator.
   */
  function setReturnParams() {
    cwrc_params.text_annotation_width = $('.col1').css("width");
    cwrc_params.separator_pos = $('#column-separator').css("left");
  }

  /**
   * Sets clickable page header.
   *
   */
  function setHeader() {
    var address = Drupal.settings.basePath + 'islandora/object/' + cwrc_params.pages[cwrc_params.position];
    var prolog = cwrc_params.title + ' - Seq# ';
    var epilog = '';
    if (cwrc_params.no_edit === false) {
      prolog = '<a style = "color:white" href = "' + address + '">' + cwrc_params.title + ' - Seq# ';
      epilog = '</a>';
    }
    $('#header h1').html(prolog + cwrc_params.position + epilog);
  }
=======
//var $jq = jQuery.noConflict();
(function($) {
$('document').ready(function() {
	console.log($.fn.jquery);
	console.log($jq.fn.jquery);
	console.log("ready");
	console.log(Drupal.settings);
	$jq( '#versions-tab tbody').find('td[class="version_name"]').each(function(e) {
		//console.log($(this));
		$jq(this).children(':first').click(function(e) {
			e.preventDefault();
			console.log(this);
			
			  if($jq('#aparatusDialog').length == 0) {
				  $jq(document.body).append(''+
		          '<div id="aparatusDialog">'+
		          '<div id="CriticalEditionViewer"></div>'+
		          '</div>');
		      }
			  var clicked_item = this;
			  var pid = $(this).attr('data-pid');
			  console.log(pid);
			  console.log(Drupal.settings.basePath + 'islandora/cwrc_viewer/prepare_advanced/' + pid);
			  console.log($ui.fn.jquery);
//		      // TODO: get the width/height dynamically.
			  $ui('#aparatusDialog').dialog({
		        title: 'Edit Header',
		        modal: true,
		        resizable: true,
		        height: 600,
		        width: 1000,
		        open: function(e) {
		          console.log(pid);
		          // Kick of the logic to fill this.
		          $jq.ajax({
		            type: 'POST',
		            url: Drupal.settings.basePath + 'islandora/cwrc_viewer/prepare_advanced/' + pid,
		            data:{
		              "pid": pid,
		            },
		            success: function(data, status, xhr) {
		             // console.log(data);
		              CriticalEditionViewer.data_pid = pid;
		              CriticalEditionViewer.Viewer.build(data);
		            },
		            error: function(xhRequest, ErrorText, thrownError) {
		              console.log(ErrorText + ":" + thrownError);
		            },
		          });
		        },
		      });
			return false;
		});
	  });
});
	
})(jQuery);


var CriticalEditionViewer = {
	cwrc_writer: null,
	cwrc_writer_helper: null,
	cwrc_params: null,
	data_pid: null,
	current_zoom: 0,
	pager_data: new Array(),
	Viewer: {
		get_page_transformed_tei: function(page) {
			console.log("page: " + page);
			$jq.ajax({
	            type: 'POST',
	            url: Drupal.settings.basePath + 'islandora/cwrc_viewer/transformed_page/' + page,
	            data:{
		              "versionable_object": CriticalEditionViewer.data_pid,
		        },
	            success: function(data, status, xhr) {
	              //console.log(data);
	              $jq('#append_data').append(data);
//	              CriticalEditionViewer.data_pid = pid;
//	              CriticalEditionViewer.Viewer.build(data);
	            },
	            error: function(xhRequest, ErrorText, thrownError) {
	              console.log(ErrorText + ":" + thrownError);
	            },
	          });
		},
		show_preloader: function() {
			$jq("#loadImg").css('z-index','800');
			$jq("#loadImg").css('display','inherit');
		},
		hide_preloader: function() {
			//document.getElementById('loadImg').style.display='none';
			$jq("#loadImg").css('display','none');
		},
		show_plain_image: function() {
			CriticalEditionViewer.cwrc_writer.layout.close("west");
			CriticalEditionViewer.cwrc_writer.layout.close("north");
			CriticalEditionViewer.cwrc_writer.layout.sizePane("east", $jq('#CriticalEditionViewer').width());
			CriticalEditionViewer.Viewer.toggle_text_image_linking(0);
		},
		show_versionable_transcriptions: function() {
//			CriticalEditionViewer.cwrc_writer.layout.close("west");
//			CriticalEditionViewer.cwrc_writer.layout.close("north");
//			CriticalEditionViewer.cwrc_writer.layout.sizePane("east", $jq('#CriticalEditionViewer').width());
//			CriticalEditionViewer.Viewer.toggle_text_image_linking(0);
		},
		show_tei_text: function() {
			// TODO:
			if($jq('navi')) {
				
			}
			CriticalEditionViewer.cwrc_writer.layout.sizePane("east", $jq('#CriticalEditionViewer').width()/2);
			CriticalEditionViewer.cwrc_writer.editor.$('body', window.frames[0].document).addClass('showStructBrackets');
		},
		show_plain_text: function() {
			// TODO:
			CriticalEditionViewer.cwrc_writer.layout.sizePane("east", $jq('#CriticalEditionViewer').width()/2);
			CriticalEditionViewer.cwrc_writer.editor.$('body', window.frames[0].document).removeClass('showStructBrackets');
		},
		toggle_anno_entities: function(show) {
			if(show == 1) {
				CriticalEditionViewer.cwrc_writer.layout.open("west");
			} else {
				CriticalEditionViewer.cwrc_writer.layout.close("west");
			}
			//$('#cwrc_main .ui-layout-center', window.frames[0].document).append('<div style="float: left;height: 40px;background: #de9a44;margin: 3px;width: 80px;" class="slidedown"></div>')
		},
		toggle_text_image_linking: function(show) {
			if(show == 1) {
				$jq("#navi").animate({
			      marginLeft:0},{
			      complete: function() {
			        //CriticalEditionViewer.cwrc_writer.layout.sizePane("east", ($('#cwrc_wrapper', window.frames[0].document).width()-$("#navi").width()));
			        CriticalEditionViewer.cwrc_writer.editor.$('body', window.frames[0].document).toggleClass('showEntityBrackets');
			        if(!$jq('#img_title').hasClass('img_selected')) {
			        	console.log("resizing west");
			        	CriticalEditionViewer.cwrc_writer.layout.open("west");
			          CriticalEditionViewer.cwrc_writer.layout.sizePane("west", $jq("#navi").width());
			        } else {
			        	CriticalEditionViewer.cwrc_writer.layout.sizePane("east", ($jq('#cwrc_wrapper', window.frames[0].document).width()-$jq("#navi").width()));
			        }
			      }
			    }, 700);
				
//				
			} else {
				CriticalEditionViewer.cwrc_writer.layout.close("west");
				
				if($jq('#img_title').hasClass('img_selected')) {
					CriticalEditionViewer.cwrc_writer.layout.sizePane("east", $jq('#cwrc_wrapper', window.frames[0].document).width());
				}
				
				CriticalEditionViewer.cwrc_writer.editor.$('body', window.frames[0].document).toggleClass('showEntityBrackets');
				
				$jq("#navi").animate({
			        marginLeft:-$jq("#navi").width()},{
			        complete: function() {
			        	
			        },
			    }, 700);
				
			}
		},
		get_entities: function() {
			// Append to block_4_hidden.
			var cover = '<div id="navi" style="border:1px solid blue;position:absolute;overflow:auto;width:35%;height:100%;background-color: #FFFFFF;z-index: 500;top: 0;"></div>';
			
			$jq("#view_box").append(cover);
			
			var tree_html = '<div id="demo3"><ul><li id="tree_annos"><a href="#">Annotations</a></li><li id="tree_entities"><a href="#">Entities</a></li></ul></div>';
			$jq('#navi').append(tree_html);
			
			var entity_list = '<ul>';
			var text_image_list = '<ul>'
			$jq('.entitiesList li', window.frames[0].document).each(function() {
				//console.log($jq(this));
				// If a class is found, its an entity entry.
				if($jq(this).attr("class")) {
					if($jq(this).attr("class") == "txtimglnk") {
						text_image_list += '<li id="phtml_2">';
						text_image_list += '<a href="#">' + 'Text Image Links' + '</a>';
						text_image_list += '<ul><li id="' + $jq(this).attr("name") + '"><a href="#">' + $jq(this).children('.entityTitle').first().text() + '</a></li></ul>';
						text_image_list += '</li>';
					} else {
						entity_list += '<li id="phtml_2">';
						entity_list += '<a href="#">' + $jq(this).attr("class") + '</a>';
						entity_list += '<ul><li id="' + $jq(this).attr("name") + '"><a href="#">' + $jq(this).children('.entityTitle').first().text() + '</a></li></ul>';
						entity_list += '</li>';
					}
				}
			});
			text_image_list += '</ul>';
			entity_list += '</ul>';
			if(entity_list != '<ul>') {
				$jq('#demo3').append(text_image_list);
			}
			//console.log(entity_list);
			$jq('#tree_entities').append(entity_list);
			
			// Build the annotation list
			var anno_list = '<ul>';
			var anno_arr = new Array();
			$jq('#comment_annos_block', window.frames[0].document).children().each(function() {
				anno_list += '<li id="annos_' + $jq(this).find('div[class="islandora_comment_type_title"]').text() + '">';
				anno_list += '<a href="#">' + $jq(this).find('div[class="islandora_comment_type_title"]').text() + '</a>';
				if(anno_arr[$jq(this).find('div[class="islandora_comment_type_title"]').text()] == null) {
					anno_arr[$jq(this).find('div[class="islandora_comment_type_title"]').text()] = new Array();
				}
				var idx = $jq(this).find('div[class="islandora_comment_type_title"]').text();
				$jq(this).find('div[class="islandora_comment_type_content"]').children().each(function() {
					anno_arr[idx].push($jq(this).find('div[class="comment_content"]').text());
					anno_list += '<ul><li id="' + $jq(this).attr('urn') + '"><a href="#">' + $jq(this).find('div[class="comment_content"]').text() + '</a></li></ul>'
				});
				anno_list += '</li>';
			});
			anno_list += '</ul>';
			//console.log(anno_list);
			$jq('#tree_annos').append(anno_list);
			$jq("#navi").css("margin-left",-$jq("#navi").width());
		},
		entity_click: function(e) {
			CriticalEditionViewer.cwrc_writer.highlightEntity($jq(e).closest("li").attr("id"));
			return false;
		},
		annos_click: function(e) {
			CriticalEditionViewer.cwrc_writer.highlightEntity(e);
			return false;
		},
		get_image_annotations: function() {
			
		},
		build_tree_view: function() {
			$jt('#demo3').jstree({
				"checkbox": {
		              real_checkboxes: false,
		              two_state: true
		           },
				"plugins" : ["themes", "ui", "checkbox"]
			}).bind('select_node.jstree', function (e, data) {
				// Hate this, but this version of jstree kinda
				// requires it.
				var data_stuff = $jq('.jstree-clicked');
				
				// The following highlights entity's
				for(var i = 0;i<data_stuff.length;i++) {
					if($jq(data_stuff[i]).closest("li").attr("id")) {
						var li_id = $jq(data_stuff[i]).closest("li").attr("id");
						if(li_id.indexOf("ent_") !== -1) {
							CriticalEditionViewer.Viewer.annos_click(li_id);
						}
					}
				}
				for(var x = 0;x<data_stuff.length;x++) {
					if($jq(data_stuff[x]).closest("li").attr("id")) {
						var uuid = $jq(data_stuff[x]).closest("li").attr("id");
						if(uuid.indexOf("annos_") === -1) {
							// Show the annotation.console.log(document.getElementById('viewer_iframe').contentWindow);
							document.getElementById('viewer_iframe').contentWindow.paint_commentAnnoTargets($jq('#anno_' + uuid, window.frames[0].document), 'canvas_0', uuid, "TextImageLink");
					
						}
					}
				}
				
				console.log(data_stuff);
			}).bind('deselect_node.jstree', function() {
				console.log("deselect");
				var data_stuff = $jq('.jstree-anchor');
				
				$jq('#entities > ul > li', window.frames[0].document).each(function(index, el) {
					$jq(this).removeClass('selected').css('background-color', '').find('div[class="info"]').hide();
					CriticalEditionViewer.cwrc_writer.delegator.editorCallback('highlightEntity_looseFocus', $jq(this));
				});
				
				for(var x = 0;x<data_stuff.length;x++) {
					if($jq(data_stuff[x]).closest("li").attr("id")) {
						var uuid = $jq(data_stuff[x]).closest("li").attr("id");
						console.log("id: " + uuid);
						if(uuid.indexOf("annos_") === -1) {
							// Show the annotation.console.log(document.getElementById('viewer_iframe').contentWindow);
							//document.getElementById('viewer_iframe').contentWindow.paint_commentAnnoTargets($jq('#anno_' + uuid, window.frames[0].document), 'canvas_0', uuid, "TextImageLink");
							$jq('.svg_' + uuid, window.frames[0].document).remove();
						}
					}
				}
				
			});
		},
		show_versionable_meta: function() {
			$jq("#meta_overlay").animate({
			      marginTop:0},{
			      complete: function() {
			    	  $jq.ajax({
				            type: 'POST',
				            url: Drupal.settings.basePath + 'islandora/cwrc_viewer/detail_meta_data',
				            data:{
				              "pid": CriticalEditionViewer.data_pid,
				            },
				            success: function(data, status, xhr) {
				              $jq("#meta_overlay").append(data);
				              // Expand the details
				              $jq("#meta_overlay").find('fieldset[class="islandora islandora-metadata collapsible collapsed"]').removeClass('collapsed');
				              CriticalEditionViewer.Viewer.hide_preloader();
				            },
				            error: function(xhRequest, ErrorText, thrownError) {
				              CriticalEditionViewer.Viewer.hide_preloader();
				            },
				       });
			      }
			    }, 700);
		},
		show_versionable_transcription: function() {
			$jq("#meta_overlay").animate({
			      marginTop:-$jq("#meta_overlay").height()},{
			      complete: function() {
			      }
			    }, 700);
		},
		show_versionable_permalink: function() {
			// The current menu path is the permalink...
			location.reload();
		},
		zoom_plus_click: function() {
			console.log("plus clicked");
			CriticalEditionViewer.current_zoom = CriticalEditionViewer.current_zoom + 5;
			CriticalEditionViewer.Viewer.zoom_level_update();
		},
		zoom_minus_click: function() {
			console.log("minus clicked");
			if(CriticalEditionViewer.current_zoom - 5 >= 0) {
				CriticalEditionViewer.current_zoom = CriticalEditionViewer.current_zoom - 5;
				CriticalEditionViewer.Viewer.zoom_level_update();
			}
			
		},
		zoom_level_update: function() {
			$jq('#zoom').text(CriticalEditionViewer.current_zoom);
			console.log($jq('#zoom').text());
			// Need to destroy it every time.
			CriticalEditionViewer.Viewer.destroy_zoom();
			var img = $jq('#annotations', window.frames[0].document).find('div[class="base_img"]').children(0);
			$zm(img).parent()
			    .zoom({
			      magnify: CriticalEditionViewer.current_zoom
			    });
		},
		build_zoom: function() {
			$jq('#viewer_iframe_border').append(
					'<div id="zoom_wrapper">'+
						'<img onclick="CriticalEditionViewer.Viewer.zoom_plus_click();" style="float:left;cursor:pointer;cursor:hand;" src="' + Drupal.settings.basePath + Drupal.settings.islandora_critical_edition_advanced.module_base+'/img/zoom_plus.png"/>'+
						'<a id="zoom" onclick="return false;" class="zoom_image" href="#">0</a>'+
						'<img onclick="CriticalEditionViewer.Viewer.zoom_minus_click();"style="float:right;cursor:pointer;cursor:hand;" src="' + Drupal.settings.basePath + Drupal.settings.islandora_critical_edition_advanced.module_base+'/img/zoom_minus.png"/>'+
					'</div>');
			
			$jq("#zoom_wrapper").css("border","1px solid red");
			$jq("#zoom_wrapper").css("margin-right","5px");
			$jq("#zoom_wrapper").css("float","right");
			$jq("#zoom_wrapper").css("text-align","center");
			$jq("#zoom_wrapper").css("position","absolute");
			$jq("#zoom_wrapper").css("right","5px");
			$jq("#zoom_wrapper").css("top","5px");
			$jq("#zoom_wrapper").css("z-index","30");
			
			$jq("#zoom_wrapper").css("width","150px");
			$jq("#zoom_wrapper").css("z-index","30");
			CriticalEditionViewer.Viewer.zoom_level_update();
			
		},
		destroy_zoom: function() {
			var img = $jq('#annotations', window.frames[0].document).find('div[class="base_img"]').children(0);
			$zm(img).trigger('zoom.destroy');
		},
		add_transcription_pager: function() {
			var pager = 
				'<div id="tr_pagination" class="pagination img_pager">' +
				    '<a href="#" class="first" data-action="first">&laquo;</a>'+
				    '<a href="#" class="previous" data-action="previous">&lsaquo;</a>'+
				    '<input id="tr_pagination_input" type="text" readonly="readonly" data-max-page="0" />'+
				    '<a href="#" class="next" data-action="next">&rsaquo;</a>'+
				    '<a href="#" class="last" data-action="last">&raquo;</a>'+
			    '</div>';
			$jq("#view_box_header").append(pager);
			$pg('#tr_pagination').jqPagination({
				max_page: $jq(".versionable_transcription_text").length,
			    paged: function(page) {
			    	$jq(".versionable_transcription_text").css("visibility", "hidden");
			    	$jq(".versionable_transcription_text").css("display", "none");
			    	$jq("#versionable_transcription_" + (page - 1)).css("visibility", "visible");
			    	$jq("#versionable_transcription_" + (page - 1)).css("display", "block");
			    }
			});
		},
		build: function(json_html) {
			
			
			if($jq('#CriticalEditionViewer').length > 0) {
				$jq('#CriticalEditionViewer').empty();
			}
			$jq('#CriticalEditionViewer').css("height", "80%")
			$jq('#CriticalEditionViewer').append(json_html);
			
			// Hide all transcriptions, showing only the first.
			$jq(".versionable_transcription_text").toggle();
			if($jq("#versionable_transcription_0").length > 0) {
				$jq("#versionable_transcription_0").toggle();
				
				// Now, set up the pager for the transcriptions.
				CriticalEditionViewer.Viewer.add_transcription_pager();
			}
			
			
			console.log($jq('#view_box').width());
			$jq('#loadImg div').width($jq('#view_box').width());
			$jq('#loadImg div').height($jq('#view_box').height());
			//$("#viewer_iframe").style(display,'none');
//			  $(window.frames[0].document).ready(function() {
//				  console.log($('#cwrc_wrapper', window.frames[0].document).height());
//			  });
			  
			$jq('.data_anchor').click(function(e) {
				$jq('.data_anchor').css('font-weight', 'normal');
				//console.log($jq(this).css('font-weight') == 'bold');
				if($jq(this).css('font-weight') == 'bold') {
					$jq(this).css('font-weight', 'normal');
				} else {
					$jq(this).css('font-weight', 'bold');
				}
				
				e.preventDefault();
				if($jq("#meta_overlay").length == 0) {
					var meta_cover = '<div id="meta_overlay" style="border:1px solid blue;position:absolute;overflow:auto;width:100%;height:100%;background-color: #FFFFFF;z-index: 500;top: 0;"></div>';
					$jq("#view_box").append(meta_cover);
					$jq("#meta_overlay").css("margin-top",-$jq("#meta_overlay").height());
				} else {
					$jq("#meta_overlay").animate({
				        marginTop:-$jq("#meta_overlay").height()},{
				        complete: function() {
				          console.log("moved up complete");
				          $jq('.data_anchor').css('font-weight', 'normal');
				          $jq('#detail_tran').css('font-weight', 'bold');
				          $jq("#meta_overlay").remove();
				        },
				    }, 700);
				}
				
				switch ($jq(this).attr('id')) {
				case "detail_meta":
					// Show the preloader while we retrieve the data.
					//CriticalEditionViewer.Viewer.show_preloader();
					CriticalEditionViewer.Viewer.show_versionable_meta();
					break;
				case "detail_tran":
					//CriticalEditionViewer.Viewer.show_preloader();
					CriticalEditionViewer.Viewer.show_versionable_transcription();
					break;
				case "detail_perm":
					//CriticalEditionViewer.Viewer.show_preloader();
					CriticalEditionViewer.Viewer.show_versionable_permalink();
					break;
				}
				
			});
			
			// Set up img click handlers
			$jq(".work_action_img").click(function() {
				$jq(".work_action_img").removeClass("img_selected");
				$jq(this).addClass("img_selected");
				// Preform the approate action.
				switch ($jq(this).attr("title")) {
					case "Plain Text":
						CriticalEditionViewer.Viewer.show_plain_text();
						break;
					case "TEI Text":
						CriticalEditionViewer.Viewer.show_tei_text();
						break;
					case "Image":
						CriticalEditionViewer.Viewer.show_plain_image();
						break;
					case "Transcriptions":
						CriticalEditionViewer.Viewer.show_versionable_transcriptions();
						break;
				}
			});
			$sb("#anno_entity_switch").switchButton();
			$sb("#til_switch").switchButton();
			
			$jq(".switch").change(function(e) {
				// Toggling 'checked' property actually shows a 
				// checkbox, which is not what we want.
				if($jq(this).attr("value") == 1) {
					$jq(this).attr("value",0);
				} else {
					$jq(this).attr("value",1);
				}
				switch ($jq(this).attr("id")) {
					case "anno_entity_switch":
						CriticalEditionViewer.Viewer.toggle_text_image_linking($jq(this).attr("value"));
						break;
					case "til_switch":
						CriticalEditionViewer.Viewer.toggle_text_image_linking($jq(this).attr("value"));
						break;
				}
			});
			
			// TODO: hide the writer from view while this is loading
			if($jq("#viewer_iframe").length > 0) {
				$jq("#viewer_iframe").load(function (){
					console.log("iframe load complete");
					
					$jq('#cwrc_wrapper', window.frames[0].document).height($jq('#view_box').height());
					console.log(document.getElementById('viewer_iframe').contentWindow);
					// Set the writer object for access later
					CriticalEditionViewer.cwrc_writer = document.getElementById('viewer_iframe').contentWindow['writer'];
					CriticalEditionViewer.cwrc_writer_helper = document.getElementById('viewer_iframe').contentWindow['islandoraCWRCWriter'];
						
					CriticalEditionViewer.cwrc_writer.editor.$('body', window.frames[0].document).removeClass('showEntityBrackets');
					
					CriticalEditionViewer.cwrc_params = document.getElementById('viewer_iframe').contentWindow['cwrc_params'];
					
					CriticalEditionViewer.cwrc_writer.pager_data = $jq('#page_choose', window.frames[0].document);
					
					$jq('#page_choose option', window.frames[0].document).each(function() {
						CriticalEditionViewer.pager_data[$jq(this).attr("value") - 1] = $jq(this).attr("value");
					});
					console.log("pager length: " + CriticalEditionViewer.pager_data.length);
					
					console.log(CriticalEditionViewer.cwrc_params.pages[ CriticalEditionViewer.cwrc_params.position]);
					
					CriticalEditionViewer.Viewer.get_page_transformed_tei(CriticalEditionViewer.cwrc_params.pages[ CriticalEditionViewer.cwrc_params.position]);
					
					$pg('.pagination').jqPagination({
						max_page: CriticalEditionViewer.pager_data.length,
					    paged: function(page) {
					    	CriticalEditionViewer.Viewer.show_preloader();
					    	CriticalEditionViewer.Viewer.toggle_text_image_linking(0);
					    	console.log($jq('#page_choose', window.frames[0].document).val());
					    	$jq('#page_choose', window.frames[0].document).val(page);
					    	$jq("#page_choose :selected[true]", window.frames[0].document).attr('selected',false);
					    	$jq("#page_choose option[value="+page+"]", window.frames[0].document).attr('selected',true);
					    	CriticalEditionViewer.cwrc_params.position = $jq('#page_choose :selected', window.frames[0].document).attr('value');
					    	document.getElementById('viewer_iframe').contentWindow['PID'] = CriticalEditionViewer.cwrc_params.pages[ CriticalEditionViewer.cwrc_params.position];
					    	
					    	CriticalEditionViewer.cwrc_writer_helper.Writer.load_next_anno_page();
					    	console.log("after load next anno");
					    	//~~~
					    	$jq("#navi").remove();
					    	CriticalEditionViewer.Viewer.get_entities();
							CriticalEditionViewer.Viewer.build_tree_view();
							CriticalEditionViewer.Viewer.hide_preloader();
					    }
					});
					
					$jq('#editor_toolbargroup', window.frames[0].document).css("visibility", "hidden");
					$jq('#editor_toolbargroup', window.frames[0].document).css("display", "none");
					
					$jq('#editor_toolbargroup', window.frames[0].document).hide();
					
					$jq('#create_annotation', window.frames[0].document).css("visibility", "hidden");
					$jq('#create_annotation', window.frames[0].document).css("display", "none");
					CriticalEditionViewer.Viewer.show_plain_image();
					
					CriticalEditionViewer.Viewer.build_zoom();
					
					
					CriticalEditionViewer.Viewer.hide_preloader();
					
					// Build entity/anno tree off of existing.
					CriticalEditionViewer.Viewer.get_entities();
					CriticalEditionViewer.Viewer.build_tree_view();
					
					
				});
			}
			
			if($jq('#MediaPlayer').length > 0) {
				jwplayer("mediaplayer").setup({
				    file: $jq('#MediaPlayer').attr('data-url'),
				    image: $jq('#MediaPlayer').attr('data-thumbnail'),
				    width: $jq('#MediaPlayer').attr('data-width'),
				});
			}
		}
	},
};
>>>>>>> 16a7e083d36feaf04091ad9f4efb3be6b27488fa
