// "model"
var socket = io();

function sendPatterns(globPatterns)
{
    // 1. hook server event: 'glob.result:{pattern}' (e.g. 'glob.result:js/vendor')
    //      client.onReceiveResult -> use result to render view
    // 2. send pattern to server
    socket.on('glob.result:' + globPatterns, function(result)
    {
        renderView(result);
    });
    socket.emit('glob', globPatterns);
}