BUILD STATUS
------------
Current build status:
[![Build Status](https://travis-ci.org/discoverygarden/islandora_critical_edition.png?branch=7.x)](https://travis-ci.org/discoverygarden/islandora_critical_edition)


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
in the 'writer_wrapper.js' file. That said, there is a file called
'delegator.js' located in 'CWRC-Writer/src/js/delegator.js' that has been
overridden and placed in this '/js' directory.

CWRC-Writer API
----------------

This version of the CWRC-Writer is build off of commit '7d301986965401f890f9f94ddafccbeefd44db23',
Made by Andrew MacDonald. Current CWRC-Writer repo: https://github.com/cwrc/CWRC-Writer.git.

CWRC-Writer Validator
---------------------

A new dependancy has been added to the cwrc-writer with this latest iteration. The cwrc-validator is
a web app that is called by the new cwrc writer when saving a document, or can be called within
the interface of the editor by clicking the validate button. The following instructions will help
you install the validator:
* Build the .war file from source, or use the included .war file in the cwrc-validator repo
(found here: https://github.com/cwrc/cwrc-validator.git, /target/cwrcxmlval-0.0.1-SNAPSHOT.war).
* Rename the .war file to 'validator.war'.
* Deploy the war to tomcats webapp directory (ex: ../tomcat/webapps).
NOTE: Do not use the webapp manager to deploy this .war file.
* After a moment, the .war should deploy and can be tested by visiting
{base_url}:8080/validator/index.html
* If not already configured, Add a reverse proxy setting on the server.
ex: (Debian) edit sites-available/default add the following lines above the </VirtualHost> tag
  ProxyPass /validator/ http://localhost:8080/validator/
  ProxyPassReverse /validator/ http://localhost:8080/validator/
* Restart apache. The validator should now be available to test at
{base_url}/validator/index.html

This module requires the Islandora Critical Edition Solution Pack.
The saxon.jar file contained in the dependencies directory must by moved or
copied to the webapps directory of the tomcat server.

This will normally be /usr/local/fedora/tomcat/webapps/

INSTALL MONGO
--------------

First install Mongo, then:

```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list
sudo apt-get update
sudo mkdir –p /data/db
chown -R vagrant /data
```

Run from Mongo prompt:

```
db.addUser('admin', 'jabberw0cky', 'userAdminAnyDatabase')
```

Then from the command line:

```bash
sudo pecl install mongo
```

Add then following line to your php.ini file /etc/php5/apache2/:

```
extension=mongo.so
```

When finished just restart apache service.
