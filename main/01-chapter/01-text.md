# 01-video.js的基本使用

有的程序员可能只是有这么一个播放器的需求，想尽快开发出播放器，然后能播放，赶紧上线，所以我第一部分就介绍一下video.js 的基本使用，和HTML5中video标签的使用。

## 目录
1. video.js的基本介绍
2. video.js的基本使用
3. video标签介绍

## video.js 的基本介绍

video.js 的官方地址 https://videojs.com/ ，在页面里面有video.js的基本使用。
video.js 的仓库地址 https://github.com/videojs/video.js 。 

## video.js的基本使用

#### 资源的引入
  在这里就只是简单介绍一下普通的引入方式，当然官方的仓库里面也有介绍。
  ```
    <link href="//vjs.zencdn.net/7.10.2/video-js.min.css" rel="stylesheet">
    <script src="//vjs.zencdn.net/7.10.2/video.min.js"></script>
  ```
  在页面中资源引入成功，会有一个全局变量 videojs，大家可以看sample-vjs/01-chapter/01-start.html例子。 在控制台打印出来，可以看到是一个函数，函数可以传有三个参数。
  当然在 videojs 函数上面也挂载了一些静态变量和静态方法。我就说几个常用的，
   + videojs.VERSION  **当前使用 video.js 的版本**
   + videojs.options  **初始化播放器的配置项**
   + videojs.getPlayers()  **获取当前初始化的播放器对象**
   + videojs.getAllPlayers()  **获取所有的播放器对象**
   + videojs.browser  **浏览器相关的信息**
   + videojs.mergeOptions()  **合并对象的工具函数**
  
  这些方法或者变量在后续的源码分析里面也会说到的，大家先知道有这个东西可以用，如果有用到的这样就不用写一些重复的代码了。

#### 播放器的初始化
  资源已经引入到页面中，接下来就初始化播放器。 02-init.html
  ```
  <video
    id="my-player"
    class="video-js"
     data-setup='{}'
    >
    <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4"></source>
  </video>
  <script>
    var options = {
      controls: true,
      poster: '//vjs.zencdn.net/v/oceans.png', // 视频封面图
    };
    var player = videojs('my-player', options, function () {
      console.log("播放器初始化成功后的回调");
    });
  </script>

  ```
  从代码中可以看到 videojs() 初始化播放器需要三个参数， videojs('video标签', ['初始化的配置项',] ['初始化成功后的回调函数'])， **其中第一个参数 'video标签' 是必须的。后面两个参数是非必须的**。
  接下来就像详细的说一下播放器 options 配置项目,和播放器的一些方法。

- ##### 播放器options配置
大家可以看下面的配置项

  ```
      // 配置
    var options = {};

    options = {
      controls: true, // 是否显示控制条，如果在video标签里面设置了，为false时也不会显示
      poster: '//vjs.zencdn.net/v/oceans.png', // 视频封面图
      preload: '', // preload 属性规定是否在页面加载后载入视频。 // https://www.runoob.com/tags/att-video-preload.html
      autoplay: false, // 自动播放
      fluid: true, // 自适应宽度，而不是视频的宽高比
      language: 'zh-CN', // 语言设置
      muted: false, // 是否静音
      techOrder:[],
      controlBar: { // 控制条相关的

        /**
         * 下面这些是在控制条上，显示或者不显示的配置
         */

        // 播放按钮
        // playToggle: true, // 是否显示按钮
    
        // 声音控制条
        // volumePanel: false
        
        // 是否显示进度条
        // progressControl: false,
        
        // 是否显示视频剩余时间
        // remainingTimeDisplay: false,
        
        // 全屏按钮
        // fullscreenToggle: false
        
        /**
         * children 可以控制,播放器中需要的控件，以及可以根据先后位置。
         */
        children: [
          {
            name: 'playToggle' // 播放按钮
          },
          // { // 视频时间，但是为啥没起作用
          //   name: 'currentTimeDisplay'
          // },
          {
            name: 'progressControl' // 播放进度条
          },
          {
            name: 'remainingTimeDisplay' // 视频剩余时间
          },
          {
            name: 'playbackRateMenuButton',
            playbackRates: [0.5, 1, 1.5]
          },
          {
            name: 'volumePanel', // 声音控制条
            inline: false
          },

          {
            name: 'fullscreenToggle' // 全屏按钮
          },
        ]
      },
      sources: [
        {
          src: '//vjs.zencdn.net/v/oceans.mp4',
          type: 'video/mp4',
          poster: '//vjs.zencdn.net/v/oceans.png'
        },
      ]
    };

    var player = videojs('my-player', options, function () {
      console.log(" 初始化完成 ");
    });
  ```

想说一下 controlBar 这个参数，如果 controlBar不传的话，就是默认的播放器控制条。如果传值的话，可以说有两种，一、控制条上某个组件是否显，参数值一般为 true 或者 false。二、控制条组件的位置，和样式配置。这个需要用 设置children参数的值，他是个数组，根据传的组件名字的顺序，在页面上也会根据这个顺序来初始化。

比如你可能只需要播放按钮、进度条、播放剩余时间和声音控制面板。那么你就可以写如下配置。页面显示组件的顺序和在children中数组的顺序一样。
```
  controlBar: { // 控制条相关的
    children: [
      {
        name: 'playToggle' // 播放按钮
      },
      {
        name: 'progressControl' // 播放进度条
      },
      {
        name: 'remainingTimeDisplay' // 视频剩余时间
      },
      {
        name: 'volumePanel', // 声音控制条
        inline: false
      },
    ]
  }
```

- ##### 播放器事件
播放器初始化以后返回一个播放器对象 player，有一些控制播放的方法比如 player.play()、player.pause()等等可以来控制播放的交互。另外也可以在 player 对象上增加一些监听事件，比如监听播放、暂停、卡顿等等， player.on("play", fn)、player.on('waiting', fn)。

```
  <script>

    // 配置
    var options = {
      controls: true,
      poster: '//vjs.zencdn.net/v/oceans.png', // 视频封面图
      sources: [
        {
          src: '//vjs.zencdn.net/v/oceans.mp4',
          type: 'video/mp4',
        },
      ]
    };

    var player = videojs('my-player', options);


    player.on('play', function () {
      console.log(" play ");
    });

    player.on('pause', function () {
      console.log(" pause ");
    });

    player.on('error', function () {
      console.log(" error ");
    });

    player.on('timeupdate', function () {
      console.log(" timeupdate ");
    });

    player.on('waiting', function () {
      console.log(" waiting ");
    });

    player.on('ended', function () {
      console.log(" ended ");
    });

    // 播放
    $("#playBtn").on('click', function () {
      player.play()
    });

    // 暂停
    $("#pauseBtn").on('click', function () {
      player.pause()
    });

    // 封面
    $("#posterBtn").on('click', function () {
      player.poster('https://p.ivideo.sina.com.cn/video/476/112/084/476112084.jpg')
    });

    // 切换地址
    $("#srcBtn").on('click', function () {
      player.src({
        src: 'https://edge.ivideo.sina.com.cn/47611208402.mp4?KID=sina,viask&Expires=1657036800&ssig=Dre0wxnaZE&reqid=',
        type: 'video/mp4',
      })
    });

    // 销毁
    $("#disposeBtn").on('click', function () {
      player.dispose();
    });

  </script>
```

- ##### video标签


