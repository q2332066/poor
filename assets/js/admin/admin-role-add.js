layui.config({
    version: 'true',   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: '../../assets/module/'
}).extend({
    eleTree: "eleTree/eleTree"
}).use(['form', 'layer', 'eleTree', 'setter', 'index', 'admin'],
    function() {
        var $ = layui.jquery,
            form = layui.form,
            eleTree = layui.eleTree,
            layer = layui.layer,
            setter = layui.setter,
            admin = layui.admin;

        var el;

        //自定义验证规则
        form.verify({
            name: function(value) {
                if (value.length < 5) {
                    return '昵称至少得5个字符啊';
                }
            }
        });

        admin.req('min/est/roleauthority/tree', {parent: "all"},function(resp){
            if(resp && resp.code == 200){
                setTimeout(function() {
                    el = eleTree.render({
                        elem: '#ele',
                        highlightCurrent: true,
                        emptText: '暂无数据',
                        showCheckbox: true,
                        request: {
                            name: "name"
                        },
                        data: resp.data
                    });
                    el.expandAll();

                    var id = getQueryString("id");
                    if(id){
                        admin.req('role/' + id, {}, function(data) {
                            form.val("main-form", data.data);
                            let auths = data.data.authorizations;
                            let ids = [];
                            for(let i in auths){
                                ids.push(auths[i].id)
                            }
                            el.expandAll();
                            el.setChecked(ids, true);
                        }, 'get');
                    }
                },100);
            } else {

            }
        }, 'get')

        //监听提交
        form.on('submit(add)', function(data) {
            delete data.field["eleTree-node"];
            //权限项
            let auths = el.getChecked(true, false);
            for(let i in auths){
                delete auths[i]["elem"];
                delete auths[i]["othis"];
            }

            data.field.authorizations = auths;
            admin.req('role/add', JSON.stringify(data.field), function(resp){
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