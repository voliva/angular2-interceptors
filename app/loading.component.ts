import { Component, OnInit } from '@angular/core';
import { LoadingService } from './interceptors';

@Component({
	selector: 'loading',
	template: '<div *ngIf="display">Loading</div>'
})
export class LoadingComponent implements OnInit {
	display: boolean = false;

	constructor(
		private loading: LoadingService
	) {
	}

	ngOnInit() {
		this.loading.getObservable().subscribe((show) => {
			this.display = show;
		});
	}
}
