import { ConnectionBackend, Http, Request, Response, RequestOptions } from '@angular/http';
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
    private httpRequest(request);
    request(url: string | Request, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `get` http method.
     */
    get(url: string, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `post` http method.
     */
    post(url: string, body: any, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `put` http method.
     */
    put(url: string, body: any, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `delete` http method.
     */
    delete(url: string, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `patch` http method.
     */
    patch(url: string, body: any, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `head` http method.
     */
    head(url: string, options?: InterceptorOptions): Observable<Response>;
    /**
     * Performs a request with `options` http method.
     */
    options(url: string, options?: InterceptorOptions): Observable<Response>;
    /** Private functions **/
    private runBeforeInterceptors(params);
    private runAfterInterceptors(response, startOn);
}
