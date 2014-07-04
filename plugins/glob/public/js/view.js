// "view"

var $filesView = $('#files');
var $body = $('body');
var $error = $body.filter('#error');

function renderView(result)
{
    // <li class="glob-result" data-glob-pattern-index="0">js/vendor</li>
    // create elements first, then 'inject' all at once
    $filesView.html(getFileListItems(result));

    var pattern = result[0].pattern;
    document.title = pattern === "" ? "globd" : "globd - {0}".format(pattern);

    function getFileListItems(result)
    {
        var fileElements = [];
        result.forEach(function(elem,i){
            var globResult = result[i];
            handleError(result);
            fileElements = fileElements.concat(
                globResult.files.map(addFile)
            );

            function handleError(error){
                if (error.error)
                {
                    console.log(error.error);
                    $error.text(error.error);
                }
            }
            function addFile(filePath){
                return $('<li></li>')
                    .addClass("glob-result")
                    .data('glob-pattern-index', i)
                    .text(filePath);
            }
        });
        return fileElements;
    }
}