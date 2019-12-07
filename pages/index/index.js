//index.js
//获取应用实例
const app = getApp()
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
Page({
  data: {
    data: '',
    currentText: '', //识别内容
    typeText: '', // 返回的类型
    score: '', // 按钮颜色
    shadow: ''
  },
   streamRecord: function() {
    this.setData({
      score: '#73D8FF',
      shadow: '0px 0px 24px #73D8FF'
    })
    wx.showToast({
      icon: 'none',
      title: '正在识别',
    })
    manager.start({
      lang: 'zh_CN',
    }) 
  },
   endStreamRecord: function() {
    this.setData({
      score: '#ffffff',
      shadow: '0px 0px 4px #d3d3d3'
    })
    manager.stop() 
  },
   onLoad: function() {
    this.initRecord()
  },
   initRecord: function() {
    //新内容返回 调用
    manager.onRecognize = (res) => {
      let text = res.result
      this.setData({
        currentText: text,
      })
    }
    // 识别结束事件
    manager.onStop = (res) => {
      let that = this
      let text = res.result
      text = text.slice(0, text.length - 1)
      text = text.replace('，', '')
      let currentText = text
      let yes = text.search("是")
      if (yes != -1) {
        let yexIndex = text.indexOf('是')
        text = text.slice(0, Number(yexIndex))
      }
      if (text == '') {
        // 没有内容时
        wx.showToast({
          icon: 'none',
          title: '未识别到语音',
        })
        return
      }
      this.typrRequest(text,that)
      this.setData({
        currentText: currentText,
      })
      this.translateTextAction() //翻译
    }
  },
  typrRequest: function(content, that) {
    if (content == '') {
      that.setData({
        data: '',
        typeText: ''
      })
      return
    }
    wx.request({
      url: 'https://www.chenhanqi.cn/API/type.py',
      data: {
        垃圾: content
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        const {
          data
        } = res.data
        if (data == '该垃圾不在数据库内') {
          wx.showToast({
            icon: 'none',
            title: '该垃圾不在数据库内',
            duration: 2000
          })
          that.setData({
            data: '',
            typeText: ''
          })
          return
        }
        that.setData({
          data: data,
          typeText: `${content}是${data}`
        })
      }
    })
  },
  textareaAInput: function(e) {
    let that = this
    let value = e.detail.value
    console.log(value)
    this.typrRequest(value, that)
  },
  //需要翻译时调用
   translateTextAction: function() {},

})