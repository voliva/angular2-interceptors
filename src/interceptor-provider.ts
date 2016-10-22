import { FactoryProvider, ValueProvider } from '@angular/core';
import { XHRBackend, RequestOptions } from '@angular/http';
import { InterceptorService } from './interceptor-service';

export function interceptorFactory(){
	let injectedServices = arguments;
	let xhrBackend:XHRBackend = injectedServices[0];
	let requestOptions:RequestOptions = injectedServices[1];
	let interceptors:any[] = injectedServices[2];

	let service = new InterceptorService(xhrBackend, requestOptions);
	interceptors.forEach((interceptor) => {
		if(interceptor.useValue){
			service.addInterceptor(interceptor.useValue);
		}else{
			let value = injectedServices[interceptor.index];
			service.addInterceptor(value);
		}
	});
	return service;
}

export function provideInterceptorService(interceptors:any[]):{first:ValueProvider, second:FactoryProvider} {
	let deps:any[] = [
		XHRBackend,
		RequestOptions
	];

	/* These push and map functions are not allowed for AoT, we have to put them inside
	a factory as well, but we need to generate the deps array with the Interceptor services
	that it requires, so we need it here... Any solution?
	*/
	deps.push("NG2Interceptors");

	interceptors = interceptors.map((interceptor:any) => {
		if(typeof interceptor == "function"){
			deps.push(interceptor);
			return {
				useValue: false,
				index: deps.length-1
			}
		}else{
			return {
				useValue: interceptor
			}
		}
	});

	return {
		first: {
			provide: "NG2Interceptors",
			useValue: interceptors
		},
		second: {
			provide: InterceptorService,
			useFactory: interceptorFactory,
			deps: deps,
			multi: false
		}
	}
}
