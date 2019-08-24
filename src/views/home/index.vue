<template>
  <div class="homeIndex">
    <van-nav-bar title="首页" />
    <van-tabs v-model="activeChannelIndex">
      <van-tab v-for="channel in channels" :title="channel.name" :key="channel.id" color="#3196fa">
        <van-pull-refresh v-model="channel.pullLoading" @refresh="onRefresh">
          <van-list
            v-model="channel.loading"
            :finished="channel.finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-cell
             v-for="article in channel.articles"
             :key="article.id"
             :title="article.title"
             style="font-size:16px">
              <div slot="label">
                <van-grid :border="false" :column-num="3">
                  <van-grid-item v-for="(img,index) in article.cover.images" :key="index">
                    <van-image :src="img" height="80" />
                  </van-grid-item>
                </van-grid>
              </div>
              <div slot="label">
                <div class="article-item-label">
                  <span>{{article.aut_name}}</span>
                  <span>{{article.collect_count}}评论</span>
                   <!-- 调用全局过滤器relativeTime -->
                  <span>{{article.pubdate | relativeTime }}</span>
                </div>
              </div>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { getDefaultOrUserChannel } from '@/api/channel'
import { getArticles } from '@/api/articles'

export default {
  name: 'HomeIndex',
  data () {
    return {
      activeChannelIndex: 0,
      // 存储获取到到频道列表
      channels: []
    }
  },
  computed: {
    // 获取当前激活的频道
    currentChannel () {
      return this.channels[this.activeChannelIndex]
    }
  },
  async created () {
    // 调用获取频道列表 的函数
    await this.loadChannels()
  },
  methods: {
    // 获取频道列表
    async loadChannels () {
      const { data } = await getDefaultOrUserChannel()
      data.data.channels.forEach(channel => {
        // 存储每个频道的文章列表
        channel.articles = []
        // 存储频道下拉刷新的loading状态
        channel.pullLoading = false
        // 存储频道是否加载完毕的状态
        channel.finished = false
        // 存储频道上拉加载刷新的loading状态
        channel.loading = false
        // 存储当前频道加载下一页数据的时间戳标志（页码）
        channel.timestamp = null
      })
      this.channels = data.data.channels
    },
    async onLoad () {
      const { currentChannel } = this
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })
      const { results, pre_timestamp: preTimestamp } = data.data
      // 将获取到的文章列表添加到当天频道中
      currentChannel.articles.push(...results)
      if (preTimestamp) {
        currentChannel.timestamp = preTimestamp
      } else {
        // 没有下一页数据,显示加载完毕
        currentChannel.finished = true
      }
      // 将本次加载的loading设为false
      currentChannel.loading = false
    },
    async onRefresh () {
      const { currentChannel } = this
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: Date.now(),
        withTop: 1
      })
      // 下拉刷新新,把获取到到最新到文章,加在数组到最上面
      currentChannel.articles.unshift(...data.data.results)
      // 数据加载完毕后,将下拉刷新到loading关闭
      currentChannel.pullLoading = false
      this.$toast('刷新成功')
    }
  }
}
</script>

<style scoped>
 .article-item-label span {
    margin-right: 10px;
 }
</style>
