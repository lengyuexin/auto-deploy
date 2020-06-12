
const runCommand = require('./execCommand')
const getCurrentTime = require('./timeFormat')
const print = require('./print')

// 处理源文件(ssh对象、配置信息)
async function handleBackupFile(ssh, config) {

    try {
        if (config.openBackUp) {
            if (config.backUpByTime) {
                print('已开启远端备份---时间节点备份');
                await runCommand(
                    ssh,
                    //备份-重命名文件
                    `
            if [ -d ${config.releaseDir} ];
            then mv ${config.releaseDir} ${config.releaseDir}#${getCurrentTime()}
            fi
            `,
                    config.deployDir)
            } else {
                print('已开启远端备份---最新备份')

                //每次删除备份目录，下次创建相当于备份后并重命名
                //始终获取最新数据
                await runCommand(
                    ssh,
                    `
            if [ -d ${config.releaseDir} ];
            then rm -rf ${config.releaseDir}#bak && mv -f ${config.releaseDir} ${config.releaseDir}#bak
            fi
            `,
                    config.deployDir)
            }


        } else {
            print('非法操作：请开启远端备份!', 'danger')
            process.exit()
        }
    } catch (error) {
        print("远程备份出错，请检查!", 'danger')
        print(error.message, 'danger')
        process.exit()
    }

}

module.exports = handleBackupFile