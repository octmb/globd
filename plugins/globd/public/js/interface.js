var globd = {
    api: {
        glob: {
            toServer: {
                name: 'globd',
                type: Array
            },
            toClient: {
                nameFn: function(globPatterns) { return 'globd.result:' + globPatterns; }
            }
        }
    }
};
