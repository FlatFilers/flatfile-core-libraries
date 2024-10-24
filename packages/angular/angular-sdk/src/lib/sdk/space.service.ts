import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  signal: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  OpenEmbed() {
    setTimeout(() => this.signal.emit(true), 1);
  }
}
