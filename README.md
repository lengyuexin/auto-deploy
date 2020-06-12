## 自动化部署



### 项目启动

1. npm i node-ssh archiver inquirer  rimraf
2. 按需修改config文件
3. 运行npm run deploy


### 部署流程

1. 部署文件配置 config
2. 压缩本地编译后的项目 npm run build =>dist=> dist.zip
3. 建立与远程服务器的连接 ssh
4. 上传本地压缩后项目到远程服务器 upload dist.zip
5. 远程服务器数据备份 根据时间节点备份或只保留最新备份
6. 远程服务器解压本地上传的压缩包 unzip dist.zip
7. 修改发布目录 mv dist target
8. 删除远程的压缩文件 rm -rf dist.zip
9. 删除本地的压缩文件 rimraf dist.zip

![部署流程](https://img-blog.csdnimg.cn/20200612112840959.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyODEzNDkx,size_16,color_FFFFFF,t_70)


### 技术选型


1. node-ssh 实现远程服务器的连接，远程命令执行
2. archiver 实现文件压缩
3. inquirer 命令行交互界面

### 目录结构划分

```
src/main.js                 自动化部署程序入口
src/config.js               部署文件配置
src/utils/compressFile.js   文件压缩
src/utils/execCommand.js    执行远程命令
src/utils/timeFormat.js     时间格式化处理
src/utils/inquirerUI.js     命令行交互界面
src/utils/ssh.js            ssh连接
src/utils/uploadFile.js     文件上传
src/utils/backupFile.js     远程文件备份
src/utils/print.js          美化打印

```

### 功能实现


**通用工具函数--美化打印print**

```js
//src/utils/print
const styles = {
    'red': '\x1B[31m', // 红色--danger
    'danger': '\x1B[31m', // 红色--danger
    'yellow': '\x1B[33m', // 黄色--warnning
    'warnning': '\x1B[33m', // 黄色--warnning
    'blue': '\x1B[34m', // 蓝色--primary
    'primary': '\x1B[34m', // 蓝色--primary
    'bright': '\x1B[1m', // 亮色
    'green': '\x1B[32m', // 绿色
    'magenta': '\x1B[35m', // 品红
    'cyan': '\x1B[36m', // 青色
    'white': '\x1B[37m', // 白色
}

function print(msg = '', color = 'blue') {
    console.log(`${styles[color]}%s\x1B[0m`, msg)
}

//颜色测试
for (const key in styles) {
    if (styles.hasOwnProperty(key)) {
        print('自动化部署',key)
    }
}

module.exports = print


```

![美化打印](https://img-blog.csdnimg.cn/20200612112624128.png)


**通用工具函数--时间格式化timeFormat**

```js

//src/utils/timeFormat
function getCurrentTime() {
  const date = new Date
  const yyyy = date.getFullYear()
  const MM = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const HH = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  const ss = date.getSeconds().toString().padStart(2, '0')
  return `${yyyy}-${MM}-${dd}#${HH}:${mm}:${ss}`
}

module.exports = getCurrentTime

```



**1. 预检查**


```js
//src/utils/inquirerUI
const inquirer = require('inquirer')
const print = require('./print')
const selectTip = 'project name:'
const options = [
  {
    type: 'list',
    name: selectTip,
    message: 'Which project do you want to deploy?',
    choices: []
  }
]

//交互式命令行界面
function showHelper(config) {
  return new Promise((resolve, reject) => {
    initHelper(config) // 初始化helper
    inquirer.prompt(options).then(answers => {
      resolve({ value: findInfoByName(config, answers[selectTip]) }) // 查找所选配置项
    }).catch((err) => {
      reject(print(' helper显示或选择出错！' + err.message, 'danger'))
      process.exit()
    })
  })
}

// 初始化helper
function initHelper(config) {
  for (let item of config) {
    options[0].choices.push(item.name)
  }
  print('正在检查全局配置信息...')
  // 检查是否存在相同name
  if (new Set(options[0].choices).size !== options[0].choices.length) {
    print('请检查配置信息，存在相同name！', 'danger')
    process.exit()
  }
}

// 查找符合条件的配置项
function findInfoByName(config, name) {
  for (let item of config) {
    if (item.name === name) {
      return item
    }
  }
}

module.exports = showHelper


```


**2. 本地项目压缩**

```js
//src/utils/compressFile
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


```




**3. ssh连接**


```js

//src/utils/ssh
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


```

**4. 文件上传**

```js

//src/utils/uploadFile
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

```

**5. 远程数据备份**


```js
//src/utils/backupFile
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


```

**6. 入口文件**


```js
//src/main

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
    await runCommand(sshServer.ssh, `mv ${build}  ${releaseDir}`, deployDir) // 修改发布目录
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


```


**7. 配置文件**

```js
//src/config
const config = [
  {
    name: 'xxx',
    ssh: {
      host: 'xxx',
      port: 22,
      username: 'xxx',
      password: 'xxx',
      // privateKey: '', // ssh私钥(不使用此方法时请勿填写， 注释即可)
      passphrase: '' // ssh私钥对应解密密码(不存在设为''即可)
    },
    build: 'lib',//目标压缩目录名称
    targetDir: './lib', // 目标压缩目录路径(可使用相对地址)
    targetFile: 'lib.zip', // 目标文件压缩包名称
    openCompress: true, // 是否开启本地压缩
    openBackUp: true, // 是否开启远端备份
    backUpByTime: false, // 是否开启基于时间节点的备份
    deployDir: 'xxx', // 远端目录
    releaseDir: 'www' // 远端发布目录 ,形如 deployDir/releaseDir
  },
  {
    name: 'yyy',
    ssh: {
      host: 'yyy',
      port: 22,
      username: 'yyy',
      password: 'yyy',
      // privateKey: '', // ssh私钥(不使用此方法时请勿填写， 注释即可)
      passphrase: '' // ssh私钥对应解密密码(不存在设为''即可)
    },
    build: 'dist',//目标压缩目录名称
    targetDir: './dist', // 目标压缩目录(可使用相对地址)
    targetFile: 'dist.zip', // 目标文件
    openCompress: true, // 是否开启本地压缩
    openBackUp: true, // 是否开启远端备份
    backUpByTime: true, // 是否开启基于时间节点的备份
    deployDir: 'yyy', // 远端目录
    releaseDir: 'yyy' // 远端发布目录 形如 deployDir/releaseDir
  },
]

module.exports = config

```

**8. 本地项目清理**


```
npm i rimraf -D

//package.json配置

"devDependencies": {
    "rimraf": "^3.0.2"
},
"scripts": {
    "deploy": "node main.js && rimraf ./lib.zip && rimraf ./dist.zip"
},

```
