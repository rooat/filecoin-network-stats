import {TimeseriesDatapoint} from 'filecoin-network-stats-common/lib/domain/TimeseriesDatapoint';
import BigNumber from 'bignumber.js';
import {createCurrencyNumberFormatter, CurrencyNumberFormatter} from './Currency';
import {NumberFormatter} from '@amcharts/amcharts4/core';

export interface TimeseriesRenderOpts {
  tooltipNum: string
  numberFormatter: NumberFormatter
}

export function currencyTimeseriesRenderOpts (points: TimeseriesDatapoint[]): TimeseriesRenderOpts {
  const firstNonZero = points.find((d: TimeseriesDatapoint) => d.amount.gt(0));
  if (!firstNonZero) {
    return {
      tooltipNum: `{amount0.formatNumber('#,###.00')}`,
      numberFormatter: new CurrencyNumberFormatter(false),
    };
  }

  const chosenPoint = firstNonZero ? firstNonZero.amount : new BigNumber(0);
  const tooltipNum = chosenPoint.decimalPlaces() > 2 && chosenPoint.lt(0.01) ?
    `{amount0.formatNumber('#.#e')}` :
    `{amount0.formatNumber('#,###.00')}`;
  const numberFormatter = createCurrencyNumberFormatter(chosenPoint);

  return {
    tooltipNum,
    numberFormatter,
  };
}