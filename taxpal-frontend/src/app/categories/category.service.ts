import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';


export interface CategoryItem {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  description?: string;
  isCustom?: boolean;
  user_id?: string | number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly API_URL =
    'http://localhost:8080/api/categories';

  private categoriesSubject =
    new BehaviorSubject<CategoryItem[]>([]);

  public categories$ =
    this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {

    this.authService.currentUser$
      .subscribe(user => {

        if (user) {

          this.getCategories().subscribe({
            error: error => {
              console.error(
                'Initial category loading failed:',
                error
              );
            }
          });

        } else {

          this.categoriesSubject.next([]);

        }

      });
  }

  private getHeaders(): HttpHeaders {

    const token =
      this.authService.getToken();

    let headers =
      new HttpHeaders({
        'Content-Type': 'application/json'
      });

    if (token) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );

    }

    return headers;
  }

  public getCategories():
    Observable<CategoryItem[]> {

    return this.http
      .get<any>(
        this.API_URL,
        {
          headers: this.getHeaders()
        }
      )
      .pipe(

        tap(response => {

          console.log(
            'GET Categories Response:',
            response
          );

          const categories =
            Array.isArray(response?.data)
              ? response.data
              : [];

          const formattedCategories:
            CategoryItem[] =
            categories.map(
              (category: any) => ({

                id:
                  String(category.id),

                name:
                  category.name || '',

                type:
                  String(category.type)
                    .toLowerCase() === 'income'
                    ? 'income'
                    : 'expense',

                color:
                  category.color ||
                  '#3b82f6',

                description:
                  category.description ||
                  '',

                isCustom:
                  true,

                user_id:
                  category.user_id,

                created_at:
                  category.created_at,

                updated_at:
                  category.updated_at

              })
            );

          this.categoriesSubject.next(
            formattedCategories
          );

        }),

        catchError(error => {
          console.error(
            'Get Categories Error:',
            error
          );
          return of(this.categoriesSubject.value);
        })

      );
  }

  public getCategoriesByType(
    type: 'income' | 'expense'
  ): CategoryItem[] {

    return this.categoriesSubject.value
      .filter(
        category =>
          category.type === type
      );

  }

  public addCategory(
    name: string,
    type: 'income' | 'expense',
    color: string,
    description?: string
  ): Observable<CategoryItem> {

    const body = {

      name:
        name.trim(),

      type:
        type.toLowerCase(),

      color:
        color || '#3b82f6',

      description:
        description || ''

    };

    console.log(
      'POST Category Body:',
      body
    );

    return this.http
      .post<any>(
        this.API_URL,
        body,
        {
          headers:
            this.getHeaders()
        }
      )
      .pipe(

        tap(response => {

          console.log(
            'POST Category Response:',
            response
          );

          const created =
            response?.data;

          if (!created) {
            return;
          }

          const newCategory:
            CategoryItem = {

            id:
              String(created.id),

            name:
              created.name ||
              body.name,

            type:
              String(
                created.type ||
                body.type
              ).toLowerCase() === 'income'
                ? 'income'
                : 'expense',

            color:
              created.color ||
              body.color,

            description:
              created.description ||
              body.description ||
              '',

            isCustom:
              true,

            user_id:
              created.user_id,

            created_at:
              created.created_at

          };

          const current =
            this.categoriesSubject.value;

          const exists =
            current.some(
              category =>
                String(category.id) ===
                String(newCategory.id)
            );

          if (!exists) {

            this.categoriesSubject.next([
              ...current,
              newCategory
            ]);

          }

        }),

        catchError(error => {

          console.error(
            'Create Category Error:',
            error
          );

          return throwError(
            () => error
          );

        })

      );
  }

  public updateCategory(
    id: string,
    name: string,
    color: string,
    description?: string,
    type?: 'income' | 'expense'
  ): Observable<any> {

    const body: any = {

      name:
        name.trim(),

      color:
        color || '#3b82f6',

      description:
        description || ''

    };

    if (type) {

      body.type =
        type.toLowerCase();

    }

    console.log(
      'PUT Category ID:',
      id
    );

    console.log(
      'PUT Category Body:',
      body
    );

    return this.http
      .put<any>(
        `${this.API_URL}/${id}`,
        body,
        {
          headers:
            this.getHeaders()
        }
      )
      .pipe(

        tap(response => {

          console.log(
            'PUT Category Response:',
            response
          );

          const current =
            this.categoriesSubject.value;

          const updated =
            current.map(category => {

              if (
                String(category.id) !==
                String(id)
              ) {

                return category;

              }

              return {

                ...category,

                id:
                  String(category.id),

                name:
                  body.name,

                color:
                  body.color,

                description:
                  body.description,

                type:
                  body.type ||
                  category.type

              };

            });

          this.categoriesSubject.next(
            updated
          );

        }),

        catchError(error => {

          console.error(
            'Update Category Error:',
            error
          );

          return throwError(
            () => error
          );

        })

      );
  }

  public deleteCategory(
    id: string
  ): Observable<any> {

    console.log(
      'DELETE Category ID:',
      id
    );

    return this.http
      .delete<any>(
        `${this.API_URL}/${id}`,
        {
          headers:
            this.getHeaders()
        }
      )
      .pipe(

        tap(response => {

          console.log(
            'DELETE Category Response:',
            response
          );

          const updated =
            this.categoriesSubject.value
              .filter(
                category =>
                  String(category.id) !==
                  String(id)
              );

          this.categoriesSubject.next(
            updated
          );

        }),

        catchError(error => {

          console.error(
            'Delete Category Error:',
            error
          );

          return throwError(
            () => error
          );

        })

      );
  }

  public suggestCategory(
    description: string,
    type: 'income' | 'expense' = 'expense'
  ): string {

    if (
      !description ||
      !description.trim()
    ) {

      return '';

    }

    const text =
      description
        .toLowerCase()
        .trim();

    if (type === 'income') {

      if (
        text.includes('design') ||
        text.includes('ui') ||
        text.includes('ux') ||
        text.includes('figma')
      ) {

        return 'Web Design';

      }

      if (
        text.includes('consult') ||
        text.includes('advisory') ||
        text.includes('client')
      ) {

        return 'Consulting';

      }

      if (
        text.includes('sale') ||
        text.includes('course') ||
        text.includes('template')
      ) {

        return 'Product Sales';

      }

      if (
        text.includes('affiliate') ||
        text.includes('royalty')
      ) {

        return 'Royalties';

      }

      return 'Consulting';
    }

    if (
      text.includes('rent') ||
      text.includes('mortgage') ||
      text.includes('lease')
    ) {

      if (
        text.includes('office') ||
        text.includes('wework') ||
        text.includes('desk')
      ) {

        return 'Office Rent';

      }

      return 'Rent/Mortgage';
    }

    if (
      text.includes('software') ||
      text.includes('saas') ||
      text.includes('aws') ||
      text.includes('github') ||
      text.includes('adobe') ||
      text.includes('hostinger') ||
      text.includes('domain') ||
      text.includes('hosting')
    ) {

      return 'Software Subscriptions';

    }

    if (
      text.includes('travel') ||
      text.includes('uber') ||
      text.includes('flight') ||
      text.includes('cab') ||
      text.includes('hotel') ||
      text.includes('taxi')
    ) {

      return 'Travel';

    }

    if (
      text.includes('meal') ||
      text.includes('coffee') ||
      text.includes('starbucks') ||
      text.includes('swiggy') ||
      text.includes('zomato') ||
      text.includes('dinner') ||
      text.includes('lunch')
    ) {

      return 'Meals & Entertainment';

    }

    if (
      text.includes('marketing') ||
      text.includes('ad') ||
      text.includes('google ads') ||
      text.includes('facebook ads') ||
      text.includes('seo')
    ) {

      return 'Marketing';

    }

    if (
      text.includes('utility') ||
      text.includes('electric') ||
      text.includes('internet') ||
      text.includes('wifi') ||
      text.includes('phone')
    ) {

      return 'Utilities';

    }

    if (
      text.includes('course') ||
      text.includes('udemy') ||
      text.includes('book') ||
      text.includes('training') ||
      text.includes('conference')
    ) {

      return 'Professional Development';

    }

    if (
      text.includes('grocery') ||
      text.includes('food') ||
      text.includes('supermarket')
    ) {

      return 'Food';

    }

    return 'Business Expenses';
  }
}