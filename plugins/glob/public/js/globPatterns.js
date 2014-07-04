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