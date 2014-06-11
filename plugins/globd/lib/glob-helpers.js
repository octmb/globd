var log = require('npmlog');
var glob = require('glob');

exports.getGlobResult = function getGlobResult(pattern)
{
    var files = null, error = null;
    try
    {
        files = glob.sync(pattern/*, options*/);
    }
    catch (ex)
    {
        if (ex.message === "must provide pattern")
        {// catch empty case (glob.js, Line 132)
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
};
