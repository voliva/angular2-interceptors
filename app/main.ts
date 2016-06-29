import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { provide }      from '@angular/core';

import { InterceptorService } from './ng-interceptor/interceptor-service';
import { Http, HTTP_PROVIDERS, XHRBackend, RequestOptions } from '@angular/http';

bootstrap(AppComponent, [
	HTTP_PROVIDERS,
	provide(Http, {
		useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions) => {
			var ret = new InterceptorService(xhrBackend, requestOptions)
			return ret;
		},
		deps: [XHRBackend, RequestOptions]
	})
]);
