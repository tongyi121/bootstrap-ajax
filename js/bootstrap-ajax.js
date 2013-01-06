/* ====================================================================
 * bootstrap-ajax.js v0.5.0
 * ====================================================================
 *rewrite by tongyi121,
 *add something remove something in my idea.
 */

String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
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
!function ($) {
    'use strict';
    var Ajax = function () {
    };
    Ajax.prototype.click = function (e) {
        var $this = $(this),
            url = $this.attr('href'),
            data = $this.attr('data-data'),
            params = bindParams($this);

        if (!params.method) {
            params.method = 'GET'
        }
        if (data) {
            params.data = $.parseJSON(data.replaceAll("'", "\""));
        }
        params.url = url;
        e.preventDefault();
        bootAjax(params);
    };
    Ajax.prototype.submit = function (e) {
        var $this = $(this),
            params = bindParams($this);
        params.url = $this.attr('action');
        params.data = $this.serialize();
        if (!params.method) {
            params.method = 'POST'
        }
        e.preventDefault();
        bootAjax(params);
    };

    function bindParams($this) {
        return {
            beforeCallback: $this.attr('data-before-callback'),
            successCallback: $this.attr('data-success-callback'),
            completeCallback: $this.attr('data-complete-callback'),
            confirmInfo: $this.attr('data-confirm'),
            replace_selector: $this.attr('data-replace'),
            append_selector: $this.attr('data-append'),
            dataType: $this.attr('data-data-type'),
            refresh_selector: $this.attr('data-refresh'),
            method: $this.attr('data-method')
        }
    }

    var spinOpts = {radius: 30, length: 0, width: 10, color: '#C40000', trail: 40};

    function spin(selector, flag) {
        var opts = (flag == true ? spinOpts : false);
        $(selector).spin(opts);
    }

    function bootAjax(params) {
        var confirmInfo = params.confirmInfo;
        if (confirmInfo) {
            if (bootbox != undefined)
                bootbox.confirm(confirmInfo, function (confirmed) {
                    if (confirmed)
                        processAjax(params);
                });
            else if (confirm(confirmInfo))
                processAjax(params);
        } else {
            processAjax(params);
        }
    }

    function processAjax(params) {
        if (params.replace_selector)
            params.el = $(params.replace_selector);
        if (params.append_selector) {
            params.el = $(params.append_selector);
            params.append = true;
        }
        var $el = params.el,
            dataType = params.dataType,
            append = params.append,
            successCallback = params.successCallback,
            refresh_selector = params.refresh_selector ,
            beforeCallback = params.beforeCallback,
            completeCallback = params.completeCallback,
            replacePrevent = false,
            refreshPrevent = false;
        $.ajax({
            url: params.url,
            type: params.method,
            data: params.data,
            success: function (data, textStatus) {
                if (dataType == 'json') {
                    if (data.replacePrevent == true)
                        replacePrevent = true;
                    if (data.refreshPrevent)
                        refreshPrevent = true;

                }
                if (!replacePrevent) {
                    if (dataType == 'json') {
                        if(data.html){
                            if (append) {
                                $el.append(data.html).bootAjax();
                            } else
                                $el.html(data.html).bootAjax();
                        }

                    } else {
                        if (append) {
                            $el.append(data).bootAjax();
                        } else
                            $el.html(data).bootAjax();
                    }


                }
                if (dataType == 'json') {
                    if (data.callback) {

                        executeFunctionByName(data.callback, window, data.callbackParams ? data.callbackParams : {});
                    }
                }
                if (successCallback)
                    executeFunctionByName(successCallback, window, data, textStatus);

                if (refresh_selector && !refreshPrevent) {
                    processRefresh($(refresh_selector))
                }
            },
            beforeSend: function (jqXHR, settings) {
                if ($el)
                    spin($el, true);

                if (beforeCallback)
                    executeFunctionByName(beforeCallback, window, jqXHR, settings);
            },
            complete: function (jqXHR, textStatus) {
                if ($el)
                    spin($el, false);
                if (completeCallback)
                    executeFunctionByName(completeCallback, window, jqXHR, textStatus);
            },
            error: function (result) {
                if ($el)
                    spin($el, false);
                processError($el, result);
            }
        })
    }

    function processRefresh($el) {
        var params = bindParams($el);
        params.el = $el;
        params.url = $el.data('refresh-url');
        bootAjax(params);
    }

    function processError($el, result, append) {
        var errorMsg, title;
        if (result.status == 404)
            title = "<strong>错误！</strong>HTTP 404-请求的页面不存在或链接错误";
        else if (result.status == 0)
            title = "<strong>错误！</strong> 服务无效，请检查服务器状态";
        else if (result.status == 500)
            title = "<strong>错误！</strong>HTTP 500内部服务器错误";
        else
            title = "<strong>错误！</strong>" + result.status;

        errorMsg = result.responseText;

        var errorHtml = '<div class="modal-header"><button type="button" class="close" data-dismiss="modal">×</button><h3>' + title + '</h3></div><div class="modal-body">' + errorMsg + '</div><div class="modal-footer"><a href="#" class="btn btn-inverse" data-dismiss="modal"><i class="icon-off icon-white"></i>Close</a></div>';
        if (append)
            $el.append(errorHtml);
        else
            $el.html(errorHtml);
    }

    $.fn.bootAjax = function (params) {
        if (params) {
            params.el = $(this);
            bootAjax(params);
        } else {
            return this.each(function () {
                var $this = $(this);
                $this.find('a.ajax').bind('click', Ajax.prototype.click);
                $this.find('form.ajax').bind('submit', Ajax.prototype.submit);
                //以下依赖于datepicker与jqBootstrapValidation
                $this.find('.datepicker').datepicker();
                $this.find("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
            });
        }

    };

    $(function () {
        $("body").bootAjax();
    })

}(window.jQuery);
