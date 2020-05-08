/* ----

# binyui.js 1.1
# By: biny
# Update: 2020.02.00

一个极简的前端框架。

本代码为 biny's blog 作者 陆英彬 原创，并遵守 MIT 开源协议。

欢迎访问我的博客：http://www.binylu.cn:3000

---- */

;
(function(window, document, undefined) {
    
    //缩小全局变量,减少差错
    
    //实例化函数对象
    binyui = {
        //图片箱
        ImgShow: function(imgBoxId) {
            new BinyImgShow(imgBoxId);
        },
        //提示框
        TipShow: function(msgText, setting) {
            new BinyTipShow(msgText, setting);
        },
        //轮播图
        Silder: function(imgUrl, userSetting) {
            new BinySilder(imgUrl, userSetting)
        },
        //弹窗公告
        Notice: function(objs, setting) {
            new BinyNotice(objs, setting)
        }
    }

    // 获取元素   $biny('h1')
    window.$biny = function(elemt) {
        if (typeof(elemt) == 'string') {
            try {
                if (document.querySelectorAll(elemt).length > 1) {
                    return document.querySelectorAll(elemt)
                } else if (document.querySelectorAll(elemt).length == 1) {
                    return document.querySelector(elemt)
                } else if (document.querySelectorAll(elemt).length == 0) {
                    return null
                }
            } catch (e) {
                // console.log('错误名称: ' + e.name);
                console.log('错误信息: ' + e.message);
                console.log('错误堆栈详情: ' + e.stack);
                return null
            }
        }
    }

    // 随机值   randomNum(0, 999)
    function randomNum(begin, end) {
        if (typeof(begin) == 'string' || typeof(end) == 'string') {
            begin = Number(begin);
            end = Number(end);
        }
        return Math.floor(Math.random() * (end - begin)) + begin;
    }

    //binyAjax封装
    window.binyAjax = function() {
        // console.log(arguments[0])
        var ajaxData = {
            type: (arguments[0].type || "GET").toUpperCase(),
            url: arguments[0].url || "",
            async: arguments[0].async || "true",
            data: arguments[0].data || null,
            dataType: arguments[0].dataType || "json",
            contentType: arguments[0].contentType || "application/x-www-form-urlencoded; charset=utf-8",
            beforeSend: arguments[0].beforeSend || function() {},
            success: arguments[0].success || function() {},
            error: arguments[0].error || function() {}
        }

        ajaxData.beforeSend()
        var xhr = createxmlHttpRequest();
        xhr.responseType = ajaxData.dataType;

        xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);
        xhr.setRequestHeader("Content-Type", ajaxData.contentType);
        xhr.send(convertData(ajaxData.data));

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    ajaxData.success(xhr.response)
                } else {
                    ajaxData.error()
                }
            }
        }
    }

    // binyAjax兼容处理
    function createxmlHttpRequest() {
        if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }

    // 对象转换url字符串形式
    function convertData(data) {
        if (typeof data === 'object') {
            var convertResult = "";
            for (var c in data) {
                convertResult += c + "=" + data[c] + "&";
            }
            convertResult = convertResult.substring(0, convertResult.length - 1)
            return convertResult;
        } else {
            return data;
        }
    }
    
    /**
     * 图片箱构造函数
     * @param {Object} initCallback 初始化回调函数
     * @param {Object} imgBoxId  图片箱ID
     */
    function BinyImgShow(initCallback, imgBoxId) {
        imgBoxId ? this.imgBoxId = imgBoxId : this.imgBoxId = 'BinyImgBoxId';
        if (initCallback) {
            var isCall = true;
            this.init(isCall, initCallback);
            return
        }
        this.init();
    }
    // 开始对BinyImgShow原型链封装事件函数
    BinyImgShow.prototype = {
        // 开始执行初始化函数，带有自定义回调函数事件，用户可自行处理新的事件
        init: function(isCall, initCallback) {
            var that = this;
            var thatImgIndex;
            // 没有获取到图片则不执行以下事件
            if (!$biny('img')) {
                return
            }
            var imgMaxLength = $biny('img').length;
            if ($biny('img') == null) {
                return;
            }
            // 如果获取到多张图片
            if (document.querySelectorAll('img').length == 1) {
                $biny('img').onclick = function() {
                    thatImgIndex = 0;
                    imgMaxLength = 1;
                    if (isCall == true) {
                        initCallback();
                    }
                    that.removeCreat(thatImgIndex, imgMaxLength)
                }
                return
            }
            // 获取用户点击的图片元素，对图片dom进行传值给下一个函数执行
            for (i in $biny('img')) {
                $biny('img')[i].index = i;
                $biny('img')[i].onclick = function() {
                    if (isCall == true) {
                        initCallback();
                    }
                    thatImgIndex = this.index;
                    that.removeCreat(thatImgIndex, imgMaxLength)
                }
            }
        },
        //如有上一张预览图盒子则进行删除销毁后再进行生成新的dom元素对象
        removeCreat: function(thatImgIndex, imgMaxLength) {
            if ($biny('#' + this.imgBoxId)) {
                if ($biny('#BinyImgBoxStyle')) {
                    // 销毁样式
                    document.head.removeChild($biny('#BinyImgBoxStyle'));
                }
                // 销毁dom元素节点
                document.body.removeChild($biny('#' + this.imgBoxId));
                // 执行下一个任务事件
                this.creatImgBox(thatImgIndex, imgMaxLength);
                return;
            } else {
                // 如果没有上一张图，则执行下一个任务事件
                this.creatImgBox(thatImgIndex, imgMaxLength);
            }
        },
        //设置预览图dom元素节点
        creatImgBox: function(index, max) {
            var Div = document.createElement('div');
            Div.id = this.imgBoxId;
            document.body.appendChild(Div);

            var sid = $biny('#' + this.imgBoxId);
            var imgDom = '';
            if (max == 1) {
                imgDom = '<img src = "' + $biny('img').src + '" />';
            } else {
                imgDom = '<img src = "' + $biny('img')[index].src + '" />';
            }
            var closeButton =
                '<div class="binyImgBoxClose" style="position: absolute;bottom: 10%; left: 50%; transform: translate(-50%, -50%);background:#000;color:#fff;padding:10px 15px;cursor:pointer;box-shadow: 10px 10px 30px rgba(0, 0, 0, .2);">关闭</div>'
            sid.innerHTML = imgDom + closeButton;

            this.commonStyle(sid);
        },
        //设置预览图样式动画
        commonStyle: function(sid) {
            var sids = "#" + sid.id;
            var comm =
                "width:100%;height: 100vh;background-color: rgba(0,0,0,.8); color: #fff; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 5%;box-sizing: border-box; box-shadow: 10px 10px 30px rgba(0, 0, 0, .2);z-index:9999;";
            var sidImg = sids +
                ">img{position: absolute;top: 0%;left: 0%;cursor: move;width: 100%;};";
            var sidShowStyle = sids + "{" + comm +
                "opacity: 0; animation: sidShowStyle .2s ease-in-out forwards; }" + sidImg;
            var sidHideStyle = sids + "{" + comm +
                "opacity: 1; animation: sidHideStyle .2s ease-in-out forwards; }" + sidImg;
            var sidShowAmin =
                " @keyframes sidShowStyle { 0% { opacity: 0;transform: translate(-50%,-50%) scale(.9);  } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } } @-ms-keyframes sidShowStyle { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } } @-webkit-keyframes sidShowStyle{ 0% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } } @-moz-keyframes sidShowStyle{ 0% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } }";
            var sidHideAmin =
                " @keyframes sidHideStyle { 0% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } } @-ms-keyframes sidHideStyle { 0% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } } @-webkit-keyframes sidHideStyle { 0% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } } @-moz-keyframes sidHideStyle { 0% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(.9); } }";

            var sidStyle = [
                sidShowStyle + sidShowAmin,
                sidHideStyle + sidHideAmin
            ];

            this.caretImgBoxStyle(sids, sidStyle);
            this.scaleMoveImgBox(sids);
            this.removeImgBox(sids, sidStyle);
        },
        // 开始渲染预览图元素的样式
        caretImgBoxStyle: function(sids, sidStyle) {
            var styleEl = document.createElement('style');
            styleEl.id = 'BinyImgBoxStyle';
            document.head.appendChild(styleEl);
            $biny('#BinyImgBoxStyle').innerHTML = sidStyle[0];
        },
        // 放大缩小图片
        scaleMoveImgBox: function(sids) {
            var obj = $biny(sids + '>img');
            obj.setAttribute('draggable', 'false');
            obj.onmousewheel = fn;
            if (obj.addEventListener) {
                obj.addEventListener('DOMMouseScroll', fn, false);
            }

            function fn(ev) {
                var oEvent = ev || window.event;
                var down = true;
                if (oEvent.detail) {
                    down = oEvent.detail > 0
                } else {
                    down = oEvent.wheelDelta < 0
                }
                var oldWidth = this.offsetWidth;
                var oldHeight = this.offsetHeight;
                var oldLeft = this.offsetLeft;
                var oldTop = this.offsetTop;
                var scaleX = (oEvent.clientX - oldLeft) / oldWidth; //比例
                var scaleY = (oEvent.clientY - oldTop) / oldHeight;
                if (down) {
                    this.style.width = this.offsetWidth * 0.9 + "px";
                    this.style.height = this.offsetHeight * 0.9 + "px";
                } else {
                    this.style.width = this.offsetWidth * 1.1 + "px";
                    this.style.height = this.offsetHeight * 1.1 + "px";
                }
                var newWidth = this.offsetWidth;
                var newHeight = this.offsetHeight;
                this.style.left = oldLeft - scaleX * (newWidth - oldWidth) + "px";
                this.style.top = oldTop - scaleY * (newHeight - oldHeight) + "px";

                if (oEvent.preventDefault) {
                    oEvent.preventDefault();
                }
                return false;
            }
            // 拖动图片
            var sidon = $biny(sids);
            sidon.onmousedown = function(e) {
                e = e || window.event;
                var left = obj.offsetLeft;
                var top = obj.offsetTop;
                var nowX = e.clientX;
                var nowY = e.clientY;
                document.onmousemove = function(e) {
                    var resultX = left + e.clientX - nowX;
                    var resultY = top + e.clientY - nowY;
                    if (resultX < 0) {
                        resultX = 0;
                    } else if (resultX > sidon.clientWidth - obj.offsetWidth) {
                        resultX = sidon.clientWidth - obj.offsetWidth
                    }
                    if (resultY < 0) {
                        resultY = 0;
                    } else if (resultY > sidon.clientHeight - obj.offsetHeight) {
                        resultY = sidon.clientHeight - obj.offsetHeight
                    }
                    obj.style.left = resultX + "px";
                    obj.style.top = resultY + "px";
                }
            }
            document.onmouseup = function() {
                document.onmousemove = null;
            }
        },
        //动画执行完之后开始对dom元素节点进行删除销毁当前显示的图片元素
        removeImgBox: function(sids, sidStyle) {
            $biny(sids + '>.binyImgBoxClose').onclick = function() {
                $biny('#BinyImgBoxStyle').innerHTML = sidStyle[1];
                setTimeout(function() {
                    try {
                        document.body.removeChild($biny(sids));
                        document.head.removeChild($biny('#BinyImgBoxStyle'));
                    } catch (e) {
                        console.log('BinyImgShow 似乎发生某些错误...此处可忽略不计，错误行 => 200')
                    }
                }, 500)
            }
        }
    }
    
    /**
     * 提示框构造函数
     * @param {Object} msgText 用户设置的文本信息
     * @param {Object} setting 用户对元素的自定义设置
     */
    function BinyTipShow(msgText, setting) {
        msgText ? this.msgText = msgText : this.msgText = '初始化 TipBox.js 成功!';
        this.setting = {
            msgTimer: setting.msgTimer ? setting.msgTimer : 2,
            msgColor: setting.msgColor ? setting.msgColor : 'red',
            msgAxis: setting.msgAxis ? setting.msgAxis : 'rightTop', //leftTop rightTop centerTop leftBottom centerBottom rightBottom
            xNum: setting.xNum ? setting.xNum : '10%',
            yNum: setting.yNum ? setting.yNum : '10%',
            zIndex: setting.zIndex ? setting.zIndex : '1',
        }
        this.init()
    }
    //对BinyTipShow原型链封装
    BinyTipShow.prototype = {
        //如有相同dom元素节点则进行删除销毁后再进行生成新的dom元素对象
        init: function() {
            if ($biny('#tipDiv')) {
            	if ($biny('.TipBoxsStyle')) {
            		document.head.removeChild($biny('.TipBoxsStyle'));
            	}
            	document.body.removeChild($biny('#tipDiv'));
            	this.caretMsgBox();
            	return;
            } else {
            	this.caretMsgBox();
            }
        },
        //开始创建提示框dom元素节点
        caretMsgBox: function() {
            var tipDiv = document.createElement('div');
            var classNum = 'tipDiv' + randomNum(0, 999);
            tipDiv.className = classNum;
            tipDiv.id = 'tipDiv';
            document.body.appendChild(tipDiv);
            var msgDiv = '';
            msgDiv += this.msgText;
            $biny('.' + classNum).innerHTML = msgDiv;
            this.caretMsgStyle(classNum);
        },
        //开始创建提示框元素样式
        caretMsgStyle: function(classNum) {
            var styleEl = document.createElement('style');
            var idNum = 'TipBoxsStyle' + randomNum(0, 999);
            styleEl.className = 'TipBoxsStyle';
            styleEl.id = idNum;
            document.head.appendChild(styleEl);
            
            // 判断用户设置的x,y轴方向以及边距数值
            //leftTop rightTop centerTop leftBottom centerBottom rightBottom
            switch (this.setting.msgAxis) {
                case 'leftTop':
                    x = 'left'
                    y = 'top'
                    xNum = this.setting.xNum
                    yNum = this.setting.yNum
                    break;
                case 'rightTop':
                    x = 'right'
                    y = 'top'
                    xNum = this.setting.xNum
                    yNum = this.setting.yNum
                    break;
                case 'centerTop':
                    x = 'left'
                    y = 'top'
                    xNum = '50%'
                    yNum = this.setting.yNum
                    break;
                case 'leftBottom':
                    x = 'left'
                    y = 'bottom'
                    xNum = this.setting.xNum
                    yNum = this.setting.yNum
                    break;
                case 'centerBottom':
                    x = 'left'
                    y = 'bottom'
                    xNum = '50%'
                    yNum = this.setting.yNum
                    break;
                case 'rightBottom':
                    x = 'right'
                    y = 'bottom'
                    xNum = this.setting.xNum
                    yNum = this.setting.yNum
                    break;
            }
            
            //动画使用css3动画特征keyframes进行定帧动画
            styleEl.innerHTML = "." + classNum + "{z-index:" + this.setting.zIndex +
                ";font-size:.8em;background-color: " + this.setting.msgColor +
                ";color: #fff;position: fixed;" + y + ": " + yNum + ";" + x + ": " + xNum +
                ";transform: translate(-50%,-50%);padding: 10px 20px;box-shadow: 10px 10px 30px rgba(0,0,0,.2);opacity: 0;animation: tipboxfadein " +
                this.setting.msgTimer +
                "s ease-in-out forwards;}@keyframes tipboxfadein{0%{opacity: 0;" + y +
                ": 0;}20%{opacity: .95;" + y + ": " + yNum +
                ";}80%{opacity: .95;" + y + ": " + yNum + ";}100%{opacity: 0;" + y +
                ": 0;}}@-ms-keyframes tipboxfadein{0%{opacity: 0;" + y + ": 0;}20%{opacity: .95;" + y + ": " +
                yNum +
                ";}80%{opacity: .95;" + y + ": " + yNum + ";}100%{opacity: 0;" + y +
                ": 0;}}@-webkit-keyframes {0%{opacity: 0;" +
                y +
                ": 0;}20%{opacity: .95;" + y + ": " + yNum + ";}80%{opacity: .95;" + y + ": " + yNum +
                ";}100%{opacity: 0;" + y +
                ": 0;}}@-moz-keyframes {0%{opacity: 0;" + y + ": 0;}20%{opacity: .95;" + y + ": " + yNum +
                ";}80%{opacity: .95;" +
                y +
                ": " + yNum + ";}100%{opacity: 0;" + y + ": 0;}}";
            this.closeMsg(classNum, idNum);
        },
        //动画执行完毕之后开始销毁当前提示框dom节点元素
        closeMsg: function(classNum, idNum) {
            var times = this.setting.msgTimer;
            setTimeout(() => {
                try{
                    document.head.removeChild($biny('#' + idNum));
                    document.body.removeChild($biny('.' + classNum));
                }catch(e){
                    //TODO handle the exception
                    console.log(e)
                }
            }, times * 1000)
        }
    }
    
    /**
     * 轮播图构造函数
     * @param {Array} imgUrl 用户定义图片数组
     * @param {Object} userSetting 用户自定义轮播图属性
     */
    function BinySilder(imgUrl, userSetting) {
        imgUrl ? this.imgUrl = imgUrl : console.log('请输入轮播图路径');
        if (!userSetting) {
            console.log('必须设定指定盒子ID,否则轮播图无法开启');
            return
        }
        //初始轮播图位置
        this.lisIndex = 0;
        // 默认设置
        this.userSetting = {
            SilderId: userSetting.SilderId, //要放置轮播图的盒子ID
            SilderTimer: userSetting.SilderTimer ? userSetting.SilderTimer : false, //是否开启轮播图定时器
            SilderTimes: userSetting.SilderTimes ? userSetting.SilderTimes : 3, //轮播图每3秒下一张
            SilderWidth: userSetting.SilderWidth ? userSetting.SilderWidth : '1000px', //轮播图盒子宽度
            SilderHight: userSetting.SilderHight ? userSetting.SilderHight : '500px', //轮播图盒子高度
            SilderImgSize: userSetting.SilderImgSize ? userSetting.SilderImgSize : 'cover', //轮播图平铺方式
            SilderImgRadius: userSetting.SilderImgRadius ? userSetting.SilderImgRadius : '20px', //轮播图圆角
            SilderShow: userSetting.SilderShow ? userSetting.SilderShow : 'bounceIn', //轮播图首次出现动画
            SilderShowTime: userSetting.SilderShowTime ? userSetting.SilderShowTime : '.5s', //轮播图首次出现动画时长
            SilderLeftAmin: userSetting.SilderLeftAmin ? userSetting.SilderLeftAmin : 'bounceInLeft', //点击上一张动画类名（Animation.css）
            SilderLeftAminTime: userSetting.SilderLeftAminTime ? userSetting.SilderLeftAminTime : '.5s', //点击上一张动画做的时长
            SilderRightAmin: userSetting.SilderRightAmin ? userSetting.SilderRightAmin : 'bounceInRight', //点击下一张动画类名（Animation.css）
            SilderRightAminTime: userSetting.SilderRightAminTime ? userSetting.SilderRightAminTime : '.5s', //点击下一张动画做的时长
            SilderHideAmin: userSetting.SilderHideAmin ? userSetting.SilderHideAmin : 'fadeOut', //动画消失类名（Animation.css）
            SilderHideAminTime: userSetting.SilderHideAminTime ? userSetting.SilderHideAminTime : '.3s', //动画消失做的时长
            SilderRandomAmin: userSetting.SilderRandomAmin ? userSetting.SilderRandomAmin : false, //是否随机动画
            SilderClickBtn: userSetting.SilderClickBtn ? userSetting.SilderClickBtn : false //是否允许点击上一张下一张
        }
        //默认动画来自Animation.css文件
        this.SilderRandomArr = [
            'bounceIn',
            'bounceInDown',
            'bounceInLeft',
            'bounceInRight',
            'bounceInUp',
            'fadeIn',
            'fadeInDown',
            'fadeInDownBig',
            'fadeInLeft',
            'fadeInLeftBig',
            'fadeInRight',
            'fadeInRightBig',
            'fadeInUp',
            'fadeInUpBig',
            'flipInX',
            'flipInY',
            'lightSpeedIn',
            'rotateIn',
            'rotateInDownLeft',
            'rotateInDownRight',
            'rotateInUpLeft',
            'rotateInUpRight',
            'rollIn',
            'slideInDown',
            'slideInLeft',
            'slideInRight',
            'slideInUp',
        ]
        this.caretHtml();
    }
    // 开始对轮播图进行原型链封装
    BinySilder.prototype = {
        //根据用户图片数组进行创建轮播图dom元素节点
        caretHtml: function() {
            var oimgUrl = this.imgUrl;
            var userSetting = this.userSetting;
            var SilderId = $biny(userSetting.SilderId);
            if (!SilderId) {
                console.log('获取不到轮播图元素节点!')
                return;
            }
            var slider =
                '<ul></ul><div class="btn"><div class="allBtn prevBtn"><</div><div class="allBtn nextBtn">></div></div>'
            SilderId.innerHTML = slider;
            for (i in oimgUrl) {
                $biny(userSetting.SilderId + '>ul').innerHTML += '<li style="background-image: url(' +
                    oimgUrl[i] +
                    ')"></li>';
            }
            this.caretStyle();
            this.BtnClicks();
        },
        //开始对轮播图dom元素创建样式以及动画
        caretStyle: function() {
            var styleEl = document.createElement('style');
            styleEl.id = 'BinySilder' + randomNum(0, 9999);
            var styleElid = styleEl.id;
            document.head.appendChild(styleEl);
            var selfs = this.userSetting.SilderId;
            //轮播图主体样式
            var selfCommon = '* {padding: 0;margin: 0;}' + selfs +
                '{position:relative;overflow: hidden;display: inline-block;width:' + this.userSetting.SilderWidth +
                ';-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;-khtml-user-select:none;user-select:none;-webkit-appearance:none}' +
                selfs + ' ul{position:relative;height:' + this.userSetting.SilderHight + '}' + selfs +
                ' ul li{position:absolute;display:none;width:100%;height:' + this.userSetting
                .SilderHight + ';border-radius:' + this.userSetting.SilderImgRadius + ';background-size:' +
                this.userSetting.SilderImgSize +
                ';background-repeat:no-repeat;list-style:none}' + selfs +
                ' ul li:nth-child(1){display:block}';
            //轮播图按钮样式
            var selfBtn = selfs + ' .btn{position:absolute;top:0;left:0;width:100%;height:' + this.userSetting
                .SilderHight +
                ';font-size:5em}' + selfs +
                ' .allBtn{position:absolute;top:50%;color:#fff;text-shadow:5px 5px 20px rgba(0,0,0,.8);cursor:pointer;transition:all .2s;transform:translate(0,-50%)}' +
                selfs + ' .allBtn:hover{text-shadow:10px 10px 30px #000}' + selfs + ' .prevBtn{left:10px}' +
                selfs +
                ' .nextBtn{right:10px}';
            //轮播图动画样式
            var selfAmin = selfs + ' .showBinySilderLeftAminShow{display:block;animation:' +
                this.userSetting.SilderLeftAmin + ' ' + this.userSetting.SilderLeftAminTime +
                ' ease-in-out forwards}' + selfs +
                ' .showBinySilderRightAminShow{display:block;animation:' + this.userSetting.SilderRightAmin +
                ' ' + this.userSetting
                .SilderRightAminTime + ' ease-in-out forwards}' + selfs +
                ' .showBinySilderHide{display:block!important;animation:' + this.userSetting
                .SilderHideAmin + ' ' + this.userSetting.SilderHideAminTime +
                ' ease-in-out forwards!important}';
            $biny('#' + styleElid).innerHTML = selfCommon + selfBtn + selfAmin;
        },
        //点击轮播图上一张下一张图
        BtnClicks: function() {
            var that = this;
            var selfs = this.userSetting.SilderId;
            var lis = $biny(selfs + ' ul li');
            var lisLen = lis.length - 1;
            
            //当用户允许显示轮播图按钮时才允许用户点击上一张下一张图
            if (this.userSetting.SilderClickBtn == true) {
                $biny(selfs + ' .prevBtn').addEventListener('click', function() {
                    // 点击上一张
                    that.prevSilder(lis, lisLen)
                })
                $biny(selfs + ' .nextBtn').addEventListener('click', function() {
                    // 点击下一张
                    that.nextSilder(lis, lisLen)
                })
            } else {
                $biny(selfs + ' .prevBtn').style.display = 'none'
                $biny(selfs + ' .nextBtn').style.display = 'none'
            }
            // 轮播图自动播放
            if (this.userSetting.SilderTimer == true) {
                this.silTimers(selfs, lis, lisLen)
            }
        },
        //点击下一张按钮事件
        nextSilder: function(lis, lisLen) {
            var thatSilderRandomArr = this.SilderRandomArr;
            this.lisIndex = this.lisIndex + 1;
            if (this.lisIndex > lisLen) {
                this.lisIndex = 0;
            }
            if (this.userSetting.SilderRandomAmin == true) {
                lis[this.lisIndex].style.animationName = thatSilderRandomArr[randomNum(0,
                    thatSilderRandomArr.length - 1)];
            }
            lis[this.lisIndex].className = 'showBinySilderRightAminShow';
            if (this.lisIndex == 0) {
                lis[lisLen].className = 'showBinySilderHide';
            } else {
                lis[this.lisIndex - 1].className = 'showBinySilderHide';
            }
        },
        //点击上一张按钮事件
        prevSilder: function(lis, lisLen) {
            var thatSilderRandomArr = this.SilderRandomArr;
            this.lisIndex = this.lisIndex - 1;
            if (this.lisIndex < 0) {
                this.lisIndex = lisLen;
            }
            if (this.userSetting.SilderRandomAmin == true) {
                lis[this.lisIndex].style.animationName = thatSilderRandomArr[randomNum(0,
                    thatSilderRandomArr.length - 1)];
            }
            lis[this.lisIndex].className = 'showBinySilderLeftAminShow';
            if (this.lisIndex == lisLen) {
                lis[0].className = 'showBinySilderHide';
            } else {
                lis[this.lisIndex + 1].className = 'showBinySilderHide';
            }
        },
        // 轮播图自动播放下一张图
        silTimers: function(selfs, lis, lisLen) {
            var that = this;
            var changeTime = this.userSetting.SilderTimes;
            var silderTimer = setInterval(function() {
                that.nextSilder(lis, lisLen)
            }, changeTime * 1000)
            //鼠标在轮播图元素内时停止自动播放
            $biny(selfs).onmouseover = function() {
                clearInterval(silderTimer)
            }
            //鼠标在轮播图元素外时开始自动播放
            $biny(selfs).onmouseout = function() {
                that.silTimers(selfs, lis, lisLen);
            }
        }
    }
    /**
     * @param {Object} objs 用户定义标题与内容信息
     * @param {Object} setting 用户自定义公告框的属性
     */
    function BinyNotice(objs, setting) {
        this.objs = {
            title: objs.title ? objs.title : '公告',
            message: objs.message ? objs.message : '没有初始化公告内容'
        }
        this.setting = {
            width: setting.width ? setting.width : '500px',
            height: setting.height ? setting.height : '500px',
            amin: setting.amin ? setting.amin : 'fadeInUp',
            zIndex : setting.zIndex ? setting.zIndex : '999'
        }
        this.init()
    }
    // 开始对BinyNotice原型链封装
    BinyNotice.prototype = {
        //开始执行创建事件
        init: function() {
            // console.log(this.objs,this.setting)
            this.creatNotice();
        },
        // 创建dom元素的动画样式并渲染
        creatNotice: function() {
            // 创建公告框dom元素节点
            var cNotice = document.createElement('div');
            cNotice.className = 'cNotice';
            document.body.appendChild(cNotice);
            var domHtml =
                '<div class="binyNoticesMask"><div class="binyNoticesCon"><div class="binyNoticesTitle"><p>' +
                this
                .objs
                .title +
                '</p></div><div class="binyNoticesText"></div><div class="binyNoticesClose">X</div></div></div>';
            $biny('.cNotice').innerHTML = domHtml;
            var msgs = '';
            var thatMsg = this.objs.message;
            for (i in thatMsg) {
                msgs += '<p>' + thatMsg[i] + '</p>'
            }
            $biny('.binyNoticesText').innerHTML = msgs;
            
            // 创建动画样式
            var styleEl = document.createElement('style');
            styleEl.id = 'binyNoticeStyle' + randomNum(0, 999);
            var styleElid = styleEl.id;
            document.head.appendChild(styleEl);
            var noticeStyle =
                '.binyNoticesMask{position:fixed;top:0;left:0;width:100%;height:100vh;background:rgba(0,0,0,.5);z-index:'+this.setting.zIndex+'}.binyNoticesCon{position:fixed;top:0;left:0;right:0;bottom:0;margin:auto;width:' +
                this.setting.width + ';height:' + this.setting.height +
                ';background:#fff;border-top-left-radius:30%;border-top-right-radius:30%;border-top:15px #5e5ef7 solid;border-bottom:5px #5e5ef7 solid;border-left:1px #5e5ef7 solid;border-right:1px #5e5ef7 solid;box-shadow:10px 10px 30px rgba(0,0,0,.1);animation:' +
                this.setting.amin +
                ' .5s ease-in-out forwards}.binyNoticesTitle{position:absolute;width:40%;height:100px;top:0;left:50%;padding-top:20px;text-align:center;transform:translate(-50%,-50%);background:#fff;border-radius:50%;border-top:20px #5e5ef7 solid;font-size:2em;color:rgba(129,33,255,1);letter-spacing:5px;text-shadow:4px 4px 10px rgba(129,33,255,.3)}.binyNoticesText{margin:60px 50px;padding:5px;box-sizing:border-box;letter-spacing:2px;color:rgba(0,0,0,1);max-height:75%;min-height:75%;}.binyNoticesText p{line-height: 150%;margin:20px 0;padding-bottom:5px;border-bottom:solid 1px rgba(129,33,255,.2)}.binyNoticesClose{cursor: pointer;position:absolute;left:50%;bottom:0;color:#fff;transform:translate(-50%,-50%);box-shadow:10px 10px 30px rgba(0,0,0,.1);background:rgba(129,33,255,.8);padding:4px 10px}.binyNoticesMask{}@media screen and (max-width:500px){.binyNoticesCon{width:80%}.binyNoticesCon{height:400px}.binyNoticesText{margin:40px 30px;font-size:14px}.binyNoticesTitle{font-size:1.5em;height:50px}}'
            $biny('#' + styleElid).innerHTML = noticeStyle;
            this.closeNotice(styleElid);
        },
        //点击关闭按钮开始做消失动画并执行销毁删除元素事件
        closeNotice: function(styleElid) {
            $biny('.binyNoticesClose').addEventListener('click', function() {
                $biny('.binyNoticesCon').style.animationName = 'fadeOut';
                setTimeout(function() {
                    $biny('.binyNoticesMask').style.display = 'none';
                    if ($biny('.binyNoticesMask') || $biny('#' + styleElid)) {
                        document.body.removeChild($biny('.cNotice'));
                        document.head.removeChild($biny('#' + styleElid));
                    }
                }, 500)
            })
        }
    }




})(window, document);
