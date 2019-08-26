<template>
  <div class="homeIndex">
    <van-nav-bar title="首页" fixed />
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
              style="font-size:16px"
            >
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
                <van-icon class="icon-close" name="close" @click="onClose(article)" />
              </div>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    <!-- 举报弹框 -->
    <van-dialog
      v-model="isReportShow"
      :show-cancel-button="false"
      :showConfirmButton="false"
      closeOnClickOverlay
    >
      <van-cell-group v-if="!isRubbishShow">
        <van-cell title="反馈垃圾内容" icon="fail" is-link @click="isRubbishShow=true" />
        <van-cell title="拉黑作者" icon="plus" @click="onAddBlackLists" />
      </van-cell-group>
      <!-- 点击垃圾内容,才显示下拉选项 -->
      <van-cell-group v-else>
        <van-cell icon="arrow-left" @click="isRubbishShow=false" />
        <!-- 循环反馈类型 -->
        <van-cell
          :title="item.label"
          icon="location-o"
          v-for="item in reportType"
          :key="item.value"
          @click="onReportArticles(item.value)"
        />
      </van-cell-group>
    </van-dialog>
  </div>
</template>

<script>
import { getDefaultOrUserChannel } from '@/api/channel'
import { getArticles, reportArticles } from '@/api/articles'
import { addBlackLists } from '@/api/user'

export default {
  name: 'HomeIndex',
  data () {
    return {
      activeChannelIndex: 0,
      // 存储获取到到频道列表
      channels: [],
      // 举报弹框是否显示
      isReportShow: false,
      // 控制返回垃圾的显示
      isRubbishShow: false,
      currentArticles: null,
      // 举报文章类型
      reportType: [
        { label: '其他问题', value: 0 },
        { label: '标题夸张', value: 1 },
        { label: '低俗色情', value: 2 },
        { label: '错别字多', value: 3 },
        { label: '旧闻重复', value: 4 },
        { label: '广告软文', value: 5 },
        { label: '内容不实', value: 6 },
        { label: '涉嫌违法犯罪', value: 7 },
        { label: '侵权', value: 8 }

      ]
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
    },
    onClose (articles) {
      this.isReportShow = true
      this.currentArticles = articles
    },
    async onAddBlackLists () {
      const authId = this.currentArticles.aut_id
      await addBlackLists(authId)
      // 将拉黑的作者的文章从客服端移除
      this.channels.forEach(channel => {
        const articles = channel.articles
        for (let i = 0; i < articles.length; i++) {
          const article = articles[i]
          if (article.aut_id === authId) {
            articles.splice(i, 1)
            i--
          }
        }
      })
      this.isReportShow = false // 关闭弹窗
      this.$toast('拉黑成功,将减少此类内容推送')
    },
    async onReportArticles (type) {
      try { 
        await reportArticles({
          articleId: this.currentArticles.art_id.toString(),
 	        type
        })
        this.$toast('举报成功')
      } catch (err) {
        console.log(err)
        this.$toast('已经举报过了')
      }
      // 关闭弹窗
      this.isReportShow = false
    }
  }
}
</script>

<style scoped lang="less">
.article-item-label {
  display: inline-block;
  span {
    margin-right: 10px;
  }
}
.icon-close {
  display: inline-block;
  position: fixed;
  right: 10px;
}
</style>
