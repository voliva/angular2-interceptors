import { provide, Component } from '@angular/core';
import { InterceptorService } from './ng-interceptor/index';
import { XHRBackend, RequestOptions } from '@angular/http';

@Component({
	selector: 'side-banner',
	template: '<div><button (click)="load()">Load banner file</button></div>',
	styles: ['div { position:absolute; right: 30px; top: 100px; }'],
	providers: [provide(InterceptorService, {
		useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions) => {
			return new InterceptorService(xhrBackend, requestOptions);
		},
		deps: [XHRBackend, RequestOptions]
	})]
})
export class SideBanner {
	display: boolean = false;

	constructor(
		private http: InterceptorService
	) {
	}

	load() {
		this.http.request("banner.json").subscribe((res) => {
			console.log(res.json());
		});
	}
}
