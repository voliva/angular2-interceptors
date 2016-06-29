import { Interceptor, InterceptedRequest, InterceptedResponse } from './ng-interceptor/index';
import { Observable } from 'rxjs/Rx';


export class ServerUrlInterceptor implements Interceptor {
	public interceptBefore(params: InterceptedRequest): Observable<InterceptedRequest> {
		console.log("Before ServerUrlInterceptor");

		params.url = "http://www.example.com/" + params.url;
		return Observable.of(params);
	}

	public interceptAfter(response: InterceptedResponse): Observable<InterceptedResponse> {
		console.log("After ServerUrlInterceptor", response.interceptorOptions.memory);

		return Observable.of(response);
	}
}

export class DenyInterceptor implements Interceptor {
	public interceptBefore(params: InterceptedRequest): Observable<InterceptedRequest> {
		console.log("Before ServerUrlInterceptor");

		return <any>(Observable.throw("cancelled"));
	}

	public interceptAfter(response: InterceptedResponse): Observable<InterceptedResponse> {
		console.log("After DenyInterceptor");

		return Observable.of(response);
	}
}
