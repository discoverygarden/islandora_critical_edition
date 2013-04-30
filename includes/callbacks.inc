<?php
/**
 * @file
 *   Holds the ajax callbacks for the cwrcwriter.
 */

/**
 * Provides all the parameters necessary for CWRCWriter to operate with Fedora.
 *
 * @XXX There is no 7.x authority module yet. Alan knows how to integrate.
 *   @code
 *     $results['authority_url'] = url();
 *     $results['authority_mappings'] =
 *       islandora_critical_edition_get_authority_mappings();
 *   @endcode
 *
 * @global User $user
 *
 * @param AbstractObject $fedora_object
 *   The object to get the info on for the CWRC writer.
 */
function islandora_critical_edition_setup(AbstractObject $fedora_object) {
  module_load_include('inc', 'islandora_basic_collection', 'includes/utilities');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  global $user;

  $critical_edition_relationships = $fedora_object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isPageOf');
  $critical_edition = $critical_edition_relationships[0]['object']['value'];
  $critical_edition_object = islandora_object_load($critical_edition);
  $title = $critical_edition_object->label;
  $pages = islandora_paged_content_get_pages($critical_edition_object);
  $pages = array_keys($pages);
  $position = array_search($fedora_object->id, $pages);
  $results = array();
  $results['uid'] = $user->uid;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['title'] = $title;
  $results['no_edit'] = !islandora_critical_edition_edit_cwrc_access($fedora_object);
  $results['page_count'] = count($pages);

  drupal_json_output($results);

}

/**
 * Persists CWRC datastream to a Critical Edition object.
 *
 * @post text
 *   The contents of the CWRC datastream.
 *
 * @param AbstractObject $fedora_object
 *   The fedora object to upload the CWRC datastream to.
 */
function islandora_critical_edition_savedata(AbstractObject $fedora_object) {

  $data = html_entity_decode(stripslashes($_POST['text']), ENT_QUOTES, 'UTF-8');
  $cwrc = str_replace('<br>', '<br />', $data);
  $cwrc = str_replace('&', '&amp;', $cwrc);

  $fedora_object["CWRC"]->content = $cwrc;

  echo "Success";
}

/**
 * Ajax callback for Shared Canvas
 * Supplies the basic data, including manifest URI.
 *
 * @param AbstractObject $fedora_object
 *   The Fedora object to supply the data for
 */
function islandora_critical_edition_canvas_setup(AbstractObject $fedora_object) {
  module_load_include('inc', 'islandora_image_annotation', 'includes/utils');
  echo islandora_image_annotation_canvas_init($fedora_object->id);
}
