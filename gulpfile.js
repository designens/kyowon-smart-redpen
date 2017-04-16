/*! gulpfile.js v1.0.0 © inyoung524@naver.com */

// =======================================
// NPM 모듈 호출
// =======================================

var gulp = require('gulp'),
    g_if = require('gulp-if'),
    shell = require('gulp-shell'),
    rename = require('gulp-rename'),
    filter = require('gulp-filter'),

    includer = require('gulp-html-ssi'),

    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    csso = require('gulp-csso'),

    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),

    sprity = require('sprity'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    iconic = require('gulp-iconic'),

    bower = require('bower'),
    preen = require('preen'),

    browserSync = require('browser-sync'),
    reload = browserSync.reload;


// =======================================
// 환경설정
// =======================================

// 디렉토리 설정
const SRC          = 'markup';
const BUILD       = 'public';
const BOWER    = 'bower_components';

// 파일 압축 설정
var compress = {
    'css_singleline' : true,
    'js' : false,
};

// 디렉토리 설정
var dir = {
    'css': SRC + '/css',
    'js' : SRC + '/js',
};

// 자바스크립트 프래임워크(framework) 병합
var js_order = [
    // dir.js + '/**/*.js',
    dir.js + '/lib/svg-injector.min.js',
    dir.js + '/lib/flickity.pkgd.min.js',
    dir.js + '/lib/jquery.sortable.min.js',
];

// 자바스크립트 유지관리 파일 이동
var moveJS = [
    dir.js + '/common.js', // 공통 작업 자바스크립트
];

// 스프라이트 이미지 생성 설정
// [참고] URL: https://www.npmjs.com/package/sprity#options
var sprity_options = {
    // 스프라이트 이미지 경로 설정
    src   : SRC + '/assets/images/sprite/**/*.{png,jpg}',
    // _sprite.scss 파일 생성 위치 설정
    style: SRC + '/sass/base/_sprite.scss',
    // 생성된 _sprite.scss 파일에 삽입되는 배경이미지 CSS 경로 설정
    cssPath: '/assets/images/sprite',
    // 생성되는 CSS 클래스 접두사 (ex: .{kw}-icon)
    prefix: 'kw',
    // 스프라이트 폴더 내부의 각 폴더 별로 분리 생성 설정
    split: true,
    // 생성될 스프라이트 이미지 접두사 설정
    // 기본 값: 'sprite'
    // name: 'kw',
    // 스프라이트 이미지 사이 간격 설정
    // 기본 값: 4
    margin: 2,
    // 스프라이트 이미지 병합 알고리즘 설정
    // 'vertical', 'horizontal', 'binary-tree'
    orientation: 'binary-tree',
    // 스타일 인덴트 캐릭터 설정
    // 'space', 'tab'
    'style-indent-char': 'tab',
    // 스타일 인덴트 캐릭터 사이즈 설정
    'style-indent-size': 1,
    // Sass 활용 설정 (sprity-sass 모듈 필요!)
    processor: 'sass',
 }

// =======================================
// 기본 업무
// =======================================
gulp.task('default', ['remove', 'bower', 'bower:copy', 'preen', 'server', 'font:move']);

// =======================================
// 빌드 업무
// =======================================
gulp.task('build', function() {
    compress.css = true;
    compress.js  = true;
    gulp.start('remove');
    gulp.start('htmlSSI');
    gulp.start('sass');
    gulp.start('js');
    gulp.start('sprites');
    gulp.start('iconfont');
    gulp.start('font:move');
    gulp.start('imagemin');
    setTimeout(function() {
        gulp.start('css:min');
    }, 7000);
 });

// =======================================
// 관찰 업무
// =======================================
gulp.task('watch', function() {
    gulp.watch( SRC + '/**/*.html', ['htmlSSI'] );
    gulp.watch( SRC + '/sass/**/*', ['sass']);
    gulp.watch( SRC + '/js/**/*', ['js']);
    gulp.watch(SRC + '/assets/images/**/*', ['imagemin']);
    gulp.watch(SRC + '/assets/images/sprite/**/*', ['sprites']);
    gulp.watch( SRC + '/**/*.html' ).on('change', reload);
    gulp.watch( 'gulpfile.js' ).on('change', reload);
 });

// =======================================
// 폴더 제거 업무
// =======================================
gulp.task('remove', shell.task('rm -rf ' + BUILD + ' ' + SRC + '/iconfont/fonts ' + SRC + '/iconfont/preview ' + SRC + '/sass/fonts/_iconfont.scss' + BUILD + '/assets/css/map ' + BUILD + '/assets/css/style.css'));

// =======================================
// 서버 업무
// =======================================
gulp.task('server', ['imagemin', 'iconfont', 'htmlSSI', 'sass', 'js', 'sprites'], function() {
    browserSync.init({
        // 알림 설정
        notify: !true,
        // 포트 설정
        port: 9090,
        // 서버 설정
        server: {
            // 기본 디렉토리 설정
            baseDir: [ BUILD ],
            // 라우트 설정
            routes: {
                '/bower_components' : 'bower_components',
            }
        },
    });
    gulp.start('watch');
 });

// =======================================
// HTML SSI(Server Side Include) 업무
// =======================================
// 로컬서버 설정하여 인크루드 사용
// [참고] https://www.npmjs.com/package/gulp-html-ssi
gulp.task('htmlSSI', function() {
    gulp.src( SRC + '/**/*.html' )
        .pipe( includer() )
        .pipe( gulp.dest( BUILD ) );
 });

// =======================================
// Sass 업무
// =======================================
gulp.task('sass', function() {
    return gulp.src( SRC + '/sass/**.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe( sass({
            'outputStyle': 'compact'
        }).on('error', sass.logError) )
        .pipe( sourcemaps.write( './map' ) )
        .pipe( gulp.dest(BUILD + '/assets/css') )
        .pipe( filter("**/*.css") )
        .pipe( reload({stream: true}) );
 });

