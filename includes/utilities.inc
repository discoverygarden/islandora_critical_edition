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
  try {
    $ocr_in = $fedora_object['OCR']->content;
    $lines = explode("\n", $ocr_in);

    $preface = '<?xml version="1.0" encoding="UTF-8"?>
          <TEI xml:id="struct_35" xmlns="http://www.tei-c.org/ns/1.0">
            <teiHeader xml:id="struct_530">
             <fileDesc xml:id="struct_531">
               <titleStmt xml:id="struct_532">
                 <title xml:id="struct_533">Sample Document Title</title>
               </titleStmt>
               <publicationStmt xml:id="struct_534">
                 <p xml:id="struct_535"></p>
               </publicationStmt>
               <sourceDesc xml:id="struct_536" sameAs="http://www.cwrc.ca">
                 <p xml:id="struct_537">Created from islandora book ingest unless otherwise noted.</p>
               </sourceDesc>
             </fileDesc>
           </teiHeader>
           <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#"></rdf:RDF>
                   <span _tag="text" _struct="true" id="struct_02" _display="text">';
    $postscript = '            </span>
          </TEI>';
    $ocr = '<text xml:id="struct_611"><body xml:id="struct_612"><div xml:id="struct_613" type="letter">﻿<p>';
    if (is_array($lines)) {
      foreach ($lines as $line) {
        $line = trim(preg_replace('/&£/', '£', $line));
        $line = htmlspecialchars($line);
        $ocr .= $line . '<lb/>';
      }
      $ocr .= '</p></div></body></text>';
    }
    if (empty($ocr)) {
      $ocr = "Blank Page";
    }

    $cwrc_stream = $preface . $ocr . $postscript;
    if (!$fedora_object['CWRC']) {
      $cwrc_datastream = $fedora_object->constructDatastream('CWRC');
    }
    else {
      $cwrc_datastream = $fedora_object['CWRC'];
    }
    if ($cwrc_datastream->label != 'CWRC') {
      $cwrc_datastream->label = 'CWRC';
    }
    if ($cwrc_datastream->mimetype != 'text/plain') {
      $cwrc_datastream->mimetype = 'text/plain';
    }
    $cwrc_datastream->setContentFromString($cwrc_stream);
    $fedora_object->ingestDatastream($cwrc_datastream);
  }
  catch (Exception $e) {
    drupal_set_message(t(
        'An error occured while creating the CWRC datastream on @pid with message: "@message"',
        array(
          '@pid' => $fedora_object->id,
          "@message" => $e->getMessage(),
        )
      ),
      'error'
    );
    watchdog(
      'islandora_critical_edition',
      'An error occured while creating the CWRC datastream on @pid with message: "@message" and stack: @trace',
      array(
        '@pid' => $fedora_object->id,
        '@message' => $e->getMessage(),
        '@trace' => $e->getTraceAsString(),
      ),
      WATCHDOG_ERROR
    );
  }
}
