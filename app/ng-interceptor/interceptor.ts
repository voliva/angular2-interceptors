import { InterceptedRequest } from "./intercepted-request.ts";
import { InterceptedResponse } from "./intercepted-response.ts";
import { Observable } from 'rxjs/Rx';

export interface Interceptor {
  interceptBefore?(params: InterceptedRequest): Observable<InterceptedRequest>
  interceptAfter?(response: InterceptedResponse): Observable<InterceptedResponse>
}
