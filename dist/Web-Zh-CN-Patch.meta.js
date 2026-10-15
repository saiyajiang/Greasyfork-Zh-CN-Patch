// ==UserScript==
// @name         Web 中文化补充
// @name:zh-CN   Web 中文化补充
// @name:en      Web Zh-CN Patch
// @namespace    https://github.com/saiyajiang/Web-Zh-CN-Patch
// @version      2.5.1
// @description  为多个英文站点补齐中文界面：目前支持 Greasy Fork（greasyfork.org / sleazyfork.org）、SteamDB（steamdb.info）。补全官方翻译中未收录、漏翻的英文文案：导航、按钮、表单、表头、提示与确认弹窗等。本脚本由 AI 编写，译文仅供参考，欢迎反馈更地道的译法。
// @description:zh-CN 为多个英文站点补齐中文界面，补全官方翻译中未收录、漏翻的英文文案。本脚本由 AI 编写。
// @description:en  Fills in untranslated English UI strings on multiple sites. Written by AI.
// @author       saiyajiang
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAA/1BMVEUyh+gkdds8kvApfeH8/f5Cl/MdbtYccdoAAABeou+Gtu7S5PmmyvQNcex+sOw8ku4A//8gctpOpP0gcto9kvA7kO5Cmvh/f/8AVaoAf388lPJVVapDmPl///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABkN7wHAAAAQHRSTlP+/v7+//7++gD4////Ff8rAaAWVaLHnwIDAlQDVwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT7jHdwAAAiNJREFUeNqll+e2qyAQhUfHkW5JPfX9X/PQYozXGwT2j4Qg+5tCcC2AO02fnJuZ9QfFZsP55+St4D7szzPr8TgAe3b2tgAwNjpinyVEm4UJADtokGULG0+A4O+bbPWBAMZYf1MkSzAGPvhc6LeEmX8APxf7LeHMYWI1ADaBaapkYMYaP87A6gAMEpudRMB7u2BVAFKd6GsAqus6qAAwsgDNKjJg2hISbdgCNmfWFqE2UwkASTEsksKloIVcT70H+KTfSm0B+KIDgFcDbgAopJNLXK41OLAfiQQAH73T/bpzvVy6mQKAFXMpgB9GoUOyMEwAQiF+/+G5yP2lxO7iXQCgdt16Anxv92PBrkIKy0OEbqngoFzNagH4nhBmAVwKwxKzW+OOp/AoIpypXAAtUf1QZ/rBb0RsnMruQJDzDRi+ZYHfZ94J71dQIr8TnfN3UCaU8QgTlBJ8eHcqyuyk4jtElAFWLyddUMSgQvCYhs60i5UtZiIzCpHqpfZIO1oIxYhq+LcdOpkFyUfn5S61U4lmiF27fxIRqW7K/ycaskj2Qb9pFQ3q2Ha2WdPbVW2bR26d5SloNxPvnzpkWyWAax3gCpc6wAXGOsAI05XK7XSdgH/VAL44fPNLMYEu/BvMfWwLCdSOdwP8l49URCAardlePE+BQFkK/lO4+lrCTdi5DDuRuHl/uHzfOf8RJI4D7OIfb4sAPtlL8Ol2mCBuNrYJ1/8/AysrOqwnxKcAAAAASUVORK5CYII=
// @homepageURL  https://github.com/saiyajiang/Web-Zh-CN-Patch
// @supportURL   https://github.com/saiyajiang/Web-Zh-CN-Patch/issues
// @source       https://github.com/saiyajiang/Web-Zh-CN-Patch
// @match        https://greasyfork.org/*
// @match        https://sleazyfork.org/*
// @match        https://steamdb.info/*
// @downloadURL  https://greasyfork.org/scripts/599835-web-zh-cn-patch/code/Web%20%E4%B8%AD%E6%96%87%E5%8C%96%E8%A1%A5%E5%85%85.user.js
// @updateURL    https://greasyfork.org/scripts/599835-web-zh-cn-patch/meta.js
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @noframes
// ==/UserScript==
