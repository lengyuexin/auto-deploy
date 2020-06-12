// 获取当前时间
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
