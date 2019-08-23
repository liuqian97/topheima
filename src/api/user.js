// 用户相关接口封装模块
import request from '@/utils/request'

// 用户登录
export const login = ({ mobile, code }) => {
  return request({
    method: 'POST',
    url: '/app/v1_0/authorizations',
    data: {
      mobile,
      code
    }
  })
}
