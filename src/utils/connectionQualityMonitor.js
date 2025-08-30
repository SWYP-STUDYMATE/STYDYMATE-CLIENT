// WebRTC Connection Quality Monitor
export class ConnectionQualityMonitor {
  constructor(peerConnection, options = {}) {
    this.pc = peerConnection;
    this.options = {
      updateInterval: 2000, // 2초마다 업데이트
      alertThresholds: {
        packetLossRate: 0.05, // 5% 패킷 손실
        roundTripTime: 300, // 300ms RTT
        jitter: 50, // 50ms jitter
        ...options.alertThresholds
      },
      ...options
    };

    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.previousStats = null;
    this.connectionQuality = {
      overall: 'good', // excellent, good, fair, poor
      audio: { quality: 'good', stats: {} },
      video: { quality: 'good', stats: {} },
      network: { quality: 'good', stats: {} },
      lastUpdated: null
    };
    
    this.eventListeners = {
      qualityChange: [],
      statsUpdate: [],
      alert: []
    };
  }

  /**
   * 모니터링 시작
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.updateConnectionStats();
    }, this.options.updateInterval);

    console.log('Connection quality monitoring started');
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Connection quality monitoring stopped');
  }

  /**
   * 연결 통계 업데이트
   */
  async updateConnectionStats() {
    try {
      const stats = await this.pc.getStats();
      const parsedStats = this.parseStats(stats);
      
      // 품질 분석
      const qualityAnalysis = this.analyzeConnectionQuality(parsedStats);
      
      // 이전 품질과 비교해서 변경사항이 있으면 이벤트 발생
      if (this.hasQualityChanged(qualityAnalysis)) {
        this.connectionQuality = qualityAnalysis;
        this.emit('qualityChange', qualityAnalysis);
      }

      // 통계 업데이트 이벤트 발생
      this.emit('statsUpdate', parsedStats);

      // 경고 체크
      this.checkAlerts(parsedStats);

      this.previousStats = parsedStats;
      this.connectionQuality.lastUpdated = new Date().toISOString();

    } catch (error) {
      console.error('Failed to get connection stats:', error);
    }
  }

  /**
   * WebRTC Stats 파싱
   */
  parseStats(statsReport) {
    const stats = {
      audio: {
        inbound: {},
        outbound: {}
      },
      video: {
        inbound: {},
        outbound: {}
      },
      network: {
        candidates: [],
        selectedCandidatePair: null
      }
    };

    statsReport.forEach(stat => {
      switch (stat.type) {
        case 'inbound-rtp':
          if (stat.mediaType === 'audio') {
            stats.audio.inbound = {
              packetsReceived: stat.packetsReceived || 0,
              packetsLost: stat.packetsLost || 0,
              jitter: stat.jitter || 0,
              audioLevel: stat.audioLevel,
              bytesReceived: stat.bytesReceived || 0,
              timestamp: stat.timestamp
            };
          } else if (stat.mediaType === 'video') {
            stats.video.inbound = {
              packetsReceived: stat.packetsReceived || 0,
              packetsLost: stat.packetsLost || 0,
              jitter: stat.jitter || 0,
              framesReceived: stat.framesReceived || 0,
              framesDropped: stat.framesDropped || 0,
              frameWidth: stat.frameWidth,
              frameHeight: stat.frameHeight,
              framesPerSecond: stat.framesPerSecond,
              bytesReceived: stat.bytesReceived || 0,
              timestamp: stat.timestamp
            };
          }
          break;

        case 'outbound-rtp':
          if (stat.mediaType === 'audio') {
            stats.audio.outbound = {
              packetsSent: stat.packetsSent || 0,
              bytesSent: stat.bytesSent || 0,
              timestamp: stat.timestamp
            };
          } else if (stat.mediaType === 'video') {
            stats.video.outbound = {
              packetsSent: stat.packetsSent || 0,
              bytesSent: stat.bytesSent || 0,
              framesSent: stat.framesSent || 0,
              framesEncoded: stat.framesEncoded || 0,
              frameWidth: stat.frameWidth,
              frameHeight: stat.frameHeight,
              framesPerSecond: stat.framesPerSecond,
              timestamp: stat.timestamp
            };
          }
          break;

        case 'candidate-pair':
          if (stat.nominated && stat.state === 'succeeded') {
            stats.network.selectedCandidatePair = {
              id: stat.id,
              currentRoundTripTime: stat.currentRoundTripTime,
              totalRoundTripTime: stat.totalRoundTripTime,
              responsesReceived: stat.responsesReceived,
              bytesSent: stat.bytesSent || 0,
              bytesReceived: stat.bytesReceived || 0,
              timestamp: stat.timestamp
            };
          }
          break;

        case 'local-candidate':
        case 'remote-candidate':
          stats.network.candidates.push({
            type: stat.type,
            candidateType: stat.candidateType,
            protocol: stat.protocol,
            address: stat.address,
            port: stat.port
          });
          break;
      }
    });

    return stats;
  }

