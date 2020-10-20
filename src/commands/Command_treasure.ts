import request from 'request'
import GM from 'gm'
import path from 'path'
import fs from 'fs'

import location from './treasure/location'

import {send_private_msg, send_group_msg} from './CQReply'

export const Treasure_Private = function (ws: any, user_id: any, cq_info: any, image: any) {
  console.log('[Debug]', 'Receive command: Treasure, User_ID:', user_id, ': Image:', image)
  treasure(cq_info, image, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Treasure_Group = function (ws: any, group_id: any, cq_info: any, image: any) {
  console.log('[Debug]', 'Receive command: Treasure, Group_ID:', group_id, ': Image:', image)
  treasure(cq_info, image, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function treasure (cq_info: any, image: any, callback: any) {
  if (!image)
    callback('藏宝图查询：!treasure <藏宝图截图>')
  else if (!getImageUrl(image))
    callback('提交的图片不是有效的格式。')
  else {
    request({
      url: getImageUrl(image),
      encoding: null,
      method: 'get'
    }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let cache = fs.existsSync(path.resolve(__dirname, '../cache'))
        if (!cache)
          fs.mkdirSync(path.resolve(__dirname, '../cache'))
        let upload_file = path.resolve(__dirname, '../cache', getImageName(image))
        GM(body).resize(195, 162).write(upload_file, (err) => {
          if (err) {
            console.log('[Error]', err)
            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          } else {
            let map_lst: any = location()
            for (let i = 0; i < map_lst.length; i++) {
              let compare_file = path.resolve(__dirname, map_lst[i].uri)
              GM.compare(upload_file, compare_file, (err, isEqual, equality) => {
                if (err) {
                  console.log('[Error]', err)
                  callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                } else {
                  map_lst[i]['equality'] = equality
                  for(let j = 0; j < map_lst.length; j++) {
                    if (!map_lst[j]['equality'])
                      return
                  }
                  // 所有图片相似度检索完成，开始比较
                  let similarity = 1
                  let most_similarity = 0
                  for(let j = 0; j < map_lst.length; j++) {
                    if (map_lst[j]['equality'] < similarity) {
                      most_similarity = j
                      similarity = map_lst[j]['equality']
                    }
                  }
                  // if (cq_info.version === 'pro') {
                    try {
                      GM(path.resolve(__dirname, map_lst[most_similarity].uri.replace('/maps/', '/remaps/'))).resize(256, 256).toBuffer('jpg', (err, buffer) => {
                        if (err) {
                          console.log('[Error]', err)
                        } else {
                          callback('查询到当前宝图位置：' + map_lst[most_similarity].pos.z + ' (' + map_lst[most_similarity].pos.x + ', ' + map_lst[most_similarity].pos.y + ')\n' +
                            '[CQ:image, file=base64://' + buffer.toString('base64') + ']')
                        }
                      })
                    } catch (err) {
                      console.log('[Error]', '无法找到对应地图文件。')
                      callback('查询到当前宝图位置：' + map_lst[most_similarity].pos.z + ' (' + map_lst[most_similarity].pos.x + ', ' + map_lst[most_similarity].pos.y + ')\n' +
                        'https://map.wakingsands.com/#f=mark&x=' + map_lst[most_similarity].pos.x + '&y=' + map_lst[most_similarity].pos.y + '&id=' + map_lst[most_similarity].pos.id)
                    }
                  // } else {
                  //   callback('查询到当前宝图位置：' + map_lst[most_similarity].pos.z + ' (' + map_lst[most_similarity].pos.x + ', ' + map_lst[most_similarity].pos.y + ')\n' +
                  //     'https://map.wakingsands.com/#f=mark&x=' + map_lst[most_similarity].pos.x + '&y=' + map_lst[most_similarity].pos.y + '&id=' + map_lst[most_similarity].pos.id)
                  // }
                }
              })
            }
          }
        })
      } else {
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      }
    })
  }
}

function getImageName (image: any) {
  if (image.match(/file=(.+?),/))
    return image.match(/file=(.+?),/)[1]
  else
    return null
}

function getImageUrl (image: any) {
  if (image.match(/url=(.+?)]/))
    return image.match(/url=(.+?)]/)[1]
  else
    return null
}