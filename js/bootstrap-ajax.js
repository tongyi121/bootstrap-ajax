/* ====================================================================
 * bootstrap-ajax.js v0.1.0
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

/*global Spinner:true*/
if (typeof Spinner !== 'undefined') { // http://fgnass.github.com/spin.js/
    $.fn.spin = function (opts) {
        this.each(function () {
            var $this = $(this),
                data = $this.data();

            if (data.spinner) {
                data.spinner.stop();
                delete data.spinner;
            }
            if (opts !== false) {
                data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
            }
        });
        return this;
    };
}
!function ($) {

    'use strict'; // jshint ;_;

    var Ajax = function () {
    };

    Ajax.prototype.click = function (e) {
        var $this = $(this),
            url = $this.attr('href'),
            data = $this.attr('data-data'),
            method = $this.attr('data-method'),
            successCallback = $this.attr('data-success-callback');
        if (!method) {
            method = 'get'
        }
        e.preventDefault();
        processAjax($this, method, url, data, successCallback);
    };

    Ajax.prototype.submit = function (e) {
        var $this = $(this),
            url = $this.attr('action') ,
            data = $this.serialize(),
            method = $this.attr('method'),
            successCallback = $this.attr('data-success-callback');
        $this.find("input[type=submit],button[type=submit]").attr("disabled", "disabled");
        e.preventDefault();
        processAjax($this, method, url, data, successCallback);
    };
    //TO DO 要搞清楚应用场景
    Ajax.prototype.cancel = function (e) {
        var $this = $(this),
            selector = $this.attr('data-cancel-closest');
        e.preventDefault();
        $this.closest(selector).remove()
    };

    function processAjax($this, method, url, data, successCallback) {
        $.ajax({
            url: url,
            type: method,
            data: data,
            success: function (data, textStatus) {
                processData(data, $this);
                if (successCallback)
                    eval(successCallback + ".call(this,data,textStatus)");
            },
            beforeSend: function (XMLHttpRequest) {
                spin($this, true);
            },
            complete: function (XMLHttpRequest, textStatus) {
                spin($this, false);
            },
            error: function (result) {
                processError($this, result);
            }
        })
    }

    function spin($el, flag) { // http://fgnass.github.com/spin.js/
        if (typeof $.fn.spin !== 'undefined') {
            var replace_selector = $el.attr('data-replace'),
                append_selector = $el.attr('data-append') ,
                refresh_selector = $el.attr('data-refresh'),
                opts = (flag == true ? {radius: 30, length: 0, width: 10, color: '#C40000', trail: 40} : false);

            if (replace_selector) {
                $(replace_selector).spin(opts);
            }
            if (append_selector) {
                $(append_selector).spin(opts);
            }
            if (refresh_selector) {
                $(refresh_selector).spin(opts);
            }
        }
    }

    function processData(data, $el) {
        if (data.location) {
            window.location.href = data.location
        } else {
            var replace_selector = $el.attr('data-replace'),
                append_selector = $el.attr('data-append') ,
                refresh_selector = $el.attr('data-refresh');

            if (replace_selector) {
                $(replace_selector).html(data.html).bootAjax();
            }

            if (append_selector) {
                $(append_selector).append(data.html).bootAjax();
            }
            if (refresh_selector) {
                $.each($(refresh_selector), function (index, value) {
                    var url = $(value).data('refresh-url'),
                        data = $(value).attr('data-data'),
                        method = $(value).attr('method'),
                        successCallback = $(value).attr('data-success-callback');
                    if (!method) {
                        method = 'GET';
                    }
                    $.ajax({
                        url: url,
                        type: method,
                        data: data,
                        success: function (data, textStatus) {
                            $(value).html(data.html).bootAjax();
                            if (successCallback)
                                eval(successCallback + ".call(this,data,textStatus)");
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

    function buildErrorMsg(result){
        var errorMsg = "";
        if (result.status == 404)
            errorMsg = "<strong>错误！</strong>HTTP 404-请求的页面不存在或链接错误";
        else if (result.status == 0)
            errorMsg = "<strong>错误！</strong> 服务无效，请检查服务器状态";
        else if (result.status == 500)
            errorMsg = "<strong>错误！</strong>HTTP 500内部服务器错误";
        else
            errorMsg = "错误代号:" + result.status + ' 错误信息：' + result.statusText;
        return '<div class="alert alert-error">' + errorMsg + '</div>'
    }

    $.fn.bootAjax = function () {
        return this.each(function () {
            var $this = $(this);
            $this.find('a.ajax').bind('click', Ajax.prototype.click);
            $this.find('form.ajax').bind('submit', Ajax.prototype.submit);
            $this.find('a[data-cancel-closest]').bind('click', Ajax.prototype.cancel);
        })
    };

    $(function () {
        $('body').bootAjax();
    })


}(window.jQuery);
