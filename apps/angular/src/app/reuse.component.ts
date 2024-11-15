import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SpaceModule, ISpace, SpaceService } from '@flatfile/angular-sdk';
import { listener } from "./listener";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SpaceModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'create-flatfile-angular';
  showSpace: boolean = false;
  data: any;

  constructor(private spaceService: SpaceService) {}

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace;
  }

  closeSpace() {
    this.showSpace = false;
  }

  spaceProps: ISpace = {
    space: {
      id: 'us_sp_1234',
      accessToken: 'sk_1234'
    },
    environmentId: 'us_env_1234',
    listener,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
    displayAsModal: true
  }
}
