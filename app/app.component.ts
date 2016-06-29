import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { InterceptorService } from './ng-interceptor/interceptor-service';

@Component({
  selector: 'my-app',
  template: '<h1>My First Angular 2 App</h1>'
})
export class AppComponent implements OnInit {
	constructor(
		private http:Http
	){
	}

	ngOnInit() {
		this.http.request("file.json").subscribe((res) => {
			console.log(res);
		});
	}
}
