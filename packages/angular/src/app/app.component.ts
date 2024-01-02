import { Component } from '@angular/core';
import { ISpace, SpaceService } from '@flatfile/angular'
import { workbook } from "./workbook";
import { listener } from "./listener";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showSpace: boolean = false;

  constructor(private spaceService: SpaceService) {}

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace;
  }

  closeSpace() {
    this.showSpace = false
  }

  spaceProps: ISpace = {
    name: 'Trste!',
    environmentId: 'us_env_1234',
    publishableKey: 'pk_1234',
    workbook,
    listener,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
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
  }
}
