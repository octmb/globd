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

exports.getIgnoredFilesAndDirs = function()
{
    function getFilesAndDirsFromGitCleanNDX(gitCleanNDXoutput)
    {
        /* "
         Would remove node_modules/request
         Would remove node_modules/socket.io
         "*/
        var splitOnLineBreaks = gitCleanNDXoutput.split('\n');
        splitOnLineBreaks.pop(); // Last is 'undefined'
        return splitOnLineBreaks
            .map(
            function(element, index, array)
            {
                return element.substring("Would remove ".length);
            }
        );
    }

    var gitIgnoredFilesAndDirsParsers = {
        gitClean: {
            cmd: 'git clean -ndX',
            parser: getFilesAndDirsFromGitCleanNDX
        }
    };

    function getIgnoredFilesAndDirs(cmdAndParser)
    {
        child = exec(
            cmdAndParser.cmd,
            function(error, stdout, stderr)
            {
                var ignoredFilesAndDirs = cmdAndParser.parser(stdout);
                //                log.level = 'verbose';
                if (log.level === 'verbose')
                {// verbose -> print all ignored files, dirs
                    ignoredFilesAndDirs.forEach(
                        function(ignoredFileOrDir)
                        {
                            log.verbose("file: " + ignoredFileOrDir);
                        }
                    );
                }
                if (!ignoredFilesAndDirs)
                {// NO ignored files/dirs (failed) -> print errors
                    if (stderr)
                    {
                        log.error('stderr: ' + stderr);
                    }
                    if (error)
                    {
                        log.error('exec error: ' + error);
                    }
                }
            }
        );
    }

    getIgnoredFilesAndDirs(gitIgnoredFilesAndDirsParsers.gitClean);
};
