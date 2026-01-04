import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// API Configuration
const API_CONFIG = {
  baseUrl: 'http://192.168.1.6:8000',  // Your Mac's LAN IP
  deviceId: 'device01',
  pollInterval: 5000, // Poll every 5 seconds
};

export default function AloeGreenDashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0,
    soil_moisture: 0,
    soil_ph: 0,
    soil_ec: 0,
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    rainfall_mm: 0,
    rssi: 0,
    free_heap: 0,
    rain_tips: 0,
    uptime_min: 0,
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for status dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Initial fetch
    fetchSensorData();

    // Start polling
    pollIntervalRef.current = setInterval(() => {
      fetchSensorData();
    }, API_CONFIG.pollInterval);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchSensorData = async () => {
    try {
      console.log('🔄 Fetching from:', `${API_CONFIG.baseUrl}/api/devices/${API_CONFIG.deviceId}/latest`);
      
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/devices/${API_CONFIG.deviceId}/latest`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Received data:', JSON.stringify(data, null, 2));

      // Update sensor data - handle both snake_case and camelCase
      setSensorData({
        temperature: data.temperature || 0,
        humidity: data.humidity || 0,
        light: data.light || 0,
        soil_moisture: data.soil_moisture || 0,
        soil_ph: data.soil_ph || 0,
        soil_ec: data.soil_ec || 0,
        nitrogen: data.nitrogen || 0,
        phosphorus: data.phosphorus || 0,
        potassium: data.potassium || 0,
        rainfall_mm: data.rainfall_mm || 0,
        rssi: data.rssi || 0,
        free_heap: data.free_heap || 0,
        rain_tips: data.rain_tips || 0,
        uptime_min: data.uptime_min || 0,
      });

      // Parse timestamp correctly
      const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
      setLastUpdate(timestamp);
      setConnectionStatus('connected');
      setError(null);
      setIsRefreshing(false);

      console.log('💚 Data updated successfully');

    } catch (err) {
      console.error('❌ Error fetching sensor data:', err);
      console.error('Error details:', err.message);
      setConnectionStatus('disconnected');
      setError(err.message);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSensorData();
  };

  const StatCard = ({ icon, label, value, unit, color, trend }) => {
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.statCard,
            { transform: [{ scale: cardScale }] },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
              <Ionicons name={icon} size={28} color={color} />
            </View>
            {trend && (
              <View style={[styles.trendBadge, { 
                backgroundColor: trend === 'up' ? '#DCFCE7' : trend === 'down' ? '#FEE2E2' : '#F3F4F6' 
              }]}>
                <Ionicons
                  name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
                  size={16}
                  color={trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#6B7280'}
                />
              </View>
            )}
          </View>

          <Text style={styles.cardLabel}>{label}</Text>

          <View style={styles.valueContainer}>
            <Text style={[styles.cardValue, { color }]}>{value}</Text>
            {unit && <Text style={styles.cardUnit}>{unit}</Text>}
          </View>

          <View style={[styles.progressBar, { backgroundColor: color + '20' }]}>
            <View style={[styles.progressFill, { backgroundColor: color, width: '60%' }]} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const NPKCard = ({ label, value, max, color, icon }) => (
    <View style={styles.npkCard}>
      <View style={styles.npkHeader}>
        <View style={styles.npkLabelContainer}>
          <Ionicons name={icon} size={20} color={color} />
          <Text style={styles.npkLabel}>{label}</Text>
        </View>
        <Text style={[styles.npkValue, { color }]}>{value}</Text>
      </View>

      <View style={styles.npkProgressContainer}>
        <View style={[styles.npkProgressBar, { backgroundColor: color + '20' }]}>
          <Animated.View
            style={[
              styles.npkProgressFill,
              { 
                backgroundColor: color,
                width: `${Math.min((value / max) * 100, 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <Text style={styles.npkUnit}>mg/kg</Text>
    </View>
  );

  const getTrend = (value, high, low) => {
    if (value > high) return 'up';
    if (value < low) return 'down';
    return 'stable';
  };

  const getConnectionColor = () => {
    return connectionStatus === 'connected' ? '#10B981' : '#EF4444';
  };

  const getConnectionText = () => {
    if (connectionStatus === 'connected') return 'Live';
    if (connectionStatus === 'connecting') return 'Connecting';
    return 'Offline';
  };

  const getTimeSinceUpdate = () => {
    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.emoji}>🌿</Text>
                <Text style={styles.title}>Aloe Green</Text>
              </View>
              <Text style={styles.subtitle}>Real-time Farm Monitoring</Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getConnectionColor() + '20' }
              ]}>
                <Animated.View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: getConnectionColor(),
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
                <Text style={[
                  styles.statusText,
                  { color: getConnectionColor() }
                ]}>
                  {getConnectionText()}
                </Text>
              </View>

              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>
                  {getTimeSinceUpdate()}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.errorText}>
                Connection error: {error}
              </Text>
              <TouchableOpacity onPress={fetchSensorData} style={styles.retryButton}>
                <Ionicons name="refresh-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )}

          {/* Main Stats Grid */}
          <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
            <StatCard
              icon="thermometer-outline"
              label="Temperature"
              value={sensorData.temperature.toFixed(1)}
              unit="°C"
              color="#EF4444"
              trend={getTrend(sensorData.temperature, 30, 29)}
            />
            <StatCard
              icon="water-outline"
              label="Humidity"
              value={sensorData.humidity.toFixed(1)}
              unit="%"
              color="#3B82F6"
              trend={getTrend(sensorData.humidity, 70, 60)}
            />
            <StatCard
              icon="sunny-outline"
              label="Light"
              value={sensorData.light.toFixed(0)}
              unit="lux"
              color="#F59E0B"
              trend="stable"
            />
            <StatCard
              icon="leaf-outline"
              label="Moisture"
              value={sensorData.soil_moisture.toFixed(0)}
              unit="%"
              color="#10B981"
              trend={getTrend(sensorData.soil_moisture, 55, 45)}
            />
            <StatCard
              icon="flask-outline"
              label="Soil pH"
              value={sensorData.soil_ph.toFixed(1)}
              unit=""
              color="#8B5CF6"
              trend="stable"
            />
            <StatCard
              icon="flash-outline"
              label="Soil EC"
              value={sensorData.soil_ec.toFixed(0)}
              unit="µS/cm"
              color="#EC4899"
              trend="stable"
            />
          </Animated.View>

          {/* NPK Section */}
          <Animated.View style={[styles.npkSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="nutrition-outline" size={28} color="#FFF" />
              </LinearGradient>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>NPK Nutrients</Text>
                <Text style={styles.sectionSubtitle}>Soil nutrient analysis</Text>
              </View>
            </View>

            <View style={styles.npkGrid}>
              <NPKCard
                label="Nitrogen"
                value={sensorData.nitrogen.toFixed(0)}
                max={200}
                color="#10B981"
                icon="leaf-outline"
              />
              <NPKCard
                label="Phosphorus"
                value={sensorData.phosphorus.toFixed(0)}
                max={150}
                color="#F59E0B"
                icon="flame-outline"
              />
              <NPKCard
                label="Potassium"
                value={sensorData.potassium.toFixed(0)}
                max={300}
                color="#8B5CF6"
                icon="water-outline"
              />
            </View>
          </Animated.View>

          {/* System Info */}
          <Animated.View style={[styles.systemInfo, { opacity: fadeAnim }]}>
            <View style={styles.systemCard}>
              <Ionicons name="wifi-outline" size={24} color="#3B82F6" />
              <Text style={styles.systemLabel}>WiFi Signal</Text>
              <Text style={styles.systemValue}>{sensorData.rssi.toFixed(0)} dBm</Text>
            </View>

            <View style={styles.systemCard}>
              <Ionicons name="time-outline" size={24} color="#10B981" />
              <Text style={styles.systemLabel}>Uptime</Text>
              <Text style={styles.systemValue}>{sensorData.uptime_min} min</Text>
            </View>

            <View style={styles.systemCard}>
              <Ionicons name="rainy-outline" size={24} color="#3B82F6" />
              <Text style={styles.systemLabel}>Rainfall</Text>
              <Text style={styles.systemValue}>{sensorData.rainfall_mm.toFixed(1)} mm</Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.footerText}>
              Fetching from {API_CONFIG.baseUrl} • Updates every 5 seconds
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },
  statusContainer: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
  },
  retryButton: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cardUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  npkSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  npkGrid: {
    gap: 12,
  },
  npkCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  npkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  npkLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  npkLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  npkValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  npkProgressContainer: {
    marginBottom: 8,
  },
  npkProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  npkProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  npkUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  systemInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  systemCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  systemLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 8,
  },
  systemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});