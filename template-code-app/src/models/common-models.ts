// Common models and types used across the application

export interface IOperationResult<T> {
  success: boolean;
  data: T;
  error?: Error;
}

export interface IGetAllOptions {
  filter?: string;
  orderBy?: string[];
  top?: number;
  skip?: number;
  select?: string[];
  expand?: string[];
}

export interface IPaginationInfo {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface IDataverseError {
  code: string;
  message: string;
  details?: string;
}
