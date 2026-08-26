import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

export interface TaxCalculationParams {
  country: string;
  state?: string;

  filingStatus:
  | 'single'
  | 'married_joint'
  | 'head_of_household';

  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  grossIncome: number;
  businessExpenses: number;
  retirementContributions: number;
  healthInsurancePremiums: number;
  homeOfficeDeduction: number;
}

export interface TaxEstimateResult {
  id?: number;

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

export interface TaxAlert {
  id: number;
  user_id: number;

  title: string;
  message: string;

  severity: string;
  alert_type: string;

  due_date: string;

  estimated_tax_amount?: number | null;

  is_read?: number;
  is_resolved?: number;

  created_at?: string;
  updated_at?: string;
}

export interface TaxReminder {
  id: number;

  user_id?: number;
  year?: number;

  title: string;
  description?: string;

  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  due_date: string;

  reminder_date?: string | null;

  estimated_tax_amount?: number | null;

  currency_symbol?: string;

  type?: 'reminder' | 'payment';

  status?:
  | 'upcoming'
  | 'due_soon'
  | 'completed'
  | 'pending'
  | 'paid'
  | 'overdue';

  completed?: number;

  // Frontend uses this to identify where
  // the item came from
  source?: 'event' | 'payment';
}

export interface TaxPayment {
  id: number;

  user_id?: number;

  tax_calculation_id?: number | null;

  year: number;

  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  amount: number;

  payment_date?: string | null;

  due_date?: string | null;

