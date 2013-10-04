<?php
/**
 * @file
 * This file contains themeing functions for islandora_critical_edition.
 */

/**
 * Implements hook_preprocess_islandora_critical_edition().
 *
 * Prepares variables for the CWRC viewer.
 * $variables['islandora_object']
 * $variables['anno_list_pane']
 * $variables['anno_img_pane']
 * $variables['images_path']
 */
function islandora_critical_edition_preprocess_islandora_critical_edition(&$variables) {
  global $base_url;
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  module_load_include('inc', 'islandora_image_annotation', 'includes/utils');

  // Local Critical Editions module path.
  $critical_edition_module_path = drupal_get_path('module', 'islandora_critical_edition');

  // Islandora Image Annotation base path, required module.
  $image_annotation_module_path = drupal_get_path('module', 'islandora_image_annotation');
  $pages = islandora_paged_content_get_pages($variables['islandora_object']);
  $pids = array_keys($pages);
  // Use the theme files from image annotation for annotation list
  // and image annotation pane's.
  $variables['anno_list_pane'] = theme('islandora_anno_list_pane');
  $variables['anno_img_pane'] = theme('islandora_anno_image_pane');
  drupal_add_css($critical_edition_module_path . "/css/islandora_critical_edition.css");
  // Fill additional session variables.
  $variables['images_path'] = url($critical_edition_module_path . '/CWRC-Writer/src/img/', array('absolute' => TRUE));
  $image_anno_images = $image_annotation_module_path . '/shared_canvas/imgs/';
  drupal_add_js(array('islandora_critical_edition' => array('image_anno_img' => $image_anno_images)), 'setting');
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'book_pid' => islandora_critical_edition_get_object_of_critical_edition(
          $variables['islandora_object']))), 'setting');

  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'images_path' => $variables['images_path'])), 'setting');
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'base_url' => $base_url)), 'setting');
  // Passing the page pid, instead of getting if from the
  // URL on the javascript side.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'page_pid' => $pids[0])), 'setting');

  // To avoid hard coded values in js, this is the best option.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'module_base' => $critical_edition_module_path)), 'setting');
  drupal_add_js($critical_edition_module_path . "/js/writer_backend_delegate.js");
  drupal_add_js($critical_edition_module_path . '/js/writer_wrapper.js');

  drupal_add_js($critical_edition_module_path . '/CWRC-Writer/src/js/lib/jquery/jquery-1.8.3.js');
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jquery/jquery-ui-1.9.0.custom.min.js");
  islandora_image_annotation_include_common_js();

  drupal_add_js($critical_edition_module_path . "/js/writer_backend_delegate.js");
  drupal_add_js($critical_edition_module_path . '/js/writer_wrapper.js');
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jquery/jquery.layout-latest.min.js");
  drupal_add_css($critical_edition_module_path . "/css/islandora_critical_edition_editor.css");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jquery/jquery.layout.resizeTabLayout-1.3.js");

  drupal_add_css($critical_edition_module_path . "/CWRC-Writer/src/smoothness/jquery-ui-1.10.3.custom.min.css");
  islandora_image_annotation_include_common_css();

  drupal_add_js($critical_edition_module_path . '/CWRC-Writer/src/js/lib/jquery/jquery.collapsiblepanel.js');
  drupal_add_css($critical_edition_module_path . '/CWRC-Writer/src/js/lib/jquery/jquery.collapsiblepanel.css');

  drupal_add_js($critical_edition_module_path . '/js/dialog_annotate.js');
  drupal_add_css($critical_edition_module_path . "/css/style_2.css");
  drupal_add_css($critical_edition_module_path . "/CWRC-Writer/src/css/tei.css");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jquery/jquery.tmpl.min.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jquery/jquery.watermark.min.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/tinymce/tiny_mce_src.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/tinymce/jquery.tinymce.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/snippet/jquery.snippet.min.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/tinymce/copy_event.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jstree/jquery.hotkeys.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/jstree/jquery.jstree.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/moment/moment.min.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/objtree/ObjTree.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/utilities.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/filemanager.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/entitieslist.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/entities_model.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/relations.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/validation.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/selection.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/delegator.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_addevent.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_addorg.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_addperson.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_addplace.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_citation.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_correction.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_date.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_header.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_keyword.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_link.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_message.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_note.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_search.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_settings.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_title.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_triple.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialogs/dialog_filemanager.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/structuretree.js");

  drupal_add_css($critical_edition_module_path . "/CWRC-Writer/src/css/layout-default-latest.css");
  drupal_add_css($critical_edition_module_path . "/CWRC-Writer/src/css/image_local.css");

  drupal_add_css($critical_edition_module_path . "/css/islandora_critical_edition_style.css");
  drupal_add_css($critical_edition_module_path . "/css/style.css");

  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/editor.js");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/tagger.js");

  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/dialog.js");

  drupal_add_js($critical_edition_module_path . "/js/startup.js");
  drupal_add_js($critical_edition_module_path . "/js/init.js");
  drupal_add_css($critical_edition_module_path . "/CWRC-Writer/src/js/lib/snippet/jquery.snippet.css");
  drupal_add_js($critical_edition_module_path . "/CWRC-Writer/src/js/lib/tinymce/jquery.tinymce.js");

}
