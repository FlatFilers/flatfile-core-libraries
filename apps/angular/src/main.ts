import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'
import { importProvidersFrom } from '@angular/core'
import { SpaceModule } from '@flatfile/angular-sdk'

bootstrapApplication(AppComponent, {
  providers: [...(appConfig.providers || []), importProvidersFrom(SpaceModule)],
}).catch((err) => console.error(err))
