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
