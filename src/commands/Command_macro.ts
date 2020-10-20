import request from 'request'

import {send_private_msg, send_group_msg} from './CQReply'

export const Macro_Private = function (ws: any, user_id: any, id: any, index: any) {
  console.log('[Debug]', 'Receive command: Macro, User_ID:', user_id, ': ID&INDEX:', id, index)
  macro(id, index, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Macro_Group = function (ws: any, group_id: any, id: any, index: any) {
  console.log('[Debug]', 'Receive command: Macro, Group_ID:', group_id, ': ID&INDEX:', id, index)
  macro(id, index, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function macro (id: any, index: any, callback: any) {
  if (!id || !index || index < 0 || index > 99) {
    callback('宏书查询：!macro <宏书ID> <第几条宏>' + '\n阿莉塞的宏书: xiv.acgme.cn')
    return
  }
  id = parseInt(id)
  index = parseInt(index)
  request({
    url: 'https://xiv.acgme.cn/macro/yuer?id=' + id,
    method: 'get',
    json: true
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      if (body.code === 200) {
        let macro = JSON.parse(body.data.contents)
        let msg = body.data.bookname + ' 的第' + index + '条宏如下：'
        let macroD = macro[index]
        let null_line = 0
        msg += ('\n标题：' + macroD.title)
        for (let i = 0; i < macroD.line.length; i++) {
          if (macroD.line[i] !== null) {
            msg += ('\n' + macroD.line[i])
          } else {
            null_line++
          }
        }
        msg += ('\n该宏书作者: ' + body.data.user_info.nickname + '@' + body.data.user_info.server.server_name)
        msg += '\nPowered by: 阿莉塞的宏书'
        if (null_line < macroD.line.length) {
          callback(msg)
        } else {
          callback(body.data.bookname + '中不存在第' + index + '条宏。')
        }
      } else {
        callback('阿莉塞的宏书那边返回了一个错误：' + body.msg + '。')
      }
    } else {
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    }
  })
}