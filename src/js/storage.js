const storage = weex.requireModule('storage')

/**
 * 缓存set
 * @param key {string} 键
 * @param value {any} 值
 * @param [duration] {number} Storage有效时间，留空无限期，单位：ms
 * @returns promise
 */
const setStorage = (key, value, duration) => {
  return new Promise((resolve, reject) => {
    if (!key) {
      reject('key is empty !')
      return
    }
    const storageData = {
      value,
      duration: duration ? duration : null,
    }
    const json = JSON.stringify(storageData)
    try {
      storage.setItem(key, json, event => {
        if (event.result === 'success') {
          // event.data 为undefined, 故返回完整的event
          resolve(event)
        } else {
          reject(event)
        }
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

/**
 * 缓存get
 * @param key {string} 键
 * @returns promise
 */
const getStorage = key => {
  return new Promise((resolve, reject) => {
    if (!key) {
      reject('key is empty !')
      return
    }
    try {
      storage.getItem(key, event => {
        if (event.result === 'success') {
          const storageData = JSON.parse(event.data)
          if (storageData) {
            const { value, duration } = storageData
            // 在有效期内直接返回
            if (duration === null || duration >= Date.now()) {
              resolve(value)
              return
            }
          }
          removeStorage(key).then(() => {})
          reject(`key: "${key}" timeout`)
        } else {
          reject(`key: "${key}" not found`)
        }
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

const removeStorage = key => {
  return new Promise((resolve, reject) => {
    try {
      if (!key) {
        reject('key is empty !')
      } else {
        storage.removeItem(key, event => {
          event.result === 'success'
            ? resolve(event)
            : reject(`remove key: "${key}" failed`)
        })
      }
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}

const length = () => {
  return new Promise((resolve, reject) => {
    storage.length(event => {
      event.result === 'success'
        ? resolve(event.data)
        : reject('failed to get local storage length')
    })
  })
}

const getAllKeys = () => {
  return new Promise((resolve, reject) => {
    storage.getAllKeys(event => {
      let keyGroupStr = event.data.join(', ')
      event.result === 'success'
        ? resolve(`props:${keyGroupStr}`)
        : reject('get all keys failed')
    })
  })
}

export { setStorage, getStorage, removeStorage, length, getAllKeys }
