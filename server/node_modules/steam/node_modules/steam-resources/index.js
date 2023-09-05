var fs = require('fs');
var parse = require('csv-parse/lib/sync');
var ProtoBuf = require('protobufjs');
var Steam = exports;

var protos = parse(fs.readFileSync(__dirname + '/protogen/protos.csv', {
  encoding: 'ascii'
}), {
  columns: true
});

// one-off
Steam.GC = {
  Internal: loadProtoFiles(['../protogen/gc.proto'])
};

var namespaces = {};

protos.forEach(function(proto) {
  if (!namespaces[proto.Namespace])
    namespaces[proto.Namespace] = [];
  namespaces[proto.Namespace].push(proto.ProtoDir + '/' + proto.ProtoFileName);
});

for (var namespace in namespaces) {
  var obj = Steam;
  var prop = namespace.split('.').slice(1).reduce(function(last, next) {
    if (!obj[last])
      obj[last] = {};
    obj = obj[last];
    return next;
  });
  obj[prop] = loadProtoFiles(namespaces[namespace]);
}

require('./steam_language_parser');

function loadProtoFiles(paths) {
  var builder = ProtoBuf.newBuilder();
  paths.forEach(function(path) {
    ProtoBuf.loadProtoFile(__dirname + '/protobufs/' + path, builder);
  });
  return builder.build();
}