  /**
   * 연결 품질 분석
   */
  analyzeConnectionQuality(stats) {
    const analysis = {
      overall: 'good',
      audio: { quality: 'good', stats: {} },
      video: { quality: 'good', stats: {} },
      network: { quality: 'good', stats: {} },
      lastUpdated: new Date().toISOString()
    };

    // 오디오 품질 분석
    if (stats.audio.inbound.packetsReceived > 0) {
      const audioPacketLoss = stats.audio.inbound.packetsLost / 
        (stats.audio.inbound.packetsReceived + stats.audio.inbound.packetsLost);
      const audioJitter = stats.audio.inbound.jitter * 1000; // ms로 변환

      analysis.audio.stats = {
        packetLossRate: audioPacketLoss,
        jitter: audioJitter,
        packetsReceived: stats.audio.inbound.packetsReceived,
        packetsLost: stats.audio.inbound.packetsLost,
        bytesReceived: stats.audio.inbound.bytesReceived
      };

      if (audioPacketLoss > 0.1 || audioJitter > 100) {
        analysis.audio.quality = 'poor';
      } else if (audioPacketLoss > 0.05 || audioJitter > 50) {
        analysis.audio.quality = 'fair';
      } else if (audioPacketLoss > 0.02 || audioJitter > 20) {
        analysis.audio.quality = 'good';
      } else {
        analysis.audio.quality = 'excellent';
      }
    }

    // 비디오 품질 분석
    if (stats.video.inbound.packetsReceived > 0) {
      const videoPacketLoss = stats.video.inbound.packetsLost / 
        (stats.video.inbound.packetsReceived + stats.video.inbound.packetsLost);
      const frameDropRate = stats.video.inbound.framesDropped / 
        (stats.video.inbound.framesReceived + stats.video.inbound.framesDropped);

      analysis.video.stats = {
        packetLossRate: videoPacketLoss,
        frameDropRate: frameDropRate,
        framesPerSecond: stats.video.inbound.framesPerSecond,
        resolution: `${stats.video.inbound.frameWidth}x${stats.video.inbound.frameHeight}`,
        framesReceived: stats.video.inbound.framesReceived,
        framesDropped: stats.video.inbound.framesDropped,
        bytesReceived: stats.video.inbound.bytesReceived
      };

      if (videoPacketLoss > 0.1 || frameDropRate > 0.1) {
        analysis.video.quality = 'poor';
      } else if (videoPacketLoss > 0.05 || frameDropRate > 0.05) {
        analysis.video.quality = 'fair';
      } else if (videoPacketLoss > 0.02 || frameDropRate > 0.02) {
        analysis.video.quality = 'good';
      } else {
        analysis.video.quality = 'excellent';
      }
    }

    // 네트워크 품질 분석
    if (stats.network.selectedCandidatePair) {
      const rtt = stats.network.selectedCandidatePair.currentRoundTripTime * 1000; // ms로 변환

      analysis.network.stats = {
        roundTripTime: rtt,
        bytesSent: stats.network.selectedCandidatePair.bytesSent,
        bytesReceived: stats.network.selectedCandidatePair.bytesReceived,
        connectionType: this.getConnectionType(stats.network.candidates)
      };

      if (rtt > 500) {
        analysis.network.quality = 'poor';
      } else if (rtt > 300) {
        analysis.network.quality = 'fair';
      } else if (rtt > 150) {
        analysis.network.quality = 'good';
      } else {
        analysis.network.quality = 'excellent';
      }
    }

    // 전체 품질 계산 (가장 낮은 품질로 설정)
    const qualities = ['excellent', 'good', 'fair', 'poor'];
    const overallQuality = Math.max(
      qualities.indexOf(analysis.audio.quality),
      qualities.indexOf(analysis.video.quality),
      qualities.indexOf(analysis.network.quality)
    );
    analysis.overall = qualities[overallQuality];

    return analysis;
  }

  /**
   * 연결 타입 추정
   */
  getConnectionType(candidates) {
    const localCandidate = candidates.find(c => c.type === 'local-candidate');
    const remoteCandidate = candidates.find(c => c.type === 'remote-candidate');

    if (localCandidate && remoteCandidate) {
      if (localCandidate.candidateType === 'host' && remoteCandidate.candidateType === 'host') {
        return 'direct';
      } else if (localCandidate.candidateType === 'srflx' || remoteCandidate.candidateType === 'srflx') {
        return 'stun';
      } else if (localCandidate.candidateType === 'relay' || remoteCandidate.candidateType === 'relay') {
        return 'turn';
      }
    }

    return 'unknown';
  }

