// 频道相关接口请求模块
import request from '@/utils/request'

// 获取默认推荐 或者 用户的 频道列表
export const getDefaultOrUserChannel = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}

// 获取所有频道列表
export const getAllChannels = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/channels'
  })
}

// 删除指定用户频道
export const deleteUserChannel = channelId => {
  return request({
    method: 'DELETE',
    url: `/app/v1_0/user/channels/${channelId}`
  })
}

// 添加用户频道
export const addUserChannel = (channelId, seq) => {
  return request({
    method: 'POST',
    url: `/app/v1_0/user/channels`,
    data: {
      channels: [{
        id: channelId,
        seq
      }
      ]
    }
  })
}
