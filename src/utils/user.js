const USER_KEY = 'user'

export const getUser = () => JSON.parse(window.localStorage.getItem(USER_KEY))

export const saveUser = data => {
  // 将数据放到本地存储的目的是为了保持刷新保存数据状态
  window.localStorage.setItem('user', JSON.stringify(data))
}

export const deletUser = () => {
  window.localStorage.removeItem(USER_KEY)
}
