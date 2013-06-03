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
 * @param AbstractObject $fedora_object
 *   The object to create the CWRC datastream for. It should have an OCR
 *   datastream.
 */
function islandora_critical_edition_add_cwrc_datastream(AbstractObject $fedora_object) {
  $ocr_in = $fedora_object['OCR']->content;
  $lines = explode("\n", $ocr_in);
  $preface = '<?xml version="1.0"?>
<html>
    <head>
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:w="http://cwrctc.artsrn.ualberta.ca/#"></rdf:RDF>
    </head>
    <body>
        <tei id="struct_01" _tag="TEI" _display="TEI" _struct="true">
            <span _tag="text" _struct="true" id="struct_02" _display="text">';

  $postscript = '            </span>
        </tei>
    </body>
</html>';
  $ocr = "";
  if (is_array($lines)) {
    foreach ($lines as $line) {
      $line = trim(preg_replace('/&£/', '£', $line));
      $line = htmlspecialchars($line);
      $ocr .= $line . '<br />';
    }
  }
  if (empty($ocr)) {
    $ocr = "Blank Page";
  }

  $cwrc_stream = $preface . $ocr . $postscript;
  $cwrc_datastream = $fedora_object->constructDatastream('CWRC');
  $cwrc_datastream->label = 'CWRC';
  $cwrc_datastream->mimetype = 'text/plain';
  $cwrc_datastream->setContentFromString($cwrc_stream);
  $fedora_object->ingestDatastream($cwrc_datastream);
}
