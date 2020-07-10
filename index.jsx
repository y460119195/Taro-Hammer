import React, { Component } from 'react'
import { View } from '@tarojs/components'


/************************************************
 ***@param onTap                       (function)
 ***@param onDoubleTap                 (function)
 ***@param onPress                     (function)
 ***@param onSwipe                     (function)
 ***@param onPan                       (function)
 ***@param options                     (Object)
 ***@param style                       (Object)
 ***@param className                   (String)
 ************************************************/

/******************Options**********************
***@param options
******@param Tap 
*********@param interval:300          //doubletap tap最大时间间隔
*********@param time:250,             //最长按压时间 超过算press
*********@param threshold:2,          //一次tap允许的最大位移
*********@param posThreshold:10,      //doubletap 间两次的最大位移
******@param Swipe 
*********@param threshold:10,         // 识别方向的最小距离
*********@param velocity:.6,          //  (num)px/ms 超过判断为swipe 不超则为pan
******@param Pan
*********@param threshold:10,         // 识别方向的最小距离 (未实现)
******@param Press     
*********@param threshold:9,          //press期间允许的最大位移
*********@param time:251,             //press的最小按压时间
************************************************/


export default class Hammer extends Component {
  constructor(props) {
    super(props)
    this.tapState = this.defaultTapState
    this.defaultOptions = Object.assign(this.defaultOptions, this.props.options || {})
    this.state = {
      touchEventName: ''
    }
  }
  defaultOptions = {
    Tap: {
      interval: 300, //doubletap tap最大时间间隔
      time: 250, //最长按压时间 超过算press
      threshold: 2, //一次tap允许的最大位移
      posThreshold: 10, //doubletap 间两次的最大位移
    },
    Swipe: {
      threshold: 10, // 识别方向的最小距离
      velocity: 0.8, //  (num)px/ms 超过判断为swipe 不超则为pan
    },
    Pan: {
      threshold: 10, // 识别方向的最小距离
    },
    Press: {
      threshold: 4, //press期间允许的最大位移
      time: 251, //press的最小按压时间
    }
  }
  defaultTapState = {
    isMouseDown: false,
    isOnceTap: false,
    // lastTapTime: null,
    lastTapX: 0,
    lastTapY: 0,
    tapTimeout: null,
    pointerType: '',
    tapTime: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  }

  // x,y坐标 => 1:上 2:右 3:下 4: 左
  computeEventInfo(x, y) {
    const { startX, startY, lastX, lastY, tapTime } = this.tapState
    const diffX = startX - x
    const diffY = startY - y
    const diffT = new Date() - tapTime

    const computeDirection = (dx, dy) => {
      const diff = Math.abs(dx) - Math.abs(dy)
      if (diff >= 0) {
        if (dx > 0) {
          return 4
        } else {
          return 2
        }
      } else {
        if (dy > 0) {
          return 1
        } else {
          return 3
        }
      }
    }

    let eventInfo = {
      deltaX: diffX,
      deltaY: diffY,
      deltaTime: diffT,
      // distance: Math.sqrt(diffX*diffX+diffY*diffY),
      // angle:0,
      velocityX: diffX / diffT,
      velocityY: diffY / diffT,
      // velocity:0,
      direction: computeDirection(lastX - x, lastY - y),
      offsetDirection: computeDirection(diffX, diffY),
    }
    return eventInfo
  }

  handleTouchStart(e) {
    // if (this.tapState.pointerType !== '') return
    //触摸点击 记录起点

    this.tapState = {
      ...this.tapState,
      pointerType: 'touch',
      tapTime: new Date(),
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      lastX: e.touches[0].clientX,
      lastY: e.touches[0].clientY,
    }
  }

