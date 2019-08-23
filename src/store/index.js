import Vue from 'vue'
import Vuex from 'vuex'
import { getUser, saveUser } from '@/utils/user'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: getUser()
  },
  mutations: {
    setUser (state, user) {
      state.user = user
      // 将数据放到本地存储的目的是为了保持刷新保存数据状态
      saveUser(state.user)
    }
  },
  actions: {

  }
})
