import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { provide, ReflectiveInjector }      from '@angular/core';

import { InterceptorService } from './ng-interceptor/index';
import { Http, HTTP_PROVIDERS, XHRBackend, RequestOptions } from '@angular/http';

import { ServerUrlInterceptor, DenyInterceptor, LoadingService, CacheInterceptor } from './interceptors';

bootstrap(AppComponent, [
	HTTP_PROVIDERS,
	LoadingService,
	provide(Http, {
		useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions, loadingService: LoadingService) => {
			// let loadingService = ReflectiveInjector.resolveAndCreate([LoadingService]).get(LoadingService));

			var ret = new InterceptorService(xhrBackend, requestOptions);
			ret.addInterceptor(new ServerUrlInterceptor());
			ret.addInterceptor(new CacheInterceptor());
			ret.addInterceptor(loadingService);
			// ret.addInterceptor(new DenyInterceptor());
			return ret;
		},
		deps: [XHRBackend, RequestOptions, LoadingService]
	})
]);
