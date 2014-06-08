var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var glob = require('glob');
var log = require('npmlog');

//log.level = 'verbose'; //! accept cli arg

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

log.verbose("", __dirname + '/plugins/glob/public');

app.use(express.static(__dirname + '/plugins/glob/public'));

function getGlobResult(pattern)
{
    var files = null, error = null;
    try
    {
        files = glob.sync(pattern/*, options*/);
    }
    catch (ex)
    {
        if (ex.message === "must provide pattern")
        {// catch empty case (glob.js, Line 132
            files = [];
        }
        else
        {
            log.error("", ex.message);
            error = ex;
            throw ex;
        }
    }

    if (files)
    {
        files.forEach(function(file) {log.verbose(pattern, file);});// log each file
    }
    return  {
        error: error,
        pattern: pattern,
        files: files
    };
}

io.on('connection', function(socket)
{// client connected (via localhost:8080)
    function getLocalTime()
    {
        return new Date().toLocaleTimeString();
    }

    log.verbose("", getLocalTime() + ': connected');
    socket.on('disconnect', function()
    {// client disconnected (browser session ended)
        log.verbose("", getLocalTime() + ': DISconnected');
    });

    socket.on('glob', function(globPatterns)
    {// event from client
        log.verbose("", globPatterns);

        var result = [];

        if (globPatterns instanceof  Array)
        {
            log.verbose("", "'glob' object is Array");
            result = globPatterns.map(
                function(pattern, index, array)
                {
                    log.verbose("", pattern);
                    return getGlobResult(pattern);
                }
            );

        }
        else
        {
            log.error("", "'glob' object sent to server must be an Array. actual value: " + globPatterns);
        }

        // result = array of { globResult }

        var event = 'glob.result:' + globPatterns;
        io.sockets.emit(event, result);
    });

});

asyncTryCatch(
    function()
    {
        http.listen(8080, function()
        {
            log.info("listening on localhost:8080");
        });
    },
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

log.info("this line is executed");
