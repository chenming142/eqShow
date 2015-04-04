!function(win, ng, undefined) {
    ng.module("scene.create", [
        "app.directives.editor",
        "services.scene",
        "confirm-dialog",
        "services.modal",
        "app.directives.component",
        "services.pagetpl",
        "app.directives.addelement",
        "services.history",
        "scene.create.console"
    ]);
    ng.module("scene.create")
        .controller("CreateSceneCtrl", ["$timeout", "$compile", "$rootScope", "$scope", "$routeParams", "$route", "$location", "sceneService", "pageTplService", "$modal", "ModalService", "$window", "historyService",
            function ($timeout, $compile, $rootScope, $scope, $routeParams, $route, $location, sceneService, pageTplService, $modal, ModalService, $window, historyService) {
                //TODO: 根据指定的场景的指定 pageIdx，加载场景页面信息并解析执行
                function loadPageInfo(pageIdx, isNewPage, d) {
                    $scope.loading = !0;
                    $("#editBG").hide();
                    $scope.pageId = $scope.pages[pageIdx - 1].id;
                    sceneService.getSceneByPage($scope.pageId, isNewPage, d).then(function (data) {
                        $scope.loading = !1;
                        $scope.tpl = data.data;

                        curPageTpl = JSON.stringify($scope.tpl);
                        $scope.sceneId = $scope.tpl.obj.sceneId;

                        if ($scope.tpl.obj.properties && ($scope.tpl.obj.properties.image || $scope.tpl.obj.properties.scratch)) {
                            if ($scope.tpl.obj.properties.scratch) {
                                $scope.scratch = $scope.tpl.obj.properties.scratch;
                            } else {
                                if ($scope.tpl.obj.properties.image) {
                                    $scope.scratch.image = $scope.tpl.obj.properties.image;
                                    $scope.scratch.percentage = $scope.tpl.obj.properties.percentage;
                                    $scope.tpl.obj.properties.tip && ($scope.scratch.tip = $scope.tpl.obj.properties.tip);
                                }
                            }
                            $scope.effectName = "涂抹";
                            ng.forEach($scope.scratches, function (value) {
                                if (value.path == $scope.scratch.image.path)$scope.scratch.image = value;
                            });
                            ng.forEach($scope.percentages, function (value) {
                                if (value.value == $scope.scratch.percentage.value)$scope.scratch.percentage = value;
                            });
                        } else {
                            $scope.scratch = {};
                            $scope.scratch.image = $scope.scratches[0];
                            $scope.scratch.percentage = $scope.percentages[0];
                        }
                        if ($scope.tpl.obj.properties && $scope.tpl.obj.properties.finger) {
                            $scope.finger = $scope.tpl.obj.properties.finger;
                            $scope.effectName = "指纹";
                            ng.forEach($scope.fingerZws, function (value) {
                                if (value.path == $scope.finger.zwImage.path)$scope.finger.zwImage = value;
                            });
                            ng.forEach($scope.fingerBackgrounds, function (value) {
                                if (value.path == $scope.finger.bgImage.path)$scope.finger.bgImage = value;
                            });
                        } else {
                            $scope.finger = {};
                            $scope.finger.zwImage = $scope.fingerZws[0];
                            $scope.finger.bgImage = $scope.fingerBackgrounds[0];
                        }

                        if ($scope.tpl.obj.properties
                            && $scope.tpl.obj.properties.effect
                            && "money" == $scope.tpl.obj.properties.effect.name) {
                            $scope.effectName = "数钱";
                            $scope.money = {
                                tip: $scope.tpl.obj.properties.effect.tip
                            }
                        }
                        if ($scope.tpl.obj.properties && $scope.tpl.obj.properties.fallingObject) {
                            $scope.falling = $scope.tpl.obj.properties.fallingObject;
                            ng.forEach($scope.fallings, function (value) {
                                if (value.path == $scope.falling.src.path)$scope.falling.src = value;
                            });
                            $scope.effectName = "环境";
                        } else {
                            $scope.falling = {src: $scope.fallings[0], density: 2};
                        }

                        if (isNewPage || d) {
                            $location.$$search = {};
                            $location.search("pageIdx", ++pageIdx);
                            $scope.getScenePages();
                        }
                        $scope.pageNum = pageIdx;
                        curSceneName = $scope.tpl.obj.scene.name;
                        $("#nr").empty();

                        var pageTpl = ng.copy($scope.tpl.obj);
                        pageTpl.elements = historyService.addPage(pageTpl.id, pageTpl.elements);
                        sceneService.templateEditor.parse({
                            def: $scope.tpl.obj,
                            appendTo: "#nr",
                            mode: "edit"
                        });
                        $rootScope.$broadcast("dom.changed");
                    }, function () {
                        $scope.loading = !1
                    });
                }

                function emitRoute() {
                    //r.pushForCurrentRoute("scene.save.success.nopublish", "notify.success");
                }

                $scope.loading = !1;
                $scope.PREFIX_FILE_HOST = PREFIX_FILE_HOST;
                $scope.tpl = {};

                var curPageTplId, curSceneName = "", curPageTpl = "", originPageName = "";

                $scope.templateType = 1;
                $scope.categoryId = -1;
                $scope.isEditor = $rootScope.isEditor;

                $scope.createComp = sceneService.createComp;
                $scope.createCompGroup = sceneService.createCompGroup;
                $scope.updateCompPosition = sceneService.updateCompPosition;
                $scope.updateCompAngle = sceneService.updateCompAngle;
                $scope.updateCompSize = sceneService.updateCompSize;
                $scope.openAudioModal = sceneService.openAudioModal;
                //$scope.isAllowToAccessScrollImage = o.isAllowToAccess(4);

                $scope.scratch || ($scope.scratch = {});
                $scope.finger || ($scope.finger = {});

                $scope.effectList = [{
                    type: "scratch",
                    name: "涂抹",
                    src: CLIENT_CDN + "assets/images/create/waterdrop.jpg"
                }, {
                    type: "finger",
                    name: "指纹",
                    src: CLIENT_CDN + "assets/images/create/fingers/zhiwen1.png"
                }, {
                    type: "money",
                    name: "数钱",
                    src: CLIENT_CDN + "assets/images/create/money_thumb1.jpg"
                }, {
                    type: "fallingObject",
                    name: "环境",
                    src: CLIENT_CDN + "assets/images/create/falling.png"
                }];
                $scope.scratches = [{
                    name: "水滴",
                    path: CLIENT_CDN + "assets/images/create/waterdrop.jpg"
                }, {
                    name: "细沙",
                    path: CLIENT_CDN + "assets/images/create/sand.jpg"
                }, {
                    name: "花瓣",
                    path: CLIENT_CDN + "assets/images/create/flowers.jpg"
                }, {
                    name: "金沙",
                    path: CLIENT_CDN + "assets/images/create/goldsand.jpg"
                }, {
                    name: "白雪",
                    path: CLIENT_CDN + "assets/images/create/snowground.jpg"
                }, {
                    name: "模糊",
                    path: CLIENT_CDN + "assets/images/create/mohu.jpg"
                }, {
                    name: "落叶",
                    path: CLIENT_CDN + "assets/images/create/leaves.jpg"
                }, {
                    name: "薄雾",
                    path: CLIENT_CDN + "assets/images/create/smoke.png"
                }];
                $scope.percentages = [{
                    id: 1,
                    value: .15,
                    name: "15%"
                }, {
                    id: 2,
                    value: .3,
                    name: "30%"
                }, {
                    id: 3,
                    value: .6,
                    name: "60%"
                }];

                $scope.fingerZws = [{
                    name: "粉色指纹",
                    path: CLIENT_CDN + "assets/images/create/fingers/zhiwen1.png"
                }, {
                    name: "白色指纹",
                    path: CLIENT_CDN + "assets/images/create/fingers/zhiwen2.png"
                }, {
                    name: "蓝色指纹",
                    path: CLIENT_CDN + "assets/images/create/fingers/zhiwen3.png"
                }];
                $scope.fingerBackgrounds = [{
                    name: "粉红回忆",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg1.jpg"
                }, {
                    name: "深蓝花纹",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg2.jpg"
                }, {
                    name: "淡绿清新",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg3.jpg"
                }, {
                    name: "深紫典雅",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg4.jpg"
                }, {
                    name: "淡紫水滴",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg5.jpg"
                }, {
                    name: "蓝白晶格",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg6.jpg"
                }, {
                    name: "蓝色水滴",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg7.jpg"
                }, {
                    name: "朦胧绿光",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg8.jpg"
                }, {
                    name: "灰色金属",
                    path: CLIENT_CDN + "assets/images/create/fingers/bg9.jpg"
                }];
                $scope.fallings = [{
                    name: "福字",
                    path: CLIENT_CDN + "assets/images/create/fallings/fuzi1.png",
                    rotate: 180,
                    vy: 3
                }, {
                    name: "红包",
                    path: CLIENT_CDN + "assets/images/create/fallings/hongbao2.png",
                    rotate: 180,
                    vy: 3
                }, {
                    name: "绿枫叶",
                    path: CLIENT_CDN + "assets/images/create/fallings/lvfengye.png",
                    rotate: 180,
                    vy: 3
                }, {
                    name: "星星",
                    path: CLIENT_CDN + "assets/images/create/fallings/xing.png",
                    rotate: 180,
                    vy: 3
                }, {
                    name: "雪花",
                    path: CLIENT_CDN + "assets/images/create/fallings/snow.png",
                    rotate: 0,
                    vy: 1
                }];

                $scope.scratch.image = $scope.scratches[0];
                $scope.scratch.percentage = $scope.percentages[0];
                $scope.finger.zwImage = $scope.fingerZws[0];
                $scope.finger.bgImage = $scope.fingerBackgrounds[0];

                $scope.showPageEffect = false;
                $scope.openPageSetPanel = function () {
                    if(!$scope.showPageEffect){
                        $scope.showPageEffect = true;
                        $('<div id="modalBackdrop" class="modal-backdrop fade in" ng-class="{in: animate}" ng-style="{\'z-index\': 1040 + (index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="" style="z-index: 1040;"></div>')
                            .appendTo("body").click(function () {
                                $scope.showPageEffect = false;
                                $scope.$apply();
                                $(this).remove();
                            });
                    }
                };
                $scope.openOneEffectPanel = function (a) {
                    $scope.showPageEffect = !1;
                    $("#modalBackdrop").remove();
                    if(a.type){
                        $scope.effectType = a.type;
                    }else if(a.image || a.scratch){
                        $scope.effectType = "scratch";
                    }else if(a.finger){
                        $scope.effectType = "finger";
                    }else if(a.fallingObject){
                        $scope.effectType = "fallingObject";
                    }else{
                        $scope.effectType = a.effect.name;
                    }
                    $('<div id="modalBackdrop1" class="modal-backdrop fade in" ng-class="{in: animate}" ng-style="{\'z-index\': 1040 + (index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="" style="z-index: 1040;"></div>')
                        .appendTo("body")
                        .click(function () {
                            $scope.effectType = "";
                            $scope.$apply();
                            $(this).remove();
                        });
                };

                var uploadModal = null;
                $scope.openUploadModal = function () {
                    if (!uploadModal) {
                        uploadModal = $modal.open({
                            windowClass: "upload-console",
                            templateUrl: "my/upload.tpl.html",
                            controller: "UploadCtrl",
                            resolve: {
                                category: function () {
                                    return {
                                        categoryId: "0",
                                        fileType: "1",
                                        scratch: "scratch"
                                    }
                                }
                            }
                        }).result.then(function (data) {
                            $scope.scratch.image.path = $scope.PREFIX_FILE_HOST + data;
                            $scope.scratch.image.name = "";
                            uploadModal = null;
                        }, function () {
                            uploadModal = null;
                        });
                    }
                };
                $scope.cancel = function () {};
                $scope.cancelEffect = function () {
                    $scope.effectType = "";
                    $("#modalBackdrop1").remove();
                };
                $scope.saveEffect = function (a) {
                    $scope.tpl.obj.properties = {};
                    if ("scratch" == $scope.effectType){
                        $scope.tpl.obj.properties.scratch = a;
                        $scope.effectName = "涂抹";
                    }else if ("finger" == $scope.effectType){
                        $scope.tpl.obj.properties.finger = a;
                        $scope.effectName = "指纹";
                    }else if ("money" == $scope.effectType) {
                        if (a && a.tip && i(a.tip) > 24){
                            alert("提示文字不能超过24个字符！");
                            return void($scope.tpl.obj.properties = null);
                        }
                        if(!a)a = {tip: "握紧钱币，数到手抽筋吧！"};
                        $scope.tpl.obj.properties.effect = {name: "money",tip: a.tip};
                        $scope.effectName = "数钱";
                    }
                    if("fallingObject" == $scope.effectType){
                        $scope.tpl.obj.properties.fallingObject = a;
                        $scope.effectName = "环境"
                    }
                    $scope.cancelEffect();
                };

                var $stylePanel = null, $cropPanel = null;
                $scope.$on("showCropPanel", function (event, data) {
                    var $element = $(".content").eq(0);
                    if ($cropPanel) {
                        $rootScope.$broadcast("changeElemDef", data);
                        $cropPanel.show();
                    } else {
                        $compile("<div crop-image></div>")($scope);
                    }
                    $element.append($cropPanel);
                });
                $scope.$on("showStylePanel", function (event, data) {
                    var $element = $(".content").eq(0);
                    if ($stylePanel) {
                        $stylePanel.show();
                    } else {
                        if ("style" == data.activeTab) {
                            $stylePanel = $compile('<div style-modal active-tab="style"></div>')($scope);
                        } else if ("anim" == data.activeTab) {
                            $stylePanel = $compile('<div style-modal active-tab="anim"></div>')($scope);
                        }
                        $element.append($stylePanel);
                    }
                });
                $scope.$on("hideStylePanel", function () {
                    $stylePanel && $stylePanel.hide()
                });

                $scope.$on("dom.changed", function () {
                    $compile($("#nr"))($scope);
                });
                $scope.$on("text.click", function (event, element) {
                    $("#btn-toolbar").remove();
                    $("body").append($compile("<toolbar></toolbar>")($scope));
                    var top = $(element).offset().top;
                    $timeout(function () {
                        $("#btn-toolbar").css("top", top - 50);
                        $("#btn-toolbar").show();
                        $("#btn-toolbar").bind("click mousedown", function (event) {
                            event.stopPropagation();
                        });
                        $(element).wysiwyg_destroy();
                        $(element).wysiwyg();
                        element.focus();
                    });
                });

                $scope.getScenePages = function () {
                    var sceneId = $routeParams.sceneId;
                    //根据指定sceneId，获取该场景的所有页面信息
                    sceneService.getScenePages(sceneId).then(function (data) {
                        $scope.pages = data.data.list;
                        ng.forEach($scope.pages, function (value, key) {
                            value.name || (value.name = "第" + (key + 1) + "页");
                        });
                        var pageIdx = $location.search().pageIdx ? $location.search().pageIdx : $scope.pages[0].num;
                        loadPageInfo(pageIdx);
                    });
                };
                //TODO: 获取指定场景的所有页面
                $scope.getScenePages();
                $scope.editableStatus = [];
                $scope.removeScratch = function (event) {
                    event.stopPropagation();
                    $scope.tpl.obj.properties = null;
                };
                $scope.updatePosition = function (a) {
                    var b, c, d = f.tpl.obj.elements,
                        e = [];
                    for (c = 0; c < d.length; c++)
                        if ("3" == d[c].type) {
                            d[c].num = 0, e.push(d[c]), d.splice(c, 1);
                            break
                        }
                    for (b = 0; b < a.length; b++)
                        for (c = 0; c < d.length; c++)
                            if (d[c].num == a[b]) {
                                d[c].num = b + 1, e.push(d[c]), d.splice(c, 1);
                                break
                            }
                    f.tpl.obj.elements = e
                };
                $scope.updateEditor = function () {
                    $("#nr").empty();
                    sceneService.templateEditor.parse({
                        def: $scope.tpl.obj,
                        appendTo: "#nr",
                        mode: "edit"
                    });
                    $compile($("#nr"))($scope);
                };

                $scope.stopCopy = function () {
                    q = !1;
                };
                $scope.getOriginPageName = function (page) {
                    originPageName = page.name;
                };
                var C = !1;
                $scope.saveScene = function (save, callback) {
                    if (!C) {
                        C = !0;
                        if (curPageTpl == JSON.stringify($scope.tpl)) {
                            callback && callback();
                            if (save) {
                                if (!$scope.tpl.obj.scene.publishTime || $scope.tpl.obj.scene.updateTime > $scope.tpl.obj.scene.publishTime) {
                                    emitRoute();
                                } else {
                                    //r.pushForCurrentRoute("scene.save.success.published", "notify.success");
                                }
                            }
                            return void(C = !1);
                        }
                        if ("" === $scope.tpl.obj.scene.name)$scope.tpl.obj.scene.name = curSceneName;
                        $scope.tpl.obj.scene.name = $scope.tpl.obj.scene.name.replace(/(<([^>]+)>)/gi, "");

                        if (sceneService.getSceneObj().obj.scene.image
                            && sceneService.getSceneObj().obj.scene.image.bgAudio) {
                            if (!$scope.tpl.obj.scene.image)$scope.tpl.obj.scene.image = {};
                            $scope.tpl.obj.scene.image.bgAudio = sceneService.getSceneObj().obj.scene.image.bgAudio
                        }
                        sceneService.resetCss();
                        $scope.tpl.obj.scene.image.isAdvancedUser = $rootScope.isAdvancedUser || $rootScope.isVendorUser ? !0 : !1;
                        sceneService.saveScene($scope.tpl.obj).then(function () {
                            C = !1;
                            $scope.tpl.obj.scene.updateTime = (new Date).getTime();
                            curPageTpl = ng.toJson($scope.tpl);
                            curPageTplId && (sceneService.recordTplUsage(curPageTplId), curPageTplId = null);
                            callback && callback();
                            save && emitRoute();
                        }, function () {
                            C = !1;
                        });
                    }
                };
                $scope.publishScene = function () {
                    return f.tpl.obj.scene.publishTime && f.tpl.obj.scene.updateTime <= f.tpl.obj.scene.publishTime && curPageTpl == b.toJson(f.tpl) ? void j.path("my/scene/" + f.sceneId) : void f.saveScene(null, function () {
                        k.publishScene(f.tpl.obj.sceneId).then(function (a) {
                            a.data.success && (r.pushForNextRoute("scene.publish.success", "notify.success"), q = !1, j.path(f.tpl.obj.scene.publishTime ? "my/scene/" + f.sceneId : "my/sceneSetting/" + f.sceneId))
                        })
                    })
                };
                $scope.exitScene = function () {
                    q = !1;
                    JSON.parse(curPageTpl);
                    if (curPageTpl == ng.toJson($scope.tpl)) {
                        $window.history.back();
                    } else {
                        ModalService.openConfirmDialog({
                            msg: "是否保存更改内容？",
                            confirmName: "保存",
                            cancelName: "不保存"
                        }, function () {
                            $scope.saveScene();
                            $window.history.back();
                        }, function () {
                            $window.history.back();
                        });
                    }
                };
                $scope.duplicatePage = function () {
                    f.saveScene(null, function () {
                        loadPageInfo(f.pageNum, !1, !0)
                    })
                };
                $scope.deletePage = function (a) {
                    a.stopPropagation(), f.loading || (f.loading = !0, k.deletePage(f.tpl.obj.id).then(function () {
                        f.loading = !1, j.$$search = {}, f.pages.length == f.pageNum ? (f.pages.pop(), j.search("pageIdx", --f.pageNum), loadPageInfo(f.pageNum, !1, !1)) : (f.pages.splice(f.pageNum - 1, 1), j.search("pageIdx", f.pageNum), loadPageInfo(f.pageNum, !1, !1))
                    }, function () {
                        f.loading = !1
                    }))
                };
                $scope.removeBG = function (a) {
                    a.stopPropagation();
                    var b, c = f.tpl.obj.elements;
                    for (b = 0; b < c.length; b++)
                        if (3 == c[b].type) {
                            c.splice(b, 1);
                            var d;
                            for (d = b; d < c.length; d++) c[d].num--;
                            break
                        }
                    $("#nr .edit_area").parent().css({
                        backgroundColor: "transparent",
                        backgroundImage: "none"
                    }), $("#editBG").hide()
                };
                $scope.removeBGAudio = function (a) {
                    a.stopPropagation(), delete f.tpl.obj.scene.image.bgAudio
                };
                $scope.exitPageTplPreview = function () {
                    $("#nr").empty();
                    sceneService.templateEditor.parse({
                        def: $scope.tpl.obj,
                        appendTo: "#nr",
                        mode: "edit"
                    });
                    $rootScope.$broadcast("dom.changed");
                };
                $scope.chooseThumb = function () {
                    $modal.open({
                        windowClass: "console",
                        templateUrl: "scene/console/bg.tpl.html",
                        controller: "BgConsoleCtrl",
                        resolve: {
                            obj: function () {
                                return {
                                    fileType: "0"
                                }
                            }
                        }
                    }).result.then(function (data) {
                            if (!$scope.tpl.obj.properties)$scope.tpl.obj.properties = {};
                            $scope.tpl.obj.properties.thumbSrc = data.data
                        }, function () {
                            $scope.tpl.obj.properties.thumbSrc = null;
                        });
                };
                $scope.sortableOptions = {
                    placeholder: "ui-state-highlight ui-sort-position",
                    containment: "#containment",
                    update: function (a, b) {
                        var c = b.item.sortable.dropindex + 1,
                            d = f.pages[b.item.sortable.index].id;
                        f.saveScene(null, function () {
                            k.changePageSort(c, d).then(function () {
                                loadPageInfo(c, !1, !1, !0), j.$$search = {}, j.search("pageIdx", c), f.pageNum = c
                            })
                        })
                    }
                };
                $scope.pageChildLabel = function () {
                    var a, b = [];
                    for (a = 0; a < $scope.pageLabelAll.length; a++) {
                        if ($scope.pageLabelAll[a].ischecked)b.push($scope.pageLabelAll[a].id);
                    }
                    pageTplService.updataChildLabel(b, $scope.pageIdTag).then(function () {
                        alert("分配成功！");
                        $route.reload();
                    }, function () {
                    });
                };

                $scope.myName = [{name: "我的"}];
                //$scope.$watch(function() {return o.currentUser}, function(a) {a && (f.userProperty = a)}, !0);
                $(".scene_title").on("paste", function (event) {
                    event.preventDefault();
                    var pasteEvent = (event.originalEvent || event).clipboardData.getData("text/plain") || prompt("Paste something..");
                    document.execCommand("insertText", !1, pasteEvent);
                });

                var generateTemplate = function () {
                    if (!$rootScope.mySceneId && $scope.userProperty.property) {
                        $scope.userPropertyObj = JSON.parse($scope.userProperty.property);
                        $rootScope.mySceneId = $scope.userPropertyObj.myTplId;
                    }
                    var tplInfo = $.extend(!0, {}, $scope.tpl.obj);
                    tplInfo.sceneId = $rootScope.mySceneId ? $rootScope.mySceneId : null;

                    sceneService.saveMyTpl(tplInfo).then(function (data) {
                        alert("成功生成我的模板");
                        $rootScope.mySceneId = data.data.obj;

                        sceneService.previewScene($rootScope.mySceneId).then(function (info) {
                            $scope.myName[0].active = !0;
                            $scope.myPageTpls = mySceneOrTplInfo[$rootScope.mySceneId] = info.data.list
                        })
                    })
                }, mySceneOrTplInfo = {};
                $scope.creatMyTemplate = function () {
                    generateTemplate();
                };

                /**
                 * 根据指定的 tplPageType， 获取该类型下的所有TagLabel
                 * @param tplPageType
                 */
                $scope.getPageTagLabel = function (tplPageType) {
                    if (PageLabels[tplPageType]) {
                        $scope.pageLabel = PageLabels[tplPageType];
                        K();
                    } else {
                        pageTplService.getPageTagLabel(tplPageType).then(function (data) {
                            $scope.pageLabel = PageLabels[tplPageType] = data.data.list;
                            K();
                        });
                    }
                };
                $scope.pageLabelAll = [];
                var J, K = function () {
                    //TODO: $scope.pageIdTag ??
                    console.log("$scope.pageIdTag: " + $scope.pageIdTag);
                    //获取指定 pageIdTag 下的所有pageTpl
                    pageTplService.getPageTagLabelCheck($scope.pageIdTag).then(function (data) {
                        J = data.data.list;
                        for (var b = 0; b < $scope.pageLabel.length; b++) {
                            var c = {
                                id: $scope.pageLabel[b].id,
                                name: $scope.pageLabel[b].name
                            };
                            for (var d = 0; d < J.length; d++) {
                                if (J[d].id === $scope.pageLabel[b].id) {
                                    c.ischecked = !0;
                                    break;
                                }
                                c.ischecked = !1
                            }
                            $scope.pageLabelAll.push(c);
                        }
                    });
                };

                /**
                 * 获取指定的 TagLabelId 和 tplPageType， 获取满足的所有PageTpl
                 * @param id
                 * @param bizType
                 */
                $scope.getPageTplTypestemp = function (id, bizType) {
                    pageTplService.getPageTplTypestemp(id, bizType).then(function (data) {
                        $scope.categoryId = id;
                        $scope.pageTpls = data.data.list && data.data.list.length > 0 ? data.data.list : [];

                        if ($scope.otherCategory.length > 0) {
                            var c = $scope.childCatrgoryList[0];
                            for (var d = 0; d < $scope.otherCategory.length; d++) {
                                if ($scope.categoryId == $scope.otherCategory[d].id) {
                                    $scope.childCatrgoryList[0] = $scope.otherCategory[d];
                                    $scope.otherCategory[d] = c;
                                }
                            }
                        }
                    });
                };
                var ensureCatrgory = function () {
                        //TODO: $scope.type??
                        console.log("$scope.type: " + $scope.type);
                        var catrgory = "1" == $scope.type ? 3 : 4;
                        if ($scope.childCatrgoryList && $scope.childCatrgoryList.length > catrgory) {
                            $scope.otherCategory = $scope.childCatrgoryList.slice(catrgory);
                            $scope.childCatrgoryList = $scope.childCatrgoryList.slice(0, catrgory);
                        } else {
                            $scope.otherCategory = [];
                        }
                    },
                    PageTpls = {},//当前已缓存的PageTpls
                    /**
                     * 获取指定类型下的所有PageTpl
                     * @param tplPageType
                     */
                    getPageTpls = function (tplPageType) {
                        if (PageTpls[tplPageType]) {
                            $scope.childCatrgoryList = PageTpls[tplPageType];
                            $scope.getPageTplTypestemp($scope.childCatrgoryList[0].id, tplPageType);
                            ensureCatrgory();
                        } else {
                            //获取指定的 tplPageType 类型下的TagLabel
                            pageTplService.getPageTagLabel(tplPageType).then(function (data) {
                                $scope.childCatrgoryList = PageTpls[tplPageType] = data.data.list;
                                $scope.getPageTplTypestemp($scope.childCatrgoryList[0].id, tplPageType);
                                ensureCatrgory();
                            });
                        }
                    },
                    PageLabels = {};
                $scope.getPageTplsByMyType = function () {
                    $scope.userPropertyObj = JSON.parse($scope.userProperty.property);
                    var property = $rootScope.mySceneId || $scope.userPropertyObj;
                    if (property) {
                        var mySceneOrTplId = $rootScope.mySceneId || $scope.userPropertyObj.myTplId;

                        sceneService.previewScene(mySceneOrTplId).then(function (data) {
                            $scope.myPageTpls = mySceneOrTplInfo[mySceneOrTplId] = data.data.list
                        });
                    } else {
                        $scope.myPageTpls = [];
                    }
                };
                /**
                 * 根据指定的 tplPageType， 获取该类型下的所有页面
                 * @param tplPageType
                 */
                $scope.getPageTplsByType = function (tplPageType) {
                    getPageTpls(tplPageType);
                };
                //TODO:获取所有页面的类型
                pageTplService.getPageTplTypes().then(function (data) {
                    $scope.pageTplTypes = data.data.list && data.data.list.length > 0
                        ? data.data.list.splice(0, 3)
                        : [];
                }).then(function () {
                    //获取指定类型下的所有模板页面
                    $scope.getPageTplsByType($scope.pageTplTypes[0].value);
                });
                /**
                 * 选择并插入模板页
                 * @param pageTplId
                 */
                $scope.insertPageTpl = function (pageTplId) {
                    $scope.loading = !0;
                    var loadPageTpl = function (pageTplId) {
                        //获取指定的场景模板页
                        sceneService.getSceneTpl(pageTplId).then(function (data) {
                            $scope.loading = !1;
                            //TODO: 当前使用的PageTplId
                            curPageTplId = data.data.obj.id;
                            console.log("curPageTplId: " + curPageTplId);
                            $scope.tpl.obj.elements = sceneService.getElements();
                            $("#nr").empty();
                            historyService.addPageHistory($scope.tpl.obj.id, $scope.tpl.obj.elements);
                            sceneService.templateEditor.parse({
                                def: $scope.tpl.obj,
                                appendTo: "#nr",
                                mode: "edit"
                            });
                            $rootScope.$broadcast("dom.changed");
                        }, function () {
                            $scope.loading = !1;
                        });
                    };
                    if ($scope.tpl.obj.elements && $scope.tpl.obj.elements.length > 0) {
                        ModalService.openConfirmDialog({
                            msg: "页面模板会覆盖编辑区域已有组件，是否继续？",
                            confirmName: "是",
                            cancelName: "取消"
                        }, function () {
                            loadPageTpl(pageTplId);
                        });
                    } else {
                        loadPageTpl(pageTplId);
                    }
                };
                //增加一页
                $scope.insertPage = function () {
                    $scope.saveScene(null, function () {
                        loadPageInfo($scope.pageNum, !0, !1);
                    });
                    if ($("#pageList").height() >= 360) {
                        $timeout(function () {
                            var $pageList = document.getElementById("pageList");
                            $pageList.scrollTop = $pageList.scrollHeight;
                        }, 200);
                    }
                };
                //切换上下或指定页
                $scope.navTo = function (page, index) {
                    $scope.pageList = !0;
                    if ($scope.isEditor && (1101 === $scope.sceneId || 1102 === $scope.sceneId || 1103 === $scope.sceneId)) {
                        $scope.pageLabelAll.length = 0;
                        $scope.pageIdTag = page.id;
                        $scope.getPageTagLabel();
                    }

                    if (page.id != $scope.tpl.obj.id) {
                        $scope.saveScene(null, function () {
                            loadPageInfo(index + 1);
                            $location.$$search = {};
                            $location.search("pageIdx", page.num);
                        });
                    }
                };
                //保存指定页名称
                $scope.savePageNames = function (page, index) {
                    if (!page.name)page.name = "第" + (index + 1) + "页";
                    $scope.tpl.obj.name = page.name;

                    if (originPageName != page.name) {
                        sceneService.savePageNames($scope.tpl.obj).then(function () {
                        });
                    }
                };

                $(win).bind("beforeunload", function () {
                    return "请确认您的场景已保存";
                });
                $scope.$on("$destroy", function () {
                    $(win).unbind("beforeunload");
                    historyService.clearHistory();
                });

                $scope.$on("history.changed", function () {
                    $scope.canBack = historyService.canBack($scope.tpl.obj.id);
                    $scope.canForward = historyService.canForward($scope.tpl.obj.id);
                });
                $scope.back = function () {
                    sceneService.historyBack();
                };
                $scope.forward = function () {
                    sceneService.historyForward();
                }
            }])
        .directive("changeColor", function () {
            return {
                link: function (a, b) {
                    b.bind("click", function () {
                        $(b).addClass("current")
                    })
                }
            }
        })
        .directive("thumbTpl", ["sceneService", function (a) {
            return {
                scope: {
                    localModel: "=myAttr"
                },
                link: function (b, c) {
                    $(c).empty(), a.templateEditor.parse({
                        def: b.localModel,
                        appendTo: c,
                        mode: "view"
                    }), $(".edit_area", c).css("transform", "scale(0.25) translateX(-480px) translateY(-729px)")
                }
            }
        }]);

    ng.module("scene.create.new", ["services.scene"]);
    ng.module("scene.create.new").controller("SceneNewCtrl", ["$scope", "$location", "sceneService", "items", function(a, c, d, e) {
        a.scene = {
            name: ""
        }, e && (a.scene.name = e.name), d.getSceneType().then(function(c) {
            if (a.scene.types = c.data.list, e) {
                var d = !0;
                b.forEach(a.scene.types, function(b) {
                    if (d) {
                        var f = "" + e.type;
                        b.value === f ? (a.scene.type = b, d = !1) : a.scene.type = c.data.list[0]
                    }
                })
            } else a.scene.type = c.data.list[0]
        }), a.create = function() {
            if ("" === a.scene.name.trim()) return void alert("请输入场景名称");
            var b = i(a.scene.name.trim());
            if (b > 48) return void alert("场景名称不能超过48个字符或24个汉字");
            if (e) {
                var f = {
                    id: e.id,
                    name: a.scene.name,
                    type: a.scene.type.value,
                    pageMode: a.scene.pageMode.id
                };
                d.createByTpl(f).then(function(a) {
                    c.path("scene/create/" + a.data.obj), c.search("pageId", 1)
                }, function() {})
            } else d.createBlankScene(a.scene.name, a.scene.type.value, a.scene.pageMode.id).then(function(a) {
                c.path("scene/create/" + a.data.obj), c.search("pageId", 1)
            });
            a.$close()
        }, a.cancel = function() {
            a.$dismiss()
        }, a.pagemodes = [{
            id: 2,
            name: "上下翻页"
        }, {
            id: 1,
            name: "左右翻页"
        }], a.scene.pageMode = a.pagemodes[0]
    }]);

    ng.module("scene", ["scene.create", "services.scene", "scene.create.new", "app.directives.addelement"]);
    ng.module("scene").controller("SceneCtrl", ["$window", "$scope", "$location", "sceneService", "$modal", function(b, c, d, e, f) {
        c.PREFIX_FILE_HOST = PREFIX_FILE_HOST,
            c.PREFIX_CLIENT_HOST = PREFIX_HOST,
            c.isActive = "scene",
            c.scene = {type: null},
            c.totalItems = 0,
            c.currentPage = 1,
            c.toPage = "",
            c.tabindex = 0,
            c.childcat = 0,
            c.order = "new";
        var g = 12,
            h = 0;
        c.pageChanged = function(a) {
            return i.targetPage = a, 1 > a || a > c.totalItems / 11 + 1 ? void alert("此页超出范围") : void c.getPageTpls(1, i.sceneType, i.tagId, a, g, c.order)
        },
            c.preview = function(b) {
                var c = PREFIX_HOST + "/view.html?sceneId=" + b;
                a.open(c, "_blank")
            },
            c.createScene = function(a) {
                f.open({
                    windowClass: "login-container",
                    templateUrl: "scene/createNew.tpl.html",
                    controller: "SceneNewCtrl",
                    resolve: {
                        items: function() {
                            return a
                        }
                    }
                })
            },
            c.getStyle = function(a) {
                return {
                    "background-image": "url(" + PREFIX_FILE_HOST + a + ")"
                }
            },
            c.show = function(a) {
                console.log(a.target), $(a.target).children(".cc").css("display", "block")
            },
            e.getSceneType().then(function(a) {
                c.pageTplTypes = a.data.list && a.data.list.length > 0 ? a.data.list : []
            }).then(function() {}),
            c.tplnew = function(a) {
                c.order = a, i.orderby = a, i.tagId ? c.getPageTpls(null, i.sceneType, i.tagId, h, g, a) : c.getPageTpls(1)
            };
        var i = {
                sceneType: null,
                tagId: "",
                orderby: "new",
                pageNo: "0",
                targetPage: ""
            },
            j = {};
        c.getPageTplsByType = function(a) {
            i.sceneType = a, c.childcat = a, c.categoryId = 0, j[a] ? (c.childCatrgoryList = j[a], c.getPageTpls(1, i.sceneType, c.childCatrgoryList[0].id, h, g, c.order)) : e.getPageTplTypesTwo(a, a).then(function(b) {
                c.childCatrgoryList = j[a] = b.data.list, c.getPageTpls(1, i.sceneType, c.childCatrgoryList[0].id, h, g, c.order)
            })
        },
            c.allpage = function(a) {
                i.sceneType = a, c.childcat = 0, c.getPageTpls(1), c.childCatrgoryList = []
            },
            c.getPageTpls = function(a, b, d, f) {
                var g = 11;
                c.categoryId = d, i.tagId = d, e.getPageTpls(a, b, d, f, g, i.orderby).then(function(a) {
                    a.data.list && a.data.list.length > 0 ? (c.tpls = a.data.list, c.totalItems = a.data.map.count, c.currentPage = a.data.map.pageNo, c.allPageCount = a.data.map.count, c.toPage = "") : c.tpls = []
                })
            },
            c.getPageTpls(1)
    }]);
}(window, window.angular);