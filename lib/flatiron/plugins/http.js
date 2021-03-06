
var sugarskull = require('sugarskull'),
    union;

try {
  //
  // Attempt to require union.
  //
  union = require('union');
}
catch (ex) {
  //
  // Do nothing since this is a progressive enhancement
  //
  console.warn('flatiron.plugins.http requires the `union` module from npm');
  console.warn('install using `npm install union`.');
  module.exports = null;
  return;
}

//
// Name this plugin.
//
exports.name = 'http';

exports.attach = function (options) {
  var app = this;
  
  //
  // Define the `http` namespace on the app for later use
  //
  app.http = app.http || options || {};
  app.http.before = app.http.before || [];
  app.http.after = app.http.after || [];
  app.router = new sugarskull.http.Router().configure({
    async: true
  });
  
  app.start = function (port, host, callback) {
    if (!callback && typeof host === 'function') {
      callback = host;
      host = null;
    }
    
    app.init(function (err) {
      if (err) {
        if (callback) {
          return callback(err);
        }
        
        throw err;
      }
      
      app.listen(port, host, callback);
    });
  };
  
  app.listen = function (port, host, callback) {
    if (!callback && typeof host === 'function') {
      callback = host;
      host = null;
    } 
    
    app.server = union.createServer({
      after: app.http.after,
      before: app.http.before.concat(function (req, res) {
        var found = app.router.dispatch(req, res);
        if (!found) {
          res.emit('next');
        }
      }),
      limit: app.http.limit
    });
    
    return host 
      ? app.server.listen(port, host, callback)
      : app.server.listen(port, callback);
  };
};