import * as React from 'react';
import bemify from '../utils/bemify';
import {Col, Grid} from './Grid';
import './MiningSummary.scss';
import ellipsify from '../utils/ellipsify';
import {connect} from 'react-redux';
import {AppState} from '../ducks/store';
import { MiningStats } from 'filecoin-network-stats-common/lib/domain/Stats';
import Timeago from 'react-timeago';
import {secToMillis} from '../utils/time';
import FloatTimeago from './FloatTimeago';
import BigNumber from 'bignumber.js';
import ContentHeader from './ContentHeader';

const b = bemify('mining-summary');

export type MiningSummaryStateProps = {
  mining: MiningStats|null
  isLoading: boolean
}

export type MiningSummaryProps = MiningSummaryStateProps

export class MiningSummary extends React.Component<MiningSummaryProps> {
  render () {
    if (!this.props.mining) {
      return null;
    }

    return (
      <div>
        <ContentHeader title="Best Block" />
        <div className={b()}>
          <div className={b('left')}>
            <div className={b('main-stat')}>
              #{this.props.mining.lastBlockHeight}
            </div>
            <div className={b('label')}>
              Block Height
            </div>
          </div>
          <div className={b('right')}>
            <Grid>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {new BigNumber(this.props.mining.averageBlockTime).toFixed(2)}s
                </div>
                <div className={b('label')}>
                  Avg. block time
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {
                    this.props.mining.lastBlockTime ?
                      <FloatTimeago date={secToMillis(this.props.mining.lastBlockTime)}/> :
                      '--'
                  }
                </div>
                <div className={b('label')}>
                  Last block
                </div>
              </Col>
            </Grid>
            <Grid noMargin>
              <Col transparent>
                <div className={b('sub-stat')}>
                  --
                </div>
                <div className={b('label')}>
                  Miner nickname
                </div>
              </Col>
              <Col transparent>
                <div className={b('sub-stat')}>
                  {ellipsify(this.props.mining.minerAddress, 20)}
                </div>
                <div className={b('label')}>
                  Miner address
                </div>
              </Col>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps (state: AppState): MiningSummaryStateProps {
  return {
    mining: state.stats.stats && state.stats.stats.mining,
    isLoading: state.stats.isLoading,
  };
}

export default connect(
  mapStateToProps,
)(MiningSummary);