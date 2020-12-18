module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        babel: {
            options: {
                "presets": [
                    ['@babel/preset-env', {
                        "targets": {
                        }
                    }]
                ],
                "plugins": [
                    "@babel/plugin-syntax-class-properties"
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'out',
                    src: ['**/*.js'],
                    dest: 'dist'
                }]
            }
        }
    });

    grunt.registerTask('default', ['babel']);
}