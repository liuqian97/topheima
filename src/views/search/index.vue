<template>
  <div>
    <!-- 搜索框 -->
    <form action="/">
      <van-search
        v-model="searchText"
        placeholder="请输入搜索关键词"
        show-action
        @search="onSearch"
        @cancel="onCancel"
      />
    </form>
    <van-cell-group>
      <van-cell
      icon="search"
      v-for="item in suggestion"
      :key="item">
      <div slot="title" v-html="lightHight(item)"></div>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script>
import { getSuggestion } from '@/api/search'
import { debounce } from 'lodash'
export default {
  name: 'seachIndex',
  data () {
    return {
      searchText: '',
      suggestion: []
    }
  },
  watch: {
    searchText: debounce(async function (newVal) {
      if (!newVal.trim().length) {
        return
      }
      const { data } = await getSuggestion(newVal)
      this.suggestion = data.data.options
    }, 500)
    // async searchText (newVal) {
    //   const { data } = await getSuggestion(newVal)
    //   this.suggestion = data.data.options
    // }
  },
  methods: {
    // 用户点击键盘上的 搜索/回车 按钮触发
    onSearch () {},
    // 点击搜索框右侧取消按钮时触发
    onCancel () {},
    lightHight (str) {
      const keyword = this.searchText
      console.log(keyword)
      return str.toLowerCase().split(keyword).join(`<span style="color: red;">${keyword}</span>`)
    }
  }
}
</script>

<style scope lang="less">
</style>
