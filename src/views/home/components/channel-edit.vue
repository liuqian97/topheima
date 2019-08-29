<template>
  <div>
    <van-popup
      :value="value"
      @input="$emit('input', $event)"
      round
      position="bottom"
      :style="{ height: '94%' }"
    >
      <van-cell icon="cross" @click="$emit('input', false)" />
      <!-- 我的频道 -->
      <div class="channel">
        <div class="channel-header">
          <div>
            <span class="title">我的频道</span>
            <span class="desc">点击进入频道</span>
          </div>
          <div>
            <van-button
            type="danger"
            plain size="mini"
            style="border-radius:10px;color:#fff;background-color:red "
            @click="isEdit = !isEdit"
            >{{isEdit ? '完成':'编辑'}}</van-button>
          </div>
        </div>
        <van-grid class="channel-content" :gutter="10" clickable>
          <van-grid-item
           v-for="(channel,index ) in myChannels"
           :key="channel.id"
           @click="onMyChannelItemClick(index,channel.id)"
            >
            <span class="text" :class="{active:index===activeIndex}">{{channel.name}}</span>
            <van-icon
             class="close-icon"
             name="close"
             v-show="isEdit"></van-icon>
          </van-grid-item>
        </van-grid>
      </div>
      <!-- 频道推荐 -->
      <div class="channel">
        <div class="channel-header">
          <div>
            <span class="title">频道推荐</span>
            <span class="desc">点击添加频道</span>
          </div>
        </div>
        <van-grid class="channel-content" :gutter="10" clickable>
          <van-grid-item
            v-for="channel in  recommendChannels"
            :key="channel.id"
            :text="channel.name"
            @click="onAddChannel(channel)"
          >
            <div class="info">
              <span class="text">{{channel.name}}</span>
            </div>
          </van-grid-item>
        </van-grid>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { getAllChannels, deleteUserChannel, addUserChannel } from '@/api/channel'
import { mapState } from 'vuex'
export default {
  name: 'ChannelEdit',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    myChannels: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      allChannels: [],
      isEdit: false
    }
  },
  computed: {
    ...mapState(['user']),
    // 计算返回剩余的频道列表（不包含我的频道）
    recommendChannels () {
      const ids = this.myChannels.map(channel => channel.id)
      const ret = this.allChannels.filter(channel => {
        return !ids.includes(channel.id)
      })
      return ret
    }
  },
  created () {
    this.loadAllChannels()
  },
  methods: {
    async loadAllChannels () {
      const { data } = await getAllChannels()
      const channels = data.data.channels
      channels.forEach(channel => {
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
      this.allChannels = data.data.channels
    },
    async onAddChannel (channel) {
      this.myChannels.push(channel)
      if (this.user) {
      // 如果有token,请求保存到后端
        await addUserChannel(channel.id, this.myChannels.length)
      } else {
      // 如果没有token,保存在本地存储
        window.localStorage.setItem('channels', JSON.stringify(this.myChannels))
      }
    },
    async onMyChannelItemClick (channelIndex, channelId) {
      // 如果是编辑状态,则执行删除操作
      if (this.isEdit) {
        this.myChannels.splice(channelIndex, 1)
        if (this.user) {
          // 如果本地有token,请求保存到后端
          await deleteUserChannel(channelId)
        } else {
          // 没有token,保存在本地存储
          window.localStorage.setItem('channels', JSON.stringify(this.myChannels))
        }
      } else {
        // 非编辑状态,则状态切换频道操作
        this.$emit('update-active', channelIndex)
        // 关闭弹窗
        this.$emit('input', false)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.channel {
  .channel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    .title {
      font-size: 15px;
      margin-right: 5px;
    }
    .desc {
      font-size: 12px;
      color: #bbb;
    }
  }
  .channel-content {
    .text {
      font-size: 14px;
      width: 60px;
      height: 20px;
    }
    .active {
      color: red;
    }
    .close-icon {
      position: absolute;
      top: -5px;
      right: -5px;
      z-index: 9999;
      background-color: #fff;
    }
    .info {
      display: flex;
      align-items: center;
    }
  }
}
</style>
