import express from 'express'
import request from 'request'
import YAML from 'yaml'
import Bot from '../models/bot'
import Image from '../models/image'

import config from '../configs/config'
import alias from '../configs/alias'

const router = express.Router()

// Main page
router.get('/', (req, res) => {
  res.render('index')
})

// Help page
router.get('/help', (req, res) => {
  res.render('help')
})


// Gallery page
router.get('/gallery', (req, res) => {
  res.render('gallery')
})

// Gallery List
router.post('/gallery_list', (req, res) => {
  Image.find((err, images) => {
    if (err) {
      console.log('[Error]', err)
      images = []
    }
    res.send(JSON.stringify({
      images,
      count: images.length
    }))
  })
})

// MC page
router.get('/mc', (req, res) => {
  res.render('mc')
})

// MC users list
router.post('/mc_users_list', (req, res) => {
  const url = 'http://ddns.acgme.cn:3000/search'
  request({
    url,
    method: 'get',
    json: true
  }, (err, r, body) => {
    if (!err && r.statusCode == 200 && body.code == 0) {
      res.send(JSON.stringify({
        code: 0,
        data: body.data,
        count: body.data.length
      }))
    } else {
      res.send(JSON.stringify({
        code: -1
      }))
    }
  })
})

// MC user detail
router.post('/mc_user_detail', (req, res) => {
  const user = req.body.user ? req.body.user.split(':') : null
  const url = 'http://ddns.acgme.cn:3000?user=' + encodeURIComponent(user)
  request({
    url,
    method: 'get',
    json: true
  }, (err, r, body) => {
    if (!err && r.statusCode == 200 && body.code == 0) {
      res.send(JSON.stringify({
        code: 0,
        data: body.data
      }))
    } else {
      res.send(JSON.stringify({
        code: -1
      }))
    }
  })
})

// Adopt a bot
router.post('/adopt', (req, res) => {
  let user_id = parseInt(req.body.user_id)
  let token = req.body.token
  let use_private = req.body.use_private || true
  let use_group = req.body.use_group || true
  if (!user_id || isNaN(user_id) || (isNaN(user_id) && user_id === 0)) {
    res.send(JSON.stringify({
      code: 1,
      msg: '月華用QQ号类型有误，请再次检查'
    }))
  } else if (user_id < 10000 || user_id > 9999999999) {
    res.send(JSON.stringify({
      code: 2,
      msg: '您输入的月華用QQ号有误，请确定在[10000, 9999999999]范围内'
    }))
  } else if (!token || token.length < 6 || token.length > 32) {
    res.send(JSON.stringify({
      code: 3,
      msg: '您输入的令牌长度有误，请确定长度在[6, 32]范围内'
    }))
  } else {
    Bot.findOne({ user_id }, (err, doc) => {
      if (err) {
        res.send(JSON.stringify({
          code: -1,
          msg: err
        }))
      } else {
        if (doc) {
          res.send(JSON.stringify({
            code: 4,
            msg: '您已经领养过了'
          }))
        } else {
          Bot.create({
            user_id, token, use_private, use_group
          }).then(() => {
            res.send(JSON.stringify({
              code: 0
            }))
          }).catch((err) => {
            res.send(JSON.stringify({
              code: -1,
              msg: err
            }))
          })
        }
      }
    })
  }

  // if (req.body.user_id.length >= 5) {
    // Bot.findOne({ user_id: req.body.user_id }, (err, doc) => {
    //   if (doc)
    //     res.send(JSON.stringify({
    //       code: 1,
    //       msg: '领养失败，您已经领养过了'
    //     }))
    //   else {
    //     if (req.body.use_private === 'on')
    //       req.body.use_private = true
    //     else
    //       req.body.use_private = false
    //     if (req.body.use_group === 'on')
    //       req.body.use_group = true
    //     else
    //       req.body.use_group = false
    //     Bot.create({
    //       user_id: req.body.user_id,
    //       token: req.body.token,
    //       use_private: req.body.use_private,
    //       use_group: req.body.use_group
    //     })
    //     res.send(JSON.stringify({
    //       code: 0,
    //       msg: '领养成功'
    //     }))
    //   }
    // })
  // } else {
  //   res.send(JSON.stringify({
  //     code: 2,
  //     msg: '请确认您月華用QQ号输入正确！'
  //   }))
  // }
})

