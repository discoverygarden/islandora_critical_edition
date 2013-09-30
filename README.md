CONTENTS OF THIS FILE
---------------------

 * summary
 * configuration

SUMMARY
-------

A module for creating critical editions of Islandora objects.  Only supports
books.  The CWRCWriter only supports the Firefox browser.


CONFIGURATION
--------------

The islandora_image_annotation module needs to be configured to allow
annotation of the Islandora Page Content Model on the JPG datastream for
successful viewing of the shared canvas in Firefox.

The CSS/JS folders has all the files necessary to make Islandora work with CWRC.
Included are custom CSS and JavaScript files required to interact with the 
new CWRC-Writer API. Most top level Islandora functionality is wrapped up 
in the 'islandora_writer_wrapper.js' file. That said, there is a file called
'delegator.js' located in 'CWRC-Writer/src/js/delegator.js' that, in the 
future, should be overridden and placed in this '/js' directory.