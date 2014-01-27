<?php

/**
 * @file
 * Holds top level functionality for management of critical editions.
 */

/**
 * Generates the tabs for managing the critical editions of an object.
 *
 * @param AbstractObject $object
 *   The current Fedora object.
 *
 * @return array
 *   A render array of tabs for managing critical editions of an object.
 */
function islandora_critical_edition_management(AbstractObject $object) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/utilities');
  module_load_include('inc', 'islandora_critical_edition', 'includes/create');
  module_load_include('inc', 'islandora_critical_edition', 'includes/view');
  module_load_include('inc', 'islandora_critical_edition', 'includes/delete');

  $editions = islandora_critical_edition_get_critical_editions($object);

  drupal_set_title($object->label);
  $items = array();

  $items['manage_book'] = array(
    '#type' => 'vertical_tabs',
    '#weight' => 0,
    '#prefix' => '',
  );

  $items['manage_book']['view'] = array(
    '#access' => user_access(ISLANDORA_CRITICAL_EDITION_VIEW_CRITICAL_EDITION) && $editions,
    '#title' => t('View TEI-RDF Objects'),
    '#type' => 'fieldset',
    'view_critical_editions' => islandora_critical_edition_view_edition_form($editions),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#attributes' => array('class' => array('islandora_crited_fieldset')),
  );

  $items['manage_book']['create'] = array(
    '#access' => user_access(ISLANDORA_CRITICAL_EDITION_CREATE_CRITICAL_EDITION),
    '#title' => t('Create TEI-RDF Object'),
    '#type' => 'fieldset',
    'form' => drupal_get_form('islandora_create_edition_form', $object),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#attributes' => array(
      'class' => array('islandora_crited_fieldset'),
    ),
  );

  $items['manage_book']['delete'] = array(
    '#access' => user_access(ISLANDORA_CRITICAL_EDITION_DELETE_CRITICAL_EDITION) && $editions,
    '#title' => t('Delete TEI-RDF Object'),
    '#type' => 'fieldset',
    'form' => drupal_get_form('islandora_critical_edition_delete_edition_form', $object),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#attributes' => array(
      'class' => array('islandora_crited_fieldset'),
    ),
  );
  return $items;
}