// Get adopt list
router.post('/adopt_list', (req, res) => {
  Bot.find((err, bots) => {
    if (err) {
      console.log('[Error]', err)
      bots = []
    }
    res.send(JSON.stringify({
      bots,
      count: bots.length
    }))
  })
})

// Get Yuer Setting
router.post('/fetch_config', (req, res) => {
  let user_id = parseInt(req.body.user_id)
  let token = req.body.token
  if (!user_id || isNaN(user_id) || (isNaN(user_id) && user_id === 0) || user_id < 10000 || user_id > 9999999999) {
    res.send(JSON.stringify({
      code: 1,
      msg: '无法获取到月華的QQ号，请刷新页面重新尝试'
    }))
  } else if (!token || token.length < 6 || token.length > 32) {
    res.send(JSON.stringify({
      code: 2,
      msg: '您输入的令牌长度有误，请确定长度在[6, 32]范围内'
    }))
  } else {
    Bot.findOne({
      user_id, token
    }, (err, doc) => {
      if (err) {
        res.send(JSON.stringify({
          code: -1,
          msg: err
        }))
      } else {
        if (!doc) {
          res.send(JSON.stringify({
            code: 3,
            msg: '您指定的月華不存在或者令牌错误'
          }))
        } else {
          res.send(JSON.stringify({
            code: 0,
            config: doc
          }))
        }
      }
    })
  }
})

router.post('/edit_config', (req, res) => {
  let user_id = parseInt(req.body.user_id)
  let token = req.body.token
  let use_private = req.body.use_private || true
  let use_group = req.body.use_group || true
  let allow_groups = req.body.allow_groups.replace(/ /g, '').split(',') || []
  let ban_groups = req.body.ban_groups.replace(/ /g, '').split(',') || []
  let use_tata = req.body.use_tata || true
  let tata_url = req.body.tata_url || ''
  let tata_access = req.body.tata_access || ''
  if (!user_id || isNaN(user_id) || (isNaN(user_id) && user_id === 0)) {
    res.send(JSON.stringify({
      code: 1,
      msg: '月華用QQ号类型有误，请再次检查'
    }))
  } else if (user_id < 10000 || user_id > 9999999999) {
    res.send(JSON.stringify({
      code: 2,
      msg: '您输入的月華用QQ号有误，请确定在[10000, 9999999999]范围内'
    }))
  } else if (!token || token.length < 6 || token.length > 32) {
    res.send(JSON.stringify({
      code: 3,
      msg: '您输入的令牌长度有误，请确定长度在[6, 32]范围内'
    }))
  } else if (!token || token.length < 6 || token.length > 32) {
    res.send(JSON.stringify({
      code: 3,
      msg: '您输入的令牌长度有误，请确定长度在[6, 32]范围内'
    }))
  } else {
    Bot.findOne({
      user_id, token
    }, (err, doc) => {
      if (err) {
        res.send(JSON.stringify({
          code: -1,
          msg: err
        }))
      } else {
        if (!doc) {
          res.send(JSON.stringify({
            code: 4,
            msg: '您指定的月華不存在或者令牌错误'
          }))
        } else {
          Bot.updateOne({ user_id, token }, {
            use_private, use_group, allow_groups, ban_groups, use_tata, tata_url, tata_access
          }, (err) => {
            if (err) {
              res.send(JSON.stringify({
                code: 5,
                msg: '月華这边出现了一点错误，请重新尝试'
              }))
            } else {
              res.send(JSON.stringify({
                code: 0
              }))
            }
          })
        }
      }
    })
  }
})

