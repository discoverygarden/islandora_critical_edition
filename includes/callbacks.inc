<?php

/**
 * @file
 * Holds the ajax callbacks for the cwrcwriter.
 */

/**
 * Callback to set the user selected schema as prefered for this user/page pid.
 *
 * @param AbstractObject $islandora_object
 *   The islandora page object.
 * @param AbstractObject $schema_object
 *   The islandora_schema object.
 */
function islandora_critical_edition_set_user_schema(AbstractObject $islandora_object, AbstractObject $schema_object) {
  $valid = html_entity_decode(stripslashes(check_plain($_POST['valid'])), ENT_QUOTES, 'UTF-8');
  islandora_critical_edition_schema_work($islandora_object, $schema_object, $valid);
  drupal_json_output('Saved');
  drupal_exit();
}

/**
 * Worker function for schema definitions.
 *
 * @param AbstractObject $islandora_object
 *   The islandora page object.
 * @param AbstractObject $schema_object
 *   The Scheme object in islandora.
 * @param int $valid
 *   An integer indicating if the schema/doc combo is valid.
 */
function islandora_critical_edition_schema_work(AbstractObject $islandora_object, AbstractObject $schema_object, $valid) {
  global $user;
  module_load_include('inc', 'islandora_critical_edition', 'includes/schema_table_utils');

  // Check for an existing schema for this user and this page pid.
  $save = islandora_critical_edition_get_user_selected_schema($user->name, $islandora_object->id);
  if ($save->name == $user->name) {
    // Remove that entry if it exists.
    islandora_critical_edition_remove_user_selected_schema($save->lid);
  }
  // Set it to the currently selected schema.
  islandora_critical_edition_add_user_selected_schema($user->name, $islandora_object->id, $schema_object->id, $valid);
}
/**
 * Provides all the parameters necessary for CWRCWriter to operate with Fedora.
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
  $stroke_width = variable_get('image_annotation_annotation_stroke_width', '1%');
  $critical_edition_relationships = $fedora_object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isPageOf');
  $critical_edition = $critical_edition_relationships[0]['object']['value'];
  $critical_edition_object = islandora_object_load($critical_edition);
  $title = $critical_edition_object->label;
  $page_results = islandora_paged_content_get_pages($critical_edition_object);
  $pages = array();
  foreach ($page_results as $result) {
    $pages[$result['page']] = $result['pid'];
  }
  $position = array_search($fedora_object->id, $pages);
  $results = array();
  $results['uid'] = $user->uid;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['title'] = $title;
  $results['no_edit'] = !islandora_critical_edition_edit_cwrc_access($fedora_object);
  $results['page_count'] = count($pages);
  $results['islandora_anno_stroke_width'] = $stroke_width;

  $place_entity_collection = variable_get('islandora_entities_places_collection', 'islandora:entity_collection');
  $results['create_entity_callbacks']['places'] = url('islandora/object/' . $place_entity_collection . '/manage/overview/ingest');
  $event_entity_collection = variable_get('islandora_entities_events_collection', 'islandora:entity_collection');
  $results['create_entity_callbacks']['events'] = url('islandora/object/' . $event_entity_collection . '/manage/overview/ingest');
  $organization_entity_collection = variable_get('islandora_entities_organizations_collection', 'islandora:entity_collection');
  $results['create_entity_callbacks']['organizations'] = url('islandora/object/' . $organization_entity_collection . '/manage/overview/ingest');
  $person_entity_collection = variable_get('islandora_entities_people_collection', 'islandora:entity_collection');
  $results['create_entity_callbacks']['people'] = url('islandora/object/' . $person_entity_collection . '/manage/overview/ingest');

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
  module_load_include('inc', 'islandora_markup_editor', 'includes/utilities');
  try {
    parse_str(file_get_contents('php://input'), $put);
    // @codingStandardsIgnoreStart
    $data = $put['text'];
    $cwrc = str_replace('<br>', '<br />', $data);
    // @codingStandardsIgnoreEnd
    $cwrc = str_replace('&', '&amp;', $cwrc);
    // Update ds.
    if (!isset($fedora_object["CWRC"])) {
      $obj_ds = $fedora_object->constructDatastream('CWRC', 'M');
      $fedora_object->ingestDatastream($obj_ds);
    }
    else {
      $obj_ds = $fedora_object["CWRC"];
    }
    $obj_ds->setContentFromString($cwrc);

    // Sanitize the schema URL, incase it gets managled during transport.
    $schema = html_entity_decode(stripslashes(check_plain($put['schema'])), ENT_QUOTES, 'UTF-8');
    islandora_markup_editor_add_tei_processing_instruction($fedora_object, $schema, "CWRC");
    drupal_json_output($cwrc);
  }
  catch (Exception $e) {
    watchdog('islandora_critical_edition',
      'Failed to set CWRC datastream content for pid @pid</br>code: @code<br/>message: @msg',
      array(
        '@pid' => $fedora_object->id,
        '@code' => $e->getCode(),
        '@msg' => $e->getMessage(),
      ),
      WATCHDOG_ERROR
    );
    drupal_json_output(array("Error" => "An error occured updating "));
  }
}

/**
 * Ajax callback for Shared Canvas.
 *
 * Supplies the basic data, including manifest URI.
 *
 * @param AbstractObject $fedora_object
 *   The Fedora object to supply the data for
 */
function islandora_critical_edition_canvas_setup(AbstractObject $fedora_object) {
  module_load_include('inc', 'islandora_image_annotation', 'includes/utils');
  module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
  $stroke_width = variable_get('image_annotation_annotation_stroke_width', '1%');
  $relationships = $fedora_object->relationships->get();
  foreach ($relationships as $relationship) {
    if ($relationship['predicate']['value'] == 'isEditionOf') {
      $page_object = islandora_object_load($relationship['object']['value']);
    }
  }

  $page_object_of_relationship = $page_object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isPageOf');
  $book_object = islandora_object_load($page_object_of_relationship[0]['object']['value']);
  $pages = array_keys(islandora_paged_content_get_pages($book_object));
  $position = array_search($page_object->id, $pages);

  $results = islandora_image_annotation_canvas_init($page_object->id);
  $results['islandora_anno_stroke_width'] = $stroke_width;
  $results['position'] = $position;
  $results['pages'] = $pages;
  $results['no_edit'] = !islandora_critical_edition_edit_cwrc_access($fedora_object);
  $results['entities_search_callback'] = url('islandora/entities/search');
  drupal_json_output($results);
}
