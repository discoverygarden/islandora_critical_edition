<?php

function islandora_critical_edition_management(FedoraObject $object) {
  module_load_include('inc', 'islandora_critical_edition', 'includes/critical_edition_creation');
  module_load_include('inc', 'islandora_critical_edition', 'includes/critical_edition_view');
  drupal_set_title($object->label);
  return array(
    'manage_book' => array(
      '#type' => 'vertical_tabs',
      '#weight' => 0,
      '#prefix' => '',
      'create' => array(
        '#access' => user_access(FEDORA_ADD_DS),
        '#title' => t('Create Critical Edition'),
        '#type' => 'fieldset',
        'form' => drupal_get_form('islandora_create_edition_form', $object),
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
      ),
      'view' => array(
        '#access' => user_access(FEDORA_ADD_DS),
        '#title' => t('View Critical Editions'),
        '#type' => 'fieldset',
        'form' => drupal_get_form('islandora_view_edition_form', $object),
        '#collapsible' => TRUE,
        '#collapsed' => TRUE,
      ),
    ),
  );
}