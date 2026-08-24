import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

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
  year: number;

  total_income: number;
  total_expenses: number;
  taxable_income: number;
  estimated_tax: number;

  country?: string;
  state?: string;
  filingStatus?: string;
  quarter?: string;

  grossIncome?: number;
  totalDeductions?: number;
  taxableIncome?: number;

  federalTax?: number;
  stateTax?: number;
  selfEmploymentTax?: number;
  totalEstimatedTax?: number;
  effectiveTaxRate?: number;

  breakdown?: {
    bracket: string;
    rate: number;
    amount: number;
  }[];
}

export interface TaxReminder {
  id: string | number;
  title: string;
  quarter: string;
  dueDate: string;
  reminderDate?: string;
  description: string;
  estimatedTaxAmount?: number | null;
  currencySymbol?: string;
  type?: 'reminder' | 'payment';
  status?: 'upcoming' | 'due_soon' | 'completed';
  severity?: string;
  alert_type?: string;
  due_date?: string;
  is_read?: number | boolean;
  is_resolved?: number | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaxEstimatorService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  calculateTax(
    params: TaxCalculationParams
  ): Observable<TaxEstimateResult> {

    const year = new Date().getFullYear();

    return this.http.post<any>(
      `${this.apiUrl}/tax/calculate`,
      {
        year,
        ...params
      }
    ).pipe(
      map((response): TaxEstimateResult => {
        const data = response?.data || response || {};

        return this.normalizeTaxResult(data, params, year);
      }),

      catchError(() => {
        return of(this.calculateFallbackTax(params, year));
      })
    );
  }

  getTaxSummary(year: number): Observable<TaxEstimateResult> {
    return this.http.get<any>(
      `${this.apiUrl}/tax/summary/${year}`
    ).pipe(
      map((response): TaxEstimateResult => {
        const data = response?.data || response || {};

        const params: TaxCalculationParams = {
          country: data.country || 'India',
          state: data.state,
          filingStatus: data.filingStatus || 'single',
          quarter: data.quarter || 'Q1',
          grossIncome: Number(
            data.grossIncome ?? data.total_income ?? 0
          ),
          businessExpenses: 0,
          retirementContributions: 0,
          healthInsurancePremiums: 0,
          homeOfficeDeduction: 0
        };

        return this.normalizeTaxResult(data, params, year);
      }),

      catchError(() =>
        of({
          year,
          total_income: 0,
          total_expenses: 0,
          taxable_income: 0,
          estimated_tax: 0,
          grossIncome: 0,
          totalDeductions: 0,
          taxableIncome: 0,
          federalTax: 0,
          stateTax: 0,
          selfEmploymentTax: 0,
          totalEstimatedTax: 0,
          effectiveTaxRate: 0,
          breakdown: []
        })
      )
    );
  }

