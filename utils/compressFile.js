const fs = require('fs')
const archiver = require('archiver')
const print = require('./print')

//文件压缩
function compressFile(targetDir, localFile, build) {
  return new Promise((resolve, reject) => {

    print('1-正在压缩文件...')
    let output = fs.createWriteStream(localFile) // 创建文件写入流
    const archive = archiver('zip', {
      zlib: { level: 9 } // 设置压缩等级
    })
    output.on('close', () => {
      resolve(
        print('2-压缩完成！共计 ' + (archive.pointer() / 1024 / 1024).toFixed(3) + 'MB')
      )
    }).on('error', (err) => {
      reject(() => {
        print('压缩失败', 'dnager')
        print(err.message, 'dnager')
        process.exit()
      })
    })
    archive.pipe(output) // 管道存档数据到文件
    archive.directory(targetDir, build) // 存储目标文件并重命名
    archive.finalize() // 完成文件追加 确保写入流完成
  })
}

module.exports = compressFile
