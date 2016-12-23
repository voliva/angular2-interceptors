import {
	ConnectionBackend,
	Headers,
	Http,
	Request,
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
	private httpRequest(request:InterceptedRequest): Observable<Response> {
		request.options = request.options || {};
		request.options.headers = request.options.headers || new Headers();
		return this.runBeforeInterceptors(request)
		.flatMap<InterceptedRequest, InterceptedResponse>((value: InterceptedRequest, index: number) => {
			// We return an observable that merges the result of the request plus the interceptorOptions we need
			return Observable.zip(
				super.request(value.url, value.options),
				Observable.of(value.interceptorOptions),
				function(response, options) {
					return {
						response: response,
						interceptorOptions: options
					} as InterceptedResponse;
				}
			).catch((err: any) => {
				return Observable.of({
					response: err,
					interceptorOptions: value.interceptorOptions || {}
				} as InterceptedResponse);
			});
		})
		.catch<InterceptedResponse, InterceptedResponse>((err: any) => {
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
		})
		.flatMap((value: Response, index: number) => {
			if (!value.ok)
				return Observable.throw(value);

			return Observable.of(value);
		});
	}

	request(url: string|Request, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		let responseObservable: any;
		if (typeof url === 'string') {
			responseObservable = this.httpRequest({
				url: url,
				options: options,
				interceptorOptions: options.interceptorOptions || {}
			});
		} else if (url instanceof Request) {
			let request:Request = url;
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
		} else {
			throw new Error('First argument must be a url string or Request instance.');
		}
		return responseObservable;
	}

	/**
	 * Performs a request with `get` http method.
	 */
	get(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Get;
		options.url = options.url || url;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `post` http method.
	 */
	post(url: string, body: any, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Post;
		options.url = options.url || url;
		options.body = options.body || body;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `put` http method.
	 */
	put(url: string, body: any, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Put;
		options.url = options.url || url;
		options.body = options.body || body;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `delete` http method.
	 */
	delete(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Delete;
		options.url = options.url || url;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `patch` http method.
	 */
	patch(url: string, body: any, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Patch;
		options.url = options.url || url;
		options.body = options.body || body;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `head` http method.
	 */
	head(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Head;
		options.url = options.url || url;
		return this.request(url, options);
	}

	/**
	 * Performs a request with `options` http method.
	 */
	options(url: string, options?: InterceptorOptions): Observable<Response> {
		options = options || {};
		options.method = options.method || RequestMethod.Options;
		options.url = options.url || url;
		return this.request(url, options);
	}

	/** Private functions **/
	private runBeforeInterceptors(params: InterceptedRequest): Observable<InterceptedRequest> {
		let ret: Observable<InterceptedRequest> = Observable.of(params);

		for (let i = 0; i < this.interceptors.length; i++) {
			let bf: Interceptor = this.interceptors[i];
			if (!bf.interceptBefore) continue;

			ret = ret.flatMap<InterceptedRequest, InterceptedRequest>((value: InterceptedRequest, index: number) => {
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

			ret = ret.flatMap<InterceptedResponse, InterceptedResponse>((value: InterceptedResponse, index) => {
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
