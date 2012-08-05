var url = require('url');

var config = {
	textus : {
		port : 8080,
		base : null
	},
	es : {
		host : "127.0.0.1",
		protocol : "http",
		port : 9200,
		timeout : 60000
	},
	mailgun : {
		key : null,
		from : "no-reply@textus.okfn.org"
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
				.describe('p', 'Textus HTTP server port, if applicable - overridden by PORT')
				.alias('e', 'esHost')
				.describe('e', 'ElasticSearch host - overridden by BONSAI_INDEX_URL')
				.describe('mailgunKey', 'Mailgun API key - overridden by MAILGUN_API_KEY')
				.describe(
						'baseUrl',
						'Base URL of the textus server, i.e. http://mytextus.org used when constructing password reminder links and similar - overridden by TEXTUS_BASE_URL')
				.alias('r', 'esProtocol').describe('r',
						'ElasticSearch protocol [http|https] - overridden by BONSAI_INDEX_URL.').alias('t', 'esPort')
				.describe('t', 'ElasticSearch port number - overridden by BONSAI_INDEX_URL.').alias('i', 'esIndex')
				.describe('i', 'ElasticSearch index name - overridden by BONSAI_INDEX_URL')['default']({
			p : 8080,
			t : 9200,
			r : 'http',
			e : '127.0.0.1',
			i : 'textus'
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
		if (args.mailgunKey) {
			config.mailgun.key = args.mailgunKey;
		}
		if (args.baseUrl) {
			config.textus.base = args.baseUrl;
		}

		// Heroku configuration: override config with contents of env variables if
		// they exist.
		if (process.env.TEXTUS_BASE_URL) {
			config.textus.base = process.env.TEXTUS_BASE_URL;
			console.log("INFO - textus base URL explicitly set to '" + config.textus.base + "'");
		}
		if (process.env.MAILGUN_API_KEY) {
			config.mailgun.key = process.env.MAILGUN_API_KEY;
			console.log("INFO - mailgun API key set from MAILGUN_API_KEY", config.mailgun.key);
		}
		if (process.env.PORT) {
			config.textus.port = parseInt(process.env.PORT, 10);
		}
		if (process.env.BONSAI_INDEX_URL) {
			esUrl = url.parse(process.env.BONSAI_INDEX_URL);
			config.es.protocol = esUrl.protocol.slice(0, -1);
			config.es.host = esUrl.hostname;
			config.es.port = (typeof esUrl.port !== 'undefined' && esUrl.port !== null) ? parseInt(esUrl.port, 10) : 80;
			config.es.index = esUrl.pathname.slice(1);
			console.log("INFO - elasticsearch properties set from BONSAI_INDEX_URL.", config.es);
		} else {
			console.log("INFO - elasticsearch properties set", config.es);
		}

		if (config.mailgun.key === null) {
			console.log("WARNING - no mailgun API key set, email functionality will be unavailable. "
					+ "To fix this set the MAILGUN_API_KEY environment variable appropriately, "
					+ "or specify with --mailgunKey on the command line.");
		}

		if (config.textus.base === null) {
			console.log("INFO - textus base URL not explicitly set, will be inferred "
					+ "from first request to password reset location.");
		}

		return config;

	}

};
