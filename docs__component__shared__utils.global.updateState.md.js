(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[5],{NU5j:function(e,a,t){"use strict";t.r(a);var n=t("q1tI"),o=t.n(n),l=(t("dEAq"),t("ZpkN"));a["default"]=function(){return o.a.createElement(o.a.Fragment,null,o.a.createElement("div",{className:"markdown"},o.a.createElement("p",null,"In real project you may want to call global.updateState on state change, like for umi js, you can add something like this under app.ts file"),o.a.createElement(l["a"],{code:"import { global, StateProps } from '@medisys/utils';\n\nexport const dva = {\n  config: {\n    onStateChange(state: StateProps) {\n      //state:{loading:{models:{somename:Boolean}}}\n      global.updateState(state)\n    },\n  },\n}\n",lang:"js"})))}}}]);