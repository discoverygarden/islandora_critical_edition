<?php
/**
 * @file
 * Holds utility functions for islandora_critical_editions.
 */

/**
 * Returns PID and title of all critical editions associated with an object.
 *
 * @param AbstractObject $fedora_object
 *   The base object to check for related critical editions.
 *
 * @return array
 *   The list of critical editions.
 */
function islandora_critical_edition_get_critical_editions(AbstractObject $fedora_object) {
  $edition_pids = array();

  $query = "
select \$subject \$title from <#ri>
where (\$subject <" . ISLANDORA_RELS_EXT_URI . ISLANDORA_CRITICAL_EDITION_IS_CRITICAL_EDITION_OF . ">'" . $fedora_object->id . "'
and \$subject <" . FEDORA_MODEL_URI . "state> <" . FEDORA_MODEL_URI . "Active>
and \$subject <dc:title> \$title)
";

  $objects = $fedora_object->repository->ri->itqlQuery($query, 'unlimited');
  if (!empty($objects)) {
    foreach ($objects as $object) {
      $edition_pids[$object['subject']['value']] = $object['title']['value'];
    }
  }

  return $edition_pids;
}

/**
 * Returns the base object associated with a critical edition.
 *
 * @param AbstractObject $fedora_object
 *   The critical edition object to check for a related base object.
 *
 * @return string
 *   The PID of the base object.
 */
function islandora_critical_edition_get_object_of_critical_edition(AbstractObject $fedora_object) {
  $critical_edition_relationships = $fedora_object->relationships->get(ISLANDORA_RELS_EXT_URI, ISLANDORA_CRITICAL_EDITION_IS_CRITICAL_EDITION_OF);
  return $critical_edition_relationships[0]['object']['value'];
}

/**
 * Constructs CWRC datastream on an object if none exists.
 *
 * @param AbstractObject $object
 *   The object to create the CWRC datastream for. It should have an OCR
 *   datastream.
 */
function islandora_critical_edition_add_cwrc_datastream(AbstractObject $object) {
  try {
    $cwrc_stream = islandora_critical_edition_wrap_plain_text_in_tei($object['OCR']->content);
    if (!$object['CWRC']) {
      $cwrc_datastream = $object->constructDatastream('CWRC');
    }
    else {
      $cwrc_datastream = $object['CWRC'];
    }
    if ($cwrc_datastream->label != 'CWRC') {
      $cwrc_datastream->label = 'CWRC';
    }
    if ($cwrc_datastream->mimetype != 'text/plain') {
      $cwrc_datastream->mimetype = 'text/plain';
    }
    $cwrc_datastream->setContentFromString($cwrc_stream);
    $object->ingestDatastream($cwrc_datastream);
  }
  catch (Exception $e) {
    drupal_set_message(t(
        'An error occured while creating the CWRC datastream on @pid with message: "@message"',
        array(
          '@pid' => $object->id,
          "@message" => $e->getMessage(),
        )
      ),
      'error'
    );
    watchdog(
      'islandora_critical_edition',
      'An error occured while creating the CWRC datastream on @pid with message: "@message" and stack: @trace',
      array(
        '@pid' => $object->id,
        '@message' => $e->getMessage(),
        '@trace' => $e->getTraceAsString(),
      ),
      WATCHDOG_ERROR
    );
  }
}

/**
 * Generates a TEI document from the given object's OCR datastream.
 *
 * @param AbstractObject $object
 *   The object to generate the TEI document from, it should have an OCR
 *   datastream.
 */
function islandora_critical_edition_generate_tei_from_ocr(AbstractObject $object) {
  $content = isset($object['OCR']) ? $object['OCR']->content : NULL;
  if (isset($object['OCR'])) {
    return islandora_critical_edition_wrap_plain_text_in_tei($object['OCR']->content);
  }
  // Return the Default blank text.
  return islandora_critical_edition_wrap_plain_text_in_tei();
}

/**
 * Generates a TEI document with the given text content.
 *
 * This function is used to generate the CWRC datastream content from the
 * objects OCR datastream.
 *
 * @param string $content
 *   The plain text to be wrapped in a TEI document.
 */
