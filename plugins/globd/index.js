var log = require('npmlog');
var helpers = require('./lib/glob-helpers.js');
var interface = require('./public/js/interface.js');

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
