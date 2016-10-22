"use strict";
var http_1 = require('@angular/http');
var interceptor_service_1 = require('./interceptor-service');
function interceptorFactory() {
    var injectedServices = arguments;
    var xhrBackend = injectedServices[0];
    var requestOptions = injectedServices[1];
    var interceptors = injectedServices[2];
    var service = new interceptor_service_1.InterceptorService(xhrBackend, requestOptions);
    interceptors.forEach(function (interceptor) {
        if (interceptor.useValue) {
            service.addInterceptor(interceptor.useValue);
        }
        else {
            var value = injectedServices[interceptor.index];
            service.addInterceptor(value);
        }
    });
    return service;
}
exports.interceptorFactory = interceptorFactory;
function provideInterceptorService(interceptors) {
    var deps = [
        http_1.XHRBackend,
        http_1.RequestOptions
    ];
    deps.push("NG2Interceptors");
    interceptors = interceptors.map(function (interceptor) {
        if (typeof interceptor == "function") {
            deps.push(interceptor);
            return {
                useValue: false,
                index: deps.length - 1
            };
        }
        else {
            return {
                useValue: interceptor
            };
        }
    });
    return {
        first: {
            provide: "NG2Interceptors",
            useValue: interceptors
        },
        second: {
            provide: interceptor_service_1.InterceptorService,
            useFactory: interceptorFactory,
            deps: deps,
            multi: false
        }
    };
}
exports.provideInterceptorService = provideInterceptorService;
//# sourceMappingURL=interceptor-provider.js.map