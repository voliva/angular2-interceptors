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
````
'ng2-interceptors/**/*.+(js|js.map)'
````

2- Add the following line into the `map` object of the `src/system-config.ts` file:
````
'ng2-interceptors': 'vendor/ng2-interceptors'
````

3- Add the following lines into the `packages` object of the `src/system-config.ts` file:
````
'ng2-interceptors': {
  main: 'index'
}
````
