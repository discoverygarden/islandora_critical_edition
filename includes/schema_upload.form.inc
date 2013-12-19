<?php

/**
 * @file
 * Holds the schema and css upload form..
 */

/**
 * The schema upload form.
 *
 * @param array $form
 *   The current form.
 * @param array $form_state
 *   The current form state.
 *
 * @return array
 *   The current form.
 */
function islandora_critical_edition_schema_upload_form(array $form, array &$form_state) {
  $upload_size = min((int) ini_get('post_max_size'), (int) ini_get('upload_max_filesize'));
  $rng_extensions = array('rng');
  $css_extensions = array('css');
  $xslt_extensions = array('xsl', 'xslt');
  $form = array();
  $form['rng_file'] = array(
    '#title' => t('RNG File'),
    '#type' => 'managed_file',
    '#required' => TRUE,
    '#description' => t('Select file to upload.<br/>Files must be less than <b>@size MB.</b><br/>Allowed file types: <b>@ext.</b>', array('@size' => $upload_size, '@ext' => $rng_extensions[0])),
    '#default_value' => isset($form_state['values']['files']) ? $form_state['values']['files'] : NULL,
    '#upload_location' => 'temporary://',
    '#upload_validators' => array(
      'file_validate_extensions' => $rng_extensions,
       // Assume it's specified in MB.
      'file_validate_size' => array($upload_size * 1024 * 1024),
    ),
  );
  $form['css_file'] = array(
    '#title' => t('RDF-CSS File'),
    '#type' => 'managed_file',
    '#required' => TRUE,
    '#description' => t('Select file to upload.<br/>Files must be less than <b>@size MB.</b><br/>Allowed file types: <b>@ext.</b>', array('@size' => $upload_size, '@ext' => $css_extensions[0])),
    '#default_value' => isset($form_state['values']['files']) ? $form_state['values']['files'] : NULL,
    '#upload_location' => 'temporary://',
    '#upload_validators' => array(
      'file_validate_extensions' => $css_extensions,
      // Assume it's specified in MB.
      'file_validate_size' => array($upload_size * 1024 * 1024),
    ),
  );
  $form['xslt_file'] = array(
    '#title' => t('XSLT File'),
    '#type' => 'managed_file',
    '#description' => t('Select file to upload.<br/>Files must be less than <b>@size MB.</b><br/>Allowed file types: <b>@ext.</b>', array('@size' => $upload_size, '@ext' => $rng_extensions[0])),
    '#default_value' => isset($form_state['values']['files']) ? $form_state['values']['files'] : NULL,
    '#upload_location' => 'temporary://',
    '#upload_validators' => array(
      'file_validate_extensions' => $xslt_extensions,
       // Assume it's specified in MB.
      'file_validate_size' => array($upload_size * 1024 * 1024),
    ),
  );
  return $form;
}

/**
 * Addes the uploaded file into the ingestable objects 'OBJ' datastream.
 *
 * @param array $form
 *   The drupal form.
 * @param array $form_state
 *   The drupal form state.
 */
function islandora_critical_edition_schema_upload_form_submit(array $form, array &$form_state) {
  $object = $form_state['islandora']['objects'][0];
  if (empty($object['RDF-SCHEMA'])) {
    $ds = $object->constructDatastream('RDF-SCHEMA', 'M');
    $object->ingestDatastream($ds);
  }
  else {
    $ds = $object['RDF-SCHEMA'];
  }
  $rng_file = file_load($form_state['values']['rng_file']);
  $rng_path = drupal_realpath($rng_file->uri);
  $ds->setContentFromFile($rng_path, FALSE);
  $ds->label = $rng_file->filename;
  $ds->mimetype = "application/rdf+xml";

  if (empty($object['RDF-CSS'])) {
    $ds = $object->constructDatastream('RDF-CSS', 'M');
    $object->ingestDatastream($ds);
  }
  else {
    $ds = $object['RDF-CSS'];
  }
  $css_file = file_load($form_state['values']['css_file']);
  $css_path = drupal_realpath($css_file->uri);
  $ds->setContentFromFile($css_path, FALSE);
  $ds->label = $css_file->filename;
  $ds->mimetype = "text/css";

  $xslt_file = file_load($form_state['values']['xslt_file']);
  if ($xslt_file) {
    if (empty($object['RDF-XSLT'])) {
      $ds = $object->constructDatastream('RDF-XSLT', 'M');
      $object->ingestDatastream($ds);
    }
    else {
      $ds = $object['RDF-XSLT'];
    }
    $xslt_path = drupal_realpath($xslt_file->uri);
    $ds->setContentFromFile($xslt_path, FALSE);
    $ds->label = $xslt_file->filename;
    $ds->mimetype = 'application/xslt+xml';
  }
}
