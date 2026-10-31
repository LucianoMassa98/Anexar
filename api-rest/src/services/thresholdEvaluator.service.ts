import { ThresholdEvaluationRequest, ThresholdEvaluationResult } from '../types';

/**
 * ThresholdEvaluator
 * Inspects SQL result sets against financial and operational alarm conditions.
 * Detects whether metrics deviate from desired KPI boundaries (e.g. EBITDA margin < 15% or DSO > 45 days).
 */
export class ThresholdEvaluator {
  /**
   * Evaluates if the result set satisfies the given threshold condition.
   */
  public static evaluate(request: ThresholdEvaluationRequest): ThresholdEvaluationResult {
    const { conditionMetric, operator, thresholdValue, rows } = request;

    if (!rows || rows.length === 0) {
      return {
        isTriggered: false,
        metricFound: false,
        actualValue: null,
        thresholdValue,
        message: 'El conjunto de resultados SQL está vacío. No se pudo evaluar el umbral.',
      };
    }

    // Search for metric case-insensitively across columns of the first row
    const targetKey = Object.keys(rows[0]).find(
      (k) => k.toLowerCase() === conditionMetric.toLowerCase().trim()
    );

    if (!targetKey) {
      return {
        isTriggered: false,
        metricFound: false,
        actualValue: null,
        thresholdValue,
        message: `La columna de métrica "${conditionMetric}" no fue encontrada en los resultados SQL.`,
      };
    }

    // Take the value from the latest/first row
    const rawVal = rows[0][targetKey];
    const numericValue = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal));

    if (isNaN(numericValue)) {
      return {
        isTriggered: false,
        metricFound: true,
        actualValue: null,
        thresholdValue,
        message: `El valor de "${targetKey}" (${rawVal}) no es un número computable.`,
      };
    }

    let isTriggered = false;

    switch (operator) {
      case 'GREATER_THAN':
        isTriggered = numericValue > thresholdValue;
        break;
      case 'LESS_THAN':
        isTriggered = numericValue < thresholdValue;
        break;
      case 'GREATER_EQUAL':
        isTriggered = numericValue >= thresholdValue;
        break;
      case 'LESS_EQUAL':
        isTriggered = numericValue <= thresholdValue;
        break;
      case 'EQUALS':
        isTriggered = Math.abs(numericValue - thresholdValue) < 0.0001;
        break;
      case 'NOT_EQUALS':
        isTriggered = Math.abs(numericValue - thresholdValue) >= 0.0001;
        break;
      default:
        isTriggered = false;
    }

    const readableOperatorMap = {
      GREATER_THAN: '>',
      LESS_THAN: '<',
      GREATER_EQUAL: '>=',
      LESS_EQUAL: '<=',
      EQUALS: '==',
      NOT_EQUALS: '!=',
    };

    const readableOp = readableOperatorMap[operator] || operator;

    const message = isTriggered
      ? `🚨 ALERTA DISPARADA: El valor actual de ${targetKey} (${numericValue}) cumplió la condición (${readableOp} ${thresholdValue}).`
      : `✅ Parámetro nominal: ${targetKey} (${numericValue}) no sobrepasa la condición de alarma (${readableOp} ${thresholdValue}).`;

    return {
      isTriggered,
      metricFound: true,
      actualValue: numericValue,
      thresholdValue,
      message,
    };
  }
}