  getTaxReminders(): Observable<TaxReminder[]> {
    return this.http.get<any>(
      `${this.apiUrl}/alerts`
    ).pipe(
      map((response): TaxReminder[] => {
        const alerts = response?.data || response || [];

        if (!Array.isArray(alerts)) {
          return [];
        }

        return alerts.map((alert: any): TaxReminder => {
          const type: 'reminder' | 'payment' =
            String(
              alert.type ||
              alert.alert_type ||
              ''
            ).toLowerCase().includes('payment')
              ? 'payment'
              : 'reminder';

          return {
            id: alert.id,

            title:
              alert.title ||
              'Tax Reminder',

            quarter:
              this.getQuarterFromAlert(
                alert.title || '',
                alert.alert_type
              ),

            dueDate:
              alert.due_date ||
              alert.dueDate ||
              '',

            reminderDate:
              alert.reminder_date ||
              alert.due_date ||
              alert.dueDate ||
              '',

            description:
              alert.message ||
              alert.description ||
              '',

            estimatedTaxAmount:
              alert.estimated_tax_amount ?? null,

            currencySymbol:
              alert.currencySymbol || '₹',

            type,

            status:
              this.getAlertStatus(alert),

            severity:
              alert.severity,

            alert_type:
              alert.alert_type,

            due_date:
              alert.due_date,

            is_read:
              alert.is_read,

            is_resolved:
              alert.is_resolved
          };
        });
      }),

      catchError(() => {
        const reminders: TaxReminder[] = [
          {
            id: 1,
            title: 'Q1 Estimated Tax Payment',
            quarter: 'Q1',
            dueDate: 'April 15',
            reminderDate: 'April 1',
            description: 'First quarter estimated tax payment reminder.',
            type: 'reminder',
            status: 'completed',
            currencySymbol: '₹'
          },
          {
            id: 2,
            title: 'Q2 Estimated Tax Payment',
            quarter: 'Q2',
            dueDate: 'June 15',
            reminderDate: 'June 1',
            description: 'Second quarter estimated tax payment reminder.',
            type: 'payment',
            status: 'due_soon',
            currencySymbol: '₹'
          },
          {
            id: 3,
            title: 'Q3 Estimated Tax Payment',
            quarter: 'Q3',
            dueDate: 'September 15',
            reminderDate: 'September 1',
            description: 'Third quarter estimated tax payment reminder.',
            type: 'reminder',
            status: 'upcoming',
            currencySymbol: '₹'
          },
          {
            id: 4,
            title: 'Q4 Estimated Tax Payment',
            quarter: 'Q4',
            dueDate: 'January 15',
            reminderDate: 'January 1',
            description: 'Fourth quarter estimated tax payment reminder.',
            type: 'payment',
            status: 'upcoming',
            currencySymbol: '₹'
          }
        ];

        return of(reminders);
      })
    );
  }

  updateReminderStatus(
    id: string | number,
    status: string = 'completed'
  ): Observable<any> {

    if (status === 'completed') {
      return this.http.put<any>(
        `${this.apiUrl}/alerts/${id}/resolve`,
        {}
      ).pipe(
        catchError(() => of({ success: true }))
      );
    }

    return this.http.put<any>(
      `${this.apiUrl}/alerts/${id}/read`,
      {}
    ).pipe(
      catchError(() => of({ success: true }))
    );
  }

