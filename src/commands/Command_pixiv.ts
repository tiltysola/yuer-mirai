import request from 'request'
import GM from 'gm'

import {send_private_msg, send_private_msg_wd, send_group_msg, send_group_msg_wd} from './CQReply'

let cool_down = false

export const Pixiv_Private = function (ws: any, user_id: any, cq_info: any, tags: any) {
  console.log('[Debug]', 'Receive command: Hso, User_ID:', user_id, ': Tags:', tags)
  pixiv(tags, (res: any, wd: any = 0) => {
    send_private_msg_wd(ws, user_id, res, wd)
  })
}

export const Pixiv_Group = function (ws: any, group_id: any, cq_info: any, tags: any) {
  console.log('[Debug]', 'Receive command: Hso, Group_ID:', group_id, ': Tags:', tags)
  pixiv(tags, (res: any, wd: any = 0) => {
    send_group_msg_wd(ws, group_id, res, wd)
  })
}

function pixiv (tags: any, callback: any) {
  if (cool_down === false) {
    cool_down = true
    req(tags, callback)
  } else {
    callback('上一个请求尚未结束，请稍后再试！')
  }
}

function req (tags: any, callback: any) {
  let url = 'https://api.imjad.cn/pixiv/v1/?type=search&word=' + encodeURIComponent(tags) + '&mode=tag&order=desc&per_page=100'
  request({
    url,
    method: 'get',
    json: true
  }, (err, res, body) => {
    console.log('[Debug]', 'pixiv req Fetched.')
    if (!err && res.statusCode == 200) {
      try {
        if (body.status == 'success') {
          if (body.response.length == 0) {
            callback('没有搜索到相关图片。')
            cool_down = false
            return
          }
          if (body.response.length < 100) {
            callback('当前标签图库较少，仅有：' + body.response.length + '张')
          }
          const random = Math.ceil(Math.random() * body.response.length) - 1
          const r18 = body.response[random].tags.includes('R-18') || body.response[random].tags.includes('R-18G')
          // const id = body.response[random].id
          // reqImg(`https://pixiv.cat/${id}.png`, callback)
          console.log('[Debug]', `Req random ${random} id ${body.response[random].id}`)
          reqImg(body.response[random].image_urls.px_480mw, body.response[random].image_urls.large, r18 ? 8000 : 0, callback)
        } else {
          console.log('[Error]', err)
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          cool_down = false
        }
      } catch (err) {
        console.log('[Error]', err)
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        cool_down = false
      }
    } else {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      cool_down = false
    }
  })
}

function reqImg (url: any, source: any, wd: any = 0, callback: any) {
  request({
    url,
    method: 'get',
    headers: {
      Referer: 'https://www.pixiv.net/'
    },
    encoding: null
  }, (err, res, body) => {
    console.log('[Debug]', 'pixiv reqImg Fetched.')
    if (!err && res.statusCode == 200) {
      cool_down = false
      GM(body).resize(512).toBuffer('PNG', function (err, buffer) {
        if (err) {
          console.log('[Error]', err)
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        } else {
          callback('[CQ:image, file=base64://' + buffer.toString('base64') + ']\n' + '图片源：' + source, wd)
        }
      })
    } else {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      cool_down = false
    }
  })
}