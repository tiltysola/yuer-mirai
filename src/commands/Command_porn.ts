import PornCore from '@alicloud/pop-core'

import {send_private_msg, send_group_msg} from './CQReply'

import secret from '../configs/secret'

const pornClient = new PornCore({
  endpoint: 'https://imageaudit.cn-shanghai.aliyuncs.com',
  apiVersion: '2019-12-30',
  ...secret.alivision
})

export const Porn_Private = function (ws: any, user_id: any, cq_info: any, image: any) {
  console.log('[Debug]', 'Receive command: Porn, User_ID:', user_id, ': Image:', image)
  porn(cq_info, image, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Porn_Group = function (ws: any, group_id: any, cq_info: any, image: any) {
  console.log('[Debug]', 'Receive command: Porn, Group_ID:', group_id, ': Image:', image)
  porn(cq_info, image, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function porn (cq_info: any, image: any, callback: any) {
  if (!image)
    callback('图片鉴黄：!porn <图片>')
  else if (!getImageUrl(image))
    // callback('提交的图片不是有效的格式。')
    pornClient.request('ScanText', {
      "Labels.1.Label": "porn",
      "Tasks.1.Content": image
    }, {
      method: 'POST'
    }).then((result: any) => {
      try {
        if (result && result.Data && result.Data.Elements && result.Data.Elements[0].Results) {
          console.log('[Debug]', 'ScanText:', result.Data.Elements[0].Results[0])
          let porn = '未识别'
          let rate = result.Data.Elements[0].Results[0].Rate
          switch (result.Data.Elements[0].Results[0].Label) {
            case 'normal': porn = '正常文本'; break
            case 'sexy': porn = '性感文本'; break
            case 'porn': porn = '色情文本'; break
          }
          callback(`文本鉴黄结果：\n类型：${porn}\n可信度：${rate}\n{阿里云AI}`)
        } else {
          console.log('[Error]', JSON.stringify(result))
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        }
      } catch (e) {
        callback(e.toString())
      }
    }, (ex) => {
      console.log('[Error]', ex);
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    })
  else {
    pornClient.request('ScanImage', {
      "Scene.1": "porn",
      "Task.1.ImageURL": getImageUrl(image)
    }, {
      method: 'POST'
    }).then((result: any) => {
      try {
        if (result && result.Data && result.Data.Results && result.Data.Results[0].SubResults) {
          console.log('[Debug]', 'ScanImage:', result.Data.Results[0].SubResults[0])
          let porn = '未识别'
          let rate = result.Data.Results[0].SubResults[0].Rate
          switch (result.Data.Results[0].SubResults[0].Label) {
            case 'normal': porn = '正常图片'; break
            case 'sexy': porn = '性感图片'; break
            case 'porn': porn = '色情图片'; break
          }
          callback(`图片鉴黄结果：\n类型：${porn}\n可信度：${rate}\n{阿里云AI}`)
        } else {
          console.log('[Error]', JSON.stringify(result))
          callback('图片查询失败，请尝试重新截图而不是复制图片。')
        }
      } catch (e) {
        callback(e.toString())
      }
    }, (ex) => {
      console.log(ex);
      callback('图片查询失败，请尝试重新截图而不是复制图片。')
    })
  }
}

function getImageUrl (image: any) {
  if (image.match(/url=(.+?)]/))
    return image.match(/url=(.+?)]/)[1]
  else
    return null
}