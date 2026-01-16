import type { GeorgTown } from '../models/georg-town-model';
import type { IGetAllOptions } from '../models/common-models';
import type { IOperationResult } from '@microsoft/power-apps/data';
import { getClient } from '../../../app-gen-sdk/data';

export class GeorgTownService {
  private static readonly dataSourceName = 'GeorgTown';

  private static readonly client = getClient();

  public static async create(record: Omit<GeorgTown, 'id'>): Promise<IOperationResult<GeorgTown>> {
    const result = await GeorgTownService.client.createRecordAsync<Omit<GeorgTown, 'id'>, GeorgTown>(
      GeorgTownService.dataSourceName,
      record
    );
    return result;
  }

  public static async update(id: string, changedFields: Partial<Omit<GeorgTown, 'id'>>): Promise<IOperationResult<GeorgTown>> {
    const result = await GeorgTownService.client.updateRecordAsync<Partial<Omit<GeorgTown, 'id'>>, GeorgTown>(
      GeorgTownService.dataSourceName,
      id.toString(),
      changedFields
    );
    return result;
  }

  public static async delete(id: string): Promise<void> {
    await GeorgTownService.client.deleteRecordAsync(
      GeorgTownService.dataSourceName,
      id.toString());
  }

  public static async get(id: string): Promise<IOperationResult<GeorgTown>> {
    const result = await GeorgTownService.client.retrieveRecordAsync<GeorgTown>(
      GeorgTownService.dataSourceName,
      id.toString()
    );
    return result;
  }

  public static async getAll(options?: IGetAllOptions): Promise<IOperationResult<GeorgTown[]>> {
    const result = await GeorgTownService.client.retrieveMultipleRecordsAsync<GeorgTown>(
      GeorgTownService.dataSourceName,
      options
    );
    return result;
  }
}
