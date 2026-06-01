import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

// 1. PURE IDLE DATA LAYER (STARTING AT UP2 WITH 0 COST)
const UPGRADE_TREE = {
  // Tier 1 (Unlocked immediately, Level 1 is completely FREE)
  up2: { id: 'up2', type: 'repeatable', name: 'Auto-Matrix I', baseCost: 15, scale: 1.15, baseValue: 1, desc: (localMult) => `Adds continuous generation channels (+${(1 * localMult).toFixed(1)} pt/sec per level).`, requires: [] },
  up3: { id: 'up3', type: 'repeatable', name: 'Sub-Routine A', baseCost: 75, scale: 1.2, baseValue: 5, desc: (localMult) => `Deploys localized monitoring script units (+${(5 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up2'] },

  // Tier 2
  up4: { id: 'up4', type: 'linear', name: 'Clock Overclock', cost: 250, desc: () => 'Speeds up Auto-Matrix I streams by 100% (2x to Auto-Matrix I).', requires: ['up2'], multPPS: 2, target: 'up2' },
  up5: { id: 'up5', type: 'linear', name: 'Sub-Routine Sync', cost: 500, desc: () => 'Optimizes Sub-Routine A clusters (2x to Sub-Routine A).', requires: ['up3'], multPPS: 2, target: 'up3' },
  
  // Tier 3
  up6: { id: 'up6', type: 'linear', name: 'Core Pipeline Intersect', cost: 1400, desc: () => 'Blends data pipelines together (1.5x Global Multiplier).', requires: ['up4', 'up5'], multPPS: 1.5, target: 'global' },
  up7: { id: 'up7', type: 'repeatable', name: 'Auto-Matrix II', baseCost: 3500, scale: 1.25, baseValue: 20, desc: (localMult) => `Unlocks advanced generation pipelines (+${(20 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up4'] },

  // Tier 4
  up8: { id: 'up8', type: 'linear', name: 'Sub-space Resonator', cost: 14000, desc: () => 'All Auto-Matrix II production is multiplied by 2.5x.', requires: ['up7'], multPPS: 2.5, target: 'up7' },
  up9: { id: 'up9', type: 'linear', name: 'Data Compression Patch', cost: 28000, desc: () => 'Compresses Sub-Routine A packet delivery structures (4x to Sub-Routine A).', requires: ['up6'], multPPS: 4, target: 'up3' },
  
  // Tier 5
  up10: { id: 'up10', type: 'repeatable', name: 'Data Condenser', baseCost: 65000, scale: 1.3, baseValue: 150, desc: (localMult) => `Compacts local signals. Flat passive generation (+${(150 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up8'] },
  up11: { id: 'up11', type: 'linear', name: 'Bandwidth Bridge', cost: 160000, desc: () => 'Broadens pipeline capacity thresholds (2x Global Multiplier).', requires: ['up9', 'up10'], multPPS: 2, target: 'global' },

  // Tier 6
  up12: { id: 'up12', type: 'repeatable', name: 'Auto-Matrix III', baseCost: 450000, scale: 1.35, baseValue: 1200, desc: (localMult) => `Industrial generation grid array (+${(1200 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up10'] },
  up13: { id: 'up13', type: 'linear', name: 'Condenser Overheat Bypass', cost: 1200000, desc: () => 'Siphons heat models away from Condensers (3x to Data Condenser).', requires: ['up11'], multPPS: 3, target: 'up10' },

  // Tier 7
  up14: { id: 'up14', type: 'linear', name: 'Quantum Matrix Link', cost: 3800000, desc: () => 'Triples the efficiency of all basic Auto-Matrix systems (3x to Matrix I, II, III).', requires: ['up12'], multPPS: 3, target: 'all_matrices' },
  up15: { id: 'up15', type: 'linear', name: 'Entangled Nodes', cost: 9500000, desc: () => 'Total global passive generation scales up by 3x (3x Global Multiplier).', requires: ['up13', 'up14'], multPPS: 3, target: 'global' },

  // Tier 8
  up16: { id: 'up16', type: 'repeatable', name: 'Macro Harvester', baseCost: 28000000, scale: 1.4, baseValue: 12500, desc: (localMult) => `Colossal automated background matrix network (+${(12500 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up14'] },
  up17: { id: 'up17', type: 'linear', name: 'Macro Optimization Protocol', cost: 80000000, desc: () => 'Polishes Macro Harvester scraping algorithms (3x to Macro Harvester).', requires: ['up15'], multPPS: 3, target: 'up16' },

  // Tier 9
  up18: { id: 'up18', type: 'linear', name: 'Singularity Loom', cost: 300000000, desc: () => 'Folds math operations. Multiplies total overall production by 5x.', requires: ['up16', 'up17'], multPPS: 5, target: 'global' },
  up19: { id: 'up19', type: 'repeatable', name: 'Antimatter Conduit', baseCost: 1200000000, scale: 1.45, baseValue: 150000, desc: (localMult) => `Deep-void extraction systems (+${(150000 * localMult).toFixed(1)} pt/sec per level).`, requires: ['up18'] },
  
  // Tier 10
  up20: { id: 'up20', type: 'linear', name: 'Universal Transcendence', cost: 15000000000, desc: () => 'The final operations matrix. Reaches peak execution potential (100x Global Multiplier).', requires: ['up19'], multPPS: 100, target: 'global' }
};

export default function App() {
  const [points, setPoints] = useState(0);
  const [purchasedUps, setPurchasedUps] = useState({});
  const [currentPPS, setCurrentPPS] = useState(0);

  const stateRef = useRef({
    points: 0,
    purchased: {}, 
    lastTick: Date.now(),
  });

  // 2. DYNAMIC COST ALGORITHM
  const getUpgradeCost = (id) => {
    const node = UPGRADE_TREE[id];
    if (node.type === 'linear') return node.cost;
    
    const currentLevel = stateRef.current.purchased[id] || 0;
    // CRITICAL: If they own 0 units of up2, the first purchase is explicitly FREE.
    if (id === 'up2' && currentLevel === 0) return 0;

    return Math.floor(node.baseCost * Math.pow(node.scale, currentLevel));
  };

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

  // 3. REFACTORED COMPILER (No up1 dependencies)
  const calculateCurrentStats = (activePurchases) => {
    let baseSum = 0;
    let globalPPSMultiplier = 1;

    Object.keys(UPGRADE_TREE).forEach((id) => {
      const item = UPGRADE_TREE[id];
      if (item.type === 'repeatable') {
        const count = activePurchases[id] || 0;
        const localMult = getLocalBuildingMultiplier(id, activePurchases);
        baseSum += count * (item.baseValue * localMult);
      }
      if (item.type === 'linear' && item.target === 'global' && activePurchases[id]) {
        globalPPSMultiplier *= item.multPPS;
      }
    });

    return baseSum * globalPPSMultiplier;
  };

  useEffect(() => {
    const loop = setInterval(() => {
      const now = Date.now();
      const delta = (now - stateRef.current.lastTick) / 1000;
      stateRef.current.lastTick = now;

      const pps = calculateCurrentStats(stateRef.current.purchased);
      setCurrentPPS(pps);

      if (pps > 0) {
        stateRef.current.points += pps * delta;
        setPoints(stateRef.current.points);
      }
    }, 100);
    return () => clearInterval(loop);
  }, []);

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
      setCurrentPPS(calculateCurrentStats(stateRef.current.purchased));
    }
  };

  const isPrereqMet = (upgrade) => {
    if (upgrade.requires.length === 0) return true;
    return upgrade.requires.every(reqId => (purchasedUps[reqId] || 0) > 0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.counter}>{Math.floor(points).toLocaleString()} points</Text>
      <Text style={styles.subCounter}>{currentPPS.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} points/sec</Text>

      <TouchableOpacity 
        style={styles.devButton}
        onPress={() => {
          stateRef.current.points += 50000000;
          setPoints(stateRef.current.points);
        }}
      >
        <Text style={styles.devButtonText}>[DEV] INJECT_+50M_PTS</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>System Operations Console</Text>
      
      {Object.keys(UPGRADE_TREE).map((id) => {
        const item = UPGRADE_TREE[id];
        const cost = getUpgradeCost(id);
        const ownedLevel = purchasedUps[id] || 0;
        
        if (!isPrereqMet(item)) return null;
        if (item.type === 'linear' && ownedLevel > 0) return null;

        const currentLocalMult = getLocalBuildingMultiplier(id, purchasedUps);
        const currentTotalBuildingYield = ownedLevel * (item.baseValue * currentLocalMult);

        return (
          <View key={id} style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.rowName}>
                {item.name} {item.type === 'repeatable' && `[Lvl ${ownedLevel}]`}
              </Text>
              
              <Text style={styles.rowDetails}>
                {item.desc(currentLocalMult)}
              </Text>

              {item.type === 'repeatable' && ownedLevel > 0 && (
                <Text style={styles.telemetryText}>
                  Current Yield: {currentTotalBuildingYield.toLocaleString(undefined, {maximumFractionDigits: 1})} pt/s
                </Text>
              )}

              <Text style={styles.costText}>Cost: {cost === 0 ? 'FREE' : `${cost.toLocaleString()} pts`}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.buyBtn, points < cost && styles.btnDisabled]} 
              onPress={() => buyUpgrade(id)}
              disabled={points < cost}
            >
              <Text style={styles.buyBtnText}>
                {item.type === 'repeatable' && ownedLevel > 0 ? 'Upgrade' : 'Initialize'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#050505', padding: 24, justifyContent: 'center' },
  counter: { color: '#00ff00', fontSize: 32, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  subCounter: { color: '#006600', fontSize: 16, fontFamily: 'monospace', textAlign: 'center', marginBottom: 30 },
  devButton: { borderWidth: 1, borderColor: '#ff0055', padding: 10, alignItems: 'center', marginBottom: 30 },
  devButtonText: { color: '#ff0055', fontSize: 11, fontFamily: 'monospace' },
  sectionHeader: { color: '#444', fontSize: 12, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#111' },
  textContainer: { flex: 1, paddingRight: 16 },
  rowName: { color: '#fff', fontSize: 15, fontFamily: 'monospace', fontWeight: 'bold' },
  rowDetails: { color: '#aaa', fontSize: 12, fontFamily: 'monospace', marginTop: 4 },
  telemetryText: { color: '#005500', fontSize: 11, fontFamily: 'monospace', marginTop: 4, fontStyle: 'italic' },
  costText: { color: '#00ff00', fontSize: 12, fontFamily: 'monospace', marginTop: 6 },
  buyBtn: { borderWidth: 1, borderColor: '#00ff00', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#001100' },
  buyBtnText: { color: '#00ff00', fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold' },
  btnDisabled: { borderColor: '#222', backgroundColor: 'transparent', opacity: 0.2 }
});
