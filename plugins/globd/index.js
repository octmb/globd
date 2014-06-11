var log = require('npmlog');
var helpers = require('./lib/glob-helpers.js');
var interface = require('./public/js/interface.js');
var util = require('util'),
    exec = require('child_process').exec,
    child;

var spawn = require('child_process').spawn;

exports.listenToClient = function(socket, onResultProcessed)
{
    socket.on('globd', function(globPatterns)
    {// event from client
        var event = 'globd.result:' + globPatterns;
        var globResult = this.getGlobResult(globPatterns);
        onResultProcessed(event, globResult);
    });
};

exports.getGlobResult = function(globPatterns)
{
    log.verbose(globPatterns);
    if (globPatterns instanceof Array)
    {
        log.verbose("'globd' object is Array");
        return globPatterns.map(
            function(pattern, index, array)
            {
                log.verbose(pattern);
                return helpers.getGlobResult(pattern);
            }
        );
    }
    else
    {
        var exMsgGlobdObjNotArray = "'globd' object sent to server must be an Array. actual value: " + globPatterns;
        log.error(exMsgGlobdObjNotArray);
        return { error: new Error(exMsgGlobdObjNotArray) };
    }
};

exports.printGitIgnored = function()
{
    function getFilesAndDirsFromGitCleanNDX(gitCleanNDXoutput)
    {
        /* "
         Would remove node_modules/request
         Would remove node_modules/socket.io
         "*/
        return  gitCleanNDXoutput
            .split('\n')
            .map(
            function(element, index, array)
            {
                return element.substring("Would remove ".length);
            }
        );
    }

    child = exec(
        'git clean -ndX',
        function(error, stdout, stderr)
        {
            var ignoredFilesAndDirs = getFilesAndDirsFromGitCleanNDX(stdout);
            //                            log.level = 'verbose';
            if (log.level === 'verbose')
            {// verbose -> print all ignored files, dirs
                ignoredFilesAndDirs.forEach(
                    function(ignoredFileOrDir)
                    {
                        log.verbose(ignoredFileOrDir);
                    }
                );
            }
            console.log('stderr: ' + stderr);
            if (error !== null)
            {
                console.log('exec error: ' + error);
            }
        }
    );

};
