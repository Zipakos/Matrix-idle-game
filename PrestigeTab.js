// PrestigeTab.js
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { PRESTIGE_TREE, VOID_CORE_TREE } from './gameData';

export default function PrestigeTab({
  points,
  shards,
  prestigeUps,
  voidPurchased,
  getPendingShards,
  getPrestigeUpgradeCost,
  buyPrestigeUpgrade,
  buyVoidUpgrade,
  executeSingularityCollapse
}) {
  const [subTab, setSubTab] = useState('tree'); 
  const [selectedNodeId, setSelectedNodeId] = useState(null); 

  // SCROLL REFERENCES FOR DRAG ENGINES
  const horizontalScrollRef = useRef(null);
  const verticalScrollRef = useRef(null);
  
  // DRAG STATE TRACKERS
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const isNodeUnlocked = (node) => {
    if (!node.parent) return true; 
    return (prestigeUps[node.parent] || 0) > 0; 
  };

  const hasUnlockedVoidCore = (prestigeUps['pr_fabricator'] || 0) > 0;

  const handleNodeTap = (id, item) => {
    if (selectedNodeId === id) {
      buyPrestigeUpgrade(id);
    } else {
      setSelectedNodeId(id);
    }
  };

  // --- DESKTOP MOUSE DRAG HANDLERS ---
  const handleMouseDown = (e) => {
    isDragging.current = true;
    
    const nativeEvent = e.nativeEvent || e;
    startX.current = nativeEvent.pageX;
    startY.current = nativeEvent.pageY;

    // Direct DOM element node discovery
    if (horizontalScrollRef.current) {
      const hNode = horizontalScrollRef.current.getScrollableNode 
        ? horizontalScrollRef.current.getScrollableNode() 
        : horizontalScrollRef.current;
      scrollLeft.current = hNode.scrollLeft || 0;
    }
    if (verticalScrollRef.current) {
      const vNode = verticalScrollRef.current.getScrollableNode 
        ? verticalScrollRef.current.getScrollableNode() 
        : verticalScrollRef.current;
      scrollTop.current = vNode.scrollTop || 0;
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const nativeEvent = e.nativeEvent || e;
    const xDiff = nativeEvent.pageX - startX.current;
    const yDiff = nativeEvent.pageY - startY.current;

    // Forces web rendering engines to move both absolute scroll axes synchronously
    if (horizontalScrollRef.current) {
      const hNode = horizontalScrollRef.current.getScrollableNode 
        ? horizontalScrollRef.current.getScrollableNode() 
        : horizontalScrollRef.current;
      if (hNode) hNode.scrollLeft = scrollLeft.current - xDiff;
    }
    if (verticalScrollRef.current) {
      const vNode = verticalScrollRef.current.getScrollableNode 
        ? verticalScrollRef.current.getScrollableNode() 
        : verticalScrollRef.current;
      if (vNode) vNode.scrollTop = scrollTop.current - yDiff;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // DYNAMIC CONNECTING WIRE ENGINE (Updated for 60px node midpoints)
  const renderConnectingWire = (childId, childNode) => {
    if (!childNode.parent) return null;
    if (!isNodeUnlocked(childNode)) return null;

    const parentNode = PRESTIGE_TREE[childNode.parent];

    // Radius compensation values changed from 45 to 30 to account for smaller 60px nodes
    const pX = parentNode.gridX + 30;
    const pY = parentNode.gridY + 30;
    const cX = childNode.gridX + 30;
    const cY = childNode.gridY + 30;

    const dx = cX - pX;
    const dy = cY - pY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const isChildBought = (prestigeUps[childId] || 0) > 0;
    const lineColor = isChildBought ? '#00ffff' : '#1a4444';

    return (
      <View
        key={`wire-${childId}`}
        style={[
          styles.wireElement,
          {
            width: distance,
            left: pX,
            top: pY,
            transform: [
              { rotate: `${angle}deg` },
              { translateX: 0 },
              { translateY: -0.5 }
            ],
            backgroundColor: lineColor,
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* INITIAL RESET MATRIX INTERACTION HUB */}
      <View style={styles.prestigeResetPanel}>
        <Text style={styles.panelTitle}>CORE SINGULARITY RESET MATRIX</Text>
        <Text style={styles.pendingShardValue}>
          PENDING SHARDS: +{getPendingShards(points).toLocaleString()}
        </Text>
        <TouchableOpacity 
          style={[styles.collapseBtn, getPendingShards(points) < 1 && styles.collapseBtnDisabled]}
          onPress={executeSingularityCollapse}
          disabled={getPendingShards(points) < 1}
        >
          <Text style={styles.collapseBtnText}>EXECUTE DIMENSIONAL REBOOT</Text>
        </TouchableOpacity>
      </View>

      {/* TOP SUB-TAB BAR VIEW MANAGER */}
      {hasUnlockedVoidCore && (
        <View style={styles.subTabBar}>
          <TouchableOpacity style={[styles.subTabButton, subTab === 'tree' && styles.subTabActive]} onPress={() => setSubTab('tree')}>
            <Text style={[styles.subTabText, subTab === 'tree' && styles.subTabTextActive]}>SYNAPSE_GRID_MAP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subTabButton, subTab === 'void_core' && styles.subTabActive, { borderColor: '#ff00ff' }]} onPress={() => setSubTab('void_core')}>
            <Text style={[styles.subTabText, subTab === 'void_core' && { color: '#ff00ff' }]}>VOID_CORE_HORIZON</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CORE DISPLAY ROUTERS */}
      {subTab === 'tree' ? (
        <View style={styles.treeSectionWrapper}>
          <Text style={styles.sectionHeader}>Neural Singularity Synapse Web</Text>
          
          {/* MOUSE-INTERACTIVE FRAME CONTEXT */}
          <View 
            style={styles.canvasFrameContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <ScrollView 
              ref={horizontalScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.horizontalScrollContent}
              scrollEnabled={false} // Disable native mousewheel fight triggers
            >
              <ScrollView 
                ref={verticalScrollRef}
                nestedScrollEnabled 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.verticalScrollContent}
                style={styles.mapCanvasScrollVertical}
                scrollEnabled={false}
              >
                <View style={styles.canvasPlane}>
                  
                  {/* WIRE MAPPING MATRIX LAYER */}
                  {Object.keys(PRESTIGE_TREE).map((id) => renderConnectingWire(id, PRESTIGE_TREE[id]))}

                  {/* LOGICAL DISPLAY NODES LAYER */}
                  {Object.keys(PRESTIGE_TREE).map((id) => {
                    const item = PRESTIGE_TREE[id];
                    if (!isNodeUnlocked(item)) return null;

                    const cost = getPrestigeUpgradeCost(id);
                    const ownedLevel = prestigeUps[id] || 0;
                    const isBoughtLinear = item.type === 'linear' && ownedLevel > 0;
                    const isFocused = selectedNodeId === id;

                    return (
                      <TouchableOpacity
                        key={id}
                        activeOpacity={0.9}
                        style={[
                          styles.neuronNode,
                          { left: item.gridX, top: item.gridY },
                          isBoughtLinear && styles.neuronLinearBought,
                          ownedLevel > 0 && item.type === 'repeatable' && styles.neuronActiveRepeatable,
                          isFocused && styles.neuronFocusedBorder
                        ]}
                        onPress={() => handleNodeTap(id, item)}
                        onMouseDown={(e) => e.stopPropagation()} 
                      >
                        <Text style={styles.neuronName} numberOfLines={2}>{item.name}</Text>
                        <Text style={styles.neuronMeta}>
                          {item.type === 'linear' ? (isBoughtLinear ? 'ON' : 'STBY') : `L${ownedLevel}`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                </View>
              </ScrollView>
            </ScrollView>
          </View>

          {/* DYNAMIC FOCUS TELEMETRY FOOTER MONITOR INTERFACE */}
          <View style={styles.telemetryFooterBox}>
            {selectedNodeId && PRESTIGE_TREE[selectedNodeId] ? (() => {
              const selectedItem = PRESTIGE_TREE[selectedNodeId];
              const cost = getPrestigeUpgradeCost(selectedNodeId);
              const lvl = prestigeUps[selectedNodeId] || 0;
              const isMaxedLinear = selectedItem.type === 'linear' && lvl > 0;
              const processingAffordable = shards >= cost;

              return (
                <View>
                  <Text style={styles.telemetryNodeTitle}>{selectedItem.name.toUpperCase()}</Text>
                  <Text style={styles.telemetryNodeDesc}>{selectedItem.desc(lvl)}</Text>
                  <View style={styles.telemetryActionRow}>
                    <Text style={[styles.telemetryCostText, processingAffordable ? { color: '#00ffff' } : { color: '#662222' }]}>
                      {isMaxedLinear ? 'STATUS: MAXIMUM ALLOCATION MET' : `REQUISITION COST: ${cost.toLocaleString()} SHARDS`}
                    </Text>
                    {!isMaxedLinear && (
                      <TouchableOpacity 
                        style={[styles.telemetryDirectBuyBtn, !processingAffordable && styles.telemetryDirectBuyBtnDisabled]}
                        onPress={() => buyPrestigeUpgrade(selectedNodeId)}
                        disabled={!processingAffordable}
                      >
                        <Text style={styles.telemetryDirectBuyText}>
                          {shards >= cost ? 'EXECUTE_UPGRADE' : 'INSUFFICIENT_SHARDS'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })() : (
              <Text style={styles.telemetryStandbyPrompt}>[INTELLIGENCE CONSOLE MONITOR STANDBY: INITIALIZE SYNAPSE NODE HIGHLIGHT TO QUERY PIPELINE TELEMETRY DATA]</Text>
            )}
          </View>
        </View>
      ) : (
        /* VOID CORE MATRIX SECTIONS */
        <View>
          <Text style={[styles.sectionHeader, { color: '#ff00ff', borderBottomColor: '#220022' }]}>Void Core Infinite Matrix Upgrades</Text>
          {Object.keys(VOID_CORE_TREE).map((id) => {
            const item = VOID_CORE_TREE[id];
            const ownedLevel = voidPurchased[id] || 0;
            let cost = item.cost;
            if (item.type === 'repeatable') cost = Math.floor(item.baseCost * Math.pow(item.scale, ownedLevel));
            if (item.type === 'linear' && ownedLevel > 0) return null;

            return (
              <View key={id} style={styles.voidRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#ff00ff', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {item.name} {item.type === 'repeatable' && `[Lvl ${ownedLevel}]`}
                  </Text>
                  <Text style={styles.rowDetails}>{item.desc(ownedLevel)}</Text>
                  <Text style={{ color: '#ff00ff', fontFamily: 'monospace', fontSize: 11, marginTop: 2 }}>Cost: {cost} Shards</Text>
                </View>
                <TouchableOpacity style={styles.voidBuyBtn} onPress={() => buyVoidUpgrade(id)}>
                  <Text style={{ color: '#ff00ff', fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }}>WEAVE</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  treeSectionWrapper: { width: '100%' },
  prestigeResetPanel: { backgroundColor: '#050a0a', borderWidth: 1, borderColor: '#003333', padding: 12, marginBottom: 12 },
  panelTitle: { color: '#00ffff', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center' },
  pendingShardValue: { color: '#fff', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', marginTop: 6, backgroundColor: '#001a1a', paddingVertical: 4 },
  collapseBtn: { backgroundColor: '#002626', borderWidth: 1, borderColor: '#00ffff', paddingVertical: 8, marginTop: 8, alignItems: 'center' },
  collapseBtnText: { color: '#00ffff', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' },
  collapseBtnDisabled: { borderColor: '#112222', backgroundColor: 'transparent', opacity: 0.2 },
  sectionHeader: { color: '#00ffff', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#002222', paddingBottom: 2 },
  
  canvasFrameContainer: {
    backgroundColor: '#030606',
    borderWidth: 1,
    borderColor: '#002222',
    height: 420, 
    width: '100%',
    overflow: 'hidden',
    cursor: 'grab', 
    userSelect: 'none', // Stops text selection highlights while dragging the map
  },
  horizontalScrollContent: {
    width: 600,
    alignSelf: 'flex-start',
  },
  verticalScrollContent: {
    height: 480,
  },
  mapCanvasScrollVertical: {
    flex: 1,
    width: '100%',
  },
  canvasPlane: { 
    width: 600,  
    height: 480, 
    position: 'relative',
    backgroundColor: '#020404',
  },

  // SHRUNK NEURON CONFIGS (90px -> 60px diameter)
  neuronNode: { 
    position: 'absolute', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#011111', 
    borderWidth: 1, 
    borderColor: '#004444', 
    padding: 4, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 5 
  },
  neuronLinearBought: { backgroundColor: '#002222', borderColor: '#00ffff' },
  neuronActiveRepeatable: { borderColor: '#00cc88' },
  neuronFocusedBorder: { borderColor: '#ffffff', borderWidth: 1.5, backgroundColor: '#002626' },
  neuronName: { color: '#eee', fontSize: 7.5, fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', lineHeight: 8.5 },
  neuronMeta: { color: '#009988', fontSize: 7, fontFamily: 'monospace', marginTop: 1, fontWeight: 'bold' },

  wireElement: { position: 'absolute', height: 1.5, transformOrigin: 'top left', zIndex: 1 },

  telemetryFooterBox: { backgroundColor: '#050707', borderWidth: 1, borderColor: '#112222', padding: 12, marginTop: 10, minHeight: 92, justifyContent: 'center' },
  telemetryStandbyPrompt: { color: '#334444', fontFamily: 'monospace', fontSize: 10, textAlign: 'center', lineHeight: 14 },
  telemetryNodeTitle: { color: '#fff', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#002222', paddingBottom: 2, marginBottom: 4 },
  telemetryNodeDesc: { color: '#8aa', fontFamily: 'monospace', fontSize: 11, lineHeight: 14 },
  telemetryActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#0a1414', paddingTop: 6 },
  telemetryCostText: { fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' },
  telemetryDirectBuyBtn: { backgroundColor: '#002222', borderWidth: 1, borderColor: '#00ffff', paddingHorizontal: 8, paddingVertical: 4 },
  telemetryDirectBuyBtnDisabled: { borderColor: '#221111', backgroundColor: 'transparent', opacity: 0.2 },
  telemetryDirectBuyText:
