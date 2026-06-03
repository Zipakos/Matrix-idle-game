// gameData.js

export const PRESTIGE_THRESHOLD = 1000000;

// 1. STANDARD UPGRADE TREE (Now with Thermal Load constraints)
export const UPGRADE_TREE = {
  up2: { id: 'up2', type: 'repeatable', name: 'Auto-Matrix I', baseCost: 15, scale: 1.15, baseValue: 1, heatGen: 0.8, desc: (localMult) => `Generates +${(1 * localMult).toFixed(1)} pt/sec. Adds +0.8°C thermal load.`, requires: [] },
  up3: { id: 'up3', type: 'repeatable', name: 'Sub-Routine A', baseCost: 75, scale: 1.2, baseValue: 5, heatGen: 2.5, desc: (localMult) => `Generates +${(5 * localMult).toFixed(1)} pt/sec. Adds +2.5°C thermal load.`, requires: ['up2'] },
  
  // Thermodynamics Nullifier (The Heat Vent Upgrade)
  upCool: { id: 'upCool', type: 'repeatable', name: 'Heatsink Exhaust', baseCost: 50, scale: 1.4, baseValue: 0, heatGen: -5.0, desc: () => `Siphons away accumulated data heat (-5.0°C Thermal Load).`, requires: ['up2'] },

  up4: { id: 'up4', type: 'linear', name: 'Clock Overclock', cost: 250, desc: () => 'Speeds up Auto-Matrix I streams by 100%.', requires: ['up2'], multPPS: 2, target: 'up2' },
  up5: { id: 'up5', type: 'linear', name: 'Sub-Routine Sync', cost: 500, desc: () => 'Optimizes Sub-Routine A clusters (2x to Sub-Routine A).', requires: ['up3'], multPPS: 2, target: 'up3' },
  up6: { id: 'up6', type: 'linear', name: 'Core Pipeline Intersect', cost: 1400, desc: () => 'Blends data pipelines together (1.5x Global Multiplier).', requires: ['up4', 'up5'], multPPS: 1.5, target: 'global' },
  up7: { id: 'up7', type: 'repeatable', name: 'Auto-Matrix II', baseCost: 3500, scale: 1.25, baseValue: 20, heatGen: 12, desc: (localMult) => `Generates +${(20 * localMult).toFixed(1)} pt/sec. Adds +12.0°C thermal load.`, requires: ['up4'] },
  up8: { id: 'up8', type: 'linear', name: 'Sub-space Resonator', cost: 14000, desc: () => 'All Auto-Matrix II production multiplied by 2.5x.', requires: ['up7'], multPPS: 2.5, target: 'up7' },
  up9: { id: 'up9', type: 'linear', name: 'Data Compression Patch', cost: 28000, desc: () => 'Compresses Sub-Routine A packet structures (4x to Sub-Routine A).', requires: ['up6'], multPPS: 4, target: 'up3' },
  up10: { id: 'up10', type: 'repeatable', name: 'Data Condenser', baseCost: 65000, scale: 1.3, baseValue: 150, heatGen: 65, desc: (localMult) => `Generates +${(150 * localMult).toFixed(1)} pt/sec. Adds +65.0°C thermal load.`, requires: ['up8'] },
  up11: { id: 'up11', type: 'linear', name: 'Bandwidth Bridge', cost: 160000, desc: () => 'Broadens pipeline capacity thresholds (2x Global Multiplier).', requires: ['up9', 'up10'], multPPS: 2, target: 'global' },
  up12: { id: 'up12', type: 'repeatable', name: 'Auto-Matrix III', baseCost: 450000, scale: 1.35, baseValue: 1200, heatGen: 450, desc: (localMult) => `Generates +${(1200 * localMult).toFixed(1)} pt/sec. Adds +450.0°C thermal load.`, requires: ['up10'] },
  up13: { id: 'up13', type: 'linear', name: 'Condenser Overheat Bypass', cost: 1200000, desc: () => 'Siphons heat models away from Condensers (3x to Condenser).', requires: ['up11'], multPPS: 3, target: 'up10' },
  up14: { id: 'up14', type: 'linear', name: 'Quantum Matrix Link', cost: 3800000, desc: () => 'Triples the efficiency of all basic Matrix networks.', requires: ['up12'], multPPS: 3, target: 'all_matrices' },
  up15: { id: 'up15', type: 'linear', name: 'Entangled Nodes', cost: 9500000, desc: () => 'Total global passive generation scales up by 3x.', requires: ['up13', 'up14'], multPPS: 3, target: 'global' }
};

// Add absolute grid coordinates (X, Y layout spacing) for the neural map layout
export const PRESTIGE_TREE = {
  // --- TIER 1 ROOT NODES ---
  pr1: { 
    id: 'pr1', type: 'repeatable', name: 'Hyper-Threading Shard', baseCost: 1, scale: 1.5, parent: null, gridX: 40, gridY: 200, 
    desc: (lvl) => `Permanently accelerates overall simulation clock speed by +10% per level.\nCurrently: +${((lvl || 0) * 10)}% global speed.` 
  },
  pr2: { 
    id: 'pr2', type: 'repeatable', name: 'Quantum Over-Yield', baseCost: 1, scale: 1.7, parent: null, gridX: 40, gridY: 360, 
    desc: (lvl) => `Boosts total raw Shard extraction efficacy by generating +25% global point output per level.\nCurrently: +${((lvl || 0) * 25)}% yield.` 
  },
  
  // --- NEW THERMAL MANAGEMENT BRANCH (Branches upward from pr1) ---
  pr_cooling_node: {
    id: 'pr_cooling_node', type: 'repeatable', name: 'Cryo-Grid Subcooler', baseCost: 3, scale: 1.8, parent: 'pr1', gridX: 240, gridY: 40,
    desc: (lvl) => `Statically damps global heat production vectors by pulling -15% raw thermal emissions from all background modules per level.\nCurrently: -${((lvl || 0) * 15)}% heat gen.`
  },

  // --- TIER 2 UTILITY BRANCHES ---
  pr_heat1: { 
    id: 'pr_heat1', type: 'linear', name: 'Thermal Convection Buffers', cost: 8, parent: 'pr1', gridX: 240, gridY: 200, 
    desc: () => 'Alters core safe operating boundaries. Expands the global system Heat Degradation safety limit from 50°C out to 120°C before throttling occurs.' 
  },
  pr3: { 
    id: 'pr3', type: 'linear', name: 'Static Chrono Buffer', cost: 10, parent: 'pr2', gridX: 240, gridY: 360, 
    desc: () => 'Injects a permanent, hardware-isolated initialization script that seeds operations with an automatic +100 pt/sec baseline output immediately following all resets.' 
  },
  
  // --- TIER 3 CAPSTONE GATE ---
  pr_fabricator: { 
    id: 'pr_fabricator', type: 'linear', name: 'Dimensional Tear Injector', cost: 15, parent: 'pr_heat1', gridX: 460, gridY: 200, 
    desc: () => 'Rips a hole in the baseline simulation interface shell. Unlocks the VOID_CORE Sub-Prestige Horizon tab window for deep computational engineering.' 
  }
};
