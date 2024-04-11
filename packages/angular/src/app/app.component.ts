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
    environmentId: 'us_env_ZvaDGP3B',
    publishableKey: 'pk_0d40167fccfc47e9a4ec0223e9787e63',
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
  }
}
