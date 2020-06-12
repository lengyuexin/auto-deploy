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