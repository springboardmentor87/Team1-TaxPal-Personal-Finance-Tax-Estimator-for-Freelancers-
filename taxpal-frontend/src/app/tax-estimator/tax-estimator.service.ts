import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, catchError, map } from 'rxjs';

export interface TaxCalculationParams {
  country: string;
  state?: string;
  filingStatus: 'single' | 'married_joint' | 'head_of_household';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  grossIncome: number;
  businessExpenses: number;
  retirementContributions: number;
  healthInsurancePremiums: number;
  homeOfficeDeduction: number;
}

export interface TaxEstimateResult {
  country: string;
  state?: string;
  filingStatus: string;
  quarter: string;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  selfEmploymentTax: number;
  totalEstimatedTax: number;
  effectiveTaxRate: number;
  breakdown: {
    bracket: string;
    rate: number;
    amount: number;
  }[];
}

export interface TaxReminder {
  id: string;
  title: string;
  quarter: string;
  dueDate: string;
  reminderDate: string;
  description: string;
  estimatedTaxAmount?: number | null;
  currencySymbol?: string;
  type: 'reminder' | 'payment';
  status: 'upcoming' | 'due_soon' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class TaxEstimatorService {
  private apiUrl = 'http://localhost:8080/api/tax';

  constructor(private http: HttpClient) {}

  calculateTax(params: TaxCalculationParams): Observable<TaxEstimateResult> {
    return this.http.post<any>(`${this.apiUrl}/calculate`, params).pipe(
      map(response => response.data || response),
      catchError(() => {
        // Client-side fallback calculation engine
        const grossIncome = Number(params.grossIncome) || 0;
        const businessExpenses = Number(params.businessExpenses) || 0;
        const retirement = Number(params.retirementContributions) || 0;
        const healthInsurance = Number(params.healthInsurancePremiums) || 0;
        const homeOffice = Number(params.homeOfficeDeduction) || 0;

        const totalDeductions = businessExpenses + retirement + healthInsurance + homeOffice;
        const netIncome = Math.max(0, grossIncome - totalDeductions);

        let federalTax = 0;
        let stateTax = 0;
        let selfEmploymentTax = 0;
        const breakdown: { bracket: string; rate: number; amount: number }[] = [];

        if (params.country === 'India') {
          const annualIncome = netIncome * 4;
          let annualTax = 0;
          
          if (annualIncome > 1500000) {
            annualTax = 150000 + (annualIncome - 1500000) * 0.30;
            breakdown.push({ bracket: '> ₹15,00,000', rate: 30, amount: (annualIncome - 1500000) * 0.30 / 4 });
          } else if (annualIncome > 1200000) {
            annualTax = 90000 + (annualIncome - 1200000) * 0.20;
            breakdown.push({ bracket: '₹12L - ₹15L', rate: 20, amount: (annualIncome - 1200000) * 0.20 / 4 });
          } else if (annualIncome > 900000) {
            annualTax = 45000 + (annualIncome - 900000) * 0.15;
            breakdown.push({ bracket: '₹9L - ₹12L', rate: 15, amount: (annualIncome - 900000) * 0.15 / 4 });
          } else if (annualIncome > 600000) {
            annualTax = 15000 + (annualIncome - 600000) * 0.10;
            breakdown.push({ bracket: '₹6L - ₹9L', rate: 10, amount: (annualIncome - 600000) * 0.10 / 4 });
          } else if (annualIncome > 300000) {
            annualTax = (annualIncome - 300000) * 0.05;
            breakdown.push({ bracket: '₹3L - ₹6L', rate: 5, amount: (annualIncome - 300000) * 0.05 / 4 });
          }

          federalTax = Math.round(annualTax / 4);
          selfEmploymentTax = Math.round(netIncome * 0.05);
        } else {
          const annualIncome = netIncome * 4;
          let annualFedTax = 0;

          if (annualIncome > 100000) {
            annualFedTax = 16290 + (annualIncome - 100000) * 0.24;
            breakdown.push({ bracket: '24% Bracket', rate: 24, amount: (annualIncome - 100000) * 0.24 / 4 });
          } else if (annualIncome > 47150) {
            annualFedTax = 5426 + (annualIncome - 47150) * 0.22;
            breakdown.push({ bracket: '22% Bracket', rate: 22, amount: (annualIncome - 47150) * 0.22 / 4 });
          } else if (annualIncome > 11600) {
            annualFedTax = 1160 + (annualIncome - 11600) * 0.12;
            breakdown.push({ bracket: '12% Bracket', rate: 12, amount: (annualIncome - 11600) * 0.12 / 4 });
          } else {
            annualFedTax = annualIncome * 0.10;
            breakdown.push({ bracket: '10% Bracket', rate: 10, amount: annualFedTax / 4 });
          }

          federalTax = Math.round(annualFedTax / 4);
          stateTax = Math.round(netIncome * 0.05);
          selfEmploymentTax = Math.round(netIncome * 0.153);
        }

        const totalEstimatedTax = federalTax + stateTax + selfEmploymentTax;
        const effectiveTaxRate = grossIncome > 0 ? Number(((totalEstimatedTax / grossIncome) * 100).toFixed(1)) : 0;

        const result: TaxEstimateResult = {
          country: params.country,
          state: params.state,
          filingStatus: params.filingStatus,
          quarter: params.quarter,
          grossIncome,
          totalDeductions,
          taxableIncome: netIncome,
          federalTax,
          stateTax,
          selfEmploymentTax,
          totalEstimatedTax,
          effectiveTaxRate,
          breakdown
        };

        return of(result);
      })
    );
  }

  getTaxReminders(): Observable<TaxReminder[]> {
    return this.http.get<any>(`${this.apiUrl}/reminders`).pipe(
      map(response => response.data || response),
      catchError(() => {
        const reminders: TaxReminder[] = [
          {
            id: '1',
            title: 'Reminder: Q1 Estimated Tax Payment',
            quarter: 'Q1',
            dueDate: 'April 15, 2026',
            reminderDate: 'April 1, 2026',
            description: 'First quarter estimated tax payment due for Jan-Mar earnings.',
            type: 'reminder',
            status: 'completed'
          },
          {
            id: '2',
            title: 'Q1 Estimated Tax Payment Due',
            quarter: 'Q1',
            dueDate: 'April 15, 2026',
            reminderDate: 'April 15, 2026',
            description: 'Submit your Q1 tax payment to tax authorities.',
            type: 'payment',
            status: 'completed'
          },
          {
            id: '3',
            title: 'Reminder: Q2 Estimated Tax Payment',
            quarter: 'Q2',
            dueDate: 'June 15, 2026',
            reminderDate: 'June 1, 2026',
            description: 'Reminder for upcoming Q2 estimated tax payment due on June 15.',
            type: 'reminder',
            status: 'due_soon'
          },
          {
            id: '4',
            title: 'Q2 Estimated Tax Payment',
            quarter: 'Q2',
            dueDate: 'June 15, 2026',
            reminderDate: 'June 15, 2026',
            description: 'Second quarter estimated tax payment due.',
            type: 'payment',
            status: 'upcoming'
          },
          {
            id: '5',
            title: 'Reminder: Q3 Estimated Tax Payment',
            quarter: 'Q3',
            dueDate: 'September 15, 2026',
            reminderDate: 'September 1, 2026',
            description: 'Reminder for upcoming Q3 estimated tax payment due on Sep 15.',
            type: 'reminder',
            status: 'upcoming'
          },
          {
            id: '6',
            title: 'Q3 Estimated Tax Payment',
            quarter: 'Q3',
            dueDate: 'September 15, 2026',
            reminderDate: 'September 15, 2026',
            description: 'Third quarter estimated tax payment due.',
            type: 'payment',
            status: 'upcoming'
          },
          {
            id: '7',
            title: 'Reminder: Q4 Estimated Tax Payment',
            quarter: 'Q4',
            dueDate: 'January 15, 2027',
            reminderDate: 'January 1, 2027',
            description: 'Fourth quarter estimated tax payment due.',
            type: 'reminder',
            status: 'upcoming'
          }
        ];

        return of(reminders);
      })
    );
  }

  updateReminderStatus(id: string, status: string = 'completed'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/reminders/${id}/status`, { status }).pipe(
      catchError(() => of({ success: true }))
    );
  }
}
