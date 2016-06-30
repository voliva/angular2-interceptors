import { Component, OnInit } from '@angular/core';
import { InterceptorService } from './ng-interceptor/index';
import { LoadingComponent } from './loading.component';

@Component({
  selector: 'my-app',
  template: `
  <h1>My First Angular 2 App</h1>
  <button (click)="loadFile()">Load file</button>
  <loading></loading>
  `,
  directives: [LoadingComponent]
})
export class AppComponent {
	constructor(
		private http:InterceptorService
	){
	}

	loadFile() {
		this.http.request("file.json").subscribe((res) => {
			console.log(res.json());
		});
	}
}
