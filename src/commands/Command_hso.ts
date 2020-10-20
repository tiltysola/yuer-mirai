import request from 'request'
import GM from 'gm'

import {send_private_msg, send_private_msg_wd, send_group_msg, send_group_msg_wd} from './CQReply'

let cool_down = false

export const Hso_Private = function (ws: any, user_id: any, cq_info: any, rage: any, tags: any) {
  console.log('[Debug]', 'Receive command: Hso, User_ID:', user_id, ': Tags:', tags)
  // if (cq_info.version !== 'pro') {
  //   send_private_msg(ws, user_id, '很抱歉，您的BOT版本不支持该指令！')
  //   return
  // }
  if (rage && rage === 'x') {
    hso(tags, true, (res: any, wd: any = 0) => {
      send_private_msg_wd(ws, user_id, res, wd)
    })
  } else {
    hso(rage, false, (res: any, wd: any = 0) => {
      send_private_msg_wd(ws, user_id, res, wd)
    })
  }
}

export const Hso_Group = function (ws: any, group_id: any, cq_info: any, rage: any, tags: any) {
  console.log('[Debug]', 'Receive command: Hso, Group_ID:', group_id, ': Tags:', tags)
  // if (cq_info.version !== 'pro') {
  //   send_group_msg(ws, group_id, '很抱歉，您的BOT版本不支持该指令！')
  //   return
  // }
  if (rage && rage === 'x') {
    hso(tags, true, (res: any, wd: any = 0) => {
      send_group_msg_wd(ws, group_id, res, wd)
    })
  } else {
    hso(rage, false, (res: any, wd: any = 0) => {
      send_group_msg_wd(ws, group_id, res, wd)
    })
  }
}

function hso (tags: any, r18: boolean = false, callback: any) {
  if (cool_down === false) {
    cool_down = true
    if (tags)
      req(1, 1000, tags, r18, callback)
    else {
      let page = Math.floor(Math.random() * 1000)
      req(page, 100, tags, r18, callback)
    }
  } else {
    callback('上一个请求尚未结束，请稍后再试！')
  }
}

function req (page: any, limit: any, tags: any, r18: any, callback: any) {
  let url = 'https://konachan.com/post.json?limit=' + limit + '&page=' + page
  if (tags)
    url = 'https://konachan.com/post.json?limit=' + limit + '&page=' + page + '&tags=' + encodeURIComponent(escape(tags.replace(/,/g, ' ')))
  // console.log(url)
  request({
    url,
    method: 'get',
    json: true
  }, (err, res, body) => {
    console.log('[Debug]', 'Hso req Fetched.')
    if (!err && res.statusCode == 200) {
      try {
        if (body.length === 0) {
          callback('没有搜索到相关图片！')
          cool_down = false
        } else {
          if (r18) {
            let seed = Math.floor(Math.random() * body.length)
            reqImg(body[seed].sample_url, body[seed].source, (body[seed].rating === 's' ? 0 : 8000), callback)
          } else {
            let sImg: any = []
            for (let i = 0; i < body.length; i++) {
              if (body[i].rating === 's') {
                sImg.push(body[i])
              }
            }
            if (sImg.length === 0) {
              callback('没有搜索到相关图片！')
              cool_down = false
            } else {
              let seed = Math.floor(Math.random() * sImg.length)
              reqImg(sImg[seed].sample_url, sImg[seed].source, 0, callback)
            }
          }
          // callback('[CQ:image, file=' + body[Math.floor(Math.random() * body.length)].sample_url + ']')
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
  // console.log(url)
  request({
    url,
    method: 'get',
    encoding: null
  }, (err, res, body) => {
    console.log('[Debug]', 'Hso reqImg Fetched.')
    if (!err && res.statusCode == 200) {
      // callback('[CQ:image, file=base64://' + body.toString('base64') + ']', wd)
      cool_down = false
      GM(body).resize(512).toBuffer('PNG', function (err, buffer) {
        if (err) {
          console.log('[Error]', err)
          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
        } else {
          callback('[CQ:image, file=base64://' + buffer.toString('base64') + ']\n' + '图片源: ' + source, wd)
        }
      })
    } else {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      cool_down = false
    }
  })
}

// function req (page: any, tags: any, callback: any) {
//   let url = 'http://206.189.159.80/konachan.php?limit=50&page=' + page
//   if (tags)
//     url = 'http://206.189.159.80/konachan.php?limit=50&page=' + page + '&tags=' + escape(tags)
//   request({
//     url,
//     method: 'get'
//   }, (err, res, body) => {
//     if (!err && res.statusCode == 200) {
//       let json
//       try {
//         json = JSON.parse(body)
//         if (json.length === 0 && page > 1) {
//           req(Math.floor(page / 2), tags, callback)
//         } else {
//           if (json.length === 0) {
//             callback('没有搜索到相关图片！')
//           } else {
//             console.log(page, json.length)
//           }
//         }
//       } catch (err) {
//         req(Math.floor(page / 4), tags, callback)
//       }
//       // let ran = Math.floor(Math.random() * 20)
//       // callback('[CQ:image, file=' + json[ran].sample_url + ']')
//     } else {
//       console.log('[Error]', err)
//       callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
//     }
//   })
// }