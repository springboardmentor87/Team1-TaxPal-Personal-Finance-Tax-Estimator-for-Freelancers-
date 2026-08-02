import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onClose()">
      <div class="modal-container" [style.max-width]="maxWidth" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title" [ngStyle]="{'color': titleColor}">{{ title }}</h2>
          <button class="modal-close" (click)="onClose()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ModalWrapperComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() titleColor = 'var(--text-primary)';
  @Input() maxWidth = '500px';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