gulp.task('css:min', function() {
    gulp.src(BUILD + '/assets/css/style.css')
        .pipe( csso() )
        .pipe( rename('style.min.css') )
        .pipe( gulp.dest(BUILD + '/assets/css') );
 });

// =======================================
// JS 병합 업무
// =======================================
gulp.task('js', ['js:concat']);

// 공통 JS  파일 이동
gulp.task('js:moveJS', function() {
    gulp.src( moveJS )
        .pipe( gulp.dest( BUILD + '/assets/js') );
 });

// 공통 JS 파일 병합 후 이동
gulp.task('js:concat', ['js:moveJS'], function() {
    gulp.src( js_order )
        .pipe( concat('bundle.js') )
        .pipe( g_if(compress.js, uglify()) )
        .pipe( g_if(compress.js, rename( 'bundle.min.js' )) )
        .pipe( gulp.dest( BUILD + '/assets/js' ) );
 });

// =======================================
// Sprites images 업무
// =======================================

gulp.task('sprites', function () {
    return sprity.src( sprity_options )
    .pipe(g_if('*.png', gulp.dest(BUILD+ '/assets/images/sprite'), gulp.dest(SRC + '/sass/base')))
 });

// =======================================
// Images min 업무
// =======================================
gulp.task('imagemin', function () {
    return gulp.src( SRC + '/assets/images/**/*' )
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe( gulp.dest( BUILD + '/assets/images' ) );
 });

// =======================================
// Iconfont 업무
// =======================================
gulp.task('iconfont', ['iconfont:make']);

gulp.task('iconfont:make', function(cb){
    iconic({
        // 템플릿 파일 경로 설정 (filename)
        // gulp-iconic/template/_iconfont.scss
        cssTemplate: SRC + '/sass/template/_iconfont.scss',
        // Scss 생성 파일 경로 설정
        cssFolder: SRC + '/sass/fonts',
        // Fonts 생성 파일 경로 설정
        fontFolder: SRC + '/iconfont/fonts',
        // SVG 파일 경로 설정
        svgFolder: SRC + '/iconfont/fonts_here',
        // Preview 생성 폴더 경로 설정
        previewFolder: SRC + '/iconfont/preview',
        // font 경로 설정
        fontUrl: '/assets/fonts',
        // 아이콘 베이스라인 위치 설정
        descent: 30
    }, cb);

    setTimeout(function() {
        gulp.start('iconfont:move');
    }, 1000);
 });

gulp.task('iconfont:move', function(){
    gulp.src(SRC + '/iconfont/fonts/*')
        .pipe( gulp.dest( BUILD + '/assets/fonts' ) );
 });

// =======================================
// web font 업무
// =======================================

gulp.task('font:move', function(){
    gulp.src(SRC + '/assets/fonts/*')
        .pipe( gulp.dest( BUILD + '/assets/fonts' ) );
 });

// =======================================
// Bower 프래임워크 관리 업무
// =======================================
// Bower component : 프래임워크(Framework) 다운
gulp.task('bower', function(cb) {
    bower.commands.install([], {
            save: true
        }, {})
        .on('end', function(installed) {
            cb();
        });
});

// 프래임워크(Framework) 불필요한 파일 제거
// [참고] https://www.npmjs.com/package/preen
gulp.task('preen', function(cb) {
    preen.preen({}, cb);
});

// 프래임워크(Framework) 폴더 관리
gulp.task('bower:copy', function() {
    // Susy
    gulp.src(BOWER + '/susy/sass/**')
        .pipe(gulp.dest(SRC + '/sass/lib/susy'))
    // Font Awesome : fonts
    gulp.src(BOWER + '/font-awesome/fonts/**')
        .pipe(gulp.dest(BUILD + '/assets/fonts'))
        .pipe(gulp.dest(SRC + '/sass/lib/font-awesome/fonts'))
    // Font Awesome : css
    gulp.src(BOWER + '/font-awesome/css/**')
        .pipe(gulp.dest(SRC + '/sass/lib/font-awesome/css'))
    // Svg injector
    gulp.src(BOWER + '/svg-injector/dist/svg-injector.min.js')
        .pipe(gulp.dest(SRC + '/js/lib'));
});