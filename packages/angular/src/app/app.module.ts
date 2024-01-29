import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpaceModule, SpaceService } from '@flatfile/angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SpaceModule
  ],
  providers: [ SpaceService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
