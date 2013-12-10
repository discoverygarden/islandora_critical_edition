<?php
/**
 * @file
 * This file is for managing critical editions cwrc datastream regeneration.
 */

/**
 * Regenerate the TEI-RDF datastream for the given object.
 *
 * @param array $form
 *   The Drupal form.
 * @param array $form_state
 *   The Drupal form state.
 * @param AbstractObject $object
 *   The object to rebuild the cwrc datastream for.
 *
 * @return array
 *   The drupal form definition.
 */
function islandora_critical_edition_regen_cwrc_datastream($form, &$form_state, AbstractObject $object) {
  $form_state['islandora_critical_edition'] = $object->id;
  return confirm_form($form,
    t('Are you sure you want to regenerate the RDF-TEI datastream for object %id?', array('%id' => $object->id)),
    "islandora/object/$object->id",
    t('Changes made to this datastream, including linking entities
      within the text (corrects, TEI, entities) will be erased permanently.
      If datastream versioning is enabled, this will create a new version from the
      original source to be used by default, preserving edits in a previous version'),
    t('Yes'),
    t('Cancel')
  );
}

/**
 * Submit handler for the regen_cwrc_datastream form.
 *
 * @param array $form
 *   The Drupal form.
 * @param array $form_state
 *   The Drupal form state.
 */
function islandora_critical_edition_regen_cwrc_datastream_submit($form, &$form_state) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  $object = islandora_object_load($form_state['islandora_critical_edition']);
  $source_pid = $object->relationships->get(ISLANDORA_RELS_EXT_URI, 'isEditionOf');
  $source = islandora_object_load($source_pid[0]['object']['value']);
  if ($source) {
    // Replace the OCR content in the critical edition page source
    // with the source OCR content.
    if ($source['OCR']) {
      $object['OCR']->content = $source['OCR']->content;
    }
    // Update the CWRC datastream from the OCR datastream.
    islandora_critical_edition_add_cwrc_datastream($object);
  }
  drupal_goto("islandora/object/$object->id");
}
