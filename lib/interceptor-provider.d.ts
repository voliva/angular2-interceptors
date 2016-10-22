import { FactoryProvider, ValueProvider } from '@angular/core';
import { InterceptorService } from './interceptor-service';
export declare function interceptorFactory(): InterceptorService;
export declare function provideInterceptorService(interceptors: any[]): {
    first: ValueProvider;
    second: FactoryProvider;
};
