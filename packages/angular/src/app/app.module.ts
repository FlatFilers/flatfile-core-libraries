import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SpaceModule } from 'angular-sdk';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SpaceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
