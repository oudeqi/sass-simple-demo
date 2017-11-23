const gulp = require('gulp');
const gulpLoadPlugins = require( 'gulp-load-plugins');
const minifyCss = require('gulp-clean-css');
const spritesmith = require('gulp.spritesmith');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');
const sass = require("gulp-sass");

const $ = gulpLoadPlugins();

gulp.task('clean', ()=> {
	return gulp.src(['src/css/*'], {read: false})
		.pipe($.clean());
});

gulp.task('style', ()=> {
	return gulp.src(['src/scss/**/*.scss'])
		// .pipe($.changed("src/scss/**/*", {extension: ".css"})) //只编译改变过的文件
		// .pipe($.plumber()) //防止因为sass语法错误，而停止监听文件
		.pipe($.sourcemaps.init())
		.pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
        .pipe($.autoprefixer({
            browsers: ["Android >= 4.0", "last 3 Safari versions", "iOS 7", "ie >= 9"],
            cascade: true, //是否美化属性值 默认：true
            remove: true //是否去掉不必要的前缀 默认：true
        }))
		// .pipe(minifyCss()) //压缩css
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('src/css/'));
});

gulp.task("sprite", function() {
    let spriteData = gulp.src(['src/sprite/*.png'])
    .pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../img/sprite.png',
        cssName: '_sprite.scss',
        cssFormat: 'scss',
        cssTemplate: 'scss.template.mustache',
        cssOpts: 'spriteSrc',//定义变量名
        padding: 10,
        cssVarMap: function(sprite) {
            sprite.name = 'icon-' + sprite.name;
        }
    }));
    var imgStream = spriteData.img
    	.pipe(buffer())
        .pipe(gulp.dest('src/img/'));
    var cssStream = spriteData.css
        .pipe(gulp.dest('src/scss/helpers/'));
    return merge(imgStream, cssStream);
});

gulp.task('default', ['clean'], ()=> {
    gulp.watch(['src/scss/**/*.scss'], ['style']).on('change', (e)=> {
    	console.log(e);
    });
});