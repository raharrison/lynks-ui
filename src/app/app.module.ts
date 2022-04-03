import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedModule} from "@shared/shared.module";
import {HIGHLIGHT_OPTIONS} from "ngx-highlightjs";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LoadingBarHttpClientModule} from "@ngx-loading-bar/http-client";
import {AuthInterceptor} from "@shared/interceptors/auth.interceptor";

function getHighlightLanguages() {
  return {
    bash: () => import('highlight.js/lib/languages/bash'),
    c: () => import('highlight.js/lib/languages/c'),
    cpp: () => import('highlight.js/lib/languages/cpp'),
    csharp: () => import('highlight.js/lib/languages/csharp'),
    css: () => import('highlight.js/lib/languages/css'),
    gradle: () => import('highlight.js/lib/languages/gradle'),
    handlebars: () => import('highlight.js/lib/languages/handlebars'),
    java: () => import('highlight.js/lib/languages/java'),
    javascript: () => import('highlight.js/lib/languages/javascript'),
    json: () => import('highlight.js/lib/languages/json'),
    kotlin: () => import('highlight.js/lib/languages/kotlin'),
    nginx: () => import('highlight.js/lib/languages/nginx'),
    plaintext: () => import('highlight.js/lib/languages/plaintext'),
    python: () => import('highlight.js/lib/languages/python'),
    shell: () => import('highlight.js/lib/languages/shell'),
    sql: () => import('highlight.js/lib/languages/sql'),
    typescript: () => import('highlight.js/lib/languages/typescript'),
    xml: () => import('highlight.js/lib/languages/xml'),
    yaml: () => import('highlight.js/lib/languages/yaml')
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LoadingBarHttpClientModule,
    SharedModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbers: false,
        languages: getHighlightLanguages()
      }
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
