module.exports = function(grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);
    var path = require('path');
    var fs = require('fs');
    var pkg = require('./package');
    var proj_namespace = path.join(pkg.description, pkg.name, pkg.version, '/');
    var ASSETS_URL = 'http://assets.dwstatic.com/'+ proj_namespace;
    var ipAddress = require('network-address')();

    grunt.initConfig({

        // 全局变量
        banner: '/*! Project: '+pkg.name+'\n *  Version: '+pkg.version+'\n *  Date: <%= grunt.template.today("yyyy-mm-dd hh:MM:ss TT") %>\n *  Author: '+pkg.author.name+'\n */',

        connect: {
            site_src: {
                options: {
                    hostname: ipAddress,
                    port: 9000,
                    base: ['src/'],
                    livereload: true,
                    open: true
                }
            },
            site_dest: {
                options: {
                    hostname: ipAddress,
                    port: 9001,
                    base: ['dest/'],
                    livereload: true,
                    keepalive: true, //保持sever不退出
                    open: true //打开默认浏览器
                }
            }
        },
        clean: {
            build: ["dest"],
            release: ["dest/slice", "dest/data", "dest/partial"],
            zip: ["assets"],
            svn: [".tmp_svn"]
        },
        copy: {
            release: {
                expand: true,
                cwd: 'src/sass/ying/',
                src: ['**'],
                dest: 'dest/'
            },
            zip_dest: {
                expand: true,
                cwd: 'dest/',
                src: ['js/{,*/}*', 'img/{,*/}*', 'css/*'],
                dest: 'assets/dest'
            },
            zip_src: {
                expand: true,
                cwd: 'src/',
                src: ['**', '!sass', '!sass/{,*/}*', '!css/*.map', '!img/psd','!img/psd/{,*/}*'],
                dest: 'assets/src'  
            }
        },
        autoprefixer: {
            options: {
                browsers: ['> 1%', 'last 2 versions', 'ff 17', 'opera 12.1', 'ie 8']
            },
            dist: {
                expand: true,
                flatten: true,
                src: 'src/css/*.css',
                dest: 'src/css/'
            }
        },
        watch: {
            css: {
                files: ['src/sass/{,*/}*.scss'],
                tasks:['sass']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ['src/*.html', 'src/css/*.css', 'src/js/*.js', 'src/partial/*.ejs', 'src/data/*.json']
            }
        },
        sass: {
            dist: {
                options: {
                    outputStyle: 'expanded',
                    //nested, compact, compressed, expanded
                    sourceComments: 'map',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/sass',
                    src: ['*.scss','!_*.scss','!*/_*.scss'],
                    dest: 'src/css',
                    ext: '.css'
                }]
            }
        },
        concat: {
            trans_html: {
                options: {
                    process: function(src, filepath) {
                        var regex = /((href|src)=['"][\s]*)(?!http[s]?\:|\#|\/)([\?\#\=\/\w._-]*)([\s]*['"])/g;
                        return src.replace(regex, '$1'+ASSETS_URL+'$3$4');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dest/',
                    src: '*.html',
                    dest: 'assets/dest/'
                }]
            }
        }
    });

    // 默认任务
    grunt.registerTask('default', ['connect:site_src', 'watch']);

    // 自定义端口
    grunt.task.registerTask('port', 'multi port', function(arg) {
        if(arguments.length === 0){
            console.log('端口号不能为空！')
        }else{
            grunt.config.set('connect.port'+arg,{
                options: {
                    hostname: ipAddress,
                    port: arg,
                    base: ['src/'],
                    livereload: +arg+1,
                    open: true,
                    middleware: [
                        function(req, res, next){
                            return renderTpl(req,res,next);
                        },
                        middleware_directory(path.resolve('src/'))
                    ]
                }
            });

            grunt.config.set('watch.livereload',{
                options: {
                    livereload: +arg+1
                },
                files: ['src/*.html', 'src/css/*.css', 'src/js/*.js']
            })

            grunt.task.run(['connect:port'+arg, 'watch']);
        }
    });

    // webserver 查看发布目录
    grunt.registerTask('dest', ['connect:site_dest']);

    // 发布任务
    grunt.registerTask('release', ['sass', 'clean:build', 'copy:release', 'clean:release', 'connect:site_dest']);

};