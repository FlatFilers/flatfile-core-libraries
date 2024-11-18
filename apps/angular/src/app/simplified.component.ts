import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SpaceModule, SpaceService } from '@flatfile/angular-sdk';

const sheet = {
  name: 'Contacts',
  slug: 'contacts',
  fields: [
    {
      key: 'firstName',
      type: 'string',
      label: 'First Name',
    },
    {
      key: 'lastName',
      type: 'string',
      label: 'Last Name',
    },
    {
      key: 'email',
      type: 'string',
      label: 'Email',
    },
  ],
}

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

  spaceProps = {
    name: 'My space!',
    environmentId: 'us_env_1234',
    publishableKey: 'pk_1234',
    sheet,
    onSubmit: async ({ job, sheet, }: { job?: any, sheet?: any }): Promise<any> => {
      const data = await sheet.allData()
      console.log('onSubmit', data)
    },
    onRecordHook: (record: any, event: any) => {
      const firstName = record.get('firstName')
      const lastName = record.get('lastName')
      if (firstName && !lastName) {
        record.set('lastName', 'Rock')
        record.addInfo('lastName', 'Welcome to the Rock fam')
      }
      return record
    },
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
    displayAsModal: true
  }
}
