[Textus][] is an open-source platform for presenting and working with cultural
and historical texts.

**As of March 2013 Textus is undergoing a substantial refactor into smaller components. Please see the [website for details][Textus].**

[Textus]: http://okfnlabs.org/textus/

Textus represents the evolution of more than 6 years of software development,
building as it does on the OpenShakspeare platform (which powered
http://openshakespeare.org from 2005 until 2011) and the OpenCorrespondence
system (which powered http://opencorrespondence.org since 2009).

Quick getting started guide, this is the version on beta.openphilosophy.org

+ Install Node.js and NPM (Node Package Manager) and ElasticSearch
+ Configure and run an ElasticSearch server, making note of the connection protocol, port and host.
+ In a shell:
	* git clone git://github.com/okfn/textus.git
	* cd textus
	* npm install
	* node src/server.js --help
+ Call 'node src/server.js' with appropriate options (see the message returned from the help option)
+ Point your web browser at localhost on whatever port you've configured for Textus (defaults to 8080 if not specified).

## Copyright and License

Copyright 2011-2013 Open Knowledge Foundation

Licensed under the [MIT License]:

A copy of the license can be found in the LICENSE file

[MIT License]: http://www.opensource.org/licenses/mit-license.php

