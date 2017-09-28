<template>
  <div class="input_group" ref="group" :class="[resetClass ? resetClass : '', floatText ? 'input_group_middle': '', !focusAnimate || disabled ? 'input_group_fixed' : '']">
    <div v-if="floatText" class="input_group_float" :class="{'input_group_top': value}">{{ floatText }}</div>
    <label v-show="!value" class="input_group_text" :class="{'input_group_hidden': floatText}">{{ labelText }}</label>
    <input
      style="display: none;"
      :value="value"
      :type="type"
      :name="name" />
    <input
      class="contenteditable"
      ref="input"
      :class="{'disabled': disabled}"
      :disabled="disabled"
      :type="type"
      :value="value"
      @keyup.enter="eventEnter"
      @focus="focusEvent"
      @blur="blurEvent"
      @input="inputEvent" />
    <div class="input_group_line" :class="{'input_group_animate': underlineAnimate}"></div>
    <div class="input_group_error" v-if="errorText">{{ errorText }}</div>
  </div>
</template>

<script>
export default {
  props: {
    floatText: String, // 标题
    name: String, // input 的 name
    type: { // input类型
      type: String,
      default: 'text'
    },
    value: String, // 初始值
    labelText: String, // placehodler
    errorText: String, // 错误信息
    disabled: { // 是否禁止编辑
      type: Boolean,
      default: false
    },
    resetClass: String, // 重置样式
    underlineAnimate: { // 虚线 动画
      type: Boolean,
      default: true
    },
    focusAnimate: {
      type: Boolean, // 缩放 动画
      default: true
    },
    change: { // 获取value
      type: Function,
      default: () => {}
    },
    eventEnter: { // 回车事件
      type: Function,
      default: () => {}
    }
  },
  methods: {
    inputEvent (e) {
      const val = e.target.value.replace(/\s/g, '')
      this.change(val)
    },
    focusEvent (e) {
      this.$refs.group.classList.add('active')
    },
    blurEvent (e) {
      this.$refs.group.classList.remove('active')
    }
  }
}
</script>

<style>
  .input_group {position: relative;display: inline-block;width: 100%;height: 48px;line-height: 24px;font-size: 16px;color: #999;}
  .input_group .contenteditable {width: 100%;height: 100%;line-height: inherit;padding: 0;font-size: inherit;font-weight: inherit;color: #fff;box-sizing: border-box;border: 0;outline: none;user-select: none;}
  .input_group .contenteditable.disabled {cursor: not-allowed;}
  .input_group .contenteditable.disabled + div:before {border-bottom-style: dotted;border-bottom-width: 2px;}
  .input_group textarea {width: 100%;height: 100%;line-height: inherit;padding: 0;font-size: inherit;font-weight: inherit;color: #666;box-sizing: border-box;border: 0;resize: none;outline: none;user-select: none;}
  .input_group textarea.disabled {cursor: not-allowed;}
  .input_group textarea.disabled + div:before {border-bottom-style: dotted;border-bottom-width: 2px;}
  .input_group_hidden {opacity: 0;}
  .input_group_float,.input_group_text {position: absolute;left: 0;pointer-events: none;transition: all .25s;color: #fff;}
  .input_group_text {bottom: 12px;}
  .input_group_float {top: 38px;}
  .input_group_line {position: absolute;left: 0;bottom: 8px;width: 100%;}
  .input_group_line:before,.input_group_line:after {position: absolute;left: 0;top: 0;width: 100%;content: "";border-bottom: 1px solid #ddd;}
  .input_group_animate:after {border-bottom: 2px solid #FF3466;transition: .25s cubic-bezier(.4, 0, .2, 1);transform: scaleX(0);transform-origin: center center 0;}
  .input_group_error {position: relative;bottom: 0;line-height: 12px;color: rgb(244, 67, 54);font-size: 12px;transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1);}
  .input_group.active .input_group_animate:after {transform: scale(1);}
  .input_group.active .input_group_float,.input_group_top,.input_group_fixed .input_group_float {transform: scale(.8) translate(0, -28px);opacity: 1;transform-origin: left top 0;}
  .input_group.active .input_group_float {color: #FF3466;}
  .input_group.active .input_group_text,.input_group_fixed .input_group_text{opacity: 1;}
  .input_group_middle {height: 72px;}
  .input_group_middle .contenteditable {margin-top: 14px;}
  .input_group_middle .input_group_error {bottom: 12px;}
</style>

<!--

(function(){
　　if(navigator.userAgent.toLowerCase().indexOf("chrome") != -1){
　　　　var selectors = document.getElementsByTagName("input");
　　　　for(var i=0;i<selectors.length;i++){
　　　　　　if((selectors[i].type !== "submit") && (selectors[i].type !== "password")){
　　　　　　　　var input = selectors[i];
　　　　　　　　var inputName = selectors[i].name;
　　　　　　　　var inputid = selectors[i].id;
　　　　　　　　selectors[i].removeAttribute("name");
　　　　　　　　selectors[i].removeAttribute("id");
　　　　　　　　setTimeout(function(){
　　　　　　　　　　input.setAttribute("name",inputName);
　　　　　　　　　　input.setAttribute("id",inputid);
　　　　　　　　},1)
　　　　　　}

　　　　}

　　}
})()

-->

