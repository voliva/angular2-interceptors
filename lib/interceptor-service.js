"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var http_1 = require("@angular/http");
var Rx_1 = require("rxjs/Rx");
var InterceptorService = (function (_super) {
    __extends(InterceptorService, _super);
    function InterceptorService(backend, defaultOptions) {
        var _this = _super.call(this, backend, defaultOptions) || this;
        _this.interceptors = [];
        return _this;
    }
    /**
      Before interceptor
      patata
    */
    InterceptorService.prototype.addInterceptor = function (interceptor) {
        this.interceptors.push(interceptor);
    };
    /** Parent overrides **/
    InterceptorService.prototype.httpRequest = function (request) {
        var _this = this;
        request.options = request.options || {};
        request.options.headers = request.options.headers || new http_1.Headers();
        return this.runBeforeInterceptors(request)
            .flatMap(function (value, index) {
            // We return an observable that merges the result of the request plus the interceptorOptions we need
            return Rx_1.Observable.zip(_super.prototype.request.call(_this, value.url, value.options), Rx_1.Observable.of(value.interceptorOptions), function (response, options) {
                return {
                    response: response,
                    interceptorOptions: options
                };
            }).catch(function (err) {
                return Rx_1.Observable.of({
                    response: err,
                    interceptorOptions: value.interceptorOptions || {}
                });
            });
        })
            .catch(function (err) {
            // If it's a cancel, create a fake response and pass it to next interceptors
            if (err.error == "cancelled") {
                var response = new http_1.ResponseOptions({
                    body: null,
                    status: 0,
                    statusText: "intercepted",
                    headers: new http_1.Headers()
                });
                return Rx_1.Observable.of({
                    response: new http_1.Response(response),
                    intercepted: true,
                    interceptorStep: err.position,
                    interceptorOptions: err.interceptorOptions
                });
            }
            else {
            }
        })
            .flatMap(function (value, index) {
            var startOn = (value.intercepted) ? value.interceptorStep : _this.interceptors.length - 1;
            return _this.runAfterInterceptors(value, startOn);
        })
            .flatMap(function (value, index) {
            return Rx_1.Observable.of(value.response);
        })
            .flatMap(function (value, index) {
            if (!value.ok)
                return Rx_1.Observable.throw(value);
            return Rx_1.Observable.of(value);
        });
    };
    InterceptorService.prototype.request = function (url, options) {
        options = options || {};
        var responseObservable;
        if (typeof url === 'string') {
            responseObservable = this.httpRequest({
                url: url,
                options: options,
                interceptorOptions: options.interceptorOptions || {}
            });
        }
        else if (url instanceof http_1.Request) {
            var request = url;
            responseObservable = this.httpRequest({
                url: request.url,
                options: {
                    method: request.method,
                    headers: request.headers,
                    url: request.url,
                    withCredentials: request.withCredentials,
                    responseType: request.responseType,
                    body: request.getBody()
                },
                interceptorOptions: options.interceptorOptions || {}
            });
        }
        else {
            throw new Error('First argument must be a url string or Request instance.');
        }
        return responseObservable;
    };
    /**
     * Performs a request with `get` http method.
     */
    InterceptorService.prototype.get = function (url, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Get;
        options.url = options.url || url;
        return this.request(url, options);
    };
    /**
     * Performs a request with `post` http method.
     */
    InterceptorService.prototype.post = function (url, body, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Post;
        options.url = options.url || url;
        options.body = options.body || body;
        return this.request(url, options);
    };
    /**
     * Performs a request with `put` http method.
     */
    InterceptorService.prototype.put = function (url, body, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Put;
        options.url = options.url || url;
        options.body = options.body || body;
        return this.request(url, options);
    };
    /**
     * Performs a request with `delete` http method.
     */
    InterceptorService.prototype.delete = function (url, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Delete;
        options.url = options.url || url;
        return this.request(url, options);
    };
    /**
     * Performs a request with `patch` http method.
     */
    InterceptorService.prototype.patch = function (url, body, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Patch;
        options.url = options.url || url;
        options.body = options.body || body;
        return this.request(url, options);
    };
    /**
     * Performs a request with `head` http method.
     */
    InterceptorService.prototype.head = function (url, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Head;
        options.url = options.url || url;
        return this.request(url, options);
    };
    /**
     * Performs a request with `options` http method.
     */
    InterceptorService.prototype.options = function (url, options) {
        options = options || {};
        options.method = options.method || http_1.RequestMethod.Options;
        options.url = options.url || url;
        return this.request(url, options);
    };
    /** Private functions **/
    InterceptorService.prototype.runBeforeInterceptors = function (params) {
        var ret = Rx_1.Observable.of(params);
        var _loop_1 = function (i) {
            var bf = this_1.interceptors[i];
            if (!bf.interceptBefore)
                return "continue";
            ret = ret.flatMap(function (value, index) {
                var newObs;
                var res = null;
                try {
                    res = bf.interceptBefore(value);
                }
                catch (ex) {
                    console.error(ex);
                }
                if (!res)
                    newObs = Rx_1.Observable.of(value);
                else if (!(res instanceof Rx_1.Observable))
                    newObs = Rx_1.Observable.of(res);
                else
                    newObs = res;
                return newObs.catch(function (err, caught) {
                    if (err == "cancelled") {
                        return Rx_1.Observable.throw({
                            error: "cancelled",
                            interceptorOptions: params.interceptorOptions,
                            position: i
                        });
                    }
                    return Rx_1.Observable.throw({
                        error: "unknown",
                        interceptorOptions: params.interceptorOptions,
                        err: err
                    });
                });
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.interceptors.length; i++) {
            _loop_1(i);
        }
        return ret;
    };
    InterceptorService.prototype.runAfterInterceptors = function (response, startOn) {
        var ret = Rx_1.Observable.of(response);
        var _loop_2 = function (i) {
            var af = this_2.interceptors[i];
            if (!af.interceptAfter)
                return "continue";
            ret = ret.flatMap(function (value, index) {
                var newObs;
                var res = null;
                try {
                    res = af.interceptAfter(value);
                }
                catch (ex) {
                    console.error(ex);
                }
                if (!res)
                    newObs = Rx_1.Observable.of(value);
                else if (!(res instanceof Rx_1.Observable))
                    newObs = Rx_1.Observable.of(res);
                else
                    newObs = res;
                return newObs;
            });
        };
        var this_2 = this;
        for (var i = startOn; i >= 0; i--) {
            _loop_2(i);
        }
        return ret;
    };
    return InterceptorService;
}(http_1.Http));
exports.InterceptorService = InterceptorService;
//# sourceMappingURL=interceptor-service.js.map