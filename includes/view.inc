<?php
/**
 * @file
 * Holds functionality to show the critical editions available for an object.
 */

/**
 * Display links to all the critical editions for an object.
 *
 * @return array
 *   A render array containing a list of links to the Critical Editions.
 */
function islandora_critical_edition_view_edition_form($editions) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');

  $links = array();

  if (!user_access(VIEW_CRITICAL_EDITION)) {
    return $links;
  }

  foreach ($editions as $pid => $title) {
    $links[] = l($title, "islandora/object/$pid");
  }

  $links_theme_variables = array(
    'title' => t("Critical Editions"),
    'type' => 'ul',
    'items' => $links,
    'attributes' => array(),
  );

  return array(
    '#title' => t('Content'),
    '#description' => t('View'),
    '#type' => 'markup',
    '#markup' => theme_item_list($links_theme_variables),
    '#id' => "edition_title",
  );
}
