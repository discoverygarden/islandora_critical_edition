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
 */
function islandora_critical_edition_preprocess_islandora_critical_edition(&$variables) {
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  $module_path = drupal_get_path('module', 'islandora_critical_edition');

  $pages = islandora_paged_content_get_pages($variables['islandora_object']);
  $pids = array_keys($pages);

  $variables['viewer_url'] = url($module_path .
                                 "/cwrcwriter/resources/index.php", array(
                                   'query' => array(
                                     'PID' => $pids[0])));

  drupal_add_js(array(
      'islandora_critical_edition' => array(
        'book_pid' => islandora_critical_edition_get_object_of_critical_edition(
          $variables['islandora_object']))), 'setting');

  drupal_add_js($module_path . '/cwrcwriter/js/critical_edition.js');
  drupal_add_css($module_path . '/cwrcwriter/css/critical_edition.css');
}
