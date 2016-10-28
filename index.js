var Client = require('castv2').Client;
var mdns   = require('mdns');
var browser = mdns.createBrowser(mdns.tcp('googlecast'));

browser.on('serviceUp', function(service) {
  console.log('found device %s at %s:%d', service.name, service.addresses[0], service.port);
  ondeviceup(service.addresses[0]);
  browser.stop();
});

browser.start();

function ondeviceup(host) {

  var client = new Client();
  client.connect(host, function() {

    var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
    var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

    connection.send({ type: 'CONNECT' });

    setInterval(function() {
      heartbeat.send({ type: 'PING' });
    }, 5000);

    // talk with a registered Google Cast app
    // In this case, A7BD302D is the RemoteStage SlideQuest app
    receiver.send({ type: 'LAUNCH', appId: 'A7BD302D', requestId: 1 });

    // display receiver status updates
    receiver.on('message', function(data, broadcast) {
      if(data.type == 'RECEIVER_STATUS' && data.requestId == 1) {
          var transportIdSession='';
          for(k in data.status.applications) {
          	var appData = data.status.applications[k];
          	if(appData.appId == 'A7BD302D') {
          		transportIdSession = appData.transportId;
          		console.log('transport id = ' + transportIdSession);
            }
          }

          var connection = client.createChannel('sender-0', transportIdSession, 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
          connection.send({ type: 'CONNECT' });
          var app   = client.createChannel('sender-0', transportIdSession , 'urn:x-cast:com.telasocial.tagvisor', 'JSON');
          app.send({ url: 'http://www.telasocial.com', otherData: false });
      }
    });
  });

}
