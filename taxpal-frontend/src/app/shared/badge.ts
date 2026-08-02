import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="type === 'income' ? 'badge-income' : 'badge-expense'">
      {{ type }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .badge-income {
      background-color: var(--income-light);
      color: var(--income-hover);
    }

    .badge-expense {
      background-color: var(--expense-light);
      color: var(--expense-hover);
    }
  `]
})
export class BadgeComponent {
  @Input() type: 'income' | 'expense' = 'income';
}