// Request config
router.post('/download_config', (req, res) => {
  let user_id = parseInt(req.body.user_id)
  let token = req.body.token
  if (!user_id || isNaN(user_id) || (isNaN(user_id) && user_id === 0) || user_id < 10000 || user_id > 9999999999) {
    res.send(JSON.stringify({
      code: 1,
      msg: '无法获取到月華的QQ号，请刷新页面重新尝试'
    }))
  } else if (!token || token.length < 6 || token.length > 32) {
    res.send(JSON.stringify({
      code: 2,
      msg: '您输入的令牌长度有误，请确定长度在[6, 32]范围内'
    }))
  } else {
    Bot.findOne({
      user_id, token
    }, (err, doc) => {
      if (err) {
        res.send(JSON.stringify({
          code: -1,
          msg: err
        }))
      } else {
        if (!doc) {
          res.send(JSON.stringify({
            code: 3,
            msg: '您指定的月華不存在或者令牌错误'
          }))
        } else {
          const cfg: any = {
            debug: false,
            [user_id]: {
              cacheImage: false,
              cacheRecord: false,
              heartbeat: {
                enable: true,
                interval: 15000
              },
              ws_reverse: [{
                enable: true,
                postMessageFormat: 'string',
                reverseHost: config.host,
                reversePort: config.ws_port,
                accessToken: token,
                reversePath: '/',
                reverseApiPath: '/',
                reverseEventPath: '/',
                useUniversal: true,
                useTLS: false,
                reconnectInterval: 3000
              }]
            }
          }
          res.send(JSON.stringify({
            code: 0,
            config: String(new YAML.Document(cfg))
          }))
        }
      }
    })
  }
})

// Request Help
router.get('/help_info', (req, res) => {
  res.send(JSON.stringify({
    data:
    '<li>★ 物品查询：!search <物品名称>, 别名：' + alias.search.join(', ') + '</li>' +
    '<li>★ 本周暖暖：!nuannuan, 别名：' + alias.nuannuan.join(', ') + '</li>' +
    '<li>★ 玄学选门：!gate, 三个门使用：!gate3, 别名：' + alias.gate.join(', ') + '</li>' +
    '<li>★ 挖宝查询：!treasure <藏宝图截图>, 别名：' + alias.treasure.join(', ') + '</li>' +
    '<li>★ 贪欲陷阱：!trap <数值|1-9>, 别名：' + alias.trap.join(', ') + '</li>' +
    '<li>★ 投掷子：!dice {数值|n>0|可空}, 别名：' + alias.dice.join(', ') + '</li>' +
    '<li>★ 好涩哦~：!hso {标签|可空}[Eg: miqo\'te, au_ra], 别名：' + alias.hso.join(', ') + '</li>' +
    '<li>★ 月儿传图：请输入 !image 查看具体使用说明, 别名：' + alias.image.join(', ') + '</li>' +
    '<li>★ 查看天气：!weather <地图名|中文>, 别名：' + alias.weather.join(', ') + '</li>' +
    '<li>★ 浅草寺求签：!luck, 别名：' + alias.luck.join(', ') + '</li>' +
    '<li>★ DPS统计：请输入 !dps 查看具体使用说明, 别名：' + alias.dps.join(', ') + '</li>' +
    '<li>★ 宏书查询：!macro <宏书ID> <第几条宏>, 别名：' + alias.macro.join(', ') + '</li>' +
    '<li>★ 副属性计算：!fsx <暴击|直击|等> <数值>, 别名：' + alias.fsx.join(', ') + '</li>' +
    '<li>★ 青魔法书：!blue <技能ID|技能名称|ALL>, 别名：' + alias.blue.join(', ') + '</li>' +
    '<li>★ 图片鉴黄：!porn <图片>, 别名：' + alias.porn.join(', ') + '</li>' +
    '<li>★ 辱骂识别：!abuse <文本>, 别名：' + alias.abuse.join(', ') + '</li>' +
    '<li>★ 华鸟风月：!mc <游戏昵称> {类型|info|have|inv|可空}</li>' +
    '<li>☆ 玩家搜索：!mc search <游戏昵称|模糊搜索></li>' +
    '<li>★ 指令符别名：[\'' + alias.symble.join('\' ,  \'') + '\']</li>'
  }))
})

module.exports = router