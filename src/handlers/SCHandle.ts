import {Test} from '../schedules/Schedule_test'

export const SCHandle = (user_id: any, ws: any) => {
  console.log('[Debug]', 'Schedule handle initialed:', user_id)
  Test(user_id, ws)
}