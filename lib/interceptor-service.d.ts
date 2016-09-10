import { ConnectionBackend, Http, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { InterceptorOptions } from "./interceptor-options";
import { Interceptor } from "./interceptor";
export declare class InterceptorService extends Http {
    private interceptors;
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions);
    /**
      Before interceptor
      patata
    */
    addInterceptor(interceptor: Interceptor): void;
    /** Parent overrides **/
    request(url: string, options?: InterceptorOptions): Observable<Response>;
    get(url: string, options?: InterceptorOptions): Observable<Response>;
    post(url: string, body: string, options?: InterceptorOptions): Observable<Response>;
    put(url: string, body: string, options?: InterceptorOptions): Observable<Response>;
    delete(url: string, options?: InterceptorOptions): Observable<Response>;
    /** Private functions **/
    private runBeforeInterceptors(params);
    private runAfterInterceptors(response, startOn);
}
