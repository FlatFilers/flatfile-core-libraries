import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { RouterOutlet } from '@angular/router'
import { SpaceModule, ISpace, SpaceService } from '@flatfile/angular-sdk'
import { workbook } from './workbook'
import { listener } from './listener'
import { State } from '../../../../packages/embedded-utils/src/types/State';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SpaceModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [SpaceService], // Add this line
})
export class AppComponent {
  title = 'create-flatfile-angular'
  showSpace: boolean = false
  data: any

  constructor(private spaceService: SpaceService) {
    console.log('ANGULAR 18')
  }

  async toggleSpace() {
    const spaceResponse = await this.spaceService.OpenEmbed(this.spaceProps)
    console.log('space', spaceResponse)
    this.showSpace = !this.showSpace
  }

  closeSpace() {
    this.showSpace = false

  }
  spaceProps: ISpace = {
    name: 'my space!',
    publishableKey: 'pk_51655484b0114c419e287872d2108df4',
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
    displayAsModal: true,
    spaceBody: {
      metadata: {
        random: 'param',
      },
    },
  }

  ngOnInit() {
    this.spaceService.spaceInitialized$.subscribe((spaceInitialized) => {
      console.log('Space spaceInitialized state changed:', { spaceInitialized })
    })
    this.spaceService.loading$.subscribe((loading) => {
      console.log('Space loading state changed:', { loading })
    })
  }
}
