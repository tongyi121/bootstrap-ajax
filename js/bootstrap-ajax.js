/* ====================================================================
 * bootstrap-ajax.js v0.4.0
 * ====================================================================
 * Copyright (c) 2012, Eldarion, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 *     * Neither the name of Eldarion, Inc. nor the names of its contributors may
 *       be used to endorse or promote products derived from this software without
 *       specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ==================================================================== */
/*
 *fork by tongyi121,
 *add something remove something in my idea.
 */

/*global Spinner:true*/
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};
!function ($) {

    'use strict';

    var Ajax = function () {
    };

    Ajax.prototype.click = function (e) {
        var $this = $(this),
            url = $this.attr('href'),
            data = $this.attr('data-data'),
            method = $this.attr('data-method'),
            beforeCallback = $this.attr('data-before-callback'),
            successCallback = $this.attr('data-success-callback'),
            completeCallback = $this.attr('data-complete-callback'),
            confirmInfo = $this.attr('data-confirm');
        if (!method) {
            method = 'get'
        }

        if (data) {
            data = $.parseJSON(data.replaceAll("'", "\""));
        }

        e.preventDefault();
        if (confirmInfo) {
            if (bootbox != undefined)
                bootbox.confirm(confirmInfo, function (confirmed) {
                    if (confirmed)
                        processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);
                });
            else if (confirm(confirmInfo))
                processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);
        } else
            processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);
    };

    Ajax.prototype.submit = function (e) {
        var $this = $(this),
            url = $this.attr('action') ,
            data = $this.serialize(),
            method = $this.attr('method'),
            beforeCallback = $this.attr('data-before-callback'),
            successCallback = $this.attr('data-success-callback'),
            completeCallback = $this.attr('data-complete-callback');

        e.preventDefault();

        if (!$this.find("input,select,textarea").not("[type=submit]").jqBootstrapValidation("hasErrors")) {
            $this.find("input[type=submit],button[type=submit]").attr("disabled", "disabled");
            processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);

        }
    };
    //TO DO 要搞清楚应用场景
    Ajax.prototype.cancel = function (e) {
        var $this = $(this),
            selector = $this.attr('data-cancel-closest');
        e.preventDefault();
        $this.closest(selector).remove()
    };
    function executeFunctionByName(functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
    }

    function processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback) {
        $.ajax({
            url: url,
            type: method,
            data: data,
            success: function (data, textStatus) {
                processData(data, $this);
                if (successCallback)
                    executeFunctionByName(successCallback, window, data, textStatus);
            },
            beforeSend: function (jqXHR, settings) {
                spinForReplaceOrAppend($this, true);
                if (beforeCallback)
                    executeFunctionByName(beforeCallback, window, jqXHR, settings);
            },
            complete: function (jqXHR, textStatus) {
                spinForReplaceOrAppend($this, false);
                if (completeCallback)
                    executeFunctionByName(completeCallback, window, jqXHR, textStatus);
            },
            error: function (result) {
                processError($this, result);
            }
        })
    }


    var spinOpts = {radius: 30, length: 0, width: 10, color: '#C40000', trail: 40};

    function spin(selector, flag) {
        var opts = (flag == true ? spinOpts : false);
        $(selector).spin(opts);
    }

    function spinForReplaceOrAppend($el, flag) {
        var replace_selector = $el.attr('data-replace'),
            append_selector = $el.attr('data-append');
        if (replace_selector) {
            spin(replace_selector, flag);
        }
        if (append_selector) {
            spin(append_selector, flag);
        }
    }

    function spinForRefresh($el, flag) {
        var refresh_selector = $el.attr('data-refresh');
        if (refresh_selector) {
            spin(refresh_selector, flag)
        }
    }


    function processData(data, $el) {
        if (data.location) {
            window.location.href = data.location
        } else {
            var replace_selector = $el.attr('data-replace'),
                append_selector = $el.attr('data-append') ,
                dataType = $el.attr('data-data-type'),
                refresh_selector = $el.attr('data-refresh');

            if (replace_selector) {
                if (dataType == 'json'){
                    $(replace_selector).html(data.html).bootAjax();
                    if(data.callback){
                        var params=data.callbackParams?data.callbackParams:{};
                        executeFunctionByName(data.callback, window,params);
                    }

                }

                else
                    $(replace_selector).html(data).bootAjax();
            }

            if (append_selector) {
                if (dataType == 'json'){
                    $(append_selector).append(data.html).bootAjax();
                    if(data.callback)
                        executeFunctionByName(data.callback, window);
                }else
                    $(append_selector).append(data).bootAjax();
            }
            if (refresh_selector) {
                $.each($(refresh_selector), function (index, value) {
                    var url = $(value).data('refresh-url'),
                        data = $(value).attr('data-data'),
                        method = $(value).attr('method'),
                        dataType = $(value).attr('data-data-type'),
                        beforeCallback = $(value).attr('data-before-callback'),
                        successCallback = $(value).attr('data-success-callback'),
                        completeCallback = $(value).attr('data-complete-callback');
                    if (!method) {
                        method = 'GET';
                    }
                    if (data) {
                        data = $.parseJSON(data.replaceAll("'", "\""));
                    }
                    $.ajax({
                        url: url,
                        type: method,
                        data: data,
                        beforeSend: function (jqXHR, settings) {
                            spinForRefresh($(value), true);
                            if (beforeCallback)
                                executeFunctionByName(beforeCallback, window, jqXHR, settings);
                        },
                        success: function (data, textStatus) {
                            if (dataType == 'json'){
                                $(value).html(data.html).bootAjax();
                                if(data.callback)
                                    executeFunctionByName(data.callback, window);
                            }else
                                $(value).html(data).bootAjax();
                            if (successCallback)
                                executeFunctionByName(successCallback, window, data, textStatus);
                        },
                        complete: function (jqXHR, settings) {
                            spinForRefresh($(value), false);
                            if (completeCallback)
                                executeFunctionByName(completeCallback, window, jqXHR, settings);
                        },
                        error: function (result) {
                            $(value).html(buildErrorMsg(result));
                        }
                    })
                })
            }

        }
    }

    function processError($el, result) {

        var msg = buildErrorMsg(result),
            replace_selector = $el.attr('data-replace'),
            append_selector = $el.attr('data-append');

        if (replace_selector) {
            $(replace_selector).html(msg);
        }
        if (append_selector) {
            $(append_selector).append(msg);
        }
    }

    function buildErrorMsg(result) {
        var errorMsg = "";
        var title = "";
        if (result.status == 404)
            title = "<strong>错误！</strong>HTTP 404-请求的页面不存在或链接错误";
        else if (result.status == 0)
            title = "<strong>错误！</strong> 服务无效，请检查服务器状态";
        else if (result.status == 500)
            title = "<strong>错误！</strong>HTTP 500内部服务器错误";
        else
            title = "<strong>错误！</strong>" + result.status;

        errorMsg = result.responseText;

        return '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3>' + title + '</h3></div><div class="modal-body">' + errorMsg + '</div><div class="modal-footer"><a href="#" class="btn btn-inverse" data-dismiss="modal"><i class="icon-off icon-white"></i>Close</a></div>';

    }

    $.fn.bootAjax = function (config) {
        if (!config)
            return this.each(function () {
                var $this = $(this);
                $this.find('a.ajax').bind('click', Ajax.prototype.click);
                $this.find('form.ajax').bind('submit', Ajax.prototype.submit);
                $this.find('a[data-cancel-closest]').bind('click', Ajax.prototype.cancel);
                $this.find('.datepicker').datepicker();
                //初始化校验
                $this.find("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
            });
        else {
            var $this = $(this),
                url = config.url,
                data = config.data,
                method = config.method,
                dataType = config.dataType,
                beforeCallback = config.beforeSend,
                successCallback = config.success,
                completeCallback = config.complete,
                confirmInfo = config.confirm;
            if (!method) {
                method = 'GET';
            }

            if (!url) {
                alert("缺少url属性")
            }


            if (confirmInfo) {
                if (bootbox != undefined)
                    bootbox.confirm(confirmInfo, function (confirmed) {
                        if (confirmed)
                            processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);
                    });
                else if (confirm(confirmInfo))
                    processAjax($this, method, url, data, beforeCallback, successCallback, completeCallback);
            } else {
                $.ajax({
                    url: url,
                    type: method,
                    data: data,
                    success: function (data, textStatus) {
                        if (dataType == 'json')
                            $this.html(data.html).bootAjax();
                        else
                            $this.html(data).bootAjax();
                        if (successCallback)
                            executeFunctionByName(successCallback, window, data, textStatus);
                    },
                    beforeSend: function (jqXHR, settings) {
                        spin($this, true);
                        if (beforeCallback)
                            executeFunctionByName(beforeCallback, window, jqXHR, settings);
                    },
                    complete: function (jqXHR, textStatus) {
                        spinForReplaceOrAppend($this, false);
                        if (completeCallback)
                            executeFunctionByName(completeCallback, window, jqXHR, textStatus);
                    },
                    error: function (result) {
                        processError($this, result);
                    }
                })
            }

        }
    };


    $(function () {
        $('body').bootAjax();
    })
}(window.jQuery);
