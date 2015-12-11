#!/usr/bin/env node

/*
	Modules
 */
var Async = require("async"),
	Command = require("commander"),
	Crypto = require("crypto"),
	Fs = require("graceful-fs"),
	Path = require("path"),
	config = require(Path.join(__dirname, "package.json")),
	hashes = Crypto.getHashes();

/*
	'Constants'
 */
var VERSION = config.version;

/*
	Argument Parsing
 */

function splitFiles (val) {
	return val.split(',');
}

Command.version(VERSION)
	.option("-a, --algorithm [algo]", "Algorithm to hash with. Defaults to sha1")
	.option("-d, --directory [dir]", "Directory to hash")
	.option("-f, --files [file[,file[,file[...]]]]", "Files to hash", splitFiles)
	.option("--createOutputFiles", "Create hash files: 'FILENAME.EXT.ALG'")
	.option("--list", "List available algorithms")
	.option("--debug", "Debug on errors")
	.parse(process.argv);

/*
	Config
 */
var algorithm = "sha1",
	directory = process.cwd(),
	files = [],
	createOutputFiles, hashes;

if (Command.list) {
	console.log("Available Algorithms:");

	hashes.forEach(function (hash) {
		console.log(' ' + hash);
	});

	process.exit(0);
}

if (Command.algorithm) {
	algorithm = Command.algorithm;
}

if (Command.directory) {
	directory = Path.resolve(Command.directory);
}

if (Command.files) {
	files = Command.files;
}

createOutputFiles = files.length === 0;

/*
	Hashing
 */
Async.series([
	function prepareFiles (cb) {
		if (files.length) {
			files.forEach(function (file, i) {
				files[i] = Path.join(directory, file);
			});

			if (Command.debug) {
				console.log("Files:\n", JSON.stringify(files, null, "  "));
			}

			return cb();
		}

		// If no files were specified, hash everything
		Fs.readdir(directory, function (err, dirFiles) {
			if (err) {
				return cb(err);
			}

			dirFiles.forEach(function (file) {
				files.push(Path.join(directory, file));
			});

			if (Command.debug) {
				console.log("Files:\n", JSON.stringify(files, null, "  ") + "\n");
			}

			cb();
		});
	},

	function hashFiles (cb) {
		Async.each(files, function (file, cb) {
			Fs.stat(file, function (err, stats) {
				var hash, stream;

				if (err) {
					return cb(err);
				}

				// Don't hash directories
				if (stats.isDirectory()) {
					if (Command.debug) {
						console.log("Skipping Directory: " + file);
					}

					return cb();
				}

				// Don't load hash files that were already generated
				if (hashes.indexOf(Path.extname(file).substring(1)) !== -1) {
					if (Command.debug) {
						console.log("Skipping Previously Generated Hash: " + file);
					}

					return cb();
				}

				try {
					hash = Crypto.createHash(algorithm);
				} catch (err) {
					return cb(err);
				}

				if (Command.debug) {
					console.log("Loading File: " + file);
				}

				try {
					stream = Fs.createReadStream(file);
				} catch (err) {
					return cb(err);
				}

				stream.on("error", cb).on("data", function (chunk) {
					hash.update(chunk);
				}).on("end", function () {
					stream.close(function () {
						var digest = hash.digest("hex"),
							outFile = file + '.' + algorithm;

						if (Command.debug) {
							console.log("Finished Loading: " + file);
						}

						if (createOutputFiles) {
							if (Command.debug) {
								console.log("Writing Output: " + outFile);
							}

							return Fs.writeFile(outFile, digest, function (err) {
								if (Command.debug) {
									console.log("Finished Writing: " + outFile);
								} else {
									process.stdout.write('.');
								}

								cb(err);
							});
						} else {
							console.log(file + ":\n", digest);
							cb();
						}
					});
				});
			});
		}, cb);
	}
], function complete (err) {
	if (err) {
		if (Command.debug) {
			console.error(err.stack);
			return;
		}

		console.error(err.message);
		return;
	}

	if (createOutputFiles) {
		console.log(" Done.");
	}
});