  status:
  | 'pending'
  | 'paid'
  | 'overdue';

  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaxEstimatorService {

  private taxApiUrl =
    'http://localhost:8080/api/tax';

  private alertApiUrl =
    'http://localhost:8080/api/alerts';

  private eventApiUrl =
    'http://localhost:8080/api/tax-events';

  constructor(
    private http: HttpClient
  ) { }

  // =====================================================
  // TAX CALCULATION
  // =====================================================

  calculateTax(
    params: TaxCalculationParams
  ): Observable<TaxEstimateResult> {

    return this.http
      .post<any>(
        `${this.taxApiUrl}/calculate`,
        params
      )
      .pipe(

        map(
          response =>
            response?.data || response
        ),

        catchError(() => {

          const grossIncome =
            Number(params.grossIncome) || 0;

          const businessExpenses =
            Number(params.businessExpenses) || 0;

          const retirement =
            Number(params.retirementContributions) || 0;

          const healthInsurance =
            Number(params.healthInsurancePremiums) || 0;

          const homeOffice =
            Number(params.homeOfficeDeduction) || 0;

          const totalDeductions =
            businessExpenses +
            retirement +
            healthInsurance +
            homeOffice;

          const taxableIncome =
            Math.max(
              0,
              grossIncome - totalDeductions
            );

          let federalTax = 0;
          let stateTax = 0;
          let selfEmploymentTax = 0;

          const breakdown: {
            bracket: string;
            rate: number;
            amount: number;
          }[] = [];

          if (params.country === 'India') {

            const annualIncome =
              taxableIncome * 4;

            let annualTax = 0;

            if (annualIncome > 1500000) {

              annualTax =
                150000 +
                (annualIncome - 1500000) * 0.30;

              breakdown.push({
                bracket: '> ₹15,00,000',
                rate: 30,
                amount:
                  (
                    (annualIncome - 1500000) *
                    0.30
                  ) / 4
              });

            } else if (annualIncome > 1200000) {

              annualTax =
                90000 +
                (annualIncome - 1200000) * 0.20;

              breakdown.push({
                bracket: '₹12L - ₹15L',
                rate: 20,
                amount:
                  (
                    (annualIncome - 1200000) *
                    0.20
                  ) / 4
              });

            } else if (annualIncome > 900000) {

              annualTax =
                45000 +
                (annualIncome - 900000) * 0.15;

              breakdown.push({
                bracket: '₹9L - ₹12L',
                rate: 15,
                amount:
                  (
                    (annualIncome - 900000) *
                    0.15
                  ) / 4
              });

            } else if (annualIncome > 600000) {

              annualTax =
                15000 +
                (annualIncome - 600000) * 0.10;

              breakdown.push({
                bracket: '₹6L - ₹9L',
                rate: 10,
                amount:
                  (
                    (annualIncome - 600000) *
                    0.10
                  ) / 4
              });

            } else if (annualIncome > 300000) {

              annualTax =
                (annualIncome - 300000) * 0.05;

              breakdown.push({
                bracket: '₹3L - ₹6L',
                rate: 5,
                amount:
                  (
                    (annualIncome - 300000) *
                    0.05
                  ) / 4
              });
            }

            federalTax =
              Math.round(annualTax / 4);

            selfEmploymentTax =
              Math.round(taxableIncome * 0.05);

          } else {

            const annualIncome =
              taxableIncome * 4;

            let annualFedTax = 0;

            if (annualIncome > 100000) {

              annualFedTax =
                16290 +
                (annualIncome - 100000) * 0.24;

              breakdown.push({
                bracket: '24% Bracket',
                rate: 24,
                amount:
                  (
                    (annualIncome - 100000) *
                    0.24
                  ) / 4
              });

            } else if (annualIncome > 47150) {

              annualFedTax =
                5426 +
                (annualIncome - 47150) * 0.22;

              breakdown.push({
                bracket: '22% Bracket',
                rate: 22,
                amount:
                  (
                    (annualIncome - 47150) *
                    0.22
                  ) / 4
              });

            } else if (annualIncome > 11600) {

              annualFedTax =
                1160 +
                (annualIncome - 11600) * 0.12;

              breakdown.push({
                bracket: '12% Bracket',
                rate: 12,
                amount:
                  (
                    (annualIncome - 11600) *
                    0.12
                  ) / 4
              });

            } else {

              annualFedTax =
                annualIncome * 0.10;

              breakdown.push({
                bracket: '10% Bracket',
                rate: 10,
                amount: annualFedTax / 4
              });
            }

            federalTax =
              Math.round(annualFedTax / 4);

            stateTax =
              Math.round(taxableIncome * 0.05);

            selfEmploymentTax =
              Math.round(taxableIncome * 0.153);
          }

          const totalEstimatedTax =
            federalTax +
            stateTax +
            selfEmploymentTax;

          const effectiveTaxRate =
            grossIncome > 0
              ? Number(
                (
                  (totalEstimatedTax /
                    grossIncome) *
                  100
                ).toFixed(1)
              )
              : 0;

          const result: TaxEstimateResult = {
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

            breakdown
          };

          return of(result);
        })
      );
  }

  // =====================================================
  // ALERTS
  // =====================================================

  createQuarterlyAlerts(
    year: number
  ): Observable<TaxAlert[]> {

    return this.http
      .post<any>(
        `${this.alertApiUrl}/quarterly`,
        { year }
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  getAlerts(): Observable<TaxAlert[]> {

    return this.http
      .get<any>(
        this.alertApiUrl
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  markAlertAsRead(
    id: number
  ): Observable<any> {

    return this.http
      .patch<any>(
        `${this.alertApiUrl}/${id}/read`,
        {}
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  markAlertAsResolved(
    id: number
  ): Observable<any> {

    return this.http
      .patch<any>(
        `${this.alertApiUrl}/${id}/resolve`,
        {}
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  deleteAlert(
    id: number
  ): Observable<any> {

    return this.http
      .delete<any>(
        `${this.alertApiUrl}/${id}`
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  // =====================================================
  // TAX EVENTS
  // =====================================================

  getTaxReminders(): Observable<TaxReminder[]> {

    return this.http
      .get<any>(
        this.eventApiUrl
      )
      .pipe(

        map(response => {

          const events =
            response?.data || response || [];

          return events.map(
            (item: any): TaxReminder => ({
              ...item,

              source: 'event',

              quarter:
                item.quarter || 'Q1'
            })
          );
        })
      );
  }

  createQuarterlyTaxEvents(
    year: number
  ): Observable<TaxReminder[]> {

    return this.http
      .post<any>(
        `${this.eventApiUrl}/quarterly`,
        { year }
      )
      .pipe(

        map(response => {

          const events =
            response?.data || response || [];

          return events.map(
            (item: any): TaxReminder => ({
              ...item,

              source: 'event',

              quarter:
                item.quarter || 'Q1'
            })
          );
        })
      );
  }

  createTaxEvent(
    event: Partial<TaxReminder>
  ): Observable<TaxReminder> {

    return this.http
      .post<any>(
        this.eventApiUrl,
        event
      )
      .pipe(

        map(response => {

          const item =
            response?.data || response;

          return {
            ...item,
            source: 'event',
            quarter:
              item.quarter || 'Q1'
          } as TaxReminder;
        })
      );
  }

  updateTaxEvent(
    id: number,
    event: Partial<TaxReminder>
  ): Observable<any> {

    return this.http
      .put<any>(
        `${this.eventApiUrl}/${id}`,
        event
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  markEventAsCompleted(
    id: number
  ): Observable<any> {

    return this.http
      .patch<any>(
        `${this.eventApiUrl}/${id}/complete`,
        {}
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  deleteTaxEvent(
    id: number
  ): Observable<any> {

    return this.http
      .delete<any>(
        `${this.eventApiUrl}/${id}`
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  // =====================================================
  // TAX PAYMENTS
  // =====================================================

  getTaxPayments(): Observable<TaxPayment[]> {

    return this.http
      .get<any>(
        `${this.taxApiUrl}/payments`
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  createTaxPayment(
    payment: Partial<TaxPayment>
  ): Observable<TaxPayment> {

    return this.http
      .post<any>(
        `${this.taxApiUrl}/payments`,
        payment
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  markPaymentAsPaid(
    id: number
  ): Observable<any> {

    return this.http
      .patch<any>(
        `${this.taxApiUrl}/payments/${id}/pay`,
        {}
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  updateTaxPayment(
    id: number,
    payment: Partial<TaxPayment>
  ): Observable<any> {

    return this.http
      .put<any>(
        `${this.taxApiUrl}/payments/${id}`,
        payment
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  deleteTaxPayment(
    id: number
  ): Observable<any> {

    return this.http
      .delete<any>(
        `${this.taxApiUrl}/payments/${id}`
      )
      .pipe(
        map(
          response =>
            response?.data || response
        )
      );
  }

  // =====================================================
  // COMBINED DATA FOR TAX ESTIMATOR UI
  // =====================================================

  getCombinedTaxItems(): Observable<TaxReminder[]> {

    return this.getTaxReminders().pipe(
      map(
        reminders => reminders.map(
          item => ({
            ...item,
            source: 'event' as const
          })
        )
      )
    );
  }
}