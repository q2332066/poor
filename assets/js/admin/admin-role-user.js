layui.config({
    version: 'true',   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: '../../assets/module/'
}).extend({
    eleTree: "eleTree/eleTree"
}).use(['form', 'layer', 'eleTree', 'transfer', 'setter', 'index', 'admin'],
    function() {
        var $ = layui.jquery,
            form = layui.form,
            transfer = layui.transfer,
            admin = layui.admin,
            setter = layui.setter,
            layer = layui.layer;

        var getValueList = function(){
            let org = [];
            admin.req("min/est/user/role/" + getQueryString("id"), {},function(resp) {
                if(resp && resp.code == 0){
                    for(let i in resp.data){
                        org.push(resp.data[i].uid)
                    }
                } else {
                    layer.msg(resp.msg, {icon: 2});
                }
            }, 'get')
            console.log(org)
            return org;
        }

        var getUserList = function(){
            let val = null;
            admin.req('min/est/user/selectUser', JSON.stringify({page: 0, limit: 10000}),function(resp) {
                if (resp && resp.code == 0) {
                    val = resp.data
                } else {
                    layer.msg(resp.msg, {icon : 2})
                }
            }, 'post', {contentType: 'application/json'})
            console.log(val)
            return val;
        }

        //渲染
        transfer.render({
            elem: '#transfer'  //绑定元素
            ,data: getUserList()
            ,value: getValueList()
            ,title: ["可分配用户", "已分配用户"]
            ,showSearch: true
            ,text: {
                none: '无数据' //没有数据时的文案
                ,searchNone: '无匹配数据' //搜索无匹配数据时的文案
            }
            ,id: 'roleuser' //定义索引
            ,parseData: function(res){
                return {
                    "value": res.uid //数据值
                    ,"title": res.userName //数据标题
                    ,"disabled": res.disabled  //是否禁用
                    ,"checked": res.checked //是否选中
                }
            }
        });


        //监听提交
        form.on('submit(add)', function(data) {
            //权限项
            let users = transfer.getData('roleuser');
            let ids = [];
            for(var i in users){
                ids.push({userId: users[i].value, roleId: getQueryString("id")});
            }

            admin.req('role/add/user/' + getQueryString("id"), JSON.stringify(ids), function(resp){
                if(resp && resp.code == 0){
                    //发异步，把数据提交给php
                    layer.alert("保存成功", {
                        icon: 6
                    }, function() {
                        //关闭当前frame
                        xadmin.close();
                        // 可以对父窗口进行刷新
                        xadmin.father_reload();
                    });
                } else {
                    layer.msg(resp.msg, {icon: 2});
                }
            }, 'post', {contentType: 'application/json'})
            return false;
        });
    });

var getQueryString = function(propname) {
    var reg = new RegExp('(^|&)' + propname + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}