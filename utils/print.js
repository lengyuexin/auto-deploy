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
// for (const key in styles) {
//     if (styles.hasOwnProperty(key)) {
//         print('自动化部署', key)
//     }
// }

module.exports = print