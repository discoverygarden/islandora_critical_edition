
// toggle full window

(function ($) {
  Drupal.behaviors.CwrcFullWindow = {
    attach: function (context, settings){
      $('#full-window-button').click(function() {

        $('.islandora-crited-wrapper').toggleClass('islandora-crited-fullwindow');

        if ($(this).val() == Drupal.t('Full Window')) {
          $(this).val(Drupal.t('Exit Full Window'));

        }
        else {
          $(this).val(Drupal.t('Full Window'));
        }
      });
    }
  };
})(jQuery);
