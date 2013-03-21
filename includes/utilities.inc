<?php


/**
 * Returns PID and title of all critical editions associated with a book object
 * @param IslandoraFedoraObject $fedora_object
 * @return array
 */

function islandora_get_critical_editions($fedora_object) {
  $pid = $fedora_object->id;
  module_load_include('inc', 'fedora_repository', 'api/fedora_utils');
  $query = <<<STRING
select \$subject \$title from <#ri>
where (\$subject <http://islandora.ca/ontology/relsext#isCriticalEditionOf> '$pid'
and \$subject <info:fedora/fedora-system:def/model#state> <info:fedora/fedora-system:def/model#Active>
and \$subject <dc:title> \$title)
STRING;

  $objects = $fedora_object->repository->ri->itqlQuery($query, 'unlimited'); // for itql
  if (!empty($objects)) {
    foreach($objects as $object){
      $edition_pids[$object['subject']['value']]=$object['title']['value'];
    }
  }

  return $edition_pids;
}


/**
 * Constructs cwrc datastream if none exists
 * @param IslandoraFedoraObject $fedora_object
 */

function islandora_critical_edition_add_cwrc_datastream($fedora_object) {
  global $base_url;
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
  $count = 100;
  if (is_array($lines)) {
    foreach ($lines as $line) {
      $line = trim(preg_replace('/&£/', '£', $line));

      $line = htmlspecialchars($line);
      $count++;
      // the l tag is not supported in version 2 of cwrcwriter
      // $ocr .=   "<l xml:id='struct_$count'>$line</l>";
      // $ocr .= $line . '<span _editable="true" _struct="true" _tag="lb" id="struct_' . $count++ . '">﻿</span>';
      $count++;
      $ocr .= $line . trim("<span _editable='true' _struct='true' _tag='lb' id='struct_$count' />﻿");
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