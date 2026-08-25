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

@Injectable({
  providedIn: 'root'
})
export class TaxEstimatorService {

  private taxApiUrl = 'http://localhost:8080/api/tax';
  private alertApiUrl = 'http://localhost:8080/api/alerts';

  constructor(private http: HttpClient) { }

  calculateTax(
    params: TaxCalculationParams
  ): Observable<TaxEstimateResult> {

    return this.http
      .post<any>(
        `${this.taxApiUrl}/calculate`,
        params
      )
      .pipe(
        map(response => response.data || response),

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
                  ((annualIncome - 1500000) * 0.30) / 4
              });

            } else if (annualIncome > 1200000) {

              annualTax =
                90000 +
                (annualIncome - 1200000) * 0.20;

              breakdown.push({
                bracket: '₹12L - ₹15L',
                rate: 20,
                amount:
                  ((annualIncome - 1200000) * 0.20) / 4
              });

            } else if (annualIncome > 900000) {

              annualTax =
                45000 +
                (annualIncome - 900000) * 0.15;

              breakdown.push({
                bracket: '₹9L - ₹12L',
                rate: 15,
                amount:
                  ((annualIncome - 900000) * 0.15) / 4
              });

            } else if (annualIncome > 600000) {

              annualTax =
                15000 +
                (annualIncome - 600000) * 0.10;

              breakdown.push({
                bracket: '₹6L - ₹9L',
                rate: 10,
                amount:
                  ((annualIncome - 600000) * 0.10) / 4
              });

            } else if (annualIncome > 300000) {

              annualTax =
                (annualIncome - 300000) * 0.05;

              breakdown.push({
                bracket: '₹3L - ₹6L',
                rate: 5,
                amount:
                  ((annualIncome - 300000) * 0.05) / 4
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
                  ((annualIncome - 100000) * 0.24) / 4
              });

            } else if (annualIncome > 47150) {

              annualFedTax =
                5426 +
                (annualIncome - 47150) * 0.22;

              breakdown.push({
                bracket: '22% Bracket',
                rate: 22,
                amount:
                  ((annualIncome - 47150) * 0.22) / 4
              });

            } else if (annualIncome > 11600) {

              annualFedTax =
                1160 +
                (annualIncome - 11600) * 0.12;

              breakdown.push({
                bracket: '12% Bracket',
                rate: 12,
                amount:
                  ((annualIncome - 11600) * 0.12) / 4
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

  createQuarterlyAlerts(
    year: number
  ): Observable<TaxAlert[]> {

    return this.http
      .post<any>(
        `${this.alertApiUrl}/quarterly`,
        { year }
      )
      .pipe(
        map(response => response.data || response)
      );
  }

  getAlerts(): Observable<TaxAlert[]> {

    return this.http
      .get<any>(
        `${this.alertApiUrl}`
      )
      .pipe(
        map(response => response.data || response)
      );
  }

  markAlertAsRead(
    id: number
  ): Observable<any> {

    return this.http.patch(
      `${this.alertApiUrl}/${id}/read`,
      {}
    );
  }

  markAlertAsResolved(
    id: number
  ): Observable<any> {

    return this.http.patch(
      `${this.alertApiUrl}/${id}/resolve`,
      {}
    );
  }

  deleteAlert(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.alertApiUrl}/${id}`
    );
  }
}