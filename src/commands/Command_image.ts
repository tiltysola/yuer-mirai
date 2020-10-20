import request from 'request'
import path from 'path'
import fs from 'fs'
import GM from 'gm'
import Image from '../models/image'
import ImageRefer from '../models/image_refer'

import {send_private_msg, send_group_msg} from './CQReply'

export const Image_Private = function (ws: any, user_id: any, arg1: any, arg2: any, arg3: any) {
  console.log('[Debug]', 'Receive command: Image, User_ID:', user_id, ': Arg1:2:3:', arg1, arg2, arg3)
  image(arg1, arg2, arg3, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Image_Group = function (ws: any, group_id: any, arg1: any, arg2: any, arg3: any) {
  console.log('[Debug]', 'Receive command: Image, Group_ID:', group_id, ': Arg1:2:3:', arg1, arg2, arg3)
  image(arg1, arg2, arg3, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function image (arg1: any, arg2: any, arg3: any, callback: any) {
  if (!arg1) {
    callback('月儿传图：\n获取随机图片：!image <图库名称>\n上传图片到图库：!image upload <图库名称> <图片>\n给图库添加一个别名：!image refer <图库名称> <参照昵称>')
    return
  }
  if (arg1 === 'upload') {
    if (!arg2 || !arg3) {
      callback('月儿传图：\n获取随机图片：!image <图库名称>\n上传图片到图库：!image upload <图库名称> <图片>\n给图库添加一个别名：!image refer <图库名称> <参照昵称>')
      return
    }
    arg2 = arg2.toLowerCase().replace(/"/g, '')
    if (arg2.length < 1 || arg2.length > 16) {
      callback('图库名称长度规则为1-16字符。')
      return
    }
    if (!getImageUrl(arg3)) {
      callback('提交的图片不是有效的格式。')
      return
    }
    request({
      url: getImageUrl(arg3),
      encoding: null,
      method: 'get'
    }, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let cache = fs.existsSync(path.resolve(__dirname, '../cache'))
        if (!cache)
          fs.mkdirSync(path.resolve(__dirname, '../cache'))
        let upload_file = path.resolve(__dirname, '../cache', getImageName(arg3))
        GM(body).write(upload_file, (err) => {
          if (err) {
            console.log('[Error]', err)
            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          } else {
            let form_data = {
              smfile: fs.createReadStream(upload_file)
            }
            request({
              url: 'https://sm.ms/api/v2/upload',
              method: 'post',
              json: true,
              headers: {
                // Accept: '*/*',
                Origin: 'https://sm.ms',
                'User-Agent': 'Yuer-Bot: v1.0',
                // 'Content-Type': 'multipart/form-data',
                Authorization: 'basic n1llPovjA6jDZY4XAwyMd9Ocq1Ty3pyt'
              },
              formData: form_data
            }, (err, res, body) => {
              // console.log(res)
              if (!err && res.statusCode == 200) {
                if (body.success || body.code === 'image_repeated') {
                  let img_source: any
                  if (body.success) {
                    img_source = body.data.url
                  } else {
                    img_source = body.images
                  }
                  Image.find({ image_name: getImageName(arg3) }, (err, res) => {
                    if (err) {
                      console.log('[Error]', err)
                      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                    } else if (res && res.length > 0) {
                      callback('很抱歉，图库中已经存在这张图片了。')
                    } else {
                      refer2name(arg2, (err: any, res: any) => {
                        if (err) {
                          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                        } else {
                          Image.create({
                            image_name: getImageName(arg3),
                            category: res,
                            link: img_source
                          }).then(() => {
                            callback('图片 ' + getImageName(arg3) + ' 上传至分类 ' + res + ' 成功！')
                          }).catch((err) => {
                            console.log('[Error]', err)
                            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                          })
                        }
                      })
                    }
                  })
                } else {
                  callback('图库那边返回了一个错误：' + body.message + '。')
                }
              } else {
                console.log('[Error]', err)
                callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
              }
            })
          }
        })
      } else {
        console.log('[Error]', err)
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      }
    })
  } else if (arg1 === 'refer') {
    if (!arg2 || !arg3) {
      callback('月儿传图：\n获取随机图片：!image <图库名称>\n上传图片到图库：!image upload <图库名称> <图片>\n给图库添加一个别名：!image refer <图库名称> <参照昵称>')
      return
    }
    arg2 = arg2.toLowerCase().replace(/"/g, '')
    arg3 = arg3.toLowerCase().replace(/"/g, '')
    if (arg2.length < 1 || arg2.length > 16 || arg3.length < 1 || arg3.length > 16) {
      callback('图库名称和参照昵称长度规则为1-16字符。')
      return
    }
    Image.find({ category: arg2 }, (err, res: any) => {
      if (err) {
        console.log('[Error]', err)
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      } else if (!res || res.length === 0) {
        callback('没有找到 ' + arg2 + ' 这个分类！')
      } else {
        Image.find({ category: arg3 }, (err, res: any) => {
          if (err) {
            console.log('[Error]', err)
            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          } else if (!res || res.length === 0) {
            ImageRefer.find((err, res: any) => {
              if (err) {
                console.log('[Error]', err)
                callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
              } else {
                let found = false
                for (let i = 0; i < res.length; i++) {
                  for (let j = 0; j < res[i].refer.length; j++) {
                    if (res[i].refer[j] === arg3) {
                      found = true
                    }
                  }
                }
                if (found) {
                  callback(arg3 + ' 这个参照已经存在了，无法设置参照了。')
                } else {
                  ImageRefer.findOne({ category: arg2 }, (err, res: any) => {
                    if (err) {
                      console.log('[Error]', err)
                      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                    } else if (res) {
                      res.refer.push(arg3)
                      ImageRefer.updateOne({ category: arg2 }, { refer: res.refer}, (err) => {
                        if (err) {
                          console.log('[Error]', err)
                          callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                        } else {
                          callback('成功给 ' + arg2 + ' 分类设置了参照：' + arg3 + '。')
                        }
                      })
                    } else {
                      ImageRefer.create({
                        category: arg2,
                        refer: [arg3]
                      }).then(() => {
                        callback('成功给 ' + arg2 + ' 分类设置了参照：' + arg3 + '。')
                      }).catch((err) => {
                        console.log('[Error]', err)
                        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
                      })
                    }
                  })
                }
              }
            })
          } else {
            callback(arg3 + ' 这个分类已经存在了，无法设置参照了。')
          }
        })
      }
    })
  } else {
    arg1 = arg1.toLowerCase().replace(/"/g, '')
    refer2name(arg1, (err: any, name: any) => {
      if (err) {
        callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
      } else {
        Image.find({ category: name }, (err, res: any) => {
          if (err) {
            console.log('[Error]', err)
            callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
          } else if (!res || res.length === 0) {
            callback('没有找到 ' + name + ' 这个分类！')
          } else {
            let num = Math.floor(Math.random() * res.length)
            callback('[CQ:image, file=' + res[num].link + ']')
          }
        })
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

function refer2name (refer: any, callback: any) {
  ImageRefer.find((err, res: any) => {
    if (err) {
      console.log('[Error]', err)
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    } else {
      let found = false
      for (let i = 0; i < res.length; i++) {
        if (res[i].refer.includes(refer)) {
          callback(null, res[i].category)
          found = true
          break
        }
      }
      if (!found) {
        callback(null, refer)
      }
    }
  })
}