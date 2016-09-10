import { RequestOptionsArgs } from '@angular/http';

export interface InterceptorOptions extends RequestOptionsArgs {
	interceptorOptions?: any
}
