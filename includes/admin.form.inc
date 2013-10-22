<?php
/**
 * @file
 * Admin callbacks for Islandora Critical Edition
 */

/**
 * Creates the admin form for islandora_critical_edition.
 *
 * @return array
 *   Islandora critical edition admin form.
 */
function islandora_critical_edition_admin($form, &$form_state) {
  global $base_url;
  $form['islandora_critical_edition_validate_url_field'] = array(
    '#type' => 'textfield',
    '#title' => t('Validation endpoint'),
    '#default_value' => variable_get('islandora_critical_edition_validate_url', $base_url . 'validator/validate.html'),
    '#description' => t('Configure the cwrc-validator endpoint. This could point to an external URL.'),
    '#required' => TRUE,
  );
  $form['actions'] = array(
    '#type' => 'actions',
  );
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save Configuration'),
    '#weight' => 0,
    '#submit' => array('islandora_critical_edition_admin_submit'),
  );
  return $form;
}

/**
 * Submit handler for the admin form.
 *
 * @param array $form
 *   The admin form.
 *
 * @param array $form_state
 *   The admin form state.
 */
function islandora_critical_edition_admin_submit($form, &$form_state) {
  variable_set('islandora_critical_edition_validate_url',
    $form_state['values']['islandora_critical_edition_validate_url_field']);
}
