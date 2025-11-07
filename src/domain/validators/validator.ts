import { validate, ValidationError } from 'class-validator';

export interface ValidationErrorResponse {
  property: string;
  errorMessages: string[];
}

export abstract class BaseValidator<T extends object> {
  public entity: T;
  public listErrors: ValidationError[];

  constructor(entity: T) {
    this.entity = entity;
    this.listErrors = [];
  }


  public async validateOrThrow(): Promise<void> {
    await this.validate();
    if (this.hasErrors()) {
      throw {
        http_status: 422,
        validations: this.getFormattedErrors(),
      };
    }
  }

  public async isValid(): Promise<boolean> {
    await this.validate();
    return !this.hasErrors();
  }

  protected async validate(): Promise<void> {
    this.listErrors = await validate(this.entity);
  }

  protected hasErrors(): boolean {
    return this.listErrors.length > 0;
  }

  protected getFormattedErrors(): ValidationErrorResponse[] {
    return this.listErrors.map((error) => ({
      property: error.property,
      errorMessages: Object.values(error.constraints || {}),
    }));
  }

  public getErrors(): ValidationError[] {
    return this.listErrors;
  }

  public getFirstError(): string | null {
    if (this.listErrors.length === 0) {
      return null;
    }

    const firstError = this.listErrors[0];
    const constraints = Object.values(firstError.constraints || {});
    return constraints[0] || null;
  }
}