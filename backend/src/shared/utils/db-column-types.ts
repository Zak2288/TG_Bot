import * as dotenv from 'dotenv';

dotenv.config();

const isPostgres = process.env.DB_TYPE === 'postgres';

/**
 * Возвращает тип колонки для enum, совместимый с выбранной БД
 */
export function getEnumColumnType(enumType: any, defaultValue?: any) {
  if (isPostgres) {
    return {
      type: 'enum',
      enum: enumType,
      default: defaultValue
    };
  }
  
  return {
    type: 'varchar',
    enum: enumType,
    default: defaultValue
  };
}

/**
 * Возвращает тип колонки для timestamp, совместимый с выбранной БД
 */
export function getTimestampColumnType(defaultCurrentTimestamp = false) {
  if (isPostgres) {
    return {
      type: 'timestamp',
      default: defaultCurrentTimestamp ? () => 'CURRENT_TIMESTAMP' : undefined
    };
  }
  
  return {
    type: 'datetime',
    default: defaultCurrentTimestamp ? () => 'CURRENT_TIMESTAMP' : undefined
  };
}

/**
 * Возвращает тип колонки для десятичных чисел, совместимый с выбранной БД
 */
export function getDecimalColumnType(precision = 10, scale = 2) {
  if (isPostgres) {
    return {
      type: 'decimal',
      precision,
      scale
    };
  }
  
  return {
    type: 'float'
  };
} 