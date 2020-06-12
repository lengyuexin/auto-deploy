const NodeSSH = require('node-ssh')
const ssh = new NodeSSH()
const print = require('./print')

// 连接服务器
function connectServe(sshInfo) {
  return new Promise((resolve, reject) => {
    ssh.connect({ ...sshInfo }).then(() => {
      resolve(print('3-' + sshInfo.host + ' 连接成功'))
    }).catch((err) => {
      reject(print('3-' + sshInfo.host + ' 连接失败' + err.message, 'danger'))
    })
  })
}

module.exports = { ssh, connectServe }