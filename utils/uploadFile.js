const handleBackupFile = require('./backupFile')
const print = require('./print')

// 文件上传(ssh对象、配置信息、本地待上传文件)
async function uploadFile(ssh, config, localFile) {
  return new Promise((resolve, reject) => {
    print('4-开始文件上传')
    handleBackupFile(ssh, config)
    ssh.putFile(localFile, config.deployDir + config.targetFile).then(async () => {
      resolve(print('5-文件上传完成'))
    }, (err) => {
      reject(print('5-上传失败！' + err.message, 'danger'))
    })
  })
}



module.exports = uploadFile