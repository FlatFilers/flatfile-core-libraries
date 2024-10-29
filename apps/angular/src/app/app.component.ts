import { Component } from '@angular/core'
import { ISpace, SpaceService } from '@flatfile/angular-sdk'
import { workbook } from './workbook'
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
  spaceProps: ISpace = {
    name: 'Trste!',
    publishableKey: 'pk_123456',
    workbook,
    listener,
    userInfo: {
      name: 'my space name',
    },
    spaceInfo: {
      name: 'my space name',
    },
    displayAsModal: false,
    spaceBody: {
      metadata: {
        random: 'param',
      },
    },
    sidebarConfig: {
      showSidebar: true,
    },
    closeSpace: {
      onClose: () => {
        this.showSpace = false
      },
    },
  }
}