  handleTouchEnd(e) {
    let eventInfo = this.computeEventInfo(this.tapState.lastX, this.tapState.lastY)
    const { deltaTime, offsetDirection, deltaX, deltaY, velocityX, velocityY } = eventInfo
    //运动方向位移量
    const deltaDistance = Math.max(Math.abs(deltaX), Math.abs(deltaY))

    let res = ((tapState) => {
      //判断是否为Tap
      const { interval, time, threshold, posThreshold } = this.defaultOptions.Tap
      if (deltaTime <= time) {
        if (deltaDistance <= threshold) {
          //是tap
          const { lastTapX, lastTapY, tapTime, startX, startY } = tapState
          // console.log(tapState)
          if (tapState.isOnceTap) {
            //判断是否为doubleTap
            if (tapState.tapTimeout) {
              clearTimeout(tapState.tapTimeout)
              tapState.tapTimeout = null
              const diff = Math.max(Math.abs(startX - lastTapX), Math.abs(startY - lastTapY))
              if (diff <= posThreshold) {
                //是doubleTap    
                this.runFunc(this.props.onDoubleTap, eventInfo, 'onDoubleTap')
              }
            }
            this.initEventInfo()
            return true
          } else {
            this.tapState = {
              ...this.tapState,
              isOnceTap: true,
              // lastTapTime: tapTime,
              lastTapX: startX,
              lastTapY: startY,
              tapTimeout: setTimeout(() => {
                this.runFunc(this.props.onTap, eventInfo, 'onTap')
                this.initEventInfo()
                this.tapState.tapTimeout = null
              }, interval)
            }
            return true
          }
        }
      } else {
        if (Math.abs(deltaDistance) <= this.defaultOptions.Press.threshold) {
          this.runFunc(this.props.onPress, eventInfo, 'onPress')
          this.initEventInfo()
          return true
        }
      }
      return false
    })(this.tapState)

    if (res) return

    res = ((tapState) => {
      //判断是否为Swipe
      const { velocity, threshold } = this.defaultOptions.Swipe
      if (deltaDistance < threshold) return false
      //  const velocityNow =  Math.abs(offsetDirection == (1||3)?velocityY:velocityX)
      const velocityNow = Math.abs(deltaDistance / deltaTime)
      //  console.log(velocityNow)
      if (velocityNow >= velocity) {
        this.runFunc(this.props.onSwipe, eventInfo, 'onSwipe')
        this.initEventInfo()
        return true
      }
    })(this.tapState)

    if (res) return

    this.runFunc(this.props.onEndWithNoEvent, eventInfo, 'onEndWithNoEvent')
    // this.runFunc(this.props.onNoneEvent,eventInfo,deltaDistance+' '+deltaTime)




    // const res = (()=>{
    //   switch(eventInfo.offsetDirection){
    //     case 1 :{
    //       return (Math.abs(eventInfo.velocityY)>=1?'swipe':'pan')+'up'
    //     };
    //     case 2 :{
    //       return (Math.abs(eventInfo.velocityX)>=1?'swipe':'pan')+'right'
    //     };
    //     case 3 :{
    //       return (Math.abs(eventInfo.velocityY)>=1?'swipe':'pan')+'down'
    //     };
    //     case 4 :{
    //       return (Math.abs(eventInfo.velocityX)>=1?'swipe':'pan')+'left'
    //     };
    //     default :{
    //       return false
    //     }
    //   }
    // })()
  }

  handleTouchMove(e) {
    let eventInfo = this.computeEventInfo(e.touches[0].clientX, e.touches[0].clientY)
    this.runFunc(this.props.onPan, eventInfo, 'onPan')
    this.tapState.lastX = e.touches[0].clientX
    this.tapState.lastY = e.touches[0].clientY
  }

  handleClick(e) {
    this.handleEvent(e)
  }

  handleMouseDown(e) {
    if (this.tapState.pointerType !== '') return
    //鼠标点击 记录起点
    this.tapState = {
      ...this.tapState,
      isMouseDown: true,
      pointerType: 'mouse',
      tapTime: new Date(),
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    }
  }

  handleMouseUp(e) {
    const eventInfo = this.computeEventInfo(e.clientX, e.clientY)
      (() => {
        switch (eventInfo.offsetDirection) {
          case 1: {
            return (Math.abs(eventInfo.velocityY) >= 1 ? 'swipe' : 'pan') + 'up'
          };
          case 2: {
            return (Math.abs(eventInfo.velocityX) >= 1 ? 'swipe' : 'pan') + 'right'
          };
          case 3: {
            return (Math.abs(eventInfo.velocityY) >= 1 ? 'swipe' : 'pan') + 'down'
          };
          case 4: {
            return (Math.abs(eventInfo.velocityX) >= 1 ? 'swipe' : 'pan') + 'left'
          };
          default: {
            return false
          }
        }
      })()
    this.initEventInfo()
  }

  handleMouseMove(e) {
    if (!this.tapState.isMouseDown) return
    // const eventInfo = this.computeEventInfo(e.clientX,e.clientY)
    this.tapState.lastX = e.clientX
    this.tapState.lastY = e.clientY
  }

  initEventInfo() {
    this.tapState = this.defaultTapState
  }



  runFunc(func, e, name) {
    e.type = name
    // console.log('run '+ name)
    if (typeof func == 'function') {
      return func(e)
    }
    return name + ' Not Function'
  }

  render() {
    return (
      <View
        onTouchStart={this.handleTouchStart.bind(this)}
        onTouchEnd={this.handleTouchEnd.bind(this)}
        onTouchMove={this.handleTouchMove.bind(this)}
        // onMouseDown={this.handleMouseDown.bind(this)}
        // onMouseMove={this.handleMouseMove.bind(this)}
        // onMouseUp={this.handleMouseUp.bind(this)}
        // onClick={this.handleClick.bind(this)}
        className={this.props.className || ''}
        style={this.props.style || {}}
      >
        {this.props.children}
      </View>
    )
  }
}
