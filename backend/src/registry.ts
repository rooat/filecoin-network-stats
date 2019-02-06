import {Registry} from './Container';
import {providePeerInfo} from './util/providePeerInfo';
import {Config} from './Config';
import {HeartbeatServerImpl} from './service/HeartbeatServer';
import {HeartbeatConsumerImpl, IHeartbeatConsumer} from './service/HeartbeatConsumer';
import SystemTimestampProvider, {ITimestampProvider} from './service/TimestampProvider';
import {INodeStatusService, MemoryNodeStatusService} from './service/NodeStatusService';
import IAPIService from './service/api/IAPIService';
import {ExpressAPIServer} from './service/APIServer';
import PGClient from './service/PGClient';
import {IGeolocationDAO, PostgresGeolocationDAO} from './service/dao/GeolocationDAO';
import HTTPClient from './client/HTTPClient';
import FilecoinClient, {IFilecoinClient} from './client/FilecoinClient';
import PostgresChainsawDAO, {IChainsawDAO} from './service/dao/ChainsawDAO';
import Chainsaw from './service/Chainsaw';
import {IMiningStatsDAO, PostgresMiningStatsDAO} from './service/dao/MiningStatsDAO';
import SyncAPI from './service/api/SyncAPI';
import {IMarketStatsDAO, PostgresMarketStatsDAO} from './service/dao/MarketStatsDAO';
import {IBlocksDAO, PostgresBlocksDAO} from './service/dao/BlocksDAO';
import {IStorageStatsDAO, PostgresStorageStatsDAO} from './service/dao/StorageStatsDAO';
import {IMinerCountsDAO, PostgresMinerCountsDAO} from './service/dao/MinerCountsDAO';
import {IMiningPowerService, MiningPowerServiceImpl} from './service/MiningPowerService';
import MinerStatsAPI from './service/api/MinerStatsAPI';
import {ITokenStatsDAO, PostgresTokenStatsDAO} from './service/dao/TokenStatsDAO';
import {MaterializationServiceImpl} from './service/MaterializationService';
import StatsAPI from './service/api/StatsAPI';
import PeerInfo = require('peer-info');
import {ICacheService, MemoryCacheService} from './service/CacheService';

export default function registry (other: Registry = new Registry()): Registry {
  const registry = new Registry(other);
  registry.bind('PeerInfo', (config: Config) => providePeerInfo(config), ['Config']);
  registry.bind('HeartbeatServer', (peerInfo: PeerInfo, consumer: IHeartbeatConsumer) => new HeartbeatServerImpl(peerInfo, consumer), ['PeerInfo', 'HeartbeatConsumer']);
  registry.bind('HeartbeatConsumer', (nsd: INodeStatusService) => new HeartbeatConsumerImpl(nsd), ['NodeStatusService']);
  registry.bind('NodeStatusService', (tsp: ITimestampProvider, gDao: IGeolocationDAO, blocksDao: IBlocksDAO, mps: IMiningPowerService) => new MemoryNodeStatusService(tsp, gDao, blocksDao, mps), ['TimestampProvider', 'GeolocationDAO', 'BlocksDAO', 'MiningPowerService']);
  registry.bind('TimestampProvider', () => new SystemTimestampProvider(), []);
  registry.bind('GeolocationDAO', (client: PGClient) => new PostgresGeolocationDAO(client), ['PGClient']);
  registry.bind('BlocksDAO', (client: PGClient) => new PostgresBlocksDAO(client), ['PGClient']);
  registry.bind('ChainsawDAO', (client: PGClient, tsp: ITimestampProvider) => new PostgresChainsawDAO(client, tsp), ['PGClient', 'TimestampProvider']);
  registry.bind('MinerCountsDAO', (client: PGClient, tsp: ITimestampProvider) => new PostgresMinerCountsDAO(client, tsp), ['PGClient', 'TimestampProvider']);
  registry.bind('PGClient', (config: Config) => new PGClient(config), ['Config']);
  registry.bind('HTTPClient', (config: Config) => new HTTPClient(config), ['Config']);
  registry.bind('FilecoinClient', (httpClient: HTTPClient) => new FilecoinClient(httpClient), ['HTTPClient']);
  registry.bind('Chainsaw', (dao: IChainsawDAO, client: IFilecoinClient, mps: IMiningPowerService) => new Chainsaw(dao, client, mps), ['ChainsawDAO', 'FilecoinClient', 'MiningPowerService']);
  registry.bind('MiningStatsDAO', (client: PGClient, nss: INodeStatusService) => new PostgresMiningStatsDAO(client, nss), ['PGClient', 'NodeStatusService']);
  registry.bind('MarketStatsDAO', (client: PGClient, cs: ICacheService) => new PostgresMarketStatsDAO(client, cs), ['PGClient', 'CacheService']);
  registry.bind('StorageStatsDAO', (client: PGClient, nss: INodeStatusService, cs: ICacheService) => new PostgresStorageStatsDAO(client, nss, cs), ['PGClient', 'NodeStatusService', 'CacheService']);
  registry.bind('MinerStatsAPI', (ssd: IStorageStatsDAO) => new MinerStatsAPI(ssd), ['StorageStatsDAO']);
  registry.bind('SyncAPI', (msd: IMiningStatsDAO, mksd: IMarketStatsDAO, ssd: IStorageStatsDAO, nsd: INodeStatusService, tsd: ITokenStatsDAO) => new SyncAPI(msd, mksd, ssd, nsd, tsd), ['MiningStatsDAO', 'MarketStatsDAO', 'StorageStatsDAO', 'NodeStatusService', 'TokenStatsDAO']);
  registry.bind('StatsAPI', (msd: IMiningStatsDAO, mksd: IMarketStatsDAO, ssd: IStorageStatsDAO, nsd: INodeStatusService, tsd: ITokenStatsDAO) => new StatsAPI(msd, mksd, ssd, nsd, tsd), ['MiningStatsDAO', 'MarketStatsDAO', 'StorageStatsDAO', 'NodeStatusService', 'TokenStatsDAO']);
  registry.bind('APIServices', (...args: IAPIService[]) => args, ['SyncAPI', 'MinerStatsAPI', 'StatsAPI']);
  registry.bind('APIServer', (config: Config, apiServices: IAPIService[]) => new ExpressAPIServer(config, apiServices), ['Config', 'APIServices']);
  registry.bind('MiningPowerService', (bDao: IBlocksDAO, client: IFilecoinClient) => new MiningPowerServiceImpl(bDao, client), ['BlocksDAO', 'FilecoinClient']);
  registry.bind('TokenStatsDAO', (client: PGClient, cs: ICacheService) => new PostgresTokenStatsDAO(client, cs), ['PGClient', 'CacheService']);
  registry.bind('MaterializationService', (tsd: ITokenStatsDAO, ssd: IStorageStatsDAO, nss: INodeStatusService, mcd: IMinerCountsDAO) => new MaterializationServiceImpl(tsd, ssd, nss, mcd), ['TokenStatsDAO', 'StorageStatsDAO', 'NodeStatusService', 'MinerCountsDAO']);
  registry.bind('CacheService', () => new MemoryCacheService(), []);

  return registry;
}