import request from 'request'

import {send_private_msg, send_group_msg} from './CQReply'

export const Nuannuan_Private = function (ws: any, user_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Search, User_ID:', user_id)
  nuannuan(cq_info, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Nuannuan_Group = function (ws: any, group_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Search, Group_ID:', group_id)
  nuannuan(cq_info, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function nuannuan (cq_info: any, callback: any) {
  // let url = 'http://nuannuan.yorushika.co:5000/text'
  // if (cq_info.version === 'pro')
  const url = 'http://nuannuan.yorushika.co:5000/'
  request({
    url,
    method: 'get',
    json: true
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      if (body.success) {
        callback(body.content)
      } else {
        callback('远程服务器出错，请稍后再试。')
      }
    } else {
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    }
  })
}