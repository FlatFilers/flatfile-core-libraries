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

  constructor(private spaceService: SpaceService) {}

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace
  }

  closeSpace() {
    this.showSpace = false
  }

  spaceProps: ISpace = {
    name: 'Trste!',
    publishableKey: 'pk_ixtxE3L9iVMYgaaxePSn5hGxLffNJhiS',
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
  }
}
