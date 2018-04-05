module.exports = function(RED) {
  "use strict";

  var created = {};

  function nodefactory(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    this.on('input', function (msg) {
      if(typeof msg.payload == "object") {
        if(!Array.isArray(msg.payload)) {
          msg.payload = [msg.payload];
        }

        var nodes = RED.nodes.getNodes();

        for(var i = 0; i < msg.payload.length; i++) {
          var nn = msg.payload[i];
          if(!nn.hasOwnProperty("id")){
            nn.id = RED.util.generateId();
            msg.payload[i].id = nn.id;
          }

          if(nn.hasOwnProperty("generateKey")){
            if(nodes.filter(function(f){ return f.type!="template" && JSON.stringify(f).indexOf(nn.generateKey) != -1;}).length != 0 || created.hasOwnProperty(nn.generateKey)){
              msg.payload.splice(i, 1);
              i--;
            } else {
              created[nn.generateKey] = true;
            }
          } else {
            if(nn.id && (RED.nodes.getNode(nn.id) || created.hasOwnProperty(nn.id))) {
              msg.payload.splice(i, 1);
              i--;
            } else if (nn.id && !RED.nodes.getNode(nn.id) && !created.hasOwnProperty(nn.id)) {
              created[nn.id] = true;
            }
          }
        }

        if(msg.payload.length > 0) {
          RED.nodes.addNodeToClients(msg.payload);
        }
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType("nodefactory", nodefactory);

  RED.httpAdmin.post("/factorynode/reset", function(req,res) {
    created = {};
    res.sendStatus(200);
  });
}
