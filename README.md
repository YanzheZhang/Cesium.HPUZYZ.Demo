# Cesium.HPUZYZ.Demo
This project is some demos of CESIUM. Much of them are form other people's blogs and cesium's official website (https://cesiumjs.org/tutorials/cesium-up-and-running/). Thanks to my good friend MikesWei (https://github.com/MikesWei) for giving me great help.
# 内容
本工程使用VS2013+chrome来编辑和调试，示例代码下载后，可以直接在vs中调试运行，部分示例的测试数据需要另外下载，在对应博客中我已经一一指出了。目前我把cesium学习基础内容整理19个笔记，涵盖环境搭建、影像服务、地形服务、模型加载、鼠标事件、绘制对象、3DTiles加载等几方面。关于其它诸如czml、DataSource、粒子系统等先放一放，随后再学习。现在继续从两个方面写：工具篇、原理篇。工具篇包括在cesium引擎上实现一些常用的工具，原理篇和大家一起尝试查看cesium的源码，试图探究一下cesium底层实现和设计思想。
</br>
### 基础篇
*[Cesium学习笔记1--环境搭建](http://blog.sina.com.cn/s/blog_15e866bbe0102xleh.html) </br>
*[Cesium学习笔记2--官方DEMO和API查看](http://blog.sina.com.cn/s/blog_15e866bbe0102xm9s.html) </br>
*[Cesium学习笔记3--Cesium影像服务--在线服务](http://blog.sina.com.cn/s/blog_15e866bbe0102xmo5.html) </br>
*[Cesium学习笔记4--Cesium影像服务--在线服务扩展](http://blog.sina.com.cn/s/blog_15e866bbe0102xmo6.html) </br>
*[Cesium学习笔记5--Cesium影像服务--地图发布](http://blog.sina.com.cn/s/blog_15e866bbe0102xn72.html) </br>
*[Cesium学习笔记6--Cesium影像服务--图层功能](http://blog.sina.com.cn/s/blog_15e866bbe0102xnmj.html) </br>
*[Cesium学习笔记7--Cesium影像服务--BaseLayerPicker使用](http://blog.sina.com.cn/s/blog_15e866bbe0102xnml.html) </br>
*[Cesium学习笔记8--Cesium地形服务--在线地形](http://blog.sina.com.cn/s/blog_15e866bbe0102xoak.html) </br>
*[Cesium学习笔记9--Cesium地形服务--本地地形数据处理及加载](http://blog.sina.com.cn/s/blog_15e866bbe0102xofa.html) </br>
*[Cesium学习笔记10--Cesium地形服务--地形数据采样](http://blog.sina.com.cn/s/blog_15e866bbe0102xoo7.html) </br>
*[Cesium学习笔记11--模型加载](http://blog.sina.com.cn/s/blog_15e866bbe0102xpsm.html) </br>
*[Cesium学习笔记12--鼠标事件](http://blog.sina.com.cn/s/blog_15e866bbe0102xq8d.html) </br>
*[Cesium学习笔记13--绘制对象-Entity方式](http://blog.sina.com.cn/s/blog_15e866bbe0102xqsx.html) </br>
*[Cesium学习笔记14--绘制对象-Entity管理](http://blog.sina.com.cn/s/blog_15e866bbe0102xrt2.html) </br>
*[Cesium学习笔记15--绘制对象-Primitive方式](http://blog.sina.com.cn/s/blog_15e866bbe0102xse8.html) </br>
*[Cesium学习笔记16--绘制对象-Primitive管理](http://blog.sina.com.cn/s/blog_15e866bbe0102xseb.html) </br>
*[Cesium学习笔记17--绘制对象-Primitive外观](http://blog.sina.com.cn/s/blog_15e866bbe0102xsi8.html) </br>
*[Cesium学习笔记18--绘制对象-效率比较](http://blog.sina.com.cn/s/blog_15e866bbe0102xsj3.html) </br>
*[Cesium学习笔记19--3DTiles加载](http://blog.sina.com.cn/s/blog_15e866bbe0102xt9i.html) 
### 工具篇
*[Cesium学习笔记-工具篇01-Tooltip-entity方式](http://blog.sina.com.cn/s/blog_15e866bbe0102xv5f.html) </br>
*[Cesium学习笔记-工具篇02-Tooltip-div方式](http://blog.sina.com.cn/s/blog_15e866bbe0102xv8k.html) </br>
*[Cesium学习笔记-工具篇03-DrawHelper](http://blog.sina.com.cn/s/blog_15e866bbe0102xvwv.html) </br>
*[Cesium学习笔记-工具篇04-ChangeablePrimitive可编辑图形](http://blog.sina.com.cn/s/blog_15e866bbe0102xvwx.html) </br>
*[Cesium学习笔记-工具篇05-DynamicDrawTool交互绘制](http://blog.sina.com.cn/s/blog_15e866bbe0102xvx1.html) </br>
*[Cesium学习笔记-工具篇06-GroundPush挖地形](http://blog.sina.com.cn/s/blog_15e866bbe0102xwyb.html) </br>
*[Cesium学习笔记-工具篇07-GroundClipping挖地形](http://blog.sina.com.cn/s/blog_15e866bbe0102xwyd.html) </br>
*[Cesium学习笔记-工具篇08-CesiumNavigation导航插件](http://blog.sina.com.cn/s/blog_15e866bbe0102xxcw.html) </br>
*[Cesium学习笔记-工具篇09-CesiumVectorTile矢量瓦片](http://blog.sina.com.cn/s/blog_15e866bbe0102xxd1.html) </br>
*[Cesium学习笔记-工具篇10-TileLonlatsImageryProvider经纬度网格瓦片地图服务](http://blog.sina.com.cn/s/blog_15e866bbe0102xxme.html) </br>
*[Cesium学习笔记-工具篇11-Mouse-ButtonLanguage鼠标设置、按钮语言设置](http://blog.sina.com.cn/s/blog_15e866bbe0102xyn0.html) </br>
*[Cesium学习笔记-工具篇12-GlobeSet球场景相关设置](http://blog.sina.com.cn/s/blog_15e866bbe0102xyny.html) </br>
*[Cesium学习笔记-工具篇13-CesiumThreejsCesium引入threejs](http://blog.sina.com.cn/s/blog_15e866bbe0102xz2g.html) </br>
*[Cesium学习笔记-工具篇14-PickPosition获取鼠标点击位置方法总结](http://blog.sina.com.cn/s/blog_15e866bbe0102xz32.html) </br>
*[Cesium学习笔记-工具篇15-Elevation等高线绘制](http://blog.sina.com.cn/s/blog_15e866bbe0102xz6u.html) </br>
*[Cesium学习笔记-工具篇16-DynamicDraw-ClampGround交互绘制-贴地](http://blog.sina.com.cn/s/blog_15e866bbe0102xzbj.html) </br>
*[Cesium学习笔记-工具篇17-PrimitivePoint自定义渲染-点](http://blog.sina.com.cn/s/blog_15e866bbe0102y0ji.html) </br>
*[Cesium学习笔记-工具篇18-PrimitivePolyline自定义渲染-线](http://blog.sina.com.cn/s/blog_15e866bbe0102y0jj.html) </br>
*[Cesium学习笔记-工具篇19-PrimitiveTriangles自定义渲染-面](http://blog.sina.com.cn/s/blog_15e866bbe0102y0jl.html) </br>
*[Cesium学习笔记-工具篇20-PrimitiveTexture自定义渲染-贴图](http://blog.sina.com.cn/s/blog_15e866bbe0102y0jm.html) </br>
*[Cesium学习笔记-工具篇21-PrimitiveWaterface渲染水面](http://blog.sina.com.cn/s/blog_15e866bbe0102y0ql.html) </br>
*[Cesium学习笔记-工具篇22-PrimitiveEllipse自定义渲染椭圆](http://blog.sina.com.cn/s/blog_15e866bbe0102y0qn.html) </br>
*[Cesium学习笔记-工具篇23-PrimitiveSector自定义渲染扇形](http://blog.sina.com.cn/s/blog_15e866bbe0102y12s.html)
### 原理篇
</br>