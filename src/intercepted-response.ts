import { Response } from '@angular/http';

export interface InterceptedResponse {
	response: Response,
	intercepted?: Boolean,
	interceptorStep?: number,
	interceptorOptions?: any
}
