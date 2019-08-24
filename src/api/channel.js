// 频道相关接口请求模块
import request from '@/utils/request'

// 获取默认推荐 或者 用户的 频道列表
export const getDefaultOrUserChannel = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}
