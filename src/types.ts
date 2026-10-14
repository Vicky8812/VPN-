export interface RelayNode {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  city: string;
  endpoint: string;
  publicIp: string;
  pingBase: number;
  uplink: string;
  jurisdiction: string;
  protocols: string[];
  serverPublicKey: string;
}

export interface IPTelemetry {
  tunnel: {
    status: string;
    cipher: string;
    protocol: string;
    serverPublicIp: string;
    serverLocation: {
      city: string;
      country: string;
      countryCode: string;
      isp: string;
      asn: string;
    };
    dnsSecEnforced: boolean;
    ipv6LeakProtection: string;
    killSwitchActive: boolean;
  };
  client: {
    detectedIp: string;
    masked: boolean;
    headersSanitized: boolean;
  };
}

export interface DNSQueryResult {
  status: string;
  domain: string;
  provider: string;
  latencyMs: number;
  dnssec: boolean;
  answers: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface SpeedTestResult {
  ping: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
  state: 'idle' | 'pinging' | 'downloading' | 'uploading' | 'finished';
}

export interface ThroughputRunRecord {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeName: string;
  nodeFlag: string;
  nodeCity: string;
  nodeCountry: string;
  pingMin: number;
  pingAvg: number;
  pingMax: number;
  jitter: number;
  downloadMbps: number;
  uploadMbps: number;
  loadedPing: number;
  bufferbloatGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  dataTransferredMB: number;
}
