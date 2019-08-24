// 文章相关请求模块
import request from '@/utils/request'

// 获取文章
export const getArticles = params => {
  const { channelId, timestamp, withTop } = params
  return request({
    method: 'GET',
    url: '/app/v1_1/articles',
    // query参数都在params中,body参数都在data中
    params: {
      channel_id: channelId,
      timestamp,
      with_top: withTop
    }
  })
}
