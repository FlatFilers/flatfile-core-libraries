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

  constructor(private readonly spaceService: SpaceService) {}

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace
  }

  closeSpace() {
    this.showSpace = false
  }

  spaceProps: ISpace = {
    space: {
      id: 'us_sp_123456',
      accessToken: 'ey123456',
    },
    listener,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
  }
}
