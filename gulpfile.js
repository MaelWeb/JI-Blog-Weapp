const {
    src,
    dest,
    parallel,
    watch,
    series
} = require('gulp');
const Less = require('gulp-less');
const Rename = require('gulp-rename');
const Path = require('path');
const Csso = require('gulp-csso');
const Clean = require('gulp-clean');
const GulpIf = require('gulp-if');
const ImageMin = require('gulp-imagemin');
const UrlPrefixer = require('gulp-url-prefixer');
const Qiniu = require('gulp-qiniu-utils');
const ESLint = require('gulp-eslint');
const Alias = require('gulp-wechat-weapp-src-alisa');
const TS = require("gulp-typescript");
const TSProject = TS.createProject("tsconfig.json");
const FindUnused = require('./gulp-plugins/gulp-find-unused/index');
const Changed = require('gulp-changed');
const Print = require('gulp-print').default;
const Uglify = require('gulp-uglify-es').default;
// const Insert = require('gulp-insert');

// 匹配文件路径
const path = {
    lessPath: ['src/**/*.less'],
    wxssPath: ['src/**/*.wxss'],
    tsPath: ['src/**/*.ts', 'src/**/*.js',],
    copy: ['src/**/*.wxml', 'src/**/*.json', 'src/**/*.wxs'],
    jsonPath: 'src/**/*.json',
    images: ['src/images/*.*'],
};

const uglifyOpts = {
    // mangle: false,
    compress: {
        drop_console: true,
    },
};

const DEST = 'dist';

const urlPrefix = {
    prefix: 'https://cdn.liayal.com/dist',
    tags: ['image'],
};

// 七牛相关配置
const qiniuOptions = {
    ak: 'ac key',
    sk: 'sk key',
    zone: 'Zone_z0', // 空间对应存储区域（华东：z0，华北：z1，华南：z2，北美：na0）
    bucket: 'hynal-com', // 七牛对应空间
    upload: {
        dir: './dist/images', // 上传本地目录
        // prefix: 'test/', // 上传时添加的前缀，可省略
        except: /\.(html|js)$/, // 上传时不上传文件的正则匹配
    },
    remote: {
        url: 'https://cdn.liayal.com', // 七牛空间域名
        prefix: {
            default: 'test/', // 七牛空间默认前缀，如果下面三个相同可省略
            remove: 'test/', // 七牛空间删除前缀
            prefetch: 'test/', // 七牛空间预取前缀
            refresh: 'test/', // 七牛空间刷新前缀
        },
    },
};

function _join(dirname) {
    return Path.join(process.cwd(), 'src', dirname);
}

// 路径别名配置
const aliasConfig = {
    '@Libs': _join('libs'),
    '@Config': _join('config'),
    '@Utils': _join('utils'),
    '@Components': _join('components'),
    '@Style': _join('style'),
    '@Images': _join('images'),
    '@APP': Path.join(process.cwd(), 'src'),
};

function less() {
    return src(path.lessPath, {
            base: 'src/'
        })
        .pipe(Changed(DEST, {
            extension: '.wxss',
        }))
        .pipe(Print(filepath => `Build Less: ${filepath}`))
        .pipe(Alias(aliasConfig))
        .pipe(Less())
        .pipe(UrlPrefixer.css(urlPrefix))
        .pipe(GulpIf(process.env.NODE_ENV === 'production', Csso()))
        .pipe(Rename({
            extname: '.wxss',
        }))
        .pipe(dest(DEST));
}

function wxss() {
    return src(path.wxssPath)
        .pipe(Changed(DEST))
        .pipe(Print(filepath => `Build Wxss: ${filepath}`))
        .pipe(Alias(aliasConfig))
        .pipe(GulpIf(process.env.NODE_ENV === 'production', Csso({
            comments: false,
        })))
        .pipe(dest(DEST));
}


function ts() {
    return src(path.tsPath)
        .pipe(Changed(DEST))
        .pipe(Print(filepath => `Build ts: ${filepath}`))
        .pipe(Alias(aliasConfig))
        .pipe(GulpIf((file) => {
            const reg = /\.js$/;
            return !reg.test(file.path);
        }, TSProject()))
        .pipe(GulpIf(process.env.NODE_ENV === 'production', Uglify(uglifyOpts)))
        // .pipe(ESLint())
        // .pipe(ESLint.format())
        .pipe(dest(DEST));
}

function copy() {
    return src(path.copy)
        .pipe(Changed(DEST))
        .pipe(Alias(aliasConfig))
        .pipe(UrlPrefixer.html(urlPrefix))
        .pipe(dest(DEST));
}

function imagemin() {
    return src(path.images)
        .pipe(Changed(DEST))
        .pipe(ImageMin())
        .pipe(dest('dist/images'));
}

const images = series(imagemin, (cb) => {
    const qiniu = new Qiniu(qiniuOptions);
    qiniu.upload();
    cb();
});

function clean() {
    return src('dist/*', {
            read: false
        })
        .pipe(Clean());
}

// 检查冗余文件。根据文件名来检测，所以对同名文件无力。
function findUnuse() {
    return src(['dist'])
        .pipe(FindUnused({
            ignoreList: ['.json', '.wxml'], // 忽略的文件后缀，或文件名
            rootDir: Path.join(__dirname, 'dist/'),
        }));
}

function devbuild(cb) {

    watch(path.copy, copy);
    watch(path.lessPath, less);
    watch(path.wxssPath, wxss);
    watch(path.tsPath, ts);
    watch(path.images, imagemin);

    console.log('\r\nStart watch file...\r\n');
    cb();
}

if (process.env.NODE_ENV === 'production') {
    exports.build = series(clean, parallel(less, ts, imagemin, wxss, copy), findUnuse);
} else {
    exports.build = series(clean, parallel(less, wxss, ts, imagemin, copy), devbuild);
}

// exports.default = series(clean, parallel(copy, wxss, ts, images));