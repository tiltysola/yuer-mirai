import request from 'request'
import cheerio from 'cheerio'

import {send_private_msg, send_group_msg} from './CQReply'

export const Search_Private = function (ws: any, user_id: any, item_name: any) {
  console.log('[Debug]', 'Receive command: Search, User_ID:', user_id, ': Item_Name:', item_name)
  item_search(item_name, (res: any) => {
    send_private_msg(ws, user_id, res)
  })
}

export const Search_Group = function (ws: any, group_id: any, item_name: any) {
  console.log('[Debug]', 'Receive command: Search, Group_ID:', group_id, ': Item_Name:', item_name)
  item_search(item_name, (res: any) => {
    send_group_msg(ws, group_id, res)
  })
}

function item_search (item_name: any, callback: any) {
  if (!item_name) {
    callback('物品查询：!search <物品名称>')
    return
  }
  request({
    url: 'https://cdn.huijiwiki.com/ff14/api.php?format=json&action=parse&title=ItemSearch&text={{ItemSearch|name=' + encodeURIComponent(item_name) + '}}',
    method: 'get',
    json: true,
    headers: {
      Referer: 'https://ff14.huijiwiki.com/wiki/ItemSearch?name=' + encodeURIComponent(item_name)
    }
  }, (err, res, body) => {
    if (!err && res.statusCode == 200) {
      let $ = cheerio.load(body.parse.text['*'])
      let item_num = decodeUnicode($('div.mw-parser-output>p').html())
      let item_lst = $('div.ff14-item-list--item')
      let ouput_buffer = item_name + ' 的搜索结果\n' + item_num
      item_lst.each((key, value) => {
        if (key >= 10) return
        let html = $(value)
        let item = {
          item_name: decodeUnicode($(html.find('div.item-name.rarity-common>a')).html()),
          item_img: $(html.find('div.item-icon--img>a')).attr('href'),
          item_category: decodeUnicode($(html.find('div.item-category')).html())
        }
        if (item.item_name)
          ouput_buffer += ('\n' + key + '. ' + item.item_name + ' ' + 'https://ff14.huijiwiki.com/wiki/' + encodeURIComponent('物品:' + item.item_name))
      })
      callback(ouput_buffer)
    } else {
      callback('很抱歉，月儿出现了一点小问题，没能完成你的请求。')
    }
  })
}

function decodeUnicode (str: any) {
  if(str)
    str = str.replace(/&#x/g,'%u').replace(/;/g,'')
  else
    str = ''
  return unescape(str)
}