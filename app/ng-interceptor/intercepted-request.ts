import { RequestOptionsArgs } from '@angular/http';

export interface InterceptedRequest {
	url: string,
	options?: RequestOptionsArgs,
	interceptorOptions?: any
}
