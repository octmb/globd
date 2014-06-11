var $filesView = $('#files');
var $body = $('body');
var $error = $body.filter('#error');

function renderView(result)
{
    function getFileListItems(result)
    {
        var fileElements = [];
        for (var i = 0; i < result.length; i++)
        {
            var globResult = result[i];
            if (globResult.error)
            {
                console.log(globResult.error);
                $error.text(globResult.error);
            }
            else
            {
                fileElements = fileElements.concat(
                    globResult.files.map(
                        function(filePath)
                        {
                            return $('<li></li>')
                                .addClass("glob-result")
                                .data('glob-pattern-index', i)
                                .text(filePath);
                        }
                    )
                );

            }
        }
        return fileElements;
    }

    // <li class="globd-result" data-globd-pattern-index="0">js/vendor</li>
    // create elements first, then 'inject' all at once
    $filesView.html(getFileListItems(result));

    var pattern = result[0].pattern;
    document.title = pattern === "" ? "globd" : "globd - {0}".format(pattern);
}

var globPatterns = []; //? don't store state (get from every input, on every keypress)

// OnPatternChanged -> get pattern; send to server
$('#glob-patterns').on(
    'keyup', 'input.pattern', function(event)
    {
        var $currentPatternInput = $(this);
        var inputIndex = $currentPatternInput.data('glob-pattern-index');
        if (typeof inputIndex === 'undefined')
        {
            throw Error("glob input key-up: couldn't get glob-pattern-index for input");
        }
        event.preventDefault();
        globPatterns[inputIndex] = $currentPatternInput.val();
        sendPatterns(globPatterns);
    }
);
