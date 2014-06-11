var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var glob = require('glob');
var log = require('npmlog');
var helpers = require('./lib/helpers.js');
var globd = require('./plugins/globd/index.js');

log.level = 'verbose'; //! accept cli arg

function asyncTryCatch(tryFunction, catchFunction, keepAliveOnHandled)
{
    process.on('uncaughtException', function(ex)
    {// hook onto uncaughtException -> execute catch
        var handled = catchFunction(ex);
        if (!handled)
        {// NOT handled -> throw
            throw ex;
        }
        else if (handled && !keepAliveOnHandled)
        {// handled but NOT staying alive -> exit
            process.exit(1);
        }
    });
    tryFunction(); // try the function
}

var clientDir = __dirname + '/plugins/globd/public';
log.verbose(clientDir);
app.use(express.static(clientDir));

function listenForClients()
{
    io.on('connection', function(socket)
    {// client connected -> hook events
        log.verbose(helpers.getLocalTime() + ': connected');
        socket.on('disconnect', function()
        {// client disconnected (browser session ended)
            log.verbose("", helpers.getLocalTime() + ': DISconnected');
        });

        globd.listenToClient(
            socket,
            function onResultProcessed(event, result)
            {
                io.sockets.emit(event, result);
            }
        );

    });
}
listenForClients();

function listenOnPort(port)
{
    http.listen(port, function()
    {
        log.info("listening on localhost:8080");
    });
}

asyncTryCatch(
    listenOnPort(8080),
    function(ex)
    {
        if (ex.message.indexOf('listen EADDRINUSE') > -1)
        {// (node v0.10.28) http://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback
            log.error("port 8080 is already bound. kill the other process first.");
            return true;
        }
        else
        {
            throw ex;
        }
    }
);
