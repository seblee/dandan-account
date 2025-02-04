import { debounce } from '../../util'

Page({
  data: {
    canSubscribe: false,
    status: null,
    isChangeing: false,
    showAuthDialog: false,
    isExporting: false,
    canExport: false,
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
  onExportFile: debounce(function () {
    const self = this
    self.setData({
      isExporting: true,
    })
    wx.cloud.callFunction({
      name: 'exportFile',
      data: {},
      success(res) {
        if (res.result.code === 1) {
          wx.cloud.getTempFileURL({
            fileList: [res.result.data.fileID],
            success: (tempRes) => {
              // eslint-disable-next-line no-console
              console.log(tempRes.fileList)
              wx.setClipboardData({
                data: tempRes.fileList[0].tempFileURL,
                success() {},
              })
            },
          })
        }
      },
      complete() {
        self.setData({
          isExporting: false,
        })
      },
    })
  }, 1000, true),
  showPreview() {
    wx.previewImage({
      current: 'https://6d69-miniapp-2rsbq-1255748898.tcb.qcloud.la/WechatIMG11.jpeg?sign=da4a77d1bdf71ca1ba3a89bcf7be4e23&t=1576116322', // 当前显示图片的http链接
      urls: ['https://6d69-miniapp-2rsbq-1255748898.tcb.qcloud.la/WechatIMG12.png?sign=c7e1b901fbcb2174483a6eacfb7ee4df&t=1576116297'], // 需要预览的图片http链接列表
    })
  },
})
