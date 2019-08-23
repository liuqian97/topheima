<template>
  <div class="loginIndex">
    <van-nav-bar title="登录" />
    <van-cell-group>
      <van-field
        v-model="user.mobile"
        clearable
        left-icon="phone-o"
        placeholder="请输入手机号"
        v-validate="'required'"
        name="mobile"
        :error-message="errors.first('mobile')"
      />
      <van-field
        v-model="user.code"
        type="password"
        left-icon="comment-o"
        placeholder="请输入验证码"
        v-validate="'required'"
        name="code"
        :error-message="errors.first('code')"
      />
    </van-cell-group>
    <div class="login-btn">
      <van-button type="info" :loading="isLoginLoading" @click="onLogin">登录</van-button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
import { mapMutations } from 'vuex'

export default {
  name: 'loginIndex',
  data () {
    return {
      // 动态绑定表单数据
      user: {
        mobile: '13911111111',
        code: '246810'
      },
      isLoginLoading: false
    }
  },
  methods: {
    ...mapMutations(['setUser']),
    // 用户登录验证函数
    async onLogin () {
      try {
        const isValid = await this.$validator.validate()
        if (!isValid) {
          return
        }
        this.isLoginLoading = true
        const { data } = await login(this.user)
        // 登录成功后,存储本地token
        this.setUser(data.data)

        // 验证成功,调整首页
        this.$router.push({ name: 'home' })
      } catch (err) {
        if (err.response && err.response.status === 400) {
          this.$toast.fail('手机号或验证码错误')
        }
      }
      // 不论登录成功还是失败,都没事loading
      this.isLoginLoading = false
    },
    customValidatorMessages () {
      this.$validator.localize('zh_CN', {
        custom: {
          mobile: {
            required: '手机号不能为空'
          },
          code: {
            required: '邮箱不能为空'
          }
        }
      })
    }
  },
  created () {
    // 自定义配置表单验证提示消息
    this.customValidatorMessages()
  }
}
</script>

<style scoped lang='less'>
.login-btn {
  padding: 20px;
  .van-button {
    width: 100%;
    border-radius: 5px;
  }
}
</style>
