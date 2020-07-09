layui.config({
    version: 'true',   // 更新组件缓存，设为true不缓存，也可以设一个固定值
    base: 'assets/module/'
}).extend({
    eleTree: "eleTree/eleTree"
}).use(['form', 'eleTree', 'layer'], function () {
    var form = layui.form,
        $ = layui.$,
        eleTree = layui.eleTree,
        layer = layui.layer,
        setter = layui.setter,
        admin = layui.admin;
    window.$ = $;

    var el = eleTree.render({
        elem: '#organizationTree1',
        url: setter.baseServer + 'min/est/roleauthority/tree',
        headers: {"token":setter.getToken()},
        response: {
            statusName: "code",
            statusCode: 200,
            dataName: "data"
        },
        highlightCurrent: true,
        emptText: '暂无数据',
        showLine: true,
        request: {
            name: "name"
        },
        contextmenuList: [
            {eventName: "create", text: "新增"},
            {eventName: "update", text: "编辑"},
            {eventName: "delete", text: "删除"},
            {eventName: "cp", text: "复制"},
        ],
        // showCheckbox: true,
        lazy: true,
        load: function(data, callback){
            // this.filter=options.elem.attr("lay-filter");
            admin.req('min/est/roleauthority/tree', {parent: data.id},function(resp){
                    if(resp && resp.code == 200){
                        setTimeout(function() {
                            callback(resp.data);
                        },100);
                    } else {
                        callback(null);
                    }
                },'get')
        }
    });

    var resetForm = function(){
        form.val("tree-form", {
            id: "",
            parent: "",
            parentName: "根目录",
            name: "",
            url: "",
            icon: "",
            description: "",
            code: "",
            iframe: "",
            sortOrder: 1,
            status: 0
        })
        $("#icon-show").attr("class", "")
    }

    $("#newRoot").click(function(){
        resetForm();
    });

    //查看事件
    eleTree.on("nodeClick(tree)",function(d) {
        if(d.data.currentData.parent == "" || d.data.currentData.parent == null){
            d.data.currentData.parent = "";
            d.data.currentData.parentName = "根目录";
        }
        form.val("tree-form", d.data.currentData)
        $("#icon-show").attr("class", "layui-icon " + d.data.currentData.icon)
    })

    //新增事件
    eleTree.on("nodeCreate(tree)",function(d) {
        form.val("tree-form", {
            id: "",
            parent: d.data.id,
            parentName: d.data.name,
            name: "",
            url: "",
            icon: "",
            iframe: "",
            code: d.data.code,
            description: ""
        })
        $("#icon-show").attr("class", "")
    })

    //复制事件
    eleTree.on("nodeCp(tree)",function(d) {
        d.data.id = "";
        if(d.data.parent == "" || d.data.parent == null){
            d.data.parent = "";
            d.data.parentName = "根目录";
        }
        form.val("tree-form", d.data)
        $("#icon-show").attr("class", "layui-icon " + d.data.icon)
    })

    //编辑事件
    eleTree.on("nodeUpdate(tree)",function(d) {
        if(d.data.currentData.parent == "" || d.data.currentData.parent == null){
            d.data.currentData.parent = "";
            d.data.currentData.parentName = "根目录";
        }
        form.val("tree-form", d.data)
        $("#icon-show").attr("class", "layui-icon " + d.data.icon)
    })

    //删除事件
    eleTree.on("nodeDelete(tree)",function(d) {
        layer.confirm('真的删除行么', function (index) {
            //向服务端发送删除指令
            admin.req('min/est/roleauthority/' + d.data.id, {},function(resp) {
                if(resp && resp.code == 0){
                    layer.alert("删除成功", {icon: 6}, function(index) {
                        el = el.reload();
                        layer.close(index);
                    });
                } else {
                    layer.msg(resp.msg, {icon: 2});
                }
                layer.close(index);
            }, 'delete')
        });
    })

    //自定义验证规则
    form.verify({
        name: function(value) {
            if (value.length < 5) {
                return '昵称至少得5个字符啊';
            }
        },
        pass: [/(.+){6,12}$/, '密码必须6到12位'],
        repass: function(value) {
            if ($('#L_pass').val() != $('#L_repass').val()) {
                return '两次密码不一致';
            }
        }
    });

    //监听提交
    form.on('submit(submit)', function(data) {
        admin.req('min/est/roleauthority/add', JSON.stringify(data.field), function(resp){
            if(resp && resp.code == 0){
                //发异步，把数据提交给php
                layer.alert("保存成功", {
                    icon: 6
                }, function(index) {
                    el = el.reload();
                    resetForm();
                    layer.close(index);
                });
            } else {
                layer.msg(resp.msg, {icon: 2});
            }
        }, "post", {contentType: 'application/json'})
        return false;
    });
});