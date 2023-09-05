var protobuf = require('protobufjs');
var fs = require('fs');
var path = require('path');

var builder = protobuf.newBuilder();

// fs.readdir(path.join(__dirname, 'csgo'), function(err, files) {
	// if(!err) {
		// files.forEach(function(file) {
			// protobuf.loadProtoFile(path.join(__dirname + '/csgo', file), builder);
		// });
	// }
// });

protobuf.loadProtoFile(path.join(__dirname, '/base_gcmessages.proto'), builder);
protobuf.loadProtoFile(path.join(__dirname, '/gcsdk_gcmessages.proto'), builder);
protobuf.loadProtoFile(path.join(__dirname, '/cstrike15_gcmessages.proto'), builder);

module.exports = builder.build();