  markReminderAsRead(
    id: string | number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/alerts/${id}/read`,
      {}
    );
  }

  markReminderAsResolved(
    id: string | number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/alerts/${id}/resolve`,
      {}
    );
  }

  deleteReminder(
    id: string | number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/alerts/${id}`
    );
  }

  private normalizeTaxResult(
    data: any,
    params: TaxCalculationParams,
    year: number
  ): TaxEstimateResult {

    const grossIncome = Number(
      data.grossIncome ??
      data.total_income ??
      params.grossIncome ??
      0
    );

    const totalDeductions = Number(
      data.totalDeductions ??
      data.total_expenses ??
      (
        Number(params.businessExpenses || 0) +
        Number(params.retirementContributions || 0) +
        Number(params.healthInsurancePremiums || 0) +
        Number(params.homeOfficeDeduction || 0)
      )
    );

    const taxableIncome = Number(
      data.taxableIncome ??
      data.taxable_income ??
      Math.max(0, grossIncome - totalDeductions)
    );

    const totalEstimatedTax = Number(
      data.totalEstimatedTax ??
      data.estimated_tax ??
      0
    );

    const federalTax = Number(
      data.federalTax ?? totalEstimatedTax
    );

    const stateTax = Number(
      data.stateTax ?? 0
    );

    const selfEmploymentTax = Number(
      data.selfEmploymentTax ?? 0
    );

    const effectiveTaxRate =
      data.effectiveTaxRate !== undefined
        ? Number(data.effectiveTaxRate)
        : grossIncome > 0
          ? Number(
            (
              totalEstimatedTax / grossIncome * 100
            ).toFixed(1)
          )
          : 0;

    return {
      year: Number(data.year ?? year),

      total_income: Number(
        data.total_income ?? grossIncome
      ),

      total_expenses: Number(
        data.total_expenses ?? totalDeductions
      ),

      taxable_income: Number(
        data.taxable_income ?? taxableIncome
      ),

      estimated_tax: Number(
        data.estimated_tax ?? totalEstimatedTax
      ),

      country:
        data.country ?? params.country,

      state:
        data.state ?? params.state,

      filingStatus:
        data.filingStatus ?? params.filingStatus,

      quarter:
        data.quarter ?? params.quarter,

      grossIncome,
      totalDeductions,
      taxableIncome,

      federalTax,
      stateTax,
      selfEmploymentTax,
      totalEstimatedTax,
      effectiveTaxRate,

      breakdown:
        Array.isArray(data.breakdown)
          ? data.breakdown
          : []
    };
  }

  private calculateFallbackTax(
    params: TaxCalculationParams,
    year: number
  ): TaxEstimateResult {

    const grossIncome = Number(params.grossIncome) || 0;

    const totalDeductions =
      (Number(params.businessExpenses) || 0) +
      (Number(params.retirementContributions) || 0) +
      (Number(params.healthInsurancePremiums) || 0) +
      (Number(params.homeOfficeDeduction) || 0);

    const taxableIncome = Math.max(
      0,
      grossIncome - totalDeductions
    );

    let federalTax = 0;
    let stateTax = 0;
    let selfEmploymentTax = 0;

    if (params.country === 'India') {

      if (taxableIncome <= 300000) {
        federalTax = 0;
      } else if (taxableIncome <= 600000) {
        federalTax = (taxableIncome - 300000) * 0.05;
      } else if (taxableIncome <= 900000) {
        federalTax =
          15000 +
          (taxableIncome - 600000) * 0.10;
      } else if (taxableIncome <= 1200000) {
        federalTax =
          45000 +
          (taxableIncome - 900000) * 0.15;
      } else if (taxableIncome <= 1500000) {
        federalTax =
          90000 +
          (taxableIncome - 1200000) * 0.20;
      } else {
        federalTax =
          150000 +
          (taxableIncome - 1500000) * 0.30;
      }

      selfEmploymentTax = taxableIncome * 0.05;

    } else {

      federalTax = taxableIncome * 0.12;
      stateTax =
        params.country === 'United States'
          ? taxableIncome * 0.05
          : 0;

      selfEmploymentTax = taxableIncome * 0.153;
    }

    const totalEstimatedTax =
      federalTax +
      stateTax +
      selfEmploymentTax;

    const effectiveTaxRate =
      grossIncome > 0
        ? Number(
          (
            totalEstimatedTax / grossIncome * 100
          ).toFixed(1)
        )
        : 0;

    return {
      year,

      total_income: grossIncome,
      total_expenses: totalDeductions,
      taxable_income: taxableIncome,
      estimated_tax: totalEstimatedTax,

      country: params.country,
      state: params.state,
      filingStatus: params.filingStatus,
      quarter: params.quarter,

      grossIncome,
      totalDeductions,
      taxableIncome,

      federalTax,
      stateTax,
      selfEmploymentTax,
      totalEstimatedTax,
      effectiveTaxRate,

      breakdown: []
    };
  }

  private getQuarterFromAlert(
    title: string,
    alertType?: string
  ): string {

    const text =
      `${title || ''} ${alertType || ''}`
        .toUpperCase();

    if (
      text.includes('Q1') ||
      text.includes('QUARTER 1')
    ) {
      return 'Q1';
    }

    if (
      text.includes('Q2') ||
      text.includes('QUARTER 2')
    ) {
      return 'Q2';
    }

    if (
      text.includes('Q3') ||
      text.includes('QUARTER 3')
    ) {
      return 'Q3';
    }

    if (
      text.includes('Q4') ||
      text.includes('QUARTER 4')
    ) {
      return 'Q4';
    }

    return '';
  }

  private getAlertStatus(
    alert: any
  ): 'upcoming' | 'due_soon' | 'completed' {

    if (
      alert.is_resolved === 1 ||
      alert.is_resolved === true
    ) {
      return 'completed';
    }

    const dateValue =
      alert.due_date ||
      alert.dueDate;

    if (!dateValue) {
      return 'upcoming';
    }

    const dueDate = new Date(dateValue);

    if (Number.isNaN(dueDate.getTime())) {
      return 'upcoming';
    }

    const today = new Date();

    const difference =
      dueDate.getTime() -
      today.getTime();

    const daysRemaining = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 30) {
      return 'due_soon';
    }

    return 'upcoming';
  }
}