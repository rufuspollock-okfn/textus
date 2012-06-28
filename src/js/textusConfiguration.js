var url = require('url');

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
			config.textus.port = parseInt(args.port, 10);
		}
		if (args.esHost) {
			config.es.host = args.esHost;
		}
		if (args.esProtocol) {
			config.es.protocol = args.esProtocol;
		}
		if (args.esPort) {
			config.es.port = parseInt(args.esPort, 10);
		}
		if (args.esIndex) {
			config.es.index = args.esIndex;
		}

		// Heroku configuration: override config with contents of env variables if
		// they exist.

		if (process.env.PORT) {
			config.textus.port = parseInt(process.env.PORT, 10);
		}

		if (process.env.BONSAI_INDEX_URL) {
			esUrl = url.parse(process.env.BONSAI_INDEX_URL);
			config.es.protocol = esUrl.protocol.slice(0, -1);
			config.es.host = esUrl.hostname;
			config.es.port = (typeof esUrl.port !== 'undefined' && esUrl.port !== null) ? parseInt(esUrl.port, 10) : 80;
			config.es.index = esUrl.pathname.slice(1);
		}

		return config;

	}

};
