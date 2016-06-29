import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { provide }      from '@angular/core';

import { InterceptorService } from './ng-interceptor/index';
import { HTTP_PROVIDERS, XHRBackend, RequestOptions } from '@angular/http';

import { ServerUrlInterceptor, DenyInterceptor } from './interceptors';

bootstrap(AppComponent, [
	HTTP_PROVIDERS,
	provide(InterceptorService, {
		useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions) => {
			var ret = new InterceptorService(xhrBackend, requestOptions);
			ret.addInterceptor(new ServerUrlInterceptor());
			ret.addInterceptor(new DenyInterceptor());
			return ret;
		},
		deps: [XHRBackend, RequestOptions]
	})
]);
