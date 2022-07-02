# 01-video.js的基本使用

有的程序员可能只是有这么一个播放器的需求，想尽快开发出播放器，然后能播放，赶紧上线，所以我第一部分就介绍一下video.js 的基本使用，和HTML5中video标签的使用。

## 目录
1. video.js的基本介绍
2. video.js的基本使用
3. video标签介绍


### video.js 的基本介绍

video.js 的官方地址 https://videojs.com/ ，在页面里面有video.js的基本使用。
video.js 的仓库地址 https://github.com/videojs/video.js 。 

### video.js的基本使用

- 资源的引入
  我这里就只是简单介绍一下普通的引入方式，当然官方的仓库里面也有介绍。
  ```
    <link href="//vjs.zencdn.net/7.10.2/video-js.min.css" rel="stylesheet">
    <script src="//vjs.zencdn.net/7.10.2/video.min.js"></script>
  ```
  在页面中资源引入成功，会有一个全局变量 videojs，大家可以看sample-vjs/01-chapter/01-start.html例子。 在控制台打印出来，可以看到是一个函数，函数可以传有三个参数。
  当然在 videojs 函数上面也挂载了一些静态变量和静态方法。我就说几个常用的，
   videojs.VERSION 
   videojs.options
   videojs.getPlayers
   videojs.getAllPlayers
   videojs.browser
   videojs.mergeOptions()

  这些方法或者变量在后续的源码分析里面也会说到的，大家先知道有这个东西可以用，这样就不用写一些重复的代码了。
