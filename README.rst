**This repo is DEPRECATED**. Please see the primary repo at **<https://github.com/culturelabs/textus>**

Textus_ is a toolbox and web application for working with and presenting textual material
from shakespeare to schopenhauer, and letters to literature.

.. _Textus: http://wiki.okfn.org/Projects/Textus

Textus represents the evolution of more than 6 years of software development,
building as it does on the OpenShakspeare platform (which powered
http://openshakespeare.org from 2005 until 2011) and the OpenCorrespondence
system (which powered http://opencorrespondence.org from 2009-2011).

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
