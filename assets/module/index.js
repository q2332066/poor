/** EasyWeb spa v3.1.8 date:2020-05-04 License By http://easyweb.vip */
layui.define(["layer", "element", "setter", "layRouter", "admin"], function (g) {
    var i = layui.jquery;
    var m = layui.layer;
    var j = layui.element;
    var e = layui.setter;
    var q = layui.layRouter;
    var p = layui.admin;
    var k = ".layui-layout-admin>.layui-header";
    var f = ".layui-layout-admin>.layui-side>.layui-side-scroll";
    var b = ".layui-layout-admin>.layui-body";
    var l = b + ">.layui-tab";
    var a = b + ">.layui-body-header";
    var c = "admin-pagetabs";
    var d = "admin-side-nav";
    var o = false;
    var n = {mTabList: []};
    n.regRouter = function (r, s) {
        i.each(r, function (t, u) {
            if (s) {
                u = s(u)
            }
            if (u.url && u.url.indexOf("#") === 0) {
                q.reg(u.url, function (v) {
                    n.changeView(i.extend(v, {name: u.name, iframe: u.iframe}))
                })
            }
            if (u.children) {
                n.regRouter(u.children, s)
            }
        })
    };
    n.changeView = function (w) {
        var v = n.getHashPath(w);
        var t = b + ">div[lay-id]";
        if (e.pageTabs) {
            var r;
            i(l + ">.layui-tab-title>li").each(function () {
                if (i(this).attr("lay-id") === v) {
                    r = true
                }
            });
            if (!r) {
                if (n.mTabList.length + 1 >= e.maxTabNum) {
                    m.msg("最多打开" + e.maxTabNum + "个选项卡", {icon: 2, anim: 6});
                    return history.back()
                }
                o = true;
                j.tabAdd(c, {
                    id: v,
                    title: '<span class="title">' + (w.name || "") + "</span>",
                    content: '<div lay-id="' + v + '" lay-url="' + w.href + '"></div>'
                });
                if (v !== q.index) {
                    n.mTabList.push(w)
                }
                if (e.cacheTab) {
                    p.putTempData("indexTabs", n.mTabList)
                }
            }
            t = l + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + v + '"]';
            var u = i(t).attr("lay-url");
            if (w.href !== u) {
                layui.event.call(this, "admin", "destroy(" + v + ")");
                i(t).attr("lay-url", w.href);
                r = false;
                for (var s = 0; s < n.mTabList.length; s++) {
                    if (n.mTabList[s].href === u) {
                        n.mTabList[s] = w
                    }
                }
                if (e.cacheTab) {
                    p.putTempData("indexTabs", n.mTabList)
                }
            }
            if (!r || w.refresh) {
                if (w.refresh) {
                    layui.event.call(this, "admin", "destroy(" + v + ")")
                }
                n.renderView(w, t)
            }
            if (!w.noChange && !w.refresh) {
                j.tabChange(c, v)
            }
        } else {
            p.activeNav(w.href);
            if (i(t).length === 0) {
                i(b).html(['<div class="layui-body-header">', '   <span class="layui-body-header-title"></span>', '   <span class="layui-breadcrumb pull-right" lay-filter="admin-body-breadcrumb" style="visibility: visible;"></span>', "</div>", '<div lay-id="' + v + '" lay-url="' + w.href + '"></div>'].join(""))
            } else {
                layui.event.call(this, "admin", "destroy(" + i(t).attr("lay-id") + ")");
                i(t).attr("lay-id", v).attr("lay-url", w.href)
            }
            i('[lay-filter="admin-body-breadcrumb"]').html(n.getBreadcrumbHtml(v));
            n.mTabList.splice(0, n.mTabList.length);
            if (v === q.index) {
                n.setTabTitle(i(w.name).text() || i(f + ' [href="#/' + q.index + '"]').text() || "主页")
            } else {
                n.mTabList.push(w);
                n.setTabTitle(w.name)
            }
            n.renderView(w, t);
            if (e.cacheTab) {
                p.putTempData("indexTabs", n.mTabList)
            }
        }
        if (p.getPageWidth() <= 768) {
            p.flexible(true)
        }
        i(".layui-table-tips-c").trigger("click")
    };
    n.renderView = function (u, s, t) {
        var r = i(s);
        if (!t) {
            t = r.parent()
        }
        if (!u.iframe) {
            p.showLoading({elem: t, size: ""});
            p.ajax({
                url: e.viewPath + "/" + u.path.join("/") + e.viewSuffix,
                data: u.search,
                dataType: "html",
                success: function (x) {
                    p.removeLoading(t);
                    if (typeof x !== "string") {
                        x = JSON.stringify(x)
                    }
                    if (x.indexOf("<tpl") === 0) {
                        var v = i("<div>" + x + "</div>"), w = {};
                        v.find("script,[tpl-ignore]").each(function (z) {
                            var A = i(this);
                            w["temp_" + z] = A[0].outerHTML;
                            A.after("${temp_" + z + "}").remove()
                        });
                        x = p.util.tpl(v.html(), u, e.tplOpen, e.tplClose);
                        for (var y in w) {
                            x = x.replace("${" + y + "}", w[y])
                        }
                    }
                    r.html(x);
                    p.renderPerm();
                    p.renderTpl(s + " [ew-tpl]")
                }
            })
        } else {
            r.html(['<div class="admin-iframe" style="-webkit-overflow-scrolling: touch;">', '   <iframe src="', u.iframe, '" class="admin-iframe" frameborder="0"></iframe>', "</div>"].join(""))
        }
    };
    n.loadHome = function (s) {
        var u = p.getTempData("indexTabs");
        n.regRouter([s]);
        if (e.pageTabs) {
            var t = q.routerInfo(s.url);
            q.index = n.getHashPath(t);
            n.changeView(i.extend(t, {name: s.name, iframe: s.iframe, noChange: true}));
            if (s.loadSetting !== false && e.cacheTab && u) {
                for (var r = 0; r < u.length; r++) {
                    n.changeView(i.extend(u[r], {noChange: true}))
                }
            }
        }
        p.removeLoading(undefined, false);
        q.init({index: s.url, notFound: e.routerNotFound})
    };
    n.openNewTab = function (r) {
        n.regRouter([r]);
        q.go(r.url)
    };
    n.closeTab = function (r) {
        j.tabDelete(c, n.getHashPath(r))
    };
    n.getHashPath = function (r) {
        if (!r || typeof r === "string") {
            r = q.routerInfo(r)
        }
        return r.path.join("/")
    };
    n.go = function (r) {
        q.go(r)
    };
    n.clearTabCache = function () {
        p.putTempData("indexTabs", null)
    };
    n.setTabTitle = function (s, r) {
        if (e.pageTabs) {
            if (!r) {
                r = n.getHashPath()
            }
            if (r) {
                i(l + '>.layui-tab-title>li[lay-id="' + r + '"] .title').html(s || "")
            }
        } else {
            if (s) {
                i(a + ">.layui-body-header-title").html(s);
                i(a).addClass("show");
                i(k).css("box-shadow", "0 1px 0 0 rgba(0, 0, 0, .03)")
            } else {
                i(a).removeClass("show");
                i(k).css("box-shadow", "")
            }
        }
    };
    n.setTabTitleHtml = function (r) {
        if (e.pageTabs) {
            return
        }
        if (!r) {
            return i(a).removeClass("show")
        }
        i(a).html(r);
        i(a).addClass("show")
    };
    n.getBreadcrumb = function (r) {
        if (!r) {
            r = i(b + ">div[lay-id]").attr("lay-id")
        }
        var t = [];
        var s = i(f).find('[href="#/' + r + '"]');
        if (s.length > 0) {
            t.push(s.text().replace(/(^\s*)|(\s*$)/g, ""))
        }
        while (true) {
            s = s.parent("dd").parent("dl").prev("a");
            if (s.length === 0) {
                break
            }
            t.unshift(s.text().replace(/(^\s*)|(\s*$)/g, ""))
        }
        return t
    };
    n.getBreadcrumbHtml = function (s) {
        var u = n.getBreadcrumb(s);
        var t = s === q.index ? "" : ('<a href="#/' + q.index + '">首页</a>');
        for (var r = 0; r < u.length - 1; r++) {
            if (t) {
                t += '<span lay-separator="">/</span>'
            }
            t += ("<a><cite>" + u[r] + "</cite></a>")
        }
        return t
    };
    n.renderSide = function (v, r, y, x, t, w) {
        if (typeof r === "function") {
            t = x;
            x = y;
            y = r;
            r = undefined
        }
        if ("Array" !== p.util.isClass(v)) {
            r = v.tpl;
            y = v.callback;
            x = v.tplOpen;
            t = v.tplClose;
            w = v.format;
            v = v.data
        }

        function u(A) {
            for (var z = A.length - 1; z >= 0; z--) {
                if (w) {
                    A[z] = w(A[z])
                }
                if (A[z].children) {
                    u(A[z].children)
                }
                if (A[z].show === false) {
                    A.splice(z, 1)
                } else {
                    if (!A[z].target) {
                        A[z].target = "_self"
                    }
                    if (!A[z].url) {
                        A[z].url = "javascript:;"
                    }
                }
            }
        }

        u(v);
        var s = p.util.tpl(r || i("#sideNav").html() || "", v, x || e.tplOpen, t || e.tplClose);
        if (y) {
            return y(s, {
                data: v, side: f, render: function () {
                    j.render("nav", "admin-side-nav")
                }
            })
        }
        i(f + ">.layui-nav").html(s);
        j.render("nav", "admin-side-nav")
    };
    var h = ".layui-layout-admin .site-mobile-shade";
    if (i(h).length === 0) {
        i(".layui-layout-admin").append('<div class="site-mobile-shade"></div>')
    }
    i(h).click(function () {
        p.flexible(true)
    });
    if (e.pageTabs && i(l).length === 0) {
        i(b).html(['<div class="layui-tab" lay-allowClose="true" lay-filter="', c, '" lay-autoRefresh="', e.tabAutoRefresh == true, '">', '   <ul class="layui-tab-title"></ul><div class="layui-tab-content"></div>', "</div>", '<div class="layui-icon admin-tabs-control layui-icon-prev" ew-event="leftPage"></div>', '<div class="layui-icon admin-tabs-control layui-icon-next" ew-event="rightPage"></div>', '<div class="layui-icon admin-tabs-control layui-icon-down">', '   <ul class="layui-nav" lay-filter="admin-pagetabs-nav">', '      <li class="layui-nav-item" lay-unselect>', '         <dl class="layui-nav-child layui-anim-fadein">', '            <dd ew-event="closeThisTabs" lay-unselect><a>关闭当前标签页</a></dd>', '            <dd ew-event="closeOtherTabs" lay-unselect><a>关闭其它标签页</a></dd>', '            <dd ew-event="closeAllTabs" lay-unselect><a>关闭全部标签页</a></dd>', "         </dl>", "      </li>", "   </ul>", "</div>"].join(""));
        j.render("nav", "admin-pagetabs-nav")
    }
    j.on("nav(" + d + ")", function (s) {
        var r = i(s).attr("href");
        if (r.indexOf("#") !== 0 || i(l).attr("lay-autoRefresh") != "true") {
            return
        }
        if (!o) {
            p.refresh(r.substring(1), true)
        }
    });
    j.on("tab(" + c + ")", function () {
        var s = i(this).attr("lay-id");
        var r = i(l + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + s + '"]').attr("lay-url");
        p.activeNav(r);
        p.rollPage("auto");
        if (i(l).attr("lay-autoRefresh") == "true" && !o) {
            p.refresh(r, true)
        } else {
            q.go(r)
        }
        o = false;
        p.resizeTable(0);
        layui.event.call(this, "admin", "show(" + s + ")");
        layui.event.call(this, "admin", "tab({*})", {layId: s})
    });
    j.on("tabDelete(" + c + ")", function (s) {
        if (s.index > 0 && s.index <= n.mTabList.length) {
            var r = n.getHashPath(n.mTabList[s.index - 1].href);
            layui.event.call(this, "admin", "destroy(" + r + ")");
            n.mTabList.splice(s.index - 1, 1);
            if (e.cacheTab) {
                p.putTempData("indexTabs", n.mTabList)
            }
            layui.event.call(this, "admin", "tabDelete({*})", {layId: r})
        }
        if (i(l + ">.layui-tab-title>li.layui-this").length === 0) {
            i(l + ">.layui-tab-title>li:last").trigger("click")
        }
    });
    i(document).off("click.navMore").on("click.navMore", "[nav-bind]", function () {
        var r = i(this).attr("nav-bind");
        i('ul[lay-filter="' + d + '"]').addClass("layui-hide");
        i('ul[nav-id="' + r + '"]').removeClass("layui-hide");
        i(k + ">.layui-nav .layui-nav-item").removeClass("layui-this");
        i(this).parent(".layui-nav-item").addClass("layui-this");
        if (p.getPageWidth() <= 768) {
            p.flexible(false)
        }
        layui.event.call(this, "admin", "nav({*})", {navId: r})
    });
    if (e.openTabCtxMenu && e.pageTabs) {
        layui.use("contextMenu", function () {
            if (!layui.contextMenu) {
                return
            }
            i(l + ">.layui-tab-title").off("contextmenu.tab").on("contextmenu.tab", "li", function (s) {
                var r = i(this).attr("lay-id");
                layui.contextMenu.show([{
                    icon: "layui-icon layui-icon-refresh", name: "刷新当前", click: function () {
                        j.tabChange(c, r);
                        var t = i(l + '>.layui-tab-content>.layui-tab-item>div[lay-id="' + r + '"]').attr("lay-url");
                        if ("true" != i(l).attr("lay-autoRefresh")) {
                            p.refresh(t)
                        }
                    }
                }, {
                    icon: "layui-icon layui-icon-close-fill ctx-ic-lg", name: "关闭当前", click: function () {
                        p.closeThisTabs(r)
                    }
                }, {
                    icon: "layui-icon layui-icon-unlink", name: "关闭其他", click: function () {
                        p.closeOtherTabs(r)
                    }
                }, {
                    icon: "layui-icon layui-icon-close ctx-ic-lg", name: "关闭全部", click: function () {
                        p.closeAllTabs()
                    }
                }], s.clientX, s.clientY);
                return false
            })
        })
    }
    g("index", n)
});