import request from 'request'

import {send_private_msg, send_group_msg} from './CQReply'

export const Nuannuan_Private = function (ws: any, user_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Search, User_ID:', user_id)
  send_private_msg(ws, user_id, '功能异常，暂停使用。')
  // nuannuan(cq_info, (res: any) => {
  //   send_private_msg(ws, user_id, res)
  // })
}

export const Nuannuan_Group = function (ws: any, group_id: any, cq_info: any) {
  console.log('[Debug]', 'Receive command: Search, Group_ID:', group_id)
  send_group_msg(ws, group_id, '功能异常，暂停使用。')
  // nuannuan(cq_info, (res: any) => {
  //   send_group_msg(ws, group_id, res)
  // })
}

function nuannuan (cq_info: any, callback: any) {
  let url = 'https://docs.qq.com/dop-api/get/sheet?padId=300000000$cMshIrVXeqSX&subId=dewveu&outformat=1'
  request({
    url,
    method: 'get',
    json: true,
    headers: {
      Referer: 'https://docs.qq.com'
    }
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      let detail = body.data.initialAttributedText.text[0][4][0].c[1]
      let title = get_data(detail, 28)
      let item1 = get_data(detail, 109)
      let item2 = get_data(detail, 325)
      let item3 = get_data(detail, 514)
      let item4 = get_data(detail, 703)
      let info1 = get_data(detail, 137)
      let info2 = get_data(detail, 353)
      let info3 = get_data(detail, 542)
      let info4 = get_data(detail, 731)
      let get1 = get_data(detail, 191)
      let get2 = get_data(detail, 407)
      let get3 = get_data(detail, 596)
      let get4 = get_data(detail, 785)
      let dye1 = get_data(detail, 919) + get_data(detail, 920)
      let dye2 = get_data(detail, 946) + get_data(detail, 947)
      let dye3 = get_data(detail, 973) + get_data(detail, 974)
      let dye4 = get_data(detail, 1000) + get_data(detail, 1001)
      let dye5 = get_data(detail, 1027) + get_data(detail, 1028)
      let dye6 = get_data(detail, 1054) + get_data(detail, 1055)
      let msg = title
      msg += ('\n★ ' + item1 + '\n本期提示：' + info1 + '\n可选方案/本期提示：\n' + get1)
      msg += ('\n★ ' + item2 + '\n本期提示：' + info2 + '\n可选方案/本期提示：\n' + get2)
      msg += ('\n★ ' + item3 + '\n本期提示：' + info3 + '\n可选方案/本期提示：\n' + get3)
      msg += ('\n★ ' + item4 + '\n本期提示：' + info4 + '\n可选方案/本期提示：\n' + get4)
      if (get_data(detail, 920))
        msg += ('\n★ 染色攻略：\n' + dye1 + '\n' + dye2 + '\n' + dye3 + '\n' + dye4 + '\n' + dye5 + '\n' + dye6 + '\n')
      else
        msg += ('\n★ 染色攻略：\n如果游玩C不咕的话...周五就出来了吧~\n')
      msg += ('\n数据来源: 游玩C\n接口提供: 艾莉莎霍华特@红玉海')
      callback(msg)
    } else {
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    }
  })
}

function get_data (data: any, index: any) {
  if (data['' + index] && data['' + index]['2'])
    return data['' + index]['2'][1]
  else
    return false
}