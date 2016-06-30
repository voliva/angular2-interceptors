import { Interceptor, InterceptedRequest, InterceptedResponse } from './ng-interceptor/index';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

export class ServerUrlInterceptor implements Interceptor {
	public interceptBefore(request: InterceptedRequest): InterceptedRequest{
		console.log("Before ServerUrlInterceptor");

		request.url = "http://www.example.com/" + request.url;
		return request;
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After ServerUrlInterceptor", response.interceptorOptions.memory);

		return response;
	}
}

export class DenyInterceptor implements Interceptor {
	public interceptBefore(request: InterceptedRequest): Observable<InterceptedRequest> {
		console.log("Before ServerUrlInterceptor");

		return <any>(Observable.throw("cancelled"));
	}

	public interceptAfter(response: InterceptedResponse): Observable<InterceptedResponse> {
		console.log("After DenyInterceptor");

		return response;
	}
}

@Injectable()
export class LoadingService implements Interceptor {
	private stack:number;
	private observable:Observable<any>
	private observers:any[];

	constructor(){
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
		console.log("Before ServerUrlInterceptor");

		this.stack++;
		if(this.stack == 1)
			this.showLoading();

		return request;
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		console.log("After DenyInterceptor");

		this.stack--;
		if(this.stack == 0)
			this.hideLoading();

		return response;
	}

	public getObservable(){
		return this.observable;
	}

	private showLoading(){
		console.log("showLoading");

		this.observers.forEach(function(obs){
			obs.next(true);
		});
	}
	private hideLoading(){
		console.log("hideLoading");
		
		this.observers.forEach(function(obs){
			obs.next(false);
		});
	}
}