import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
  description?: string;
  createdAt?: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'Good' | 'Warning' | 'Exceeded';
  statusColor: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  healthStatus: 'Good' | 'Warning' | 'Critical';
  healthColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private apiUrl = 'http://localhost:8080/api/budgets';

  private budgetsSubject =
    new BehaviorSubject<BudgetProgress[]>([]);

  public budgets$ =
    this.budgetsSubject.asObservable();


  constructor(
    private http: HttpClient
  ) { }


  // ==========================================
  // Convert YYYY-MM to YYYY-MM-01
  // ==========================================

  private formatMonthForBackend(
    month: string
  ): string {

    if (!month) {
      return '';
    }

    if (month.length === 7) {
      return `${month}-01`;
    }

    return month;
  }


  // ==========================================
  // Convert backend date to YYYY-MM
  // ==========================================

  private formatMonthForFrontend(
    month: string
  ): string {

    if (!month) {
      return '';
    }

    return month.substring(0, 7);
  }


  // ==========================================
  // GET ALL BUDGETS
  // ==========================================

  getBudgets(): Observable<any> {

    return this.http.get(
      this.apiUrl
    );
  }


  // ==========================================
  // GET SINGLE BUDGET
  // ==========================================

  getBudgetById(
    id: string
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${id}`
    );
  }


  // ==========================================
  // GET BUDGETS BY MONTH
  // ==========================================

  getBudgetsByMonth(
    targetMonth: string
  ): Observable<BudgetProgress[]> {

    const month =
      this.formatMonthForBackend(
        targetMonth
      );

    return new Observable<BudgetProgress[]>(
      observer => {

        this.http.get<any>(
          `${this.apiUrl}/progress?month=${month}`
        )
          .subscribe({

            next: (response) => {

              const data =
                response?.data || [];

              const budgets: BudgetProgress[] =
                data.map((item: any) => {

                  const percentage =
                    Number(
                      item.percentage || 0
                    );

                  let status:
                    'Good' |
                    'Warning' |
                    'Exceeded' =
                    'Good';

                  let statusColor =
                    '#10b981';

                  if (percentage >= 100) {

                    status =
                      'Exceeded';

                    statusColor =
                      '#ef4444';

                  } else if (percentage >= 80) {

                    status =
                      'Warning';

                    statusColor =
                      '#f59e0b';

                  }

                  return {

                    id:
                      String(item.id),

                    category:
                      item.category,

                    limit:
                      Number(
                        item.budget || 0
                      ),

                    month:
                      this.formatMonthForFrontend(
                        item.month
                      ),

                    description:
                      item.description || '',

                    createdAt:
                      item.created_at || '',

                    spent:
                      Number(
                        item.spent || 0
                      ),

                    remaining:
                      Number(
                        item.remaining || 0
                      ),

                    percentage,

                    status,

                    statusColor

                  };

                });


              this.budgetsSubject.next(
                budgets
              );


              observer.next(
                budgets
              );

              observer.complete();

            },

            error: (error) => {

              console.error(
                'Get Budget Progress Error:',
                error
              );

              observer.error(
                error
              );

            }

          });

      }
    );
  }


  // ==========================================
  // GET BUDGET SUMMARY
  // ==========================================

  getBudgetSummary(
    targetMonth: string
  ): Observable<BudgetSummary> {

    return new Observable<BudgetSummary>(
      observer => {

        this.getBudgetsByMonth(
          targetMonth
        )
          .subscribe({

            next: (budgets) => {

              const totalBudget =
                budgets.reduce(
                  (sum, budget) =>
                    sum +
                    Number(
                      budget.limit || 0
                    ),
                  0
                );


              const totalSpent =
                budgets.reduce(
                  (sum, budget) =>
                    sum +
                    Number(
                      budget.spent || 0
                    ),
                  0
                );


              const remaining =
                totalBudget -
                totalSpent;


              const hasExceeded =
                budgets.some(
                  budget =>
                    budget.status ===
                    'Exceeded'
                );


              const hasWarning =
                budgets.some(
                  budget =>
                    budget.status ===
                    'Warning'
                );


              let healthStatus:
                'Good' |
                'Warning' |
                'Critical' =
                'Good';

              let healthColor =
                '#10b981';


              if (hasExceeded) {

                healthStatus =
                  'Critical';

                healthColor =
                  '#ef4444';

              } else if (hasWarning) {

                healthStatus =
                  'Warning';

                healthColor =
                  '#f59e0b';

              }


              observer.next({

                totalBudget,

                totalSpent,

                remaining,

                healthStatus,

                healthColor

              });


              observer.complete();

            },

            error: (error) => {

              observer.error(
                error
              );

            }

          });

      }
    );
  }


  // ==========================================
  // CREATE BUDGET
  // ==========================================

  addBudget(
    budgetData: {
      category: string;
      limit: number;
      month: string;
      description?: string;
    }
  ): Observable<any> {

    const body = {

      category:
        budgetData.category,

      budget_limit:
        Number(
          budgetData.limit
        ),

      month:
        this.formatMonthForBackend(
          budgetData.month
        ),

      description:
        budgetData.description ||
        null

    };


    console.log(
      'Creating Budget'
    );

    console.log(
      'POST URL:',
      this.apiUrl
    );

    console.log(
      'POST BODY:',
      body
    );


    return this.http.post(
      this.apiUrl,
      body
    );
  }


  // ==========================================
  // UPDATE BUDGET
  // ==========================================

  updateBudget(
    id: string,
    budgetData: {
      category: string;
      limit: number;
      month: string;
      description?: string;
    }
  ): Observable<any> {

    const body = {

      category:
        budgetData.category,

      budget_limit:
        Number(
          budgetData.limit
        ),

      month:
        this.formatMonthForBackend(
          budgetData.month
        ),

      description:
        budgetData.description ||
        null

    };


    console.log(
      'Updating Budget'
    );

    console.log(
      'PUT URL:',
      `${this.apiUrl}/${id}`
    );

    console.log(
      'PUT BODY:',
      body
    );


    return this.http.put(
      `${this.apiUrl}/${id}`,
      body
    );
  }


  // ==========================================
  // DELETE BUDGET
  // ==========================================

  deleteBudget(
    id: string
  ): Observable<any> {

    console.log(
      'Deleting Budget:',
      id
    );


    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}