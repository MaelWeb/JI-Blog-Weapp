/* eslint-disable */
const gUtil = require('gulp-util');
const through = require('through2');
const path = require('path');
const fs = require('fs');
const del = require('del');

const PLUGIN_NAME = 'gulp-find-unused';
let debug;
let ignoreList = [];


let fileList = [];
let fileLeftDir;
let rootDir;

function getFile(fullPath) {
    const data = fs.readFileSync(fullPath, 'utf-8');
    return data;
}

// 检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

function readFileList(filePath, fileList) {
    const files = fs.readdirSync(filePath);
    for (const item of files) {
        const stat = fs.statSync(path.resolve(filePath, item));
        if (stat.isDirectory()) {
            readFileList(path.resolve(filePath, item), fileList);
        } else {
            if (item === 'ry.json') {
                continue;
            }
            let fileAbs = path.resolve(filePath, item);
            fileAbs = fileAbs.split(path.sep).join('/');
            filePath = filePath.split(path.sep).join('/');
            const fileExt = /\.\w+$/.exec(item)[0];
            const name = item.replace(/(.*\/)*([^.]+).*/ig, "$2");
            const obj = {
                path: filePath,
                fileName: item,
                fileAbs,
                size: stat.size,
                useList: [],
                matchedPath: '',
                pathGroup: [] || obj.pathGroup,
            };
            const fileAbsGroup = fileAbs.split(rootDir)[1].split('/');
            if (~ignoreList.indexOf(fileExt)) {
                obj.ignore = true;
            } else {
                while (fileAbsGroup.length) {
                    const _filePath = fileAbsGroup.join('/');
                    const _filePathNoExt = _filePath.split('.')[0];
                    if (~ignoreList.indexOf(_filePath) || ~ignoreList.indexOf(_filePathNoExt)) {
                        obj.ignore = true;
                    }
                    _filePath && (obj.pathGroup = obj.pathGroup.concat([_filePath, _filePathNoExt]));
                    fileAbsGroup.shift();
                }
            }
            fileList.push(obj);
        }
    }
    return fileList;
}

function searchFileNotUse() {
    gUtil.log(gUtil.colors.green.bold('开始检查冗余文件：'));

    for (const file of fileList) {
        if (file.ignore) continue;
        const pathGroup = file.pathGroup;
        gUtil.log(gUtil.colors.green.bold(`检查文件：${file.fileAbs}`));
        for (const d of fileList) {
            const tmpPath = path.resolve(d.path, d.fileName);
            const fileContent = getFile(tmpPath);
            for (const dd of pathGroup) {
                if (~fileContent.indexOf(dd)) {
                    if (!~file.useList.indexOf(d.fileAbs)) {
                        file.useList.push(d.fileAbs);
                        file.matchedPath = dd;
                    }
                }
            }
        }
    }

    return fileList;
}

function writeRes(dir, data) {
    if (path.isAbsolute(dir)) {
        fileLeftDir = dir;
        fs.writeFileSync(path.join(dir, 'ry.json'), new Buffer(JSON.stringify(data), 'utf-8'));
    } else {
        const tmp = path.join(__dirname, dir);
        const isExistDir = fsExistsSync(tmp);
        if (!isExistDir) {
            fs.mkdirSync(tmp);
        }
        fileLeftDir = path.resolve(tmp, 'ry.json').split(path.sep).join('/');
        fs.writeFileSync(path.join(tmp, 'ry.json'), new Buffer(JSON.stringify(data), 'utf-8'));
    }
}

/*
 * options:Object
 * ignoreList:Array 忽略列表
 *
 * */
module.exports = function (options) {
    options = options || {
        ignoreList: [],
    };
    ignoreList = options.ignoreList || [];
    rootDir = options.rootDir;
    return through.obj(function (file, enc, cb) {
        const filePath = path.normalize(file.path);
        const stat = fs.statSync(filePath);
        if (!stat.isDirectory()) {
            // return cb(new gUtil.PluginError(PLUGIN_NAME, 'please only send the directory name parameter to gulp.src,no wildcards etc permitted！'));
            return cb();
        }
        fileList = readFileList(filePath, []);
        const res = searchFileNotUse();
        let count = 0;
        let totalSize = 0;
        const rongyu = [];
        res.forEach((file) => {
            if (!file.useList.length && !file.ignore) {
                count++;
                rongyu.push(file.fileName);
                totalSize += file.size;
                gUtil.log(gUtil.colors.red.bold(`删除冗余文件：${file.fileName}， 路径：${file.fileAbs},  文件大小:：${file.size}\r\n`));
                del(file.fileAbs);
            }
        });

        gUtil.log(gUtil.colors.green.bold(`扫描文件个数：${fileList.length}`));
        if (count > 0) {
            gUtil.log(gUtil.colors.red.bold(`可疑冗余文件个数：${count}，请确认`));
            gUtil.log(gUtil.colors.red.bold(`冗余率：${(count / fileList.length).toFixed(4) * 100}%`));
            gUtil.log(gUtil.colors.red.bold(`冗余文件总大小【${totalSize}】B`));
        } else {
            gUtil.log(gUtil.colors.red.bold('暂未发现冗余文件'));
        }

        gUtil.log(gUtil.colors.green.bold('处理完毕'));

        this.push(file);
        cb();
    });
};