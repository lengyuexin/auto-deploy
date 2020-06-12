const config = require('./config')
const helper = require('./utils/inquirerUI')
const compressFile = require('./utils/compressFile')
const sshServer = require('./utils/ssh')
const uploadFile = require('./utils/uploadFile')
const runCommand = require('./utils/execCommand')
const print = require('./utils/print')

// 主程序(可单独执行)
async function main() {
  try {

    const SELECT_CONFIG = (await helper(config)).value // 所选部署项目的配置信息
    const {
      name, targetFile, openCompress, targetDir,
      ssh, deployDir, build, releaseDir
    } = SELECT_CONFIG;

    print(`您选择了部署${name}`)

    const localFile = __dirname + '/' + targetFile // 待上传本地文件
    openCompress && await compressFile(targetDir, localFile, build)  //压缩
    await sshServer.connectServe(ssh) // 连接
    await uploadFile(sshServer.ssh, SELECT_CONFIG, localFile) // 上传
    await runCommand(sshServer.ssh, 'unzip ' + targetFile, deployDir) // 解压
    //此时原项目名已经被重命名，或最新备份，或时间节点备份
    // mv dist target,这条命令相当于将dist重命名为原始目录
    // src->src#bak   dist->src
    await runCommand(sshServer.ssh, `mv ${build}  ${releaseDir}`, deployDir) // 修改文件名称
    await runCommand(sshServer.ssh, 'rm -f ' + targetFile, deployDir) // 删除
  } catch (err) {
    print('部署过程出现错误！', 'danger')
    print(err.message, 'danger')
  } finally {
    process.exit()
  }
}

// run main
main()
