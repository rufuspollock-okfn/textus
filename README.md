[Textus][] is an open-source platform for presenting and working with cultural
and historical texts.

**As of March 2013 Textus is undergoing a substantial refactor into smaller components. Please see the [website for details][Textus].**

[Textus]: http://okfnlabs.org/textus/

Textus represents the evolution of more than 6 years of software development,
building as it does on the OpenShakspeare platform (which powered
http://openshakespeare.org from 2005 until 2011) and the OpenCorrespondence
system (which powered http://opencorrespondence.org since 2009).

## Components

The Textus Platform is now being refactored composed of 4 separate components:

* [Textus Formatter][formatter] - this tool converts standard text formats to the Textus
  format
* [Textus Viewer][viewer] - this is a pure Javascript + HTML app that displays a text in
  Textus Format
* [Textus Wordpress][wordpress] - a plugin that uses the other Textus tools to turn
  Wordpress into a platform for hosting, presenting and collaborating on
  cultural texts
* [Textus API][api-component] - create an API for texts in Textus format

Note these components are under **active development** as of December 2013.

[formatter]: https://github.com/okfn/textus-formatter
[viewer]: https://github.com/okfn/textus-viewer
[wordpress]: http://github.com/okfn/textus-wordpress
[api-component]: http://github.com/okfn/textus-api


## Quick getting started guide

This is the version on beta.openphilosophy.org:

+ Install Node.js and NPM (Node Package Manager) and ElasticSearch
+ Configure and run an ElasticSearch server, making note of the connection protocol, port and host.
+ In a shell:
	* `git clone git://github.com/okfn/textus.git`
	* `cd textus`
	* `npm install`
	* `node src/server.js --help`
+ Call `node src/server.js` with appropriate options (see the message returned from the help option)
+ Point your web browser at localhost on whatever port you've configured for Textus (defaults to 8080 if not specified).

## Copyright and License

Copyright 2011-2013 Open Knowledge Foundation

Licensed under the [MIT License]:

A copy of the license can be found in the LICENSE file

[MIT License]: http://www.opensource.org/licenses/mit-license.php

