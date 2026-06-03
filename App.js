import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORT STATICS AND EXTERNALIZED DATA SCHEMAS
import { UPGRADE_TREE, PRESTIGE_TREE, VOID_CORE_TREE, PRESTIGE_THRESHOLD } from './gameData';
import PrestigeTab from './PrestigeTab';

// EXPANDED REGISTRATION STORAGE PROFILE MOUNT FLAGGING KEY NODES
const SAVE_KEY_POINTS = '@idle_game_points';
const SAVE_KEY_UPGRADES = '@idle_game_upgrades';
const SAVE_KEY_TIME = '@idle_game_last_time';
const SAVE_KEY_SHARDS = '@idle_game_shards';
const SAVE_KEY_PRESTIGE_UPGRADES = '@idle_game_prestige_upgrades';
const SAVE_KEY_HAS_PRESTIGED = '@idle_game_has_prestiged';
const SAVE_KEY_VOID_UPGRADES = '@idle_game_void_upgrades'; // Extended Key

export default function App() {
  const [activeTab, setActiveTab] = useState('console'); 
  const [points, setPoints] = useState(0);
  const [purchasedUps, setPurchasedUps] = useState({});
  const [shards, setShards] = useState(0);
  const [prestigeUps, setPrestigeUps] = useState({});
  const [voidPurchased, setVoidPurchased] = useState({}); // New State Array Profile
  const [hasPrestiged, setHasPrestiged] = useState(false); 
  const [currentPPS, setCurrentPPS] = useState(0);
  const [globalMultiplier, setGlobalMultiplier] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // HEAT THERMAL LOOP REACT SYSTEM HOOK REGISTERS
  const [systemHeat, setSystemHeat] = useState(0);
  const [heatEfficiency, setHeatEfficiency] = useState(100);

  // Offline Capture States
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [offlineReport, setOfflineReport] = useState({ duration: 0, earnings: 0 });

  const stateRef = useRef({
    points: 0,
    purchased: {}, 
    shards: 0,
    prestigeUps: {},
    voidPurchased: {}, // Track inside mutable ref layer
    hasPrestiged: false,
    lastTick: Date.now(),
  });

  const getLocalBuildingMultiplier = (id, activePurchases) => {
    let multiplier = 1;
    Object.keys(activePurchases).forEach((modId) => {
      const upgrade = UPGRADE_TREE[modId];
      if (!upgrade || !upgrade.multPPS) return;
      const level = activePurchases[modId];
      const upgradePower = Math.pow(upgrade.multPPS, level);

      if (upgrade.target === 'all_matrices' && ['up2', 'up7', 'up12'].includes(id)) {
        multiplier *= upgradePower;
      } else if (upgrade.target === id) {
        multiplier *= upgradePower;
      }
    });
    return multiplier;
  };

  const getGlobalMultiplierValue = (activePurchases, pUps, currentShards) => {
    let multiplier = 1;
    Object.keys(UPGRADE_TREE).forEach((id) => {
      const item = UPGRADE_TREE[id];
      if (item.type === 'linear' && item.target === 'global' && activePurchases[id]) {
        multiplier *= item.multPPS;
      }
    });
    const shardBonus = 1 + (currentShards * 0.02);
    multiplier *= shardBonus;

    const overYieldLvl = pUps['pr2'] || 0;
    multiplier *= (1 + (overYieldLvl * 0.25));

    return multiplier;
  };

  // THERMODYNAMIC PRODUCTION ENGINE EXTENSION SYSTEM
  // App.js - Updated calculateCurrentStats Method
  const calculateCurrentStats = (activePurchases, pUps, currentShards, vPurchased) => {
    let baseSum = 0;
    let totalHeat = 0;
    if (pUps['pr3']) baseSum += 100; // Static Chrono Buffer Injection

    // 1. Gather raw base metrics and initial thermal outputs
    Object.keys(UPGRADE_TREE).forEach((id) => {
      const item = UPGRADE_TREE[id];
      const count = activePurchases[id] || 0;
      
      if (item.type === 'repeatable') {
        const localMult = getLocalBuildingMultiplier(id, activePurchases);
        baseSum += count * (item.baseValue * localMult);
        
        if (item.heatGen) {
          if (vPurchased['vc2'] && ['up2', 'up7'].includes(id)) {
            totalHeat += 0; 
          } else {
            totalHeat += count * item.heatGen;
          }
        }
      }
    });

    // 2. NEW LOGIC: Apply Singularity Node Cryo-Grid Subcooler dampening scaling factors
    const cryoCoolingLevel = pUps['pr_cooling_node'] || 0;
    if (cryoCoolingLevel > 0 && totalHeat > 0) {
      const heatReductionFactor = Math.max(0.1, 1 - (cryoCoolingLevel * 0.15)); // Cap maximum possible cooling reduction at 90%
      totalHeat *= heatReductionFactor;
    }

    if (totalHeat < 0) totalHeat = 0;

    // 3. Process Thermal Load Boundary Throttling Curves
    let heatThreshold = pUps['pr_heat1'] ? 120 : 50; 
    let efficiencyMod = 1.0;
    
    if (totalHeat > heatThreshold) {
      efficiencyMod = 100 / (100 + (totalHeat - heatThreshold));
    }

    // 4. Handle End Game Entropy Conversions
    if (vPurchased['vc1'] && totalHeat > 0) {
      const inversionLvl = vPurchased['vc1'] || 0;
      const heatBonusFactor = (totalHeat / 10) * (inversionLvl * 0.015);
      efficiencyMod *= (1 + heatBonusFactor);
    }

    const globalMult = getGlobalMultiplierValue(activePurchases, pUps, currentShards);
    
    setTimeout(() => {
      setSystemHeat(totalHeat);
      setHeatEfficiency(efficiencyMod * 100);
    }, 0);

    return baseSum * globalMult * efficiencyMod;
  };

  const getPendingShards = (currentPoints) => {
    if (currentPoints < PRESTIGE_THRESHOLD) return 0;
    return Math.floor(Math.sqrt(currentPoints / PRESTIGE_THRESHOLD));
  };

  const executeDevTimeWarp = () => {
    const secondsToWarp = 5 * 60;
    const speedLvl = stateRef.current.prestigeUps['pr1'] || 0;
    const effectiveSeconds = secondsToWarp * (1 + (speedLvl * 0.1));

    const pps = calculateCurrentStats(stateRef.current.purchased, stateRef.current.prestigeUps, stateRef.current.shards, stateRef.current.voidPurchased);
    const earnings = pps * effectiveSeconds;

    stateRef.current.points += earnings;
    setPoints(stateRef.current.points);
    saveGameToDisk();
  };

  const executeDevReset = async () => {
    try {
      stateRef.current.points = 0;
      stateRef.current.purchased = {};
      stateRef.current.shards = 0;
      stateRef.current.prestigeUps = {};
      stateRef.current.voidPurchased = {};
      stateRef.current.hasPrestiged = false;

      setPoints(0);
      setPurchasedUps({});
      setShards(0);
      setPrestigeUps({});
      setVoidPurchased({});
      setHasPrestiged(false);
      setActiveTab('console');
      setCurrentPPS(0);
      setGlobalMultiplier(1);
      setSystemHeat(0);
      setHeatEfficiency(100);

      await AsyncStorage.clear();
    } catch (e) {
      console.warn("Reset tracking write failure", e);
    }
  };

  // DISK READ AND WRITE INTERFACES (INCLUDING THE VOID UPGRADES)
  const saveGameToDisk = async () => {
    try {
      const nowString = Date.now().toString();
      await AsyncStorage.multiSet([
        [SAVE_KEY_POINTS, stateRef.current.points.toString()],
        [SAVE_KEY_UPGRADES, JSON.stringify(stateRef.current.purchased)],
        [SAVE_KEY_SHARDS, stateRef.current.shards.toString()],
        [SAVE_KEY_PRESTIGE_UPGRADES, JSON.stringify(stateRef.current.prestigeUps)],
        [SAVE_KEY_VOID_UPGRADES, JSON.stringify(stateRef.current.voidPurchased)],
        [SAVE_KEY_HAS_PRESTIGED, stateRef.current.hasPrestiged ? 'true' : 'false'],
        [SAVE_KEY_TIME, nowString]
      ]);
    } catch (e) {
      console.warn("Checkpoint configuration write failure", e);
    }
  };

  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        const savedData = await AsyncStorage.multiGet([
          SAVE_KEY_POINTS, SAVE_KEY_UPGRADES, SAVE_KEY_SHARDS, 
          SAVE_KEY_PRESTIGE_UPGRADES, SAVE_KEY_VOID_UPGRADES, 
          SAVE_KEY_HAS_PRESTIGED, SAVE_KEY_TIME
        ]);
        
        const savedPoints = savedData[0][1] ? parseFloat(savedData[0][1]) : 0;
        const savedUpgrades = savedData[1][1] ? JSON.parse(savedData[1][1]) : {};
        const savedShards = savedData[2][1] ? parseInt(savedData[2][1], 10) : 0;
        const savedPrestigeUps = savedData[3][1] ? JSON.parse(savedData[3][1]) : {};
        const savedVoidUps = savedData[4][1] ? JSON.parse(savedData[4][1]) : {};
        const savedHasPrestiged = savedData[5][1] === 'true';
        const savedTimestamp = savedData[6][1] ? parseInt(savedData[6][1], 10) : null;

        stateRef.current.points = savedPoints;
        stateRef.current.purchased = savedUpgrades;
        stateRef.current.shards = savedShards;
        stateRef.current.prestigeUps = savedPrestigeUps;
        stateRef.current.voidPurchased = savedVoidUps;
        stateRef.current.hasPrestiged = savedHasPrestiged;
        
        setPoints(savedPoints);
        setPurchasedUps(savedUpgrades);
        setShards(savedShards);
        setPrestigeUps(savedPrestigeUps);
        setVoidPurchased(savedVoidUps);
        setHasPrestiged(savedHasPrestiged);

        const currentProductionValue = calculateCurrentStats(savedUpgrades, savedPrestigeUps, savedShards, savedVoidUps);
        const currentGlobalMult = getGlobalMultiplierValue(savedUpgrades, savedPrestigeUps, savedShards);
        
        setCurrentPPS(currentProductionValue);
        setGlobalMultiplier(currentGlobalMult);

        if (savedTimestamp && currentProductionValue > 0) {
          const now = Date.now();
          if (now >= savedTimestamp) {
            let elapsedSeconds = (now - savedTimestamp) / 1000;
            const speedLvl = savedPrestigeUps['pr1'] || 0;
            elapsedSeconds *= (1 + (speedLvl * 0.1));

            if (elapsedSeconds > 10) { 
              const offlineEarnings = elapsedSeconds * currentProductionValue;
              stateRef.current.points += offlineEarnings;
              setPoints(stateRef.current.points);
              setOfflineReport({ duration: elapsedSeconds, earnings: offlineEarnings });
              setOfflineModalVisible(true);
            }
          }
        }
      } catch (err) {
        console.error("Critical storage profile parsing error", err);
      } finally {
        stateRef.current.lastTick = Date.now();
        setIsLoaded(true);
      }
    };

    initializeAndLoad();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let saveCounter = 0;
    const loop = setInterval(() => {
      const now = Date.now();
      const speedLvl = stateRef.current.prestigeUps['pr1'] || 0;
      const timeMultiplier = 1 + (speedLvl * 0.1);
      const delta = ((now - stateRef.current.lastTick) / 1000) * timeMultiplier;
      
      stateRef.current.lastTick = now;

      const pps = calculateCurrentStats(stateRef.current.purchased, stateRef.current.prestigeUps, stateRef.current.shards, stateRef.current.voidPurchased);
      const gMult = getGlobalMultiplierValue(stateRef.current.purchased, stateRef.current.prestigeUps, stateRef.current.shards);
      
      setCurrentPPS(pps);
      setGlobalMultiplier(gMult);

      if (pps > 0) {
        stateRef.current.points += pps * delta;
        setPoints(stateRef.current.points);
      }

      saveCounter++;
      if (saveCounter >= 50) {
        saveCounter = 0;
        saveGameToDisk();
      }
    }, 100);

    return () => clearInterval(loop);
  }, [isLoaded]);

  const getUpgradeCost = (id) => {
    const node = UPGRADE_TREE[id];
    if (node.type === 'linear') return node.cost;
    const currentLevel = stateRef.current.purchased[id] || 0;
    if (id === 'up2' && currentLevel === 0) return 0;
    return Math.floor(node.baseCost * Math.pow(node.scale, currentLevel));
  };

  const getPrestigeUpgradeCost = (id) => {
    const node = PRESTIGE_TREE[id];
    if (node.type === 'linear') return node.cost;
    const currentLevel = stateRef.current.prestigeUps[id] || 0;
    return Math.floor(node.baseCost * Math.pow(node.scale, currentLevel));
  };

  const buyUpgrade = (id) => {
    const node = UPGRADE_TREE[id];
    const cost = getUpgradeCost(id);

    if (stateRef.current.points >= cost) {
      if (node.type === 'linear' && stateRef.current.purchased[id]) return;

      stateRef.current.points -= cost;
      const currentLevel = stateRef.current.purchased[id] || 0;
      stateRef.current.purchased[id] = currentLevel + 1;

      setPurchasedUps({ ...stateRef.current.purchased });
      setPoints(stateRef.current.points);
      saveGameToDisk();
    }
  };

  const buyPrestigeUpgrade = (id) => {
    const node = PRESTIGE_TREE[id];
    const cost = getPrestigeUpgradeCost(id);

    if (stateRef.current.shards >= cost) {
      if (node.type === 'linear' && stateRef.current.prestigeUps[id]) return;

      stateRef.current.shards -= cost;
      const currentLevel = stateRef.current.prestigeUps[id] || 0;
      stateRef.current.prestigeUps[id] = currentLevel + 1;

      setPrestigeUps({ ...stateRef.current.prestigeUps });
      setShards(stateRef.current.shards);
      saveGameToDisk();
    }
  };

  // BUY TRANSACTION GATEWAY ACTION RUNNERS FOR LATE GAME TAB HOOK COUPLINGS
  const buyVoidUpgrade = (id) => {
    const node = VOID_CORE_TREE[id];
    const ownedLevel = stateRef.current.voidPurchased[id] || 0;
    
    let cost = node.cost;
    if (node.type === 'repeatable') {
      cost = Math.floor(node.baseCost * Math.pow(node.scale, ownedLevel));
    }

    if (stateRef.current.shards >= cost) {
      if (node.type === 'linear' && stateRef.current.voidPurchased[id]) return;

      stateRef.current.shards -= cost;
      stateRef.current.voidPurchased[id] = ownedLevel + 1;

      setVoidPurchased({ ...stateRef.current.voidPurchased });
      setShards(stateRef.current.shards);
      saveGameToDisk();
    }
  };

  const executeSingularityCollapse = () => {
    const pending = getPendingShards(stateRef.current.points);
    if (pending < 1) return;

    stateRef.current.shards += pending;
    stateRef.current.points = 0;
    stateRef.current.purchased = {}; 
    stateRef.current.hasPrestiged = true; 

    setShards(stateRef.current.shards);
    setPoints(0);
    setPurchasedUps({});
    setHasPrestiged(true);
    setActiveTab('console'); 
    saveGameToDisk();
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.counter}>SYNCING MATRIX NETWORKS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.masterWrapper}>
      {/* HUD DASHBOARD CONSOLE GRID */}
      <View style={styles.hudHeader}>
        <TouchableOpacity style={styles.devWarpButton} onPress={executeDevTimeWarp}>
          <Text style={styles.devWarpText}>WARP_+5M</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.devResetButton} onPress={executeDevReset}>
          <Text style={styles.devResetText}>RESET_SYS</Text>
        </TouchableOpacity>

        <Text style={styles.counter}>{Math.floor(points).toLocaleString()} PT</Text>
        <Text style={styles.subCounter}>{currentPPS.toLocaleString(undefined, {maximumFractionDigits: 1})} pt/sec</Text>
        <Text style={styles.multCounter}>Global Multiplier: {globalMultiplier.toFixed(2)}x</Text>
        
        {/* HEAT TELEMETRY DASHBOARD WRAPPERS */}
        <Text style={[styles.thermalMonitor, { color: systemHeat > (prestigeUps['pr_heat1'] ? 120 : 50) ? '#ff4400' : '#ffa500' }]}>
          Core Temp: {systemHeat.toFixed(1)}°C ({heatEfficiency.toFixed(1)}% Core Yield Efficiency)
        </Text>
        
        {(shards > 0 || getPendingShards(points) > 0) ? (
          <Text style={styles.shardDisplay}>⚡ {shards} Sub-Space Shards (+{(shards * 2)}% Shard Bonus)</Text>
        ) : null}
      </View>

      {/* COMPACT TAB SELECTOR COUPLING */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'console' && styles.tabActive]} 
          onPress={() => setActiveTab('console')}
        >
          <Text style={[styles.tabText, activeTab === 'console' && styles.tabTextActive]}>SYS_OPERATIONS</Text>
        </TouchableOpacity>
        
        {(hasPrestiged || getPendingShards(points) > 0) && (
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'prestige' && styles.tabActive, getPendingShards(points) > 0 && styles.tabAlert]} 
            onPress={() => setActiveTab('prestige')}
          >
            <Text style={[styles.tabText, activeTab === 'prestige' && styles.tabTextActive]}>
              SINGULARITY {getPendingShards(points) > 0 ? `[+${getPendingShards(points)}]` : ''}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TAB CONTENT HOUSING */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'console' ? (
          <View>
            {Object.keys(UPGRADE_TREE).map((id) => {
              const item = UPGRADE_TREE[id];
              const cost = getUpgradeCost(id);
              const ownedLevel = purchasedUps[id] || 0;
              
              if (item.requires.length > 0 && !item.requires.every(reqId => (purchasedUps[reqId] || 0) > 0)) return null;
              if (item.type === 'linear' && ownedLevel > 0) return null;

              const currentLocalMult = getLocalBuildingMultiplier(id, purchasedUps);
              return (
                <View key={id} style={styles.compactRow}>
                  <View style={styles.textContainer}>
                    <Text style={styles.rowName}>
                      {item.name} {item.type === 'repeatable' && `[Lvl ${ownedLevel}]`}
                    </Text>
                    <Text style={styles.rowDetails}>{item.desc(currentLocalMult)}</Text>
                    <Text style={styles.costText}>Cost: {cost === 0 ? 'FREE' : `${cost.toLocaleString()} pt`}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.buyBtn, points < cost && styles.btnDisabled]} 
                    onPress={() => buyUpgrade(id)}
                    disabled={points < cost}
                  >
                    <Text style={styles.buyBtnText}>{ownedLevel === 0 ? 'INIT' : 'UPGRADE'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <PrestigeTab 
            points={points}
            shards={shards}
            prestigeUps={prestigeUps}
            voidPurchased={voidPurchased}
            getPendingShards={getPendingShards}
            getPrestigeUpgradeCost={getPrestigeUpgradeCost}
            buyPrestigeUpgrade={buyPrestigeUpgrade}
            buyVoidUpgrade={buyVoidUpgrade}
            executeSingularityCollapse={executeSingularityCollapse}
          />
        )}
      </ScrollView>

      {/* OFFLINE MODAL DIALOGUE POPUP */}
      <Modal animationType="fade" transparent={true} visible={offlineModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>COOLDOWN DATA RESTORATION COMPLETE</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalLabel}>DOWNTIME DURATION ELAPSED:</Text>
            <Text style={styles.modalValue}>{(offlineReport.duration).toFixed(1)} Secs</Text>
            <Text style={styles.modalLabel}>PASSIVE EXTRACTIONS CONVERGED:</Text>
            <Text style={[styles.modalValue, { color: '#00ff00' }]}>+{Math.floor(offlineReport.earnings).toLocaleString()} PT</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setOfflineModalVisible(false)}>
              <Text style={styles.modalButtonText}>SYNC TIMELINE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  masterWrapper: { flex: 1, backgroundColor: '#020202' },
  hudHeader: { backgroundColor: '#070707', paddingHorizontal: 16, paddingTop: 40, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#151515', alignItems: 'center', position: 'relative' },
  container: { flex: 1, backgroundColor: '#020202' },
  scrollContainer: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 40 },
  counter: { color: '#00ff00', fontSize: 26, fontFamily: 'monospace', fontWeight: 'bold' },
  subCounter: { color: '#006600', fontSize: 13, fontFamily: 'monospace', marginTop: 2 },
  multCounter: { color: '#558855', fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  thermalMonitor: { fontSize: 11, fontFamily: 'monospace', marginTop: 3, fontWeight: 'bold' },
  shardDisplay: { color: '#00ffff', fontSize: 12, fontFamily: 'monospace', marginTop: 6, fontWeight: 'bold' },
  
  devWarpButton: { position: 'absolute', top: 40, right: 12, borderWidth: 1, borderColor: '#ff3333', backgroundColor: '#220000', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2, zIndex: 10 },
  devWarpText: { color: '#ff3333', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' },
  devResetButton: { position: 'absolute', top: 70, right: 12, borderWidth: 1, borderColor: '#ff3333', backgroundColor: '#220000', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 2, zIndex: 10 },
  devResetText: { color: '#ff3333', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' },

  tabBar: { flexDirection: 'row', backgroundColor: '#0a0a0a', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { backgroundColor: '#111', borderBottomColor: '#00ff00' },
  tabAlert: { borderBottomColor: '#00ffff' },
  tabText: { color: '#555', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' },
  tabTextActive: { color: '#fff' },

  compactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#0f0f0f' },
  textContainer: { flex: 1, paddingRight: 8 },
  rowName: { color: '#eee', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' },
  rowDetails: { color: '#888', fontSize: 11, fontFamily: 'monospace', marginTop: 1 },
  costText: { color: '#00cc00', fontSize: 11, fontFamily: 'monospace', marginTop: 2, fontWeight: 'bold' },
  buyBtn: { borderWidth: 1, borderColor: '#00ff00', paddingVertical: 4, paddingHorizontal: 6, backgroundColor: '#001100', minWidth: 72, alignItems: 'center' },
  buyBtnText: { color: '#00ff00', fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' },
  btnDisabled: { borderColor: '#1f1f1f', backgroundColor: 'transparent', opacity: 0.15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#050505', borderWidth: 1, borderColor: '#005500', padding: 20, width: '100%', maxWidth: 380 },
  modalHeader: { color: '#00ff00', fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center' },
  modalDivider: { height: 1, backgroundColor: '#002200', marginVertical: 12 },
  modalLabel: { color: '#555', fontSize: 10, fontFamily: 'monospace', marginTop: 8 },
  modalValue: { color: '#fff', fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', marginTop: 1 },
  modalButton: { borderWidth: 1, borderColor: '#00ff00', padding: 10, alignItems: 'center', marginTop: 16, backgroundColor: '#001100' },
  modalButtonText: { color: '#00ff00', fontFamily: 'monospace', fontWeight: 'bold', fontSize: 12 }
});
