import {
	ConnectionBackend,
	Headers,
	Http,
	Response,
	ResponseOptions,
	RequestMethod,
	RequestOptions
} from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { InterceptedRequest } from "./intercepted-request";
import { InterceptedResponse } from "./intercepted-response";
import { InterceptorOptions } from "./interceptor-options";
import { Interceptor } from "./interceptor";

export class InterceptorService extends Http {
	private interceptors: Array<Interceptor>;

	constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
		super(backend, defaultOptions);
		this.interceptors = [];
	}

	/**
	  Before interceptor
	  patata
	*/
	addInterceptor(interceptor: Interceptor) {
		this.interceptors.push(interceptor);
	}

	/** Parent overrides **/
	request(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.headers = options.headers || new Headers();
		return <Observable<Response>>this.runBeforeInterceptors({
			url: url,
			options: options,
			interceptorOptions: options.interceptorOptions || {}
		})
		.flatMap((value: InterceptedRequest, index: number) => {
			// We return an observable that merges the result of the request plus the interceptorOptions we need
			return Observable.zip(
				super.request(value.url, value.options),
				Observable.of(value.interceptorOptions),
				function(response, options) {
					return {
						response: response,
						interceptorOptions: options
					}
				}
			).catch((err: any) => {
				return Observable.of({
					response: err,
					interceptorOptions: value.interceptorOptions || {}
				});
			});
		})
		.catch((err: any) => {
			// If it's a cancel, create a fake response and pass it to next interceptors
			if (err.error == "cancelled") {
				var response = new ResponseOptions({
					body: null,
					status: 0,
					statusText: "intercepted",
					headers: new Headers()
				})
				return Observable.of({
					response: new Response(response),
					intercepted: true,
					interceptorStep: err.position,
					interceptorOptions: err.interceptorOptions
				});
			} else {
				// We had an exception in the pipeline... woops? TODO
			}
		})
		.flatMap((value: InterceptedResponse, index: number) => {
			var startOn = (value.intercepted) ? value.interceptorStep : this.interceptors.length - 1;
			return this.runAfterInterceptors(value, startOn);
		})
		.flatMap((value: InterceptedResponse, index: number) => {
			return Observable.of(value.response);
		});
	}

	get(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = RequestMethod.Get;
		return this.request(url, options);
	}

	post(url: string, body: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = RequestMethod.Post;
		options.body = body;
		return this.request(url, options);
	}

	put(url: string, body: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = RequestMethod.Put;
		options.body = body;
		return this.request(url, options);
	}

	delete(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = RequestMethod.Delete;
		return this.request(url, options);
	}

	/** Private functions **/
	private runBeforeInterceptors(params: InterceptedRequest): Observable<InterceptedRequest> {
		let ret: Observable<InterceptedRequest> = Observable.of(params);

		for (let i = 0; i < this.interceptors.length; i++) {
			let bf: Interceptor = this.interceptors[i];
			if (!bf.interceptBefore) continue;

			ret = ret.flatMap((value: InterceptedRequest, index: number) => {
				let newObs: Observable<InterceptedRequest>;
				let res = null;
				try {
					res = bf.interceptBefore(value);
				} catch (ex) {
					console.error(ex);
				}
				if (!res) newObs = Observable.of(value);
				else if (!(res instanceof Observable)) newObs = Observable.of(<any>res);
				else newObs = <any>res;

				return newObs.catch((err: any, caught: Observable<InterceptedRequest>) => {
					if (err == "cancelled") {
						return <Observable<any>><any>Observable.throw({
							error: "cancelled",
							interceptorOptions: params.interceptorOptions,
							position: i
						});
					}
					return <Observable<any>><any>Observable.throw({
						error: "unknown",
						interceptorOptions: params.interceptorOptions,
						err: err
					});
				});
			});
		}

		return ret;
	}

	private runAfterInterceptors(response: InterceptedResponse, startOn: number): Observable<InterceptedResponse> {
		let ret: Observable<InterceptedResponse> = Observable.of(response);

		for (let i = startOn; i >= 0; i--) {
			let af: Interceptor = this.interceptors[i];
			if (!af.interceptAfter) continue;

			ret = ret.flatMap((value: InterceptedResponse, index) => {
				let newObs: Observable<InterceptedResponse>;

				let res = null;
				try {
					res = af.interceptAfter(value);
				} catch (ex) {
					console.error(ex);
				}
				if (!res) newObs = Observable.of(value);
				else if (!(res instanceof Observable)) newObs = Observable.of(<any>res);
				else newObs = <any>res;

				return newObs;
			});
		}
		return ret;
	}
}
