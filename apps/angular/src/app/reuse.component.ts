import { Component } from '@angular/core'
import { ISpace, SpaceService } from '@flatfile/angular-sdk'
import { listener } from './listener'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showSpace: boolean = false

  constructor(private spaceService: SpaceService) {}

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace
  }

  closeSpace() {
    this.showSpace = false
  }

  spaceProps: ISpace = {
    space: {
      id: 'us_sp_Gnm2O7TL',
      accessToken: 'eyJ0eXAiOiJGbGF0ZmlsZUhTMjU2IiwiYWxnIjoiSFMyNTYifQ.eyJhdWQiOiJ1c19hY2NfaVg2UEx0bFIiLCJzdWIiOiJ1c19nX0QydGp6ejJvIiwic3BhIjoidXNfc3BfR25tMk83VEwiLCJlbnYiOiJ1c19lbnZfS0JuMjcyUEIiLCJpc3MiOiJmbGF0ZmlsZSIsImlhdCI6MTczMDE0OTcyOCwiZXhwIjoxNzMwMjM2MTI4LCJ2ZXIiOjF9.72aced7f95535e38086e60eecc90ef3c5a8b4b4af70d9d4246fb94b1c3d601bd',
    },
    listener,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
  }
}
