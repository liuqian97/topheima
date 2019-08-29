<template>
  <div class="homeIndex">
    <van-nav-bar fixed>
      <van-button
      color="#5babfb"
      size="small"
      slot="title"
      icon="search"
      round
      class="search-btn"
      type="primary">搜索</van-button>
    </van-nav-bar>
    <van-tabs v-model="activeChannelIndex">
      <div slot="nav-right" class="wap-nav">
        <van-icon name="wap-nav" size="24" @click="isChannelEditShow=true"></van-icon>
      </div>
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
              :key="article.art_id.toString()"
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
          :title="item.title"
          icon="location-o"
          v-for="item in reportType"
          :key="item.type"
          @click="onReportArticles(item.type)"
        />
      </van-cell-group>
    </van-dialog>
    <!-- 举报弹框 -->
    <!-- 编辑频道组件 -->
    <channel-edit
     v-model="isChannelEditShow"
     :my-channels="channels"
     :active-index="activeChannelIndex"
     @update-active="activeChannelIndex=$event"
     ></channel-edit>
    <!-- 编辑频道组件 -->
  </div>
</template>

<script>
import { getDefaultOrUserChannel } from '@/api/channel'
import { getArticles, reportArticle } from '@/api/articles'
import { addBlackLists } from '@/api/user'
import ChannelEdit from './components/channel-edit'
import { mapState } from 'vuex'

export default {
  name: 'HomeIndex',
  components: {
    ChannelEdit
  },
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
        { title: '其他问题', type: 0 },
        { title: '标题夸张', type: 1 },
        { title: '低俗色情', type: 2 },
        { title: '错别字多', type: 3 },
        { title: '旧闻重复', type: 4 },
        { title: '广告软文', type: 5 },
        { title: '内容不实', type: 6 },
        { title: '涉嫌违法犯罪', type: 7 },
        { title: '侵权', type: 8 }
      ],
      isChannelEditShow: false
    }
  },
  computed: {
    ...mapState(['user']),
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
      let channels = []
      if (this.user) {
        const { data } = await getDefaultOrUserChannel()
        channels = data.data.channels
      } else {
        const localChannels = JSON.parse(window.localStorage.getItem('channels'))
        if (localChannels) {
          channels = localChannels
        } else {
          const { data } = await getDefaultOrUserChannel()
          channels = data.data.channels
        }
      }

      this.channels = channels
    },
    async onLoad () {
      const { currentChannel } = this
      const { data } = await getArticles({
        channelId: currentChannel.id,
        timestamp: currentChannel.timestamp || Date.now(),
        withTop: 1
      })
      const { results, pre_timestamp: preTimestamp } = data.data
      // 将获取到的文章列表添加到当前频道中
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
        await reportArticle({
          articleId: this.article.art_id.toString(),
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
.wap-nav {
  position:sticky;
  right: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  opacity: 0.8;
}
.search-btn {
  width: 100px;
}
</style>
