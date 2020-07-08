/** EasyWeb spa v3.1.8 date:2020-05-04 License By http://easyweb.vip */
layui.config({
    version: 'true',   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: 'assets/module/'
}).extend({
    steps: 'steps/steps',
    notice: 'notice/notice',
    cascader: 'cascader/cascader',
    dropdown: 'dropdown/dropdown',
    fileChoose: 'fileChoose/fileChoose',
    Split: 'Split/Split',
    Cropper: 'Cropper/Cropper',
    tagsInput: 'tagsInput/tagsInput',
    citypicker: 'city-picker/city-picker',
    introJs: 'introJs/introJs',
    zTree: 'zTree/zTree'
}).use(['layer', 'setter', 'index', 'admin'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var setter = layui.setter;
    var index = layui.index;
    var admin = layui.admin;
    /* 检查是否登录 */
   
    if (!setter.getToken()) {
      return location.replace('components/template/login/login.html');
    }

    $("#logout").click(function(){
        setter.removeToken();
        window.location.href = "components/template/login/login.html"
    });

    /* 获取用户信息 */
    // admin.req('min/est/user/get-login-info', function (res) {
    
    //     if (200 === res.code) {
    //         setter.putUser(res.user);  // 缓存用户信息
    //         admin.renderPerm();  // 移除没有权限的元素
    //         $('#level').text(res.user);
    //     } else {
    //         layer.msg('获取用户失败', {icon: 2, anim: 6});
    //     }

    // });
  
    $.ajax({
        url:setter.baseServer +'min/est/user/get-login-info',
        type:'GET',
        // headers:{
        //     token:setter.getToken
        // },
        headers: {"token":layui.data(layui.setter.tableName)['token']},
        success:function(res){
            
            if (20000 === res.code) {
                // 设置用户信息
                window.user_info = res.data&&res.data.userInfo?res.data.userInfo:{}
                setter.putUser(res.user);  // 缓存用户信息
                admin.renderPerm();  // 移除没有权限的元素
                
                $('#level').text(res.data.userInfo.showName);
                          if (res.data.userInfo.level == '0') {
                            $("#userlevel").text("超级管理员");
                            } else if (res.data.userInfo.level == '1') {
                                $("#userlevel").text("市级管理员");
                            } else if (res.data.userInfo.level == '2') {
                                $("#userlevel").text("区县管理员");
                            } else if (res.data.userInfo.level == '3') {
                                $("#userlevel").text("乡镇管理员");
                            } else if (res.data.userInfo.level == '4') {
                                $("#userlevel").text("安置点管理员");
                            } else {
                                "";
                            }
                
            } else if(20001 == res.code){
                window.location.href='components/template/login/login.html'
            } else {
                layer.msg('获取用户失败', {icon: 2, anim: 6});
            }
        },
     

    })

    // /* 加载侧边栏 */
    // admin.req('min/est/Authority/selectAuthority', function (res) {
    //     index.regRouter(res.data);  // 注册路由s
    //     index.renderSide(res);  // 渲染侧边栏
    //     // 加载主页
    //     index.loadHome({
    //         url: '#/console/workplace',
    //         name: '<i class="layui-icon layui-icon-home"></i>'
    //     });
    // });

    $.ajax({
        url:setter.baseServer +'min/est/roleauthority/selectAuth',
        headers: {"token":layui.data(layui.setter.tableName)['token']},
        success:function(res){
          
            index.regRouter(res.data);  // 注册路由s
            index.renderSide(res);  // 渲染侧边栏
            // 加载主页
            index.loadHome({
                url:'#/layui/tcs',
                iframe:'http://192.168.101.57:8080/day25/DemoServlet3 ',
            });
        },
      

    })


});
