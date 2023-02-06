declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module "*.png";
declare namespace we {
  interface instance {
    /** 该变量包含了当前 Weex 页面的所有环境信息 */
    config: any;

    /** 获取某个 native module 的所有方法 */
    requireModule(name: string): any;
  }
}

declare var weex: we.instance;
declare module "weex-vue-render";