  /**
   * 품질 변경 여부 확인
   */
  hasQualityChanged(newQuality) {
    if (!this.connectionQuality) return true;

    return (
      this.connectionQuality.overall !== newQuality.overall ||
      this.connectionQuality.audio.quality !== newQuality.audio.quality ||
      this.connectionQuality.video.quality !== newQuality.video.quality ||
      this.connectionQuality.network.quality !== newQuality.network.quality
    );
  }

  /**
   * 경고 확인
   */
  checkAlerts(stats) {
    const alerts = [];

    // 오디오 경고
    if (stats.audio.inbound.packetsReceived > 0) {
      const audioPacketLoss = stats.audio.inbound.packetsLost / 
        (stats.audio.inbound.packetsReceived + stats.audio.inbound.packetsLost);
      
      if (audioPacketLoss > this.options.alertThresholds.packetLossRate) {
        alerts.push({
          type: 'audio_packet_loss',
          severity: 'warning',
          message: `Audio packet loss rate: ${(audioPacketLoss * 100).toFixed(1)}%`,
          value: audioPacketLoss
        });
      }

      const audioJitter = stats.audio.inbound.jitter * 1000;
      if (audioJitter > this.options.alertThresholds.jitter) {
        alerts.push({
          type: 'audio_jitter',
          severity: 'warning',
          message: `Audio jitter: ${audioJitter.toFixed(1)}ms`,
          value: audioJitter
        });
      }
    }

    // 네트워크 경고
    if (stats.network.selectedCandidatePair) {
      const rtt = stats.network.selectedCandidatePair.currentRoundTripTime * 1000;
      if (rtt > this.options.alertThresholds.roundTripTime) {
        alerts.push({
          type: 'high_latency',
          severity: 'warning',
          message: `High network latency: ${rtt.toFixed(1)}ms`,
          value: rtt
        });
      }
    }

    // 경고가 있으면 이벤트 발생
    alerts.forEach(alert => {
      this.emit('alert', alert);
    });
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event, callback) {
    if (!this.eventListeners[event]) return;
    
    const index = this.eventListeners[event].indexOf(callback);
    if (index > -1) {
      this.eventListeners[event].splice(index, 1);
    }
  }

  /**
   * 이벤트 발생
   */
  emit(event, data) {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * 현재 연결 품질 가져오기
   */
  getCurrentQuality() {
    return { ...this.connectionQuality };
  }

  /**
   * 품질 요약 정보 가져오기
   */
  getQualitySummary() {
    const quality = this.connectionQuality;
    return {
      overall: quality.overall,
      score: this.calculateQualityScore(quality),
      recommendations: this.getQualityRecommendations(quality),
      lastUpdated: quality.lastUpdated
    };
  }

  /**
   * 품질 점수 계산 (0-100)
   */
  calculateQualityScore(quality) {
    const qualityScores = {
      'excellent': 100,
      'good': 75,
      'fair': 50,
      'poor': 25
    };

    const audioScore = qualityScores[quality.audio.quality] || 0;
    const videoScore = qualityScores[quality.video.quality] || 0;
    const networkScore = qualityScores[quality.network.quality] || 0;

    // 가중평균 (오디오 40%, 비디오 35%, 네트워크 25%)
    return Math.round(audioScore * 0.4 + videoScore * 0.35 + networkScore * 0.25);
  }

  /**
   * 품질 개선 권장사항 가져오기
   */
  getQualityRecommendations(quality) {
    const recommendations = [];

    if (quality.audio.quality === 'poor' || quality.audio.quality === 'fair') {
      recommendations.push({
        type: 'audio',
        message: '오디오 품질이 좋지 않습니다. 마이크 설정을 확인하거나 네트워크 상태를 점검해보세요.',
        priority: 'high'
      });
    }

    if (quality.video.quality === 'poor' || quality.video.quality === 'fair') {
      recommendations.push({
        type: 'video',
        message: '비디오 품질이 좋지 않습니다. 카메라 해상도를 낮추거나 네트워크 대역폭을 확인해보세요.',
        priority: 'medium'
      });
    }

    if (quality.network.quality === 'poor' || quality.network.quality === 'fair') {
      recommendations.push({
        type: 'network',
        message: '네트워크 지연이 높습니다. Wi-Fi 연결을 확인하거나 유선 연결을 사용해보세요.',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * 리소스 정리
   */
  cleanup() {
    this.stopMonitoring();
    this.eventListeners = {
      qualityChange: [],
      statsUpdate: [],
      alert: []
    };
  }
}

export default ConnectionQualityMonitor;