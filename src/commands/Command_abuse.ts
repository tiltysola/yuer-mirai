import AbuseCore from '@alicloud/pop-core'

import {send_private_msg, send_group_msg} from './CQReply'

import secret from '../configs/secret'

const abuseClient = new AbuseCore({
  endpoint: 'https://imageaudit.cn-shanghai.aliyuncs.com',
  apiVersion: '2019-12-30',
  ...secret.alivision
})

export const Abuse_Private = function (ws: any, user_id: any, cq_info: any, msg: any) {
  console.log('[Debug]', 'Receive command: Abuse, User_ID:', user_id, ': Msg:', msg)
  abuse(cq_info, msg, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Abuse_Group = function (ws: any, group_id: any, cq_info: any, msg: any) {
  console.log('[Debug]', 'Receive command: Abuse, Group_ID:', group_id, ': Msg:', msg)
  abuse(cq_info, msg, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function abuse (cq_info: any, msg: any, callback: any) {
  if (!msg)
    callback('辱骂识别：!abuse <文本>')
  else
    abuseClient.request('ScanText', {
      "Labels.1.Label": "abuse",
      "Tasks.1.Content": msg
    }, {
      method: 'POST'
    }).then((result: any) => {
      if (result && result.Data && result.Data.Elements[0] && result.Data.Elements[0].Results[0]) {
        console.log('[Debug]', 'ScanText:', result.Data.Elements[0].Results[0])
        let label = result.Data.Elements[0].Results[0].Label
        switch (result.Data.Elements[0].Results[0].Label) {
          case 'normal': label = '正常文本'; break
          case 'abuse': label = '涉嫌辱骂'; break
        }
        let rate = result.Data.Elements[0].Results[0].Rate
        callback(`辱骂识别结果：\n类型：${label}\n可信度：${rate}\n{阿里云AI}`)
      } else {
        console.log('[Error]', JSON.stringify(result))
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      }
    }, (ex) => {
      console.log('[Error]', ex);
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    })
}