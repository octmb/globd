var socket = io();

function sendPatterns(globPatterns)
{
    // 1. hook server event: 'globd.result:{pattern}' (e.g. 'globd.result:js/vendor')
    //      client.onReceiveResult -> use result to render view
    // 2. send pattern to server
    socket.on(globd.api.glob.toClient.nameFn(globPatterns), function(result)
    {
        renderView(result);
    });
    socket.emit(globd.api.glob.toServer.name, globPatterns);
}
