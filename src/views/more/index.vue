<template>
  <div @viewappear="viewappear" @viewdisappear="viewdisappear">
    <scroller class="wrapper" show-scrollbar="false">
      <div ref="body">
        <div style="height: 16px; background-color: #f9f9f9"></div>
      </div>
    </scroller>
  </div>
</template>

<script>
import base from '../../mixins/pageBase'
import superMoreUtil from '../../util/superMoreUtil'

export default {
  mixins: [base],
  data() {
    return {
      isKnowNewVersion: false,
    }
  },
  computed: {},
  methods: {},
  async mounted() {
    superMoreUtil.adjustStyle(this.$refs.body)
  },
  created() {},
}
</script>

<style scoped></style>
