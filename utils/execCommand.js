const print = require('./print')
// run linux shell(ssh对象、shell指令、执行路径)
//远程命令执行
function runCommand(ssh, command, path) {
  return new Promise((resolve, reject) => {
    ssh.execCommand(command, {
      cwd: path
    }).then((res) => {
      if (res.stderr) {
        reject(print('命令执行发生错误:' + res.stderr, 'danger'))
        process.exit()
      } else {
        resolve(print(command + ' 执行完成！'))
      }
    })
  })
}

module.exports = runCommand
