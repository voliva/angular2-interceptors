import { Interceptor, InterceptedRequest, InterceptedResponse } from './ng-interceptor/index';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

export class ServerUrlInterceptor implements Interceptor {
	public interceptBefore(request: InterceptedRequest): InterceptedRequest {
		console.log("Before ServerUrlInterceptor");

		// request.url = "http://www.example.com/" + request.url;
		return request;
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After ServerUrlInterceptor", response.interceptorOptions.memory);

		return response;
	}
}

export class DenyInterceptor implements Interceptor {
	public interceptBefore(request: InterceptedRequest): InterceptedRequest {
		console.log("Before DenyInterceptor");

		return <any>(Observable.throw("cancelled"));
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After DenyInterceptor");

		return response;
	}
}

export class CacheInterceptor implements Interceptor {
	private cache: any = {};

	public interceptBefore(request: InterceptedRequest): InterceptedRequest {
		console.log("Before CacheInterceptor");

		let hash = this.getHash(request);
		request.interceptorOptions.cacheHash = hash;

		if (this.cache[hash]) {
			return <any>(Observable.throw("cancelled"));
		}

		return request;
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After CacheInterceptor");

		let hash = response.interceptorOptions.cacheHash;
		if (response.intercepted && this.cache[hash]) {
			return this.cache[hash];
		}

		this.cache[hash] = response;

		return null;
	}

	private getHash(request: InterceptedRequest): string {
		return request.url; // TODO Create a better hash...
	}
}

@Injectable()
export class LoadingService implements Interceptor {
	private stack: number;
	private observable: Observable<any>
	private observers: any[];

	constructor() {
		this.stack = 0;
		this.observable = Observable.create((observer) => {
			this.observers.push(observer);

			return () => {
				this.observers.splice(this.observers.indexOf(observer), 1);
			}
		});
		this.observers = [];
	}

	public interceptBefore(request: InterceptedRequest): InterceptedRequest {
		console.log("Before Loading");

		this.stack++;
		if (this.stack == 1)
			this.showLoading();

		return request;
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After Loading");

		this.stack--;
		if (this.stack == 0)
			this.hideLoading();

		return response;
	}

	public getObservable() {
		return this.observable;
	}

	private showLoading() {
		console.log("showLoading");

		this.observers.forEach(function(obs) {
			obs.next(true);
		});
	}
	private hideLoading() {
		console.log("hideLoading");

		this.observers.forEach(function(obs) {
			obs.next(false);
		});
	}
}
