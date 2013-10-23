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
  $form['islandora_critical_edition_validate_url'] = array(
    '#type' => 'textfield',
    '#title' => t('Validation endpoint'),
    '#default_value' => variable_get('islandora_critical_edition_validate_url', '/validator/validate.html'),
    '#description' => t('Configure the cwrc-validator endpoint. With an external endpoint, proxy configuration my be required.'),
    '#required' => TRUE,
  );
  return system_settings_form($form);
}
