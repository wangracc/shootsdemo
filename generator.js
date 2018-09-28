module.exports = {
       /**
        * Before connection (optional, just for faye)
        * @param {client} client connection
        */
       beforeConnect : function(client) {
         // Example:
          client.setHeader('Authorization', 'OAuth abcd-1234');
          client.disable('websocket');
       },

       /**
        * On client connection (required)
        * @param {client} client connection
        * @param {done} callback function(err) {}
        */
       onConnect : function(client, done) {

         // Socket.io client
         //client.emit('chat message', { hello: 'world' });
         client.emit('chat message','connected');
         done();
       },

       /**
        * Send a message (required)
        * @param {client} client connection
        * @param {done} callback function(err) {}
        */
       sendMessage : function(client, done) {
         // Example:
          client.emit('chat message', 'test');
         // client.publish('/test', { hello: 'world' });
         // client.call('com.myapp.add2', [2, 3]).then(function (res) { });
         done();
       },

       /**
        * WAMP connection options
        */
       options : {
         // realm: 'chat'
       }
    };
