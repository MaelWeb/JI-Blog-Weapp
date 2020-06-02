/**
 * LRU 文件存储，使用该 downloader 可以让下载的文件存储在本地，下次进入小程序后可以直接使用
 * 详细设计文档可查看 https://juejin.im/post/5b42d3ede51d4519277b6ce3
 */

const SAVED_FILES_KEY = '_YH_SAVE_FILE_LIST'
const KEY_TOTAL_SIZE = 'totalSize'
const KEY_PATH = 'path'

// 可存储总共为 6M，目前小程序可允许的最大本地存储为 10M
const MAX_SPACE_IN_B = 6 * 1024 * 1024

class Dowloader {

    isValidUrl(url: string) {
        return /(ht|f)tp(s?):\/\/([^ \\/]*\.)+[^ \\/]*(:[0-9]+)?\/?/.test(url)
    }

    /**
     * 下载文件，会用 lru 方式来缓存文件到本地
     * @param {String} url 文件的 url
     * @param {Boolen} saveToLocal 是否存到本地
     */
    download(url: string, saveToLocal = false) {
        return new Promise((resolve, reject) => {
            if (!(url && this.isValidUrl(url))) {
                resolve(url)
                return
            }
            const file = this._getFile(url)
            if (file) {
                // 检查文件是否正常，不正常需要重新下载
                wx.getSavedFileInfo({
                    filePath: file[KEY_PATH],
                    success: () => {
                        resolve(file[KEY_PATH])
                    },
                    fail: (error) => {
                        console.error(`the file is broken, redownload it, ${JSON.stringify(error)}`)
                        this._downloadFile(url, saveToLocal).then((path) => {
                            resolve(path)
                        }, () => {
                            reject()
                        })
                    },
                })
            } else {
                this._downloadFile(url, saveToLocal).then((path) => {
                    resolve(path)
                }, () => {
                    reject()
                })
            }
        })
    }

    _downloadFile(url: string, saveToLocal = false) {
        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url,
                success: (res) => {
                    if (res.statusCode !== 200) {
                        console.error(`downloadFile ${url} failed res.statusCode is not 200`)
                        reject()
                        return
                    }
                    const { tempFilePath } = res
                    if (saveToLocal) {
                        wx.getFileInfo({
                            filePath: tempFilePath,
                            success: (tmpRes) => {
                                const newFileSize = tmpRes.size
                                this._doLru(newFileSize).then(() => {
                                    this.saveFile(url, newFileSize, tempFilePath).then((filePath) => {
                                        resolve(filePath)
                                    })
                                }).catch(() => {
                                    resolve(tempFilePath)
                                })
                            },
                            fail: (error) => {
                                // 文件大小信息获取失败，则此文件也不要进行存储
                                console.error(`getFileInfo ${res.tempFilePath} failed, ${JSON.stringify(error)}`)
                                resolve(res.tempFilePath)
                            },
                        })
                    } else {
                        resolve(tempFilePath)
                    }
                },
                fail: (error) => {
                    console.error(`downloadFile failed, ${JSON.stringify(error)} `)
                    reject()
                },
            })
        })
    }

    saveFile(key: string, newFileSize: number, tempFilePath: string) {
        return new Promise((resolve) => {
            wx.saveFile({
                tempFilePath,
                success: (fileRes) => {
                    const savedFiles = this._storageFileList()
                    const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0

                    savedFiles.totalSize = newFileSize + totalSize
                    savedFiles[key] = {
                        path: fileRes.savedFilePath,
                        time: +new Date(),
                        size: newFileSize,
                    }

                    wx.setStorage({
                        key: SAVED_FILES_KEY,
                        data: savedFiles,
                    })
                    resolve(fileRes.savedFilePath)
                },
                fail: () => {
                    // 如果出现错误，就直接情况本地的所有文件，因为你不知道是不是因为哪次lru的某个文件未删除成功
                    this._reset()
                    // 由于 saveFile 成功后，res.tempFilePath 处的文件会被移除，所以在存储未成功时，我们还是继续使用临时文件
                    resolve(tempFilePath)
                },
            })
        })
    }

    /**
     * 清空所有下载相关内容
     */
    _reset() {
        wx.removeStorage({
            key: SAVED_FILES_KEY,
            success: () => {
                wx.getSavedFileList({
                    success: (listRes: wx.WxGetSavedFileListSuccessCallbackResult) => {
                        this._removeFiles(listRes.fileList as any)
                    },
                    fail: (getError) => {
                        console.error(`getSavedFileList failed, ${JSON.stringify(getError)}`)
                    },
                })
            },
        })
    }

    _doLru(size: number) {
        const storageFiles = this._storageFileList()

        return this.getLocalFiles()
            .then((files: { totalSize: number }) => {
                let lcoalTotalSize = files.totalSize

                if (size + lcoalTotalSize >= MAX_SPACE_IN_B) {

                    const sortedKeys = Object.keys(storageFiles).sort((a, b) => storageFiles[a].time - storageFiles[b].time)
                    const fileShouldDelete = []
                    delete storageFiles.totalSize

                    for (const key of sortedKeys) {
                        lcoalTotalSize -= storageFiles[key].size
                        fileShouldDelete.push(storageFiles[key])

                        delete storageFiles[key]

                        if (lcoalTotalSize + size < MAX_SPACE_IN_B) {
                            break
                        }
                    }

                    storageFiles.totalSize = lcoalTotalSize

                    wx.setStorageSync(SAVED_FILES_KEY, storageFiles)

                    console.log('fileShouldDelete', fileShouldDelete)
                    this._removeFiles(fileShouldDelete)
                }

                return files
            })
    }

    _removeFiles(fileShouldDelete: wx.WxGetSavedFileListSuccessCallbackResultFileItem[]) {
        if (!fileShouldDelete.length) return
        for (const pathDel of fileShouldDelete) {
            let delPath: string | wx.WxGetSavedFileListSuccessCallbackResultFileItem = pathDel
            if (typeof pathDel === 'object') {
                delPath = pathDel.filePath
            }
            wx.removeSavedFile({
                filePath: delPath as string,
                fail: (error) => {
                    console.error(`removeSavedFile ${pathDel} failed, ${JSON.stringify(error)}`)
                },
            })
        }
    }

    _getFile(key: string) {
        const savedFiles = this._storageFileList()
        if (!savedFiles[key]) {
            return null
        }
        savedFiles[key].time = new Date().getTime()
        wx.setStorage({
            key: SAVED_FILES_KEY,
            data: savedFiles,
        })

        return savedFiles[key]
    }


    getLocalFiles(): Promise<any> {
        return new Promise((resolve, reject) => {
            wx.getSavedFileList({
                success: (listRes) => {
                    const files = listRes.fileList as any;
                    let totalSize = 0
                    files.length && files.forEach((file: { size: number }) => {
                        totalSize += file.size
                    })
                    console.log('getLocalFiles', files, totalSize)
                    resolve({
                        code: 0,
                        totalSize,
                        fileList: files,
                    })
                },
                fail: (err) => {
                    reject({
                        code: 404,
                        msg: err,
                    })
                },
            })
        })
    }

    _storageFileList() {
        const fileList = wx.getStorageSync(SAVED_FILES_KEY)

        return fileList || {}
    }
}

const downloader = new Dowloader()

export default downloader