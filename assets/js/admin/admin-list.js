layui.use(['laydate', 'table'], function () {
    let laydate = layui.laydate, //日期
        table = layui.table, //表格
        form = layui.form,
        $ = layui.jquery; //jquery
    window.$ = $;
    //执行一个laydate实例
    laydate.render({
        elem: '#start' //指定元素
    });
    //执行一个laydate实例
    laydate.render({
        elem: '#end' //指定元素
    });
    //执行一个 table 实例
    let userTable = table.render({
        elem: '#admin_table'
        , url: base_path + 'user/list' //数据接口
        , title: '用户表'
        , page: true //开启分页
        // ,toolbar: 'default' //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
        // ,totalRow: true //开启合计行
        , parseData: function (res) {
            return {
                data: res.payload.records,
                count: res.payload.total,
                code: res.code
            }
        }
        , height: 'full-200'
        , limit: 10
        , limits: [10, 20, 50, 100]
        , headers: getToken()
        , cols: [[ //表头
            {type: 'checkbox'}
            , {field: 'username', title: '用户名'}
            , {field: 'screenName', title: '昵称'}
            , {title: '头像', templet: function(v){
                return '<img class="layui-nav-img" src="' + image_path + v.logo + '">';
            }}
            , {field: 'phone', title: '手机号码'}
            , {field: 'createDate', title: '创建时间'}
            , {title:'是否禁用', templet: '#checkboxTpl', unresize: true}
            , {title: '操作', align: 'center', toolbar: '#barUser'}
        ]]
    });
    $("#admin_add").click(function () {
        x_admin_show_back({title: '添加用户', url: './admin-add.html', end: function () {
                reloadTable();
            }
        });
    });
    function reloadTable(){
        userTable.reload();
    }
    //监听行工具事件
    table.on('tool(table)', function (obj) { //注：tool 是工具条事件名，test 是 table 原始容器的属性 lay-filter="对应的值"
        var data = obj.data //获得当前行数据
            , layEvent = obj.event; //获得 lay-event 对应的值
        if (layEvent === 'detail') {
            layer.msg('查看操作');
        } else if (layEvent === 'del') {
            layer.confirm('真的删除行么', function (index) {
                // obj.del(); //删除对应行（tr）的DOM结构
                layer.close(index);
                //向服务端发送删除指令
                fengtoos.server({
                    url: base_path + 'user/' + data.id,
                    type: 'delete',
                    success: function(resp) {
                        if(resp & resp.success){
                            layer.msg('删除成功', {icon: 1});
                        } else {
                            layer.msg(resp.msg, {icon: 2});
                        }
                    }
                })
            });
        } else if (layEvent === 'edit') {
            layer.msg('编辑操作');
        }
    });
    //监听锁定操作
    form.on('checkbox(lockDemo)', function(obj){
        fengtoos.server({
            url: base_path + 'user/action/' + obj.value,
            type: 'post',
            data: {status: obj.elem.checked?2:1},
            success: function(resp){
                if(resp && resp.success){
                    //发异步，把数据提交给后台
                    layer.msg("操作成功", {icon: 6, time: 800}, function () {
                        //刷新父页面的列表
                        reloadTable();
                    });

                } else {
                    layer.msg("操作失败", {icon: 5});
                }
            }
        });
        //layer.tips(this.value + ' ' + this.name + '：'+ obj.elem.checked, obj.othis);
    });
});
function delAll(argument) {
    var data = tableCheck.getData();
    layer.confirm('确认要删除吗？' + data, function (index) {
        //捉到所有被选中的，发异步进行删除
        layer.msg('删除成功', {icon: 1});
        $(".layui-form-checked").not('.header').parents('tr').remove();
    });
}