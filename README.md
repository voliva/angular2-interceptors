# NG2-Interceptors

This package adds the interceptor feature to Angular 2, by extending the @angular/http class. For concept behind Interceptor, take a look at the [wiki](https://github.com/voliva/angular2-interceptors/wiki/Concept)

# Installation

To install, just run in your angular project:

````
npm install ng2-interceptors --save
````

And it should be importable with webpack out of the box

# Usage
## Set up InterceptorService
Interceptors are registered when the service is created (to avoid any race-condition). To do so, you have to provide the instance of the service by yourself. So on your module declaration, you should put a provider like:

````
import { InterceptorService } from 'ng2-interceptors';
import { XHRBackend, RequestOptions } from '@angular/http';

export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions){
  let service = new InterceptorService(xhrBackend, requestOptions);
  // Add interceptors here with service.addInterceptor(interceptor)
  return service;
}

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
      useFactory: interceptorFactory,
      deps: [XHRBackend, RequestOptions]
    }
  ],
  bootstrap: [AppComponent]
})
````

There's a shorthand for this setup by using `provideInterceptorService`, but if you use AoT (Ahead-of-time) compilation it will fail. In fact, exporting the `interceptorFactory` is to make the AoT Compiler, as it needs all functions used in the provider to be exported.

````
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

## Using InterceptorService
Once we have it set up, we can use it in our Controllers as if we were using the default Angular `Http` service:
````
import { Component } from '@angular/core';
import { InterceptorService } from 'ng2-interceptors';

@Component({
  selector: 'my-component',
  templateUrl: 'my-component.html',
  moduleId: 'my-module'
})
export class MyComponent {

  constructor(
     private http: InterceptorService) {
  }

  ngOnInit(){
    this.http.get("http://www.example.com/").subscribe(
      (res) => console.log(res),
      (err) => console.error(err),
      () => console.log("Yay"));
  }
}
````

We can also "cheat" the Injector so that every time we ask for the `Http` we get the `InterceptorService` instead. All we have to do is replace `InterceptorService` on the provider definition for `Http`, and then we can get our service when we use `private http: Http`:
````
  {
    provide: Http,
    useFactory: interceptorFactory,
    deps: [XHRBackend, RequestOptions]
  }
````

## Creating your own Interceptor
Basically, an interceptor is represented by one pair of functions: One that will get the request that's about to be sent to the server, and another that will get the response that the server just sent. For that, we just need to create a new class that implements Interceptor:

````
import { Interceptor, InterceptedRequest, InterceptedResponse } from 'ng2-interceptors';

export class ServerURLInterceptor implements Interceptor {
    public interceptBefore(request: InterceptedRequest): InterceptedRequest {
        // Do whatever with request: get info or edit it

        return request;
        /*
          You can return:
            - Request: The modified request
            - Nothing: For convenience: It's just like returning the request
            - <any>(Observable.throw("cancelled")): Cancels the request, interrupting it from the pipeline, and calling back 'interceptAfter' in backwards order of those interceptors that got called up to this point.
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

Notice how there's a different object of `InterceptedRequest` and `InterceptedResponse`: They are modifications of angular's Http `Request` and `Response` needed for the whole Interceptor feature and to pass additional options that may be needed for specific interceptors (like to enable/disable them for specific calls, etc.) the API is:

````
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
`interceptorOptions` on `InterceptedRequest` is guaranteed to be the same of that one of `InterceptedResponse` for the same call: The stuff you put in `interceptorOptions` while in `interceptBefore` will be available when you get `interceptAfter` called.

## Creating one Injectable Interceptor
Interceptors are usually pure classes with pure functions: Given a call, they return a modified one, but sometimes we need these Interceptors to be actual Services to be used all around our application.

For instance, an interceptor that shows a loading spinner every time we have a call has -in some way- to comunicate with the `LoadingComponent` to make the spinner appear/disappear from the screen.

To do that you have to do some steps in the module/factory declaration file:
1. Create a Service (`@Injectable()` annotation) that implements `Interceptor` and the interceptor methods.
2. Define his provider before `InterceptorService`
3. Add it as a parameter to the factory function
4. Add it to the `deps` array. Note that the order of the elements have to match the one on the factory function.
5. Add it to the pipeline

If you are using the `provideInterceptorService` option (without AoT Compiler support), then you can skip steps 2-4.

If our `ServerURLInterceptor` were a Service, we would have a module declaration like:
````
import { InterceptorService } from 'ng2-interceptors';
import { ServerURLInterceptor } from './services/serverURLInterceptor';
import { XHRBackend, RequestOptions } from '@angular/http';

export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, serverURLInterceptor:ServerURLInterceptor){ // Add it here
  let service = new InterceptorService(xhrBackend, requestOptions);
  service.addInterceptor(serverURLInterceptor); // Add it here
  return service;
}

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...,
    HttpModule
  ],
  providers: [
    ServerURLInterceptor, // Add it here
    {
      provide: InterceptorService,
      useFactory: interceptorFactory,
      deps: [XHRBackend, RequestOptions, ServerURLInterceptor] // Add it here, in the same order as the signature of interceptorFactory
    }
  ],
  bootstrap: [AppComponent]
})
````
