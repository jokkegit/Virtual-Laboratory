require.config({

    deps: ['main'],
    baseUrl: '..',

    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        jqueryui: '../bower_components/jquery-ui/jquery-ui',
        flot: '../bower_components/jquery-flot/jquery.flot',
        html5Loader: '../bower_components/jquery.html5loader/src/jquery.html5Loader',
        lodash: '../bower_components/lodash/dist/lodash.compat',
        knockout: '../bower_components/knockout/dist/knockout.debug',
        mapping: '../bower_components/knockout-mapping/knockout.mapping',
        jqueryuitouchpunch: '../bower_components/jqueryui-touch-punch/jquery.ui.touch-punch',
        fastclick: '../bower_components/fastclick/lib/fastclick',
        screenfull: '../bower_components/screenfull/dist/screenfull',
        text: '../bower_components/requirejs-text/text',
        json: '../bower_components/requirejs-plugins/src/json',

        base: 'libs/Base',

        datadir: '../data'
    },
    shim: {
        'html5Loader': ['jquery'],
        'jqueryui': ['jquery'],
        'jqueryuitouchpunch': ['jqueryui'],
        'flot': ['jquery'],
        'screenfull': { exports: 'screenfull' },
        'base': { exports: 'Base' }
    }
});