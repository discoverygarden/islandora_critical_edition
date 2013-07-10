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

  // Fill additional session variables.
  $variables['images_path'] = url($image_annotation_module_path . '/shared_canvas', array('absolute' => TRUE));
  drupal_add_js(array('islandora_image_annotation' => array('images_path' => $variables['images_path'] . '/imgs')), 'setting');
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'book_pid' => islandora_critical_edition_get_object_of_critical_edition(
          $variables['islandora_object']))), 'setting');

  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'images_path' => $variables['images_path'])), 'setting');

  // Passing the page pid, instead of getting if from the
  // URL on the javascript side.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'page_pid' => $pids[0])), 'setting');

  // To avoid hard coded values in js, this is the best option.
  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'module_base' => $critical_edition_module_path)), 'setting');

  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/css/style_2.css');
  // This custom css differs from the one in the image annotation module.
  islandora_image_annotation_include_common_css();
  
  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/js/snippet/jquery.snippet.css');
  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/css/emic_canvas.css');
  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/css/screen.css');
  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/css/style.css');
  drupal_add_css($critical_edition_module_path . '/cwrcwriter/resources/css/critical_edition.css');
  
  islandora_image_annotation_include_common_js();
  
  
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/tinymce/jscripts/tiny_mce/jquery.tinymce.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/jstree/jquery.hotkeys.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/jstree/jquery.jstree.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/snippet/jquery.snippet.min.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/dialogs/dialog_settings.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/editor.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/dialog.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/filemanager.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/structuretree.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/entitieslist.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/relations.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/resize-columns.js');
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/Islandora/js/startup.js');

  // Critical Editions requires its own js init script.
  drupal_add_js($critical_edition_module_path . '/cwrcwriter/resources/js/islandora_init.js');
}
