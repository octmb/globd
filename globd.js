var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var glob = require('glob');
var log = require('npmlog');

//log.level = 'verbose'; //! accept cli arg

log.verbose("",        __dirname + '/plugins/glob/public');
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

http.listen(8080, function()
{
    log.info("", 'listening on localhost:8080');
});
