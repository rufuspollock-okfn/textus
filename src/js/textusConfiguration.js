var config = {
	textus : {
		port : 8080,
	},
	es : {
		host : "127.0.0.1",
		protocol : "http",
		port : 9200,
		timeout : 60000
	}
};

/**
 * Module to handle reading of configuration, including sensible defaults and the ability to
 * override from the command line.
 */
module.exports = exports = {

	/**
	 * @returns a configuration object
	 */
	conf : function() {

		var argParser = require('optimist')
			.usage('Usage: $0 [options]')
				.alias('p', 'port')
					.describe('p', 'Textus HTTP server port, if applicable.')
				.alias('e', 'esHost')
					.describe('e', 'ElasticSearch host.')
				.alias('r', 'esProtocol')
					.describe('r', 'ElasticSearch protocol [http|https].')
				.alias('t', 'esPort')
					.describe('t', 'ElasticSearch port number.')
				.alias('i', 'esIndex')
					.describe('i', 'ElasticSearch index name.')
			.default({
				p: 8080,
				t: 9200,
				r: 'http',
				e: '127.0.0.1',
				i: 'textus'
			});

		var args = argParser.argv;

		if (args.help) {
			console.log(argParser.help());
			process.exit(0);
		}

		if (args.port) {
			config.textus.port = parseInt(args.port);
		}
		if (args.esHost) {
			config.es.host = args.esHost;
		}
		if (args.esProtocol) {
			config.es.protocol = args.esProtocol;
		}
		if (args.esPort) {
			config.es.port = parseInt(args.esPort);
		}

		return config;

	}

};
