# Taro-Hammer
hammer used in Taro (simplified)


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