function islandora_critical_edition_wrap_plain_text_in_tei($content = 'Blank Page') {
  $markup_editor_module_path = drupal_get_path('module', 'islandora_markup_editor');
  $schema = file_create_url("$markup_editor_module_path/CWRC-Writer/src/schema/CWRC-TEIBasic.rng");
  $prefix = '<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="' . $schema . '" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<TEI xml:id="struct_35" xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader xml:id="struct_530">
    <fileDesc xml:id="struct_531">
      <titleStmt xml:id="struct_532">
        <title xml:id="struct_533">Sample Document Title</title>
      </titleStmt>
      <publicationStmt xml:id="struct_534">
        <p xml:id="struct_535"/>
      </publicationStmt>
      <sourceDesc xml:id="struct_536" sameAs="http://www.cwrc.ca">
        <p xml:id="struct_537">Created from islandora book ingest unless otherwise noted.</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#"></rdf:RDF>
  <text>
    <body><ab>';
  $suffix = '</ab></body></text></TEI>';

  // Correct common problems with the incoming text, and replace line breaks
  // with there TEI equivalent.
  $content = trim(preg_replace('/&£/', '£', $content));
  $content = htmlspecialchars($content);
  $content = trim(preg_replace("/\n/", '<lb/>', $content));

  return $prefix . $content . $suffix;
}

/**
 * Constructs the basic schemas.
 *
 * @return array
 *   An array of constructed, default schemas.
 */
function islandora_critical_edition_construct_schema_config_object() {
  // Get all available schemas.
  $schema_collection = islandora_object_load('islandora:tei_schema_collection');
  $schema_pids = islandora_critical_edition_get_schema_pids($schema_collection);
  $config_sample['schemas'] = array();
  // Fill schemas from the schema's collection.
  foreach ($schema_pids as $schema_pid) {
    $schema = islandora_object_load($schema_pid);
    $rdf_datastream = $schema['RDF-SCHEMA'];

    $css_datastream = $schema['RDF-CSS'];

    $schema_dc = new DublinCore($schema['DC']->content);
    $all_titles = $schema_dc->dc->dc['dc:title'];

    $config_sample['schemas'][$all_titles[0]] = array(
      "name" => $all_titles[0],
      "url" => url("islandora/object/$schema_pid/datastream/RDF-SCHEMA/view/$rdf_datastream->label"),
      "cssUrl" => url("islandora/object/$schema_pid/datastream/RDF-CSS/view/$css_datastream->label"),
      "pid" => $schema_pid,
    );
  }

  // Add all the sample schemas.
  $critical_edition_module_path = drupal_get_path('module', 'islandora_markup_editor');
  $config_sample['schemas']['tei'] = array(
    "name" => 'CWRC EMiC TEI',
    "url" => url($critical_edition_module_path . "/CWRC-Writer/src/schema/CWRC_EMiC_TEI.rng"),
    "cssUrl" => url($critical_edition_module_path . "/CWRC-Writer/src/css/tei_converted.css"),
    "pid" => 'islandora:tei_sample_schema',
  );
  return $config_sample;
}

/**
 * Gets a list of all schema PIDs.
 *
 * @param AbstractObject $object
 *   The collection object.
 * @param string $type
 *   Limit the child PID's to those of the given content model.
 *
 * @return array
 *   The list of child PIDs.
 */
function islandora_critical_edition_get_schema_pids(AbstractObject $object, $type = 'islandora:criticaleditionschemaCModel') {
  module_load_include('inc', 'islandora', 'includes/utilities');
  $params = array(
    'object' => $object,
    'page_size' => -1,
  );

  if (isset($type)) {
    $params['model'] = "<info:fedora/$type>";
  }

  $map_results = function($o) {
    return $o['object']['value'];
  };

  $query_info = islandora_basic_collection_get_query_info($params);
  $results = $object->repository->ri->query($query_info['query'], $query_info['type']);

  return array_map($map_results, $results);

}
