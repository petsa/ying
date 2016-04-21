/*ignore列表*/
fis.set('project.exclude', ['**.svn', '**.git', '**/_*.styl', 'Gruntfile.js', 'package.json']);
fis.set('project.ignore', ['fis3-conf.js', 'fis-conf.js']);

/*stylus编译*/
fis.match('*.styl', {
    parser: fis.plugin('stylus', {
        sourcemap: true
    }),
    rExt: '.css'
}).match('_*.styl', {
    release: false
});


