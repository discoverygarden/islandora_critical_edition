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

CWRC-Writer API
----------------

This version of the CWRC-Writer is build off of commit '7d301986965401f890f9f94ddafccbeefd44db23',
Made by Andrew MacDonald. Current CWRC-Writer repo: https://github.com/cwrc/CWRC-Writer.git.

KNOWN ISSUES: 
----------------

-The context menu does not always stay open in FireFox on mac OSX.