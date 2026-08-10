// 心旅 AI — 动线数据（主线 + 备选）

const routes = {
  main: {
    city: 'jingdezhen',
    name: '主线动线 · 南山寻瓷',
    desc: '从老城出发，一路向南，深入三宝山谷。从千年窑火到手中泥土，从白日的瓷谷到夜晚的茶香——这是一条"从瓷到心"的深度旅程。',
    timeline: [
      {
        scene_id: 'yuyao_museum',
        order: 1,
        time_slot: '🌅 早晨',
        transit_from_prev: null,
        time_range: '8:30 - 10:30',
        note: '建议开馆就到，早晨人少、光线好'
      },
      {
        scene_id: 'local_restaurant',
        order: 2,
        time_slot: '🍽️ 中午',
        transit_from_prev: '🚗 约8分钟 · 向南三宝村方向',
        time_range: '11:30 - 13:30',
        note: '建议11:30前到，避开午高峰'
      },
      {
        scene_id: 'sanbao_craft',
        order: 3,
        time_slot: '🛠️ 下午',
        transit_from_prev: '🚗 约3分钟 · 三宝村内',
        time_range: '14:00 - 17:00',
        note: '需提前2小时预约，深度手作体验约需2-3小时'
      },
      {
        scene_id: 'sanbao_valley',
        order: 4,
        time_slot: '🌇 傍晚',
        transit_from_prev: '🚶 步行5分钟 · 三宝村内',
        time_range: '17:00 - 19:00',
        note: '傍晚光线最适合拍照，溪边步道散步'
      },
      {
        scene_id: 'sanbao_teahouse',
        order: 5,
        time_slot: '🌙 夜晚',
        transit_from_prev: '🚶 步行5分钟 · 同村',
        time_range: '19:30 - 21:30',
        note: '夜间茶室需提前预订座位'
      }
    ],
    geography: '老城（珠山区中心）→ 东郊 → 南部三宝村，一路向南不往返'
  },

  alternative: {
    city: 'jingdezhen',
    name: '备选动线 · 昌江暮色',
    desc: '从老城出发，体验市井风味后去东郊淘创意器物，傍晚在昌江边看落日，晚上回到陶溪川感受创客之夜——"人文烟火 × 江边温柔"。',
    timeline: [
      {
        scene_id: 'yuyao_museum',
        order: 1,
        time_slot: '🌅 早晨',
        transit_from_prev: null,
        time_range: '8:30 - 10:30',
        note: '老城文化核心，清晨人少'
      },
      {
        scene_id: 'old_street_food',
        order: 2,
        time_slot: '🍽️ 中午',
        transit_from_prev: '🚶 步行5分钟 · 老城内',
        time_range: '11:30 - 13:30',
        note: '抚州弄小吃街种类多，适合边走边吃'
      },
      {
        scene_id: 'taoxichuan',
        order: 3,
        time_slot: '🎨 下午',
        transit_from_prev: '🚗 约10分钟 · 往东到东郊',
        time_range: '14:00 - 17:00',
        note: '下午阳光穿过红砖厂房的光影很美'
      },
      {
        scene_id: 'changjiang_riverside',
        order: 4,
        time_slot: '🌇 傍晚',
        transit_from_prev: '🚗 约12分钟 · 往西到昌江边',
        time_range: '17:30 - 19:00',
        note: '日落时间约18:30，建议提前到达找好位置'
      },
      {
        scene_id: 'taoxichuan_night_market',
        order: 5,
        time_slot: '🌙 夜晚',
        transit_from_prev: '🚗 约15分钟 · 返回陶溪川',
        time_range: '19:30 - 21:30',
        note: '仅周五、周六有夜市，工作日有常规夜间展览'
      }
    ],
    geography: '老城 → 东郊陶溪川 → 向西到昌江 → 返回陶溪川，环形动线'
  }
};

module.exports = routes;
