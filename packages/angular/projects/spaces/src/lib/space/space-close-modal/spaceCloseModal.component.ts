import { Component, Input, OnInit } from '@angular/core'

export type SpaceCloseModalPropsType = {
  onConfirm: () => void
  onCancel: () => void
  exitText: string | undefined
  exitTitle: string | undefined
  exitPrimaryButtonText: string | undefined
  exitSecondaryButtonText: string | undefined
}

@Component({
  selector: 'space-close-modal',
  templateUrl: './spaceCloseModal.component.html',
  styleUrls: ['./spaceCloseModal.component.scss'],
})
export class SpaceCloseModal implements OnInit {
  title = 'space-close-modal'

  @Input({ required: true }) spaceCloseModalProps: SpaceCloseModalPropsType =
    {} as SpaceCloseModalPropsType
  ngOnInit(): void {}
}
