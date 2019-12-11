import { debounce } from '../../util'

Page({
  data: {
    canSubscribe: false,
    status: null,
    isChangeing: false,
    showAuthDialog: false,
  },
  onLoad() {
    if (wx.requestSubscribeMessage) {
      this.setData({
        canSubscribe: true,
      })
    }
    this.getUserSucscribeStatus()
  },
  changeNotify: debounce(function () {
    const self = this
    const {
      status,
    } = this.data
    if (this.data.canSubscribe) {
      self.setData({
        isChangeing: true,
      })
      if (!status) {
        wx.requestSubscribeMessage({
          tmplIds: ['R4mTlFcEZ_vFihUU6dVddCnZPzF_-oal2ZZ-7Vu_U1U'],
          success(res) {
            if (res.errMsg === 'requestSubscribeMessage:ok') {
              // 如果订阅成功，则修改状态
              self.changeStatus('open')
            }
          },
          fail() {
            self.setData({
              showAuthDialog: true,
            })
            self.changeStatus('close')
          },
        })
      } else {
        self.changeStatus('close')
      }
    } else {
      wx.showToast({
        title: '你的微信版本过低不能订阅哦～',
        icon: 'none',
      })
    }
  }, 600, true),
  changeStatus(type) {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'post',
        type,
      },
      success(res) {
        if (res.result.code === 1) {
          setTimeout(() => {
            wx.showToast({
              title: type === 'open' ? '开启订阅成功' : '关闭订阅成功',
              icon: 'none',
            })
          }, 1000)
        }
      },
      complete() {
        self.getUserSucscribeStatus()
        self.setData({
          isChangeing: false,
        })
      },
    })
  },
  getUserSucscribeStatus() {
    const self = this
    wx.cloud.callFunction({
      name: 'checkSubscribe',
      data: {
        mode: 'get',
      },
      success(res) {
        if (res.result.code === 1) {
          self.setData({
            status: res.result.data,
          })
        }
      },
    })
  },
  openSetting() {
    const self = this
    wx.openSetting({
      success() {
        self.setData(({
          showAuthDialog: false,
        }))
      },
    })
  },
  closeDialog() {
    this.setData({
      showAuthDialog: false,
    })
  },
  copyLink() {
    wx.setClipboardData({
      data: 'https://github.com/GzhiYi/dandan-account',
      success() {},
    })
  },
})
