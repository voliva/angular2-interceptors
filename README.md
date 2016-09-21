# NG2-Interceptors

This package adds the interceptor feature to Angular 2, by extending the @angular/http class.

## Installation

To install, just run in your angular project:
````
npm install ng2-interceptors --save
````

This package is built with CommonJS system, so it should be ready for Webpack.

### SystemJS Configuration

If you are using a version of `angular-cli` that's still using SystemJS, you need to configure a few things to get things going:

1- Add the following line into the `vendorNpmFiles` list of the `angular-cli-build.js` file:
````javascript
'ng2-interceptors/**/*.+(js|js.map)'
````

2- Add the following line into the `map` object of the `src/system-config.ts` file:
````javascript
'ng2-interceptors': 'vendor/ng2-interceptors'
````

3- Add the following lines into the `packages` object of the `src/system-config.ts` file:
````javascript
'ng2-interceptors': {
  main: 'index'
}
````

## Usage

Interceptors are registered when the service is created (to avoid any race-condition). To do so, you have to provide the instance of the service by yourself. So on your module declaration, you should put a provider like:

````typescript
import { provideInterceptorService } from 'ng2-interceptors';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...,
    HttpModule
  ],
  providers: [
    provideInterceptorService([
      // Add interceptors here, like "new ServerURLInterceptor()" or just "ServerURLInterceptor" if it has a provider
    ])
  ],
  bootstrap: [AppComponent]
})

````

This simplifies the way to provide the service, but it's equivalent to:

````typescript
import { InterceptorService } from 'ng2-interceptors';
import { XHRBackend, RequestOptions } from '@angular/http';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...,
    HttpModule
  ],
  providers: [
    {
      provide: InterceptorService,
      useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions) => {
        let service = new InterceptorService(xhrBackend, requestOptions);
        // Add interceptors here with service.addInterceptor()
        return service;
      },
      deps: [XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
````

Also, InterceptorService extends from `@angular/http Http` service, so the API is exactly the same.

### Concept

The idea behind interceptors is to execute some code _every_ time an HTTP request is done. This is mainly needed for Authorization and Authentication methods (like setting the Auth header for an API), but they can be used for anything: Append the server URL on each call, log all request for analytics, provide mock data, or even show a loading spinner when there's some request going on.

The way this implementation is made makes it easy to understand all the interceptors like they are in a pipeline: They will get called in order, first getting the request that's about to be sent (and modifiying the request if needed), and then getting the response (again, modifying it if needed):
![alt tag](http://i1.imgbus.com/doimg/dc6obm7mcobnc69.png)

Also, each Interceptor is capable of cancel the request, preventing it from reaching the server, and giving back a _fake_ server response. When one interceptor cancels the request, he's inmediately called with a _cancelled_ response and he is able to edit that response to the _fake_ one. All the interceptors _next_ to the one that cancelled the request won't ever see that request, while the interceptors _previous_ will get the _fake_ request back.

### Implementing one interceptor

To implement one interceptor you just have to create a class that _implements_ Interceptor:
````typescript
import { Interceptor, InterceptedRequest, InterceptedResponse } from 'ng2-interceptors';

export class ServerURLInterceptor implements Interceptor {
	public interceptBefore(request: InterceptedRequest): InterceptedRequest {
		// Do whatever with request: get info or edit it

		return request;
		/*
		  You can return:
		    - Request: The modified request
		    - Nothing: For convenience: It's just like returning the request
		    - <any>(Observable.throw("cancelled")): Cancels the request
		*/
	}

	public interceptAfter(response: InterceptedResponse): InterceptedResponse {
		// Do whatever with response: get info or edit it

		return response;
		/*
		  You can return:
		    - Response: The modified response
		    - Nothing: For convenience: It's just like returning the response
		*/
	}
}
````

Both methods are optional, so you can implement Interceptors that just take request or responses.

Notice how there's a different object of `InterceptedRequest` and  `InterceptedResponse`: They are modifications of angular's Http Request and Response needed for the whole Interceptor feature and to pass additional options that may be needed for specific interceptors (like to enable/disable them for specific calls, etc.) the API is:
````typescript
interface InterceptedRequest {
	url: string,
	options?: RequestOptionsArgs, // Angular's HTTP Request options
	interceptorOptions?: any
}
interface InterceptedResponse {
	response: Response, // Angular's HTTP Response
	interceptorOptions?: any
}
````

`interceptorOptions` on `InterceptedRequest` is guaranteed to be the same of that one of `InterceptedResponse` for the same call, even if they get modified by an interceptor.

The subscriber of the service's `Observable` will get the Angular's HTTP vanilla Response, to make it completely transparent.

### Interceptor as a service

Interceptors are usually pure classes with pure functions: Given a call, they return a modified one, but sometimes we need these Interceptors to be actual Services to be used all around our application.

For instance, an interceptor that shows a loading spinner every time we have a call has -in some way- to comunicate with the `LoadingComponent` to make the spinner appear/disappear from the screen.

To do that it's pretty straightforward: create a Service (`@Injectable()` annotation) that `implements Interceptor` and the interceptor methods. Then to include them in the interceptor pipeline:
````typescript
providers: [
  LoadingService, // We declare it's provider
  provideInterceptorService([
    LoadingService,
    /* Provider-less interceptors can be added like this as well */
    new ServerURLInterceptor()
  ])
]
````

If for some reason you need the low-level implementation, this is equivalent to:
````typescript
providers: [
  LoadingService, // We declare it's provider
  {
    provide: InterceptorService,
    useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions, loadingService:LoadingService) => {
      let service = new InterceptorService(xhrBackend, requestOptions);
      service.addInterceptor(loadingService); // Add into the pipeline
      service.addInterceptor(new ServerURLInterceptor());
      return service;
    },
    /* Important: Add it to the deps array in the same order the useFactory method is declared */
    deps: [XHRBackend, RequestOptions, LoadingService]
  }
]
````
