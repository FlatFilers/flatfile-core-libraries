import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SpaceModule, ISpace, SpaceService } from '@flatfile/angular-sdk';
import { workbook } from "./workbook";
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

  constructor(private spaceService: SpaceService) {
    console.log('ANGULAR 17');
  }

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace;
  }

  closeSpace() {
    this.showSpace = false;
  }

  spaceProps: ISpace = {
    name: 'Test Space!',
    publishableKey: 'pk_8e77d1b186364d50bba47bacf10c0f32',
    workbook,
    listener: listener as any,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
    userInfo: {
      name: 'my space name'
    },
    spaceInfo: {
      name: 'my space name'
    },
    displayAsModal: true,
    spaceBody: {
      metadata: {
        random: 'param'
      }
    }
  }
}
