<template>
  <div>
    <router-view></router-view>
    <van-tabbar>
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="comment-o">问答</van-tabbar-item>
      <van-tabbar-item icon="fire-o">视频</van-tabbar-item>
      <van-tabbar-item icon="friends-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'TabbarIndex'
}
</script>

<style lang="less" scoped>
</style>
