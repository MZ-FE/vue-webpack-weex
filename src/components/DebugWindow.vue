<template>
  <div
    class="wrapper"
    v-if="isShowDebug"
    ref="wrapperRef"
    eventPenetrationEnabled="true"
  >
    <!-- 调试信息 -->
    <scroller
      class="scroller"
      :style="{ height: `${height}px` }"
      v-if="!folded"
    >
      <div
        v-for="(item, index) in historyInfo"
        :key="item.timeStr || `log-${index}`"
        :ref="`log-${index}`"
        class="wrapper-text"
      >
        <text v-if="item.timeStr" class="text-title"
          >&lt;{{ item.timeStr }}&gt;</text
        >
        <!-- 高亮显示最新一条日志输出 -->
        <text
          :class="[
            index === historyInfo.length - 1
              ? 'text-debug'
              : 'text-debug-history',
          ]"
          >{{ item.data ? JSON.stringify(item.data) : item }}</text
        >
      </div>

      <div class="placeholder"></div>
    </scroller>
    <text class="text-pause" v-if="pause">暂停输出</text>
    <text
      class="text-reset"
      @click="reset"
      @longpress="pause = !pause"
      v-if="!folded"
      >清/停</text
    >
    <text class="text-btn" @panstart="handleStart" @click="foldBtnClick">{{
      btnText
    }}</text>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import BindingX from 'weex-bindingx'
import { delay } from '@/util'

const domModule = weex.requireModule('dom')

export default {
  props: {
    height: {
      type: Number,
      default: 450,
    },
  },
  data() {
    return {
      show: false,
      isSitEnv: weex.config.env.appEnv === 'sit',
      folded: false,
      pause: false,
      historyInfo: [
        '> 单击红球清除日志\n> 长按红球暂停或恢复日志\n> 单击灰球收起或展开输出框\n> 拖拽灰球变更日志浮层位置',
      ],
      offsetY: 0,
      bindTokenObj: {
        token: '',
      },
    }
  },
  computed: {
    ...mapState(['isSitEnv']),
    isShowDebug() {
      return this.isSitEnv && this.show
    },
    btnText() {
      return this.folded ? 'LOG' : '收/拖'
    },
  },
  methods: {
    async scrollToBottom() {
      await delay(500)
      const el = this.$refs[`log-${this.historyInfo.length - 1}`]
      if (el) {
        domModule.scrollToElement(el[0])
      }
    },
    foldBtnClick() {
      this.folded = !this.folded
      if (!this.folded) {
        this.scrollToBottom()
      }
    },
    reset() {
      this.historyInfo.splice(0, this.historyInfo.length)
    },
    handleStart({ currentTarget }) {
      this.bindTokenObj = BindingX.bind(
        {
          anchor: currentTarget.ref,
          eventType: 'pan',
          props: [
            {
              element: this.$refs.wrapperRef.ref,
              property: 'transform.translateY',
              expression: `${this.offsetY}+y`,
            },
          ],
        },
        ({ state, deltaY }) => {
          if (state === 'end') {
            this.offsetY += deltaY
          }
        }
      )
    },
  },
  async created() {
    try {
      const result = await this.$storage.getStorage('showDebug')

      if (result !== '' && result !== undefined) {
        this.show = JSON.parse(result)
      }
    } catch (error) {
      console.log(error)
    }

    this.$bus.$on('log', data => {
      if (!this.isShowDebug || this.pause) {
        return
      }
      const timeStr = dayjs().format('HH:mm:ss')
      this.historyInfo.push({ timeStr, data })

      this.scrollToBottom()
    })
  },
}
</script>

<style scoped>
.wrapper {
  position: absolute;
  top: 50px;
  bottom: 0;
  width: 750px;
}

.scroller {
  position: absolute;
  top: 90px;
  width: 750px;
  background-color: rgba(0, 0, 0, 0.7);
}

.text-debug-history,
.text-debug,
.text-title {
  color: #eee;
  font-size: 20px;
  word-wrap: break-word;
  word-break: break-all;
}

.text-debug {
  color: #fc6;
}

.text-title {
  color: #f00;
}

.text-btn,
.text-reset {
  position: absolute;
  top: 0;
  right: 100px;
  width: 80px;
  height: 80px;
  color: #fff;
  font-size: 24px;
  line-height: 80px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 40px;
}

.text-reset {
  right: 190px;
  background-color: rgba(128, 0, 0, 0.7);
}

.text-pause {
  position: absolute;
  top: 90px;
  right: 0;
  width: 100px;
  color: #fff;
  font-size: 20px;
  line-height: 32px;
  text-align: center;
  background-color: #c00;
}

.placeholder {
  height: 100px;
}
</style>
