export default {
  t(target) {
    try {
      if (!this.i18nData) {
        this.$toast(`i18nData is undefined:${target}`)
        throw Error(`i18nData is undefined:${target}`)
      }
      let target_arr = target.split('.')
      if (target_arr.length === 1) {
        return this.i18nData[this.locale][target] || ''
      } else if (target_arr.length === 2) {
        return this.i18nData[this.locale][target_arr[0]].hasOwnProperty(
          target_arr[1]
        )
          ? this.i18nData[this.locale][target_arr[0]][target_arr[1]]
          : 'null'
      } else {
        this.$toast(`the formate of param incorrect:${target}`)
        throw Error(`the formate of param incorrect:${target}`)
      }
    } catch (error) {
      this.$toast(error)
      return ' '
    }
  },
}
