import { OstChoice, OstProblem, frac } from './mathFormat';
import {
  OST_TOPICS,
  TOPIC_STRATEGY_TIPS,
  drawOstProblem,
  getTopicMeta,
  getTopicProblems
} from './ostProblems';
import { CloudSaveSnapshot, firebaseSave } from './firebaseSave';

export function initGame(): void {
  // =========================================================================
  // 1. WEB AUDIO SYNTHESIZER
  // =========================================================================
  class SoundFX {
    ctx: AudioContext | null = null;
    enabled = true;

    init(): void {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    play(type: string): void {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(540 + Math.random() * 140, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.055);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'kill') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(310, now);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.11);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'dash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(290, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.14);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'xp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680 + Math.random() * 180, now);
        osc.frequency.exponentialRampToValueAtTime(1220, now + 0.075);
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        osc.start(now);
        osc.stop(now + 0.075);
      } else if (type === 'levelup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.08);
        osc.frequency.setValueAtTime(659, now + 0.16);
        osc.frequency.setValueAtTime(880, now + 0.24);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'revive') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.35);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(783.99, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(125, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'ult') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    }
  }
  const sfx = new SoundFX();

  const byId = <T extends HTMLElement = HTMLElement>(id: string): T =>
    document.getElementById(id) as T;

  // =========================================================================
  // 2. 4-TIER WEAPON RARITY PALETTE
  // =========================================================================
  interface TierStyle {
    label: string;
    color: string;
    borderClass: string;
    dmgMult: number;
    rateMult: number;
    extraCount: number;
    extraPierce: number;
    goldExplode: number;
  }

  const TIER_STYLES: Record<number, TierStyle> = {
    1: {
      label: 'T1 EMERALD',
      color: '#34d399',
      borderClass: 'border-emerald-400/60 bg-emerald-950/90 text-emerald-200',
      dmgMult: 1.0,
      rateMult: 1.0,
      extraCount: 0,
      extraPierce: 0,
      goldExplode: 0
    },
    2: {
      label: 'T2 COBALT',
      color: '#38bdf8',
      borderClass: 'border-sky-400 bg-sky-950/85 text-sky-200 shadow-sm shadow-sky-400/30',
      dmgMult: 1.65,
      rateMult: 0.88,
      extraCount: 1,
      extraPierce: 1,
      goldExplode: 0
    },
    3: {
      label: 'T3 AMETHYST',
      color: '#c084fc',
      borderClass: 'border-purple-400 bg-purple-950/85 text-purple-200 shadow-md shadow-purple-400/35',
      dmgMult: 2.55,
      rateMult: 0.78,
      extraCount: 1,
      extraPierce: 2,
      goldExplode: 45
    },
    4: {
      label: 'T4 SOVEREIGN GOLD',
      color: '#fbbf24',
      borderClass:
        'border-amber-300 bg-gradient-to-br from-amber-500/35 to-yellow-700/40 text-amber-200 shadow-lg shadow-amber-400/45',
      dmgMult: 4.1,
      rateMult: 0.66,
      extraCount: 2,
      extraPierce: 4,
      goldExplode: 95
    }
  };

  // =========================================================================
  // 3. 16 SIGNATURE WEAPON CATALOG
  // =========================================================================
  interface WeaponSpec {
    id: string;
    name: string;
    icon: string;
    shape: string;
    dmg: number;
    rate: number;
    speed: number;
    count: number;
    spread: number;
    pierce: number;
    bounce?: boolean;
    explode?: number;
    spin?: boolean;
    chill?: boolean;
    homing?: boolean;
    desc: string;
  }

  const WEAPON_CATALOG: Record<string, WeaponSpec> = {
    pulse: { id: 'pulse', name: 'Twin Pulse Carbines', icon: '🔫', shape: 'twin', dmg: 24, rate: 0.24, speed: 840, count: 2, spread: 0.08, pierce: 1, desc: 'Rapid-fire twin carbines with high velocity.' },
    graviton: { id: 'graviton', name: 'Graviton Magnet Lance', icon: '🧲', shape: 'lance', dmg: 34, rate: 0.38, speed: 780, count: 1, spread: 0.04, pierce: 4, bounce: true, desc: 'Rebounding golden-ratio energy lance.' },
    seismic: { id: 'seismic', name: 'Seismic Gauntlets', icon: '🥊', shape: 'gauntlet', dmg: 20, rate: 0.5, speed: 680, count: 5, spread: 0.42, pierce: 1, desc: 'Close-quarters heavy shockwave fan.' },
    inferno: { id: 'inferno', name: 'Inferno Plasma Flamer', icon: '🔥', shape: 'flamer', dmg: 46, rate: 0.68, speed: 560, count: 1, spread: 0.08, pierce: 1, explode: 90, desc: 'Launches wide-radius incendiary plasma shells.' },
    rail: { id: 'rail', name: 'Hyper-Coil Railgun', icon: '⚡', shape: 'rail', dmg: 58, rate: 0.62, speed: 1180, count: 1, spread: 0.0, pierce: 6, desc: 'Hyper-velocity rail beam piercing 6 hostiles.' },
    katana: { id: 'katana', name: 'Phase Void Katana', icon: '🗡️', shape: 'katana', dmg: 28, rate: 0.32, speed: 800, count: 3, spread: 0.18, pierce: 3, spin: true, desc: 'Fires spinning crescent energy blades.' },
    tachyon: { id: 'tachyon', name: 'Tachyon Chrono-Rifle', icon: '⏱️', shape: 'rifle', dmg: 30, rate: 0.28, speed: 960, count: 2, spread: 0.06, pierce: 2, chill: true, desc: 'Temporal bolts that slow alien movement.' },
    flak: { id: 'flak', name: 'Aegis Bastion Flak', icon: '🛡️', shape: 'flak', dmg: 22, rate: 0.48, speed: 700, count: 4, spread: 0.3, pierce: 2, desc: 'Armor-shredding tungsten shrapnel burst.' },
    alch: { id: 'alch', name: 'Corrosive Nova Vial', icon: '🧪', shape: 'staff', dmg: 40, rate: 0.64, speed: 490, count: 1, spread: 0.05, pierce: 4, explode: 82, desc: 'Detonates volatile acid spheres on impact.' },
    starlight: { id: 'starlight', name: 'Starlight Wing-Bow', icon: '🏹', shape: 'bow', dmg: 38, rate: 0.4, speed: 1020, count: 2, spread: 0.11, pierce: 4, desc: 'Radiant celestial arrows with deep penetration.' },
    arc: { id: 'arc', name: 'Tesla Arc Projector', icon: '🌩️', shape: 'coil', dmg: 25, rate: 0.3, speed: 860, count: 3, spread: 0.24, pierce: 3, homing: true, desc: 'Tracking lightning bolts that seek targets.' },
    cryo: { id: 'cryo', name: 'Glacial Shard Cannon', icon: '❄️', shape: 'flamer', dmg: 27, rate: 0.44, speed: 650, count: 3, spread: 0.22, pierce: 2, chill: true, desc: 'Freezing ice shards that chill swarms.' },
    nanite: { id: 'nanite', name: 'Nanite Bio-Repeater', icon: '🧬', shape: 'rifle', dmg: 25, rate: 0.27, speed: 800, count: 2, spread: 0.08, pierce: 2, homing: true, desc: 'Bio-engineered darts that home onto xenos.' },
    missile: { id: 'missile', name: 'Quad Micro-Launcher', icon: '🚀', shape: 'launcher', dmg: 36, rate: 0.62, speed: 600, count: 3, spread: 0.28, pierce: 1, homing: true, explode: 75, desc: 'Salvo of homing explosive micro-rockets.' },
    chi: { id: 'chi', name: 'Dragon Spirit Glaive', icon: '🐉', shape: 'glaive', dmg: 31, rate: 0.34, speed: 760, count: 2, spread: 0.14, pierce: 3, spin: true, desc: 'Spinning dragon-chi crescents.' },
    singularity: { id: 'singularity', name: 'Void Singularity Orb', icon: '🔮', shape: 'orb', dmg: 52, rate: 0.74, speed: 450, count: 1, spread: 0.0, pierce: 6, homing: true, explode: 98, desc: 'Dark-matter singularity that implodes packs.' },
    // 8 Signature Weapons for Unlockable Ascended Legends (Progressively Stronger)
    prismBeam: { id: 'prismBeam', name: 'Solar Prism Emitter', icon: '💎', shape: 'prism', dmg: 44, rate: 0.25, speed: 940, count: 2, spread: 0.12, pierce: 5, bounce: true, desc: 'Rebounding prismatic laser orbs.' },
    stormLance: { id: 'stormLance', name: 'Tempest Volt Trident', icon: '🔱', shape: 'trident', dmg: 48, rate: 0.24, speed: 980, count: 3, spread: 0.18, pierce: 4, chill: true, homing: true, desc: 'Triple tracking lightning tridents that chill swarms.' },
    crimsonScythe: { id: 'crimsonScythe', name: 'Crimson Moon Glaive', icon: '🌙', shape: 'scythe', dmg: 56, rate: 0.25, speed: 900, count: 3, spread: 0.2, pierce: 6, spin: true, desc: 'Spinning bloodmoon scythe arcs with deep pierce.' },
    heliosCannon: { id: 'heliosCannon', name: 'Helios Star-Mortar', icon: '☀️', shape: 'mortar', dmg: 74, rate: 0.36, speed: 760, count: 2, spread: 0.15, pierce: 4, explode: 112, desc: 'Twin solar plasma cores triggering wide blasts.' },
    eclipseNeedler: { id: 'eclipseNeedler', name: 'Eclipse Shard Array', icon: '☄️', shape: 'needler', dmg: 52, rate: 0.2, speed: 1080, count: 4, spread: 0.22, pierce: 6, homing: true, desc: 'Quad homing void needles with relentless tracking.' },
    omegaGatling: { id: 'omegaGatling', name: 'Omega Siege Vulcan', icon: '⚙️', shape: 'vulcan', dmg: 60, rate: 0.18, speed: 1020, count: 3, spread: 0.16, pierce: 5, explode: 90, desc: 'Ultra-rapid heavy vulcan shells with explosive bursts.' },
    quantumOrb: { id: 'quantumOrb', name: 'Quantum Singularity Matrix', icon: '💠', shape: 'quantum', dmg: 84, rate: 0.32, speed: 820, count: 3, spread: 0.24, pierce: 8, bounce: true, homing: true, explode: 120, desc: 'Bouncing, homing quantum spheres that detonate crowds.' },
    sovereignX: { id: 'sovereignX', name: 'Apex X-Method Annihilator', icon: '👑', shape: 'sovereign', dmg: 96, rate: 0.2, speed: 1120, count: 4, spread: 0.24, pierce: 10, bounce: true, homing: true, chill: true, explode: 132, desc: 'Sovereign golden X-bolts that bounce, home, chill & explode.' }
  };
  const STANDARD_WEAPON_KEYS = [
    'pulse', 'graviton', 'seismic', 'inferno', 'rail', 'katana', 'tachyon', 'flak',
    'alch', 'starlight', 'arc', 'cryo', 'nanite', 'missile', 'chi', 'singularity'
  ];

  // =========================================================================
  // 4. 16 STARTER OPERATIVES + 8 UNLOCKABLE ASCENDED LEGENDS (50 -> 400 CORRECT)
  // =========================================================================
  interface HeroStatsBonus {
    fireRate?: number;
    critChance?: number;
    critDmg?: number;
    magnet?: number;
    greed?: number;
    armor?: number;
    dashNova?: number;
    dashClones?: number;
    damage?: number;
    area?: number;
    orbitShields?: number;
    projSpeed?: number;
    pierce?: number;
    regen?: number;
    multiShot?: number;
    lifeSteal?: number;
    auraDmg?: number;
    auraRadius?: number;
    auraInterval?: number;
  }

  interface OperativeHero {
    id: string;
    name: string;
    role: string;
    weapon: string;
    gearSummary: string;
    primary: string;
    secondary: string;
    accent: string;
    visor: string;
    skin: string;
    headgear: string;
    backGear: string;
    hp: number;
    speed: number;
    fireRate: number;
    dashes: number;
    passive: string;
    ultDesc: string;
    stats: HeroStatsBonus;
    isAscended?: boolean;
    unlockTier?: number;
    unlockThreshold?: number;
  }

  const OPERATIVES: OperativeHero[] = [
    { id: 'nova', name: 'Ranger Nova', role: 'Tactical Marksman', weapon: 'pulse', gearSummary: 'Recon Jetpack & Holo-Visor', primary: '#10b981', secondary: '#064e3b', accent: '#fbbf24', visor: '#38bdf8', skin: '#f1c27d', headgear: 'techVisor', backGear: 'jetpack', hp: 115, speed: 280, fireRate: 1.18, dashes: 2, passive: '+18% Fire Rate & +14% Crit Precision.', ultDesc: 'Orbital Barrage: Calls down 22 plasma strikes across the arena.', stats: { fireRate: 0.18, critChance: 0.14 } },
    { id: 'euclid', name: 'Harvester Euclid', role: 'Geometric Scavenger', weapon: 'graviton', gearSummary: 'Golden-Ratio Cloak & Cowl', primary: '#fbbf24', secondary: '#78350f', accent: '#10b981', visor: '#fef08a', skin: '#e0ac69', headgear: 'hood', backGear: 'cape', hp: 120, speed: 285, fireRate: 1.1, dashes: 2, passive: '+55% Magnet Radius & +30% Scrap/XP Gain.', ultDesc: 'Golden Ratio Pulse: Pulls all gems & triggers 4s X-Stun.', stats: { magnet: 0.55, greed: 0.3 } },
    { id: 'titan', name: 'Brawler Titan', role: 'Juggernaut Vanguard', weapon: 'seismic', gearSummary: 'Siege Exo-Armor & Thrusters', primary: '#ef4444', secondary: '#7f1d1d', accent: '#fbbf24', visor: '#fca5a5', skin: '#c68642', headgear: 'heavyHelm', backGear: 'thrusters', hp: 175, speed: 255, fireRate: 1.1, dashes: 2, passive: '+60 Max HP, +22% Armor & Dash Shockwaves.', ultDesc: 'Seismic Slam: Obliterates close-range alien packs.', stats: { armor: 0.22, dashNova: 1 } },
    { id: 'vex', name: 'Pyro Vex', role: 'Thermal Striker', weapon: 'inferno', gearSummary: 'Twin Napalm Tanks & Flame Crest', primary: '#f97316', secondary: '#7c2d12', accent: '#fde047', visor: '#fed7aa', skin: '#f1c27d', headgear: 'mohawk', backGear: 'fuelTanks', hp: 125, speed: 276, fireRate: 1.14, dashes: 2, passive: '+30% Splash Radius & +20% Damage.', ultDesc: 'Supernova Ring: Unleashes 24 radial fireballs.', stats: { damage: 0.2, area: 0.3 } },
    { id: 'ada', name: 'Engineer Ada', role: 'Drone Architect', weapon: 'rail', gearSummary: 'Tactical Goggles & Drone Rig', primary: '#06b6d4', secondary: '#164e63', accent: '#fbbf24', visor: '#a5f3fc', skin: '#ffdbac', headgear: 'goggles', backGear: 'dronePack', hp: 120, speed: 275, fireRate: 1.22, dashes: 2, passive: '+22% Attack Speed & +1 Orbiting Combat Drone.', ultDesc: 'Overclock Turrets: 2.5x Fire Rate for 5 seconds!', stats: { fireRate: 0.22, orbitShields: 1 } },
    { id: 'zero', name: 'Phantom Zero', role: 'Shadow Assassin', weapon: 'katana', gearSummary: 'Stealth Shroud & Void Scarf', primary: '#a855f7', secondary: '#3b0764', accent: '#38bdf8', visor: '#e9d5ff', skin: '#d8b4fe', headgear: 'hood', backGear: 'cape', hp: 115, speed: 315, fireRate: 1.2, dashes: 3, passive: 'Starts with 3 Dashes, Ultra Speed & +16% Crit.', ultDesc: 'Shadow Blink: Fires 22 piercing void katana waves.', stats: { critChance: 0.16, dashNova: 1 } },
    { id: 'rook', name: 'Chrono Rook', role: 'Temporal Tactician', weapon: 'tachyon', gearSummary: 'Chrono Crown & Rift Mantle', primary: '#3b82f6', secondary: '#1e3a8a', accent: '#fde047', visor: '#93c5fd', skin: '#e0ac69', headgear: 'crown', backGear: 'cape', hp: 125, speed: 278, fireRate: 1.16, dashes: 2, passive: '+25% Projectile Velocity & +1 Pierce.', ultDesc: 'Time Dilation: Freezes all aliens in stasis for 4s.', stats: { projSpeed: 0.25, pierce: 1 } },
    { id: 'terra', name: 'Bulwark Terra', role: 'Obsidian Sentinel', weapon: 'flak', gearSummary: 'Bastion Plate & Jump-Jets', primary: '#84cc16', secondary: '#365314', accent: '#fbbf24', visor: '#d9f99d', skin: '#8d5524', headgear: 'heavyHelm', backGear: 'thrusters', hp: 165, speed: 260, fireRate: 1.1, dashes: 2, passive: '+4 HP/sec Regen & +2 Orbiting Aegis X-Shields.', ultDesc: 'Aegis Fortress: Restores 65 HP & blasts aliens back.', stats: { regen: 4, orbitShields: 2 } },
    { id: 'sol', name: 'Alchemist Sol', role: 'Solar Arcanist', weapon: 'alch', gearSummary: 'Solar Diadem & Mutagen Tanks', primary: '#eab308', secondary: '#713f12', accent: '#34d399', visor: '#fef08a', skin: '#f1c27d', headgear: 'crown', backGear: 'fuelTanks', hp: 125, speed: 278, fireRate: 1.15, dashes: 2, passive: '+2.5 HP/sec Bio-Regen & +1 Multi-Shot.', ultDesc: 'Solar Flare: Vaporizes nearby swarms & showers XP.', stats: { multiShot: 1, regen: 2.5 } },
    { id: 'astra', name: 'Valkyrie Astra', role: 'Celestial Lancer', weapon: 'starlight', gearSummary: 'Seraphic Wings & Solar Halo', primary: '#ec4899', secondary: '#831843', accent: '#fde047', visor: '#fbcfe8', skin: '#ffdbac', headgear: 'halo', backGear: 'wings', hp: 125, speed: 305, fireRate: 1.18, dashes: 3, passive: 'Golden Wings: 3 Dashes & +12% Move Speed.', ultDesc: 'Valkyrie Descent: Unleashes 24 radiant star-lances.', stats: { projSpeed: 0.22, dashNova: 1 } },
    { id: 'volt', name: 'Tesla Volt', role: 'Arc Conduit', weapon: 'arc', gearSummary: 'Storm Fin & Capacitor Pack', primary: '#38bdf8', secondary: '#0c4a6e', accent: '#fde047', visor: '#bae6fd', skin: '#e0ac69', headgear: 'mohawk', backGear: 'jetpack', hp: 125, speed: 290, fireRate: 1.25, dashes: 2, passive: '+25% Fire Rate & Electric Dash Shockwaves.', ultDesc: 'Chain Lightning Storm: Zaps all hostiles with arc bolts.', stats: { fireRate: 0.25, dashNova: 1 } },
    { id: 'glacia', name: 'Frostbite Glacia', role: 'Cryo Specialist', weapon: 'cryo', gearSummary: 'Permafrost Cowl & Cape', primary: '#22d3ee', secondary: '#155e75', accent: '#e0f2fe', visor: '#cffafe', skin: '#ffdbac', headgear: 'hood', backGear: 'cape', hp: 125, speed: 276, fireRate: 1.15, dashes: 2, passive: 'Cryo Mastery: +1 Pierce & +25% Splash Area.', ultDesc: 'Absolute Zero: Deep-freezes every alien on screen.', stats: { pierce: 1, area: 0.25 } },
    { id: 'lyra', name: 'Medic Lyra', role: 'Bio-Synth Weaver', weapon: 'nanite', gearSummary: 'Bio-Halo & Angelic Wings', primary: '#14b8a6', secondary: '#115e59', accent: '#fda4af', visor: '#99f6e4', skin: '#f1c27d', headgear: 'halo', backGear: 'wings', hp: 135, speed: 282, fireRate: 1.16, dashes: 2, passive: '+3.5 HP/sec Regen & +3 HP healed on every kill.', ultDesc: 'Nano-Restore: Heals 65 HP + emerald shockwave pulse.', stats: { regen: 3.5, lifeSteal: 3 } },
    { id: 'rex', name: 'Demolitionist Rex', role: 'Heavy Ordnance', weapon: 'missile', gearSummary: 'Ballistic Goggles & Munition Pod', primary: '#fb7185', secondary: '#881337', accent: '#fbbf24', visor: '#fecdd3', skin: '#c68642', headgear: 'goggles', backGear: 'dronePack', hp: 145, speed: 265, fireRate: 1.14, dashes: 2, passive: '+30% Splash Radius & +20% Raw Damage.', ultDesc: 'Cluster Carpet Bomb: Fires 22 explosive warheads.', stats: { damage: 0.2, area: 0.3 } },
    { id: 'kai', name: 'Monk Kai', role: 'Kinetic Striker', weapon: 'chi', gearSummary: 'Dragon Circlet & Silk Cape', primary: '#f59e0b', secondary: '#78350f', accent: '#34d399', visor: '#fde68a', skin: '#e0ac69', headgear: 'crown', backGear: 'cape', hp: 130, speed: 305, fireRate: 1.22, dashes: 3, passive: '3 Dashes, +22% Fire Rate & +2 Orbiting Spirit Blades.', ultDesc: 'Dragon Spiral: Unleashes 24 spinning kinetic blades.', stats: { fireRate: 0.22, orbitShields: 2 } },
    { id: 'nyx', name: 'Oracle Nyx', role: 'Void Mathematician', weapon: 'singularity', gearSummary: 'Astral Halo & Eclipse Wings', primary: '#8b5cf6', secondary: '#2e1065', accent: '#fbbf24', visor: '#ddd6fe', skin: '#ffdbac', headgear: 'halo', backGear: 'wings', hp: 120, speed: 280, fireRate: 1.15, dashes: 2, passive: '+1 Multi-Shot, +25% Crit Damage & +20% Breach Gold.', ultDesc: 'Singularity Collapse: Crushes & stuns all enemies.', stats: { multiShot: 1, critDmg: 0.25, greed: 0.2 } },

    // =======================================================================
    // 8 UNLOCKABLE ASCENDED LEGENDS (Every 50 Correct Answers: 50 -> 400)
    // =======================================================================
    {
      id: 'orion',
      name: 'Vanguard Orion',
      role: 'Ascended I • Prism Harbinger',
      weapon: 'prismBeam',
      gearSummary: 'Valkyrie Crest & Orbiting Prism Rings',
      primary: '#14b8a6',
      secondary: '#042f2e',
      accent: '#fde047',
      visor: '#5eead4',
      skin: '#f1c27d',
      headgear: 'valkyrieCrest',
      backGear: 'prismRings',
      hp: 185,
      speed: 318,
      fireRate: 1.32,
      dashes: 3,
      passive: '+25% DMG, +18% Crit, +1 Pierce & Harmonic Prism Aura auto-zaps nearby aliens.',
      ultDesc: 'Prism Convergence: Fires 30 bouncing prism orbs + 3.5s Overclock.',
      stats: { damage: 0.25, critChance: 0.18, pierce: 1, auraDmg: 42, auraRadius: 175, auraInterval: 0.9 },
      isAscended: true,
      unlockTier: 1,
      unlockThreshold: 50
    },
    {
      id: 'kestrel',
      name: 'Tempest Kestrel',
      role: 'Ascended II • Stormcaller Ace',
      weapon: 'stormLance',
      gearSummary: 'Cyber Oni Visor & Arc Mech-Arms',
      primary: '#0ea5e9',
      secondary: '#082f49',
      accent: '#facc15',
      visor: '#7dd3fc',
      skin: '#e0ac69',
      headgear: 'oniMask',
      backGear: 'mechArms',
      hp: 200,
      speed: 326,
      fireRate: 1.38,
      dashes: 3,
      passive: '+32% DMG, +22% Crit, +1 Multi-Shot, +30% Proj Speed & Electric Dash Nova.',
      ultDesc: 'Thunderhead Barrage: Strikes 12 nearest hostiles with lightning + 28 storm tridents.',
      stats: { damage: 0.32, critChance: 0.22, multiShot: 1, projSpeed: 0.3, dashNova: 1 },
      isAscended: true,
      unlockTier: 2,
      unlockThreshold: 100
    },
    {
      id: 'ren',
      name: 'Crimson Ronin Ren',
      role: 'Ascended III • Bloodmoon Blademaster',
      weapon: 'crimsonScythe',
      gearSummary: 'Horned Oni Mask & Starlight Nova Cloak',
      primary: '#e11d48',
      secondary: '#4c0519',
      accent: '#fbbf24',
      visor: '#fda4af',
      skin: '#ffdbac',
      headgear: 'oniMask',
      backGear: 'novaCloak',
      hp: 215,
      speed: 334,
      fireRate: 1.44,
      dashes: 3,
      passive: '+38% DMG, +26% Crit, +60% Crit DMG, +4 HP/Kill Lifesteal & +2 Orbit Scythes.',
      ultDesc: 'Bloodmoon Eclipse: Unleashes 32 spinning crimson crescents & restores 50% Max HP.',
      stats: { damage: 0.38, critChance: 0.26, critDmg: 0.6, lifeSteal: 4, orbitShields: 2 },
      isAscended: true,
      unlockTier: 3,
      unlockThreshold: 150
    },
    {
      id: 'helios',
      name: 'Archon Helios',
      role: 'Ascended IV • Supernova Paladin',
      weapon: 'heliosCannon',
      gearSummary: 'Solar Astro-Dome & Triple Seraph Wings',
      primary: '#f59e0b',
      secondary: '#451a03',
      accent: '#fef08a',
      visor: '#fde047',
      skin: '#f1c27d',
      headgear: 'astroHelm',
      backGear: 'seraphWings',
      hp: 235,
      speed: 338,
      fireRate: 1.5,
      dashes: 4,
      passive: '4 Dashes, +45% DMG, +28% Armor, +5 HP/s Regen, +40% Area & Solar Burn Aura.',
      ultDesc: 'Supernova Judgment: 420px solar shockwave + 4s Stun + 28 explosive star-mortars.',
      stats: { damage: 0.45, armor: 0.28, regen: 5, area: 0.4, dashNova: 1, auraDmg: 65, auraRadius: 195, auraInterval: 0.75 },
      isAscended: true,
      unlockTier: 4,
      unlockThreshold: 200
    },
    {
      id: 'selene',
      name: 'Wraith Selene',
      role: 'Ascended V • Eclipse Phantom',
      weapon: 'eclipseNeedler',
      gearSummary: 'Valkyrie Crest & Void Nova Cloak',
      primary: '#9333ea',
      secondary: '#2e1065',
      accent: '#22d3ee',
      visor: '#e879f9',
      skin: '#d8b4fe',
      headgear: 'valkyrieCrest',
      backGear: 'novaCloak',
      hp: 250,
      speed: 350,
      fireRate: 1.58,
      dashes: 4,
      passive: '+55% DMG, +32% Crit, +2 Multi-Shot, +2 Pierce & Shadow Clone Dash Shards.',
      ultDesc: 'Void Rift: Freezes all enemies for 4.5s & launches 36 homing eclipse shards.',
      stats: { damage: 0.55, critChance: 0.32, multiShot: 2, pierce: 2, dashNova: 1, dashClones: 10 },
      isAscended: true,
      unlockTier: 5,
      unlockThreshold: 250
    },
    {
      id: 'atlas',
      name: 'Colossus Atlas',
      role: 'Ascended VI • Omega Siege Titan',
      weapon: 'omegaGatling',
      gearSummary: 'Astro-Helm & Heavy Dual Servo-Cannons',
      primary: '#10b981',
      secondary: '#064e3b',
      accent: '#fbbf24',
      visor: '#6ee7b7',
      skin: '#8d5524',
      headgear: 'astroHelm',
      backGear: 'mechArms',
      hp: 285,
      speed: 342,
      fireRate: 1.66,
      dashes: 4,
      passive: '285 HP, 38% Armor, +7 HP/s Regen, +65% DMG, +35% Area & +4 Orbit Siege Shields.',
      ultDesc: 'Orbital Siegebuster: 5s Overclock, 2s Invulnerability, +90 HP & 36 warheads.',
      stats: { damage: 0.65, armor: 0.38, regen: 7, area: 0.35, orbitShields: 4 },
      isAscended: true,
      unlockTier: 6,
      unlockThreshold: 300
    },
    {
      id: 'seraphina',
      name: 'Seraphina Flux',
      role: 'Ascended VII • Quantum Archmage',
      weapon: 'quantumOrb',
      gearSummary: 'Tri-Omega Crown & Cosmic Seraph Wings',
      primary: '#d946ef',
      secondary: '#4a044e',
      accent: '#fde047',
      visor: '#f5d0fe',
      skin: '#ffdbac',
      headgear: 'omegaCrown',
      backGear: 'seraphWings',
      hp: 305,
      speed: 358,
      fireRate: 1.76,
      dashes: 4,
      passive: '+76% DMG, +38% Crit, +2 Multi-Shot, +3 Pierce, +6 Regen, +5 Lifesteal & +4 Orbiters.',
      ultDesc: 'Quantum Singularity: Pulls all XP gems, freezes 5s & fires 40 exploding orbs.',
      stats: { damage: 0.76, critChance: 0.38, multiShot: 2, pierce: 3, regen: 6, lifeSteal: 5, orbitShields: 4, greed: 0.5, magnet: 0.6, auraDmg: 95, auraRadius: 215, auraInterval: 0.7 },
      isAscended: true,
      unlockTier: 7,
      unlockThreshold: 350
    },
    {
      id: 'baker_prime',
      name: 'Grandmaster Baker Prime',
      role: 'Ascended VIII • Apex X-Sovereign',
      weapon: 'sovereignX',
      gearSummary: 'Omega Sovereign Crown & Seraph Prism Matrix',
      primary: '#fbbf24',
      secondary: '#064e3b',
      accent: '#ffffff',
      visor: '#34d399',
      skin: '#f1c27d',
      headgear: 'omegaCrown',
      backGear: 'seraphWings',
      hp: 345,
      speed: 372,
      fireRate: 1.9,
      dashes: 5,
      passive: '5 Dashes, +95% DMG, +45% Crit, +100% Crit DMG, +3 Multi-Shot, +4 Pierce, 40% Armor & X-Aura.',
      ultDesc: 'Final Exam Obliteration: 6s Overclock, +100 HP, 5s global X-Stun & 48 Sovereign X-bolts!',
      stats: { damage: 0.95, critChance: 0.45, critDmg: 1.0, armor: 0.4, regen: 8, lifeSteal: 6, multiShot: 3, pierce: 4, orbitShields: 5, dashNova: 2, dashClones: 14, greed: 0.65, magnet: 0.85, auraDmg: 130, auraRadius: 240, auraInterval: 0.6 },
      isAscended: true,
      unlockTier: 8,
      unlockThreshold: 400
    }
  ];

  // =========================================================================
  // 5. FULL-BODY 3D-SHADED SVG PORTRAIT GENERATOR
  // =========================================================================
  function buildOperativeSVG(hero: OperativeHero): string {
    const uid = `fb_${hero.id}`;
    const wMeta = WEAPON_CATALOG[hero.weapon];
    const wepColor = TIER_STYLES[1].color;

    let backMarkup = '';
    if (hero.backGear === 'wings') {
      backMarkup = `
        <path d="M32 48 L6 24 L26 34 L16 14 L38 34 Z" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.9"/>
        <path d="M68 48 L94 24 L74 34 L84 14 L62 34 Z" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.9"/>
      `;
    } else if (hero.backGear === 'seraphWings') {
      backMarkup = `
        <path d="M34 46 L4 14 L24 28 L10 38 L28 44 L14 58 L36 56 Z" fill="${hero.accent}" stroke="${hero.visor}" stroke-width="1.2"/>
        <path d="M66 46 L96 14 L76 28 L90 38 L72 44 L86 58 L64 56 Z" fill="${hero.accent}" stroke="${hero.visor}" stroke-width="1.2"/>
      `;
    } else if (hero.backGear === 'prismRings') {
      backMarkup = `
        <circle cx="50" cy="48" r="32" fill="none" stroke="${hero.accent}" stroke-width="2" stroke-dasharray="6 4"/>
        <polygon points="50,12 82,48 50,84 18,48" fill="none" stroke="${hero.visor}" stroke-width="1.5" opacity="0.8"/>
      `;
    } else if (hero.backGear === 'mechArms') {
      backMarkup = `
        <path d="M32 45 L14 28 L16 16 L24 16" fill="none" stroke="${hero.accent}" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="23" cy="16" r="4.5" fill="${hero.visor}" stroke="#ffffff" stroke-width="1"/>
        <path d="M68 45 L86 28 L84 16 L76 16" fill="none" stroke="${hero.accent}" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="77" cy="16" r="4.5" fill="${hero.visor}" stroke="#ffffff" stroke-width="1"/>
      `;
    } else if (hero.backGear === 'novaCloak') {
      backMarkup = `
        <path d="M28 40 L12 104 L42 96 L50 108 L58 96 L88 104 L72 40 Z" fill="${hero.secondary}" stroke="${hero.visor}" stroke-width="1.6"/>
        <circle cx="22" cy="74" r="2.5" fill="${hero.accent}"/>
        <circle cx="78" cy="74" r="2.5" fill="${hero.accent}"/>
      `;
    } else if (hero.backGear === 'cape') {
      backMarkup = `
        <path d="M30 42 L18 106 L82 106 L70 42 Z" fill="${hero.secondary}" stroke="${hero.accent}" stroke-width="1.5"/>
        <path d="M38 46 L30 106 M62 46 L70 106" stroke="${hero.primary}" stroke-width="1.2" opacity="0.5"/>
      `;
    } else if (hero.backGear === 'jetpack' || hero.backGear === 'thrusters') {
      backMarkup = `
        <rect x="24" y="36" width="10" height="28" rx="3.5" fill="#1e293b" stroke="${hero.accent}" stroke-width="1.4"/>
        <rect x="66" y="36" width="10" height="28" rx="3.5" fill="#1e293b" stroke="${hero.accent}" stroke-width="1.4"/>
        <polygon points="26,64 32,64 29,74" fill="${hero.visor}"/>
        <polygon points="68,64 74,64 71,74" fill="${hero.visor}"/>
      `;
    } else {
      backMarkup = `
        <rect x="25" y="35" width="9" height="26" rx="4.5" fill="${hero.primary}" stroke="#ffffff" stroke-width="1"/>
        <rect x="66" y="35" width="9" height="26" rx="4.5" fill="${hero.primary}" stroke="#ffffff" stroke-width="1"/>
      `;
    }

    let headMarkup = '';
    if (hero.headgear === 'oniMask') {
      headMarkup = `
        <polygon points="36,16 29,4 42,12" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.9"/>
        <polygon points="64,16 71,4 58,12" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.9"/>
        <circle cx="50" cy="24" r="13" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.6"/>
        <path d="M39 20 L48 24 L39 27 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <path d="M61 20 L52 24 L61 27 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <path d="M41 30 L50 34 L59 30" fill="none" stroke="${hero.accent}" stroke-width="2"/>
      `;
    } else if (hero.headgear === 'astroHelm') {
      headMarkup = `
        <circle cx="50" cy="23" r="14.5" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.8"/>
        <ellipse cx="50" cy="23" rx="11" ry="9.5" fill="${hero.visor}" opacity="0.88" filter="url(#${uid}_glow)"/>
        <polygon points="50,17 54,23 50,29 46,23" fill="#ffffff" opacity="0.85"/>
      `;
    } else if (hero.headgear === 'valkyrieCrest') {
      headMarkup = `
        <path d="M36 22 L24 9 L39 14" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.8"/>
        <path d="M64 22 L76 9 L61 14" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.8"/>
        <circle cx="50" cy="24" r="13" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.5"/>
        <path d="M39 22 Q50 18 61 22 L59 29 Q50 32 41 29 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else if (hero.headgear === 'omegaCrown') {
      headMarkup = `
        <polygon points="36,16 39,4 45,11 50,2 55,11 61,4 64,16" fill="${hero.accent}" stroke="#ffffff" stroke-width="1"/>
        <circle cx="50" cy="25" r="13" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.8"/>
        <rect x="38" y="21" width="24" height="6" rx="3" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else if (hero.headgear === 'techVisor') {
      headMarkup = `
        <circle cx="50" cy="24" r="13" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <path d="M38 21 Q50 17 62 21 L60 29 Q50 32 40 29 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <line x1="42" y1="22" x2="55" y2="21.5" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
      `;
    } else if (hero.headgear === 'hood') {
      headMarkup = `
        <path d="M33 32 Q50 4 67 32 L63 39 L37 39 Z" fill="${hero.secondary}" stroke="${hero.accent}" stroke-width="1.5"/>
        <circle cx="50" cy="26" r="9.5" fill="#090d16"/>
        <ellipse cx="46" cy="25" rx="2.8" ry="1.6" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <ellipse cx="54" cy="25" rx="2.8" ry="1.6" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else if (hero.headgear === 'heavyHelm') {
      headMarkup = `
        <rect x="35" y="10" width="30" height="26" rx="8" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.8"/>
        <rect x="39" y="19" width="22" height="6" rx="2.5" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <line x1="50" y1="10" x2="50" y2="18" stroke="${hero.accent}" stroke-width="2.4"/>
      `;
    } else if (hero.headgear === 'goggles') {
      headMarkup = `
        <circle cx="50" cy="25" r="12" fill="${hero.skin}"/>
        <path d="M38 21 Q50 9 62 21 Z" fill="${hero.secondary}"/>
        <circle cx="44" cy="22" r="4.8" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.6"/>
        <circle cx="56" cy="22" r="4.8" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.6"/>
        <circle cx="44" cy="22" r="2.6" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <circle cx="56" cy="22" r="2.6" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else if (hero.headgear === 'crown') {
      headMarkup = `
        <circle cx="50" cy="25" r="12" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <polygon points="38,16 42,6 47,13 50,5 53,13 58,6 62,16" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.8"/>
        <rect x="40" y="22" width="20" height="5" rx="2" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else if (hero.headgear === 'halo') {
      headMarkup = `
        <ellipse cx="50" cy="7" rx="13" ry="3.2" fill="none" stroke="${hero.accent}" stroke-width="2" filter="url(#${uid}_glow)"/>
        <circle cx="50" cy="24" r="12.5" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <path d="M39 22 Q50 19 61 22 L59 28 Q50 30 41 28 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    } else {
      headMarkup = `
        <polygon points="50,4 45,15 55,15" fill="${hero.accent}" stroke="#ffffff" stroke-width="0.7"/>
        <circle cx="50" cy="24" r="12.5" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <path d="M39 22 L48 25 L39 28 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
        <path d="M61 22 L52 25 L61 28 Z" fill="${hero.visor}" filter="url(#${uid}_glow)"/>
      `;
    }

    let weaponMarkup = '';
    if (wMeta.shape === 'katana' || wMeta.shape === 'glaive' || wMeta.shape === 'lance' || wMeta.shape === 'scythe') {
      const scy = wMeta.shape === 'scythe' ? `<path d="M78 20 Q95 28 84 48" fill="none" stroke="${hero.accent}" stroke-width="4" stroke-linecap="round"/>` : '';
      weaponMarkup = `
        <line x1="26" y1="68" x2="84" y2="26" stroke="${wepColor}" stroke-width="3.6" stroke-linecap="round" filter="url(#${uid}_glow)"/>
        <line x1="26" y1="68" x2="84" y2="26" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
        ${scy}
      `;
    } else if (wMeta.shape === 'trident' || wMeta.shape === 'sovereign') {
      weaponMarkup = `
        <line x1="74" y1="18" x2="70" y2="108" stroke="${hero.accent}" stroke-width="3.2"/>
        <path d="M64 26 L64 14 M74 28 L74 10 M84 26 L84 14 M64 24 L84 24" stroke="${hero.visor}" stroke-width="2.4" stroke-linecap="round" filter="url(#${uid}_glow)"/>
      `;
    } else if (wMeta.shape === 'bow') {
      weaponMarkup = `
        <path d="M68 24 Q88 52 68 80" fill="none" stroke="${hero.accent}" stroke-width="3"/>
        <line x1="68" y1="24" x2="68" y2="80" stroke="#ffffff" stroke-width="1"/>
        <line x1="54" y1="52" x2="88" y2="52" stroke="${wepColor}" stroke-width="2.4"/>
      `;
    } else if (wMeta.shape === 'staff' || wMeta.shape === 'orb' || wMeta.shape === 'prism' || wMeta.shape === 'quantum') {
      weaponMarkup = `
        <line x1="74" y1="20" x2="70" y2="108" stroke="${hero.accent}" stroke-width="3"/>
        <polygon points="74,9 82,18 74,27 66,18" fill="${hero.visor}" stroke="#ffffff" stroke-width="1.2" filter="url(#${uid}_glow)"/>
      `;
    } else {
      weaponMarkup = `
        <rect x="34" y="52" width="46" height="10" rx="3" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.5"/>
        <rect x="68" y="54" width="14" height="6" rx="1.5" fill="${wepColor}" filter="url(#${uid}_glow)"/>
      `;
    }

    const ascendedFrame = hero.isAscended
      ? `<rect x="2" y="2" width="96" height="112" rx="12" fill="none" stroke="${hero.accent}" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.75"/>`
      : '';

    return `
      <svg viewBox="0 0 100 116" class="w-full h-full">
        <defs>
          <radialGradient id="${uid}_bg" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="${hero.primary}" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="#050c0a" stop-opacity="0.98"/>
          </radialGradient>
          <linearGradient id="${uid}_armor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
            <stop offset="35%" stop-color="${hero.primary}"/>
            <stop offset="100%" stop-color="${hero.secondary}"/>
          </linearGradient>
          <filter id="${uid}_glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <rect width="100" height="116" rx="14" fill="url(#${uid}_bg)"/>
        ${ascendedFrame}
        <ellipse cx="50" cy="109" rx="28" ry="4.5" fill="#000000" opacity="0.65"/>
        ${backMarkup}
        <rect x="36" y="68" width="11" height="32" rx="4" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.2"/>
        <rect x="53" y="68" width="11" height="32" rx="4" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.2"/>
        <circle cx="41.5" cy="83" r="3.5" fill="${hero.accent}"/>
        <circle cx="58.5" cy="83" r="3.5" fill="${hero.accent}"/>
        <path d="M33 97 L48 97 L49 108 L31 108 Z" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.3"/>
        <path d="M52 97 L67 97 L69 108 L51 108 Z" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.3"/>
        <path d="M31 40 L69 40 L65 71 L35 71 Z" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.5"/>
        <rect x="34" y="65" width="32" height="5.5" rx="2" fill="#0f172a" stroke="${hero.accent}" stroke-width="1.2"/>
        <rect x="46" y="64" width="8" height="7.5" rx="1.5" fill="${hero.accent}"/>
        <ellipse cx="29" cy="44" rx="7.5" ry="6" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <ellipse cx="71" cy="44" rx="7.5" ry="6" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.4"/>
        <polygon points="50,45 55,52 50,59 45,52" fill="${hero.visor}" stroke="#ffffff" stroke-width="0.9" filter="url(#${uid}_glow)"/>
        <rect x="23" y="47" width="8" height="20" rx="3.5" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.1"/>
        <rect x="69" y="47" width="8" height="20" rx="3.5" fill="url(#${uid}_armor)" stroke="${hero.accent}" stroke-width="1.1"/>
        ${headMarkup}
        ${weaponMarkup}
      </svg>
    `;
  }

  // =========================================================================
  // 6. 10 DISTINCT VIBRANT ALIEN SPECIES + WAVE 10 MEGA-ALIENS
  // =========================================================================
  interface AlienSpec {
    level: number;
    name: string;
    archetype: string;
    radius: number;
    baseHp: number;
    baseSpeed: number;
    baseDmg: number;
    xp: number;
    gold: number;
    c1: string;
    c2: string;
    glow: string;
    shootCd: number;
    spawnsMites?: boolean;
  }

  const ALIEN_SPECIES: Record<number, AlienSpec> = {
    1: { level: 1, name: 'Xeno-Mite', archetype: 'arachnid', radius: 14, baseHp: 24, baseSpeed: 175, baseDmg: 9, xp: 12, gold: 4, c1: '#84cc16', c2: '#1a2e05', glow: '#bef264', shootCd: 999 },
    2: { level: 2, name: 'Acid Spitter', archetype: 'spitter', radius: 17, baseHp: 38, baseSpeed: 138, baseDmg: 12, xp: 16, gold: 5, c1: '#14b8a6', c2: '#042f2e', glow: '#a3e635', shootCd: 2.2 },
    3: { level: 3, name: 'Razor Stalker', archetype: 'mantis', radius: 19, baseHp: 56, baseSpeed: 205, baseDmg: 15, xp: 22, gold: 7, c1: '#f97316', c2: '#431407', glow: '#fde047', shootCd: 999 },
    4: { level: 4, name: 'Void Weaver', archetype: 'squid', radius: 21, baseHp: 78, baseSpeed: 162, baseDmg: 18, xp: 28, gold: 9, c1: '#a855f7', c2: '#2e1065', glow: '#f0abfc', shootCd: 2.0 },
    5: { level: 5, name: 'Magma Charger', archetype: 'beetle', radius: 25, baseHp: 125, baseSpeed: 152, baseDmg: 22, xp: 36, gold: 11, c1: '#ef4444', c2: '#450a0a', glow: '#fbbf24', shootCd: 999 },
    6: { level: 6, name: 'Cryo-Hydra', archetype: 'hydra', radius: 28, baseHp: 175, baseSpeed: 132, baseDmg: 25, xp: 45, gold: 14, c1: '#06b6d4', c2: '#083344', glow: '#cffafe', shootCd: 1.85 },
    7: { level: 7, name: 'Plasma Goliath', archetype: 'quadwalker', radius: 32, baseHp: 245, baseSpeed: 115, baseDmg: 29, xp: 56, gold: 17, c1: '#3b82f6', c2: '#172554', glow: '#60a5fa', shootCd: 1.75 },
    8: { level: 8, name: 'Necro-Hive Mother', archetype: 'hivemother', radius: 36, baseHp: 340, baseSpeed: 102, baseDmg: 32, xp: 70, gold: 22, c1: '#ec4899', c2: '#500724', glow: '#f9a8d4', shootCd: 3.6, spawnsMites: true },
    9: { level: 9, name: 'Abyssal Leviathan', archetype: 'leviathan', radius: 40, baseHp: 480, baseSpeed: 124, baseDmg: 38, xp: 90, gold: 28, c1: '#10b981', c2: '#022c22', glow: '#34d399', shootCd: 1.65 },
    10: { level: 10, name: 'Omega Dreadnought', archetype: 'dreadnought', radius: 46, baseHp: 720, baseSpeed: 108, baseDmg: 45, xp: 130, gold: 40, c1: '#e11d48', c2: '#4c0519', glow: '#fbbf24', shootCd: 1.45 }
  };

  function pickAlienLevelForWave(wave: number): number {
    const table: Record<number, number[]> = {
      1: [1, 1, 1, 1, 1, 2, 2, 3],
      2: [1, 1, 1, 2, 2, 2, 3, 3, 4],
      3: [1, 1, 2, 2, 3, 3, 3, 4, 4, 5],
      4: [2, 2, 3, 3, 4, 4, 4, 5, 5, 6],
      5: [3, 4, 4, 5, 5, 5, 6, 6, 7],
      6: [4, 5, 5, 6, 6, 6, 7, 7, 8],
      7: [5, 6, 6, 7, 7, 7, 8, 8, 9],
      8: [6, 7, 7, 8, 8, 8, 9, 9, 10],
      9: [7, 8, 8, 9, 9, 9, 10, 10],
      10: [8, 9, 9, 10, 10, 10]
    };
    const pool = table[Math.min(10, Math.max(1, wave))];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // =========================================================================
  // 7. PLAYER TYPE & UPGRADE POOL
  // =========================================================================
  interface PlayerState {
    hero: OperativeHero;
    x: number;
    y: number;
    radius: number;
    facingAngle: number;
    walkCycle: number;
    isMoving: boolean;
    recoil: number;
    deaths: number;
    maxDeaths: number;
    baseMaxHp: number;
    bonusMaxHp: number;
    hp: number;
    maxHp: number;
    baseSpeed: number;
    speedMult: number;
    fireRateMult: number;
    damageMult: number;
    projSpeedMult: number;
    critChance: number;
    critMult: number;
    armor: number;
    regen: number;
    lifeSteal: number;
    magnetRadius: number;
    xpMult: number;
    bonusProjectiles: number;
    bonusPierce: number;
    areaMult: number;
    orbitShields: number;
    orbitAngle: number;
    dashNovaLevel: number;
    dashClones: number;
    maxDashes: number;
    dashCharges: number;
    dashCooldownBase: number;
    dashRechargeTimer: number;
    dashActiveTimer: number;
    dashDirX: number;
    dashDirY: number;
    invulnTimer: number;
    ultCharge: number;
    overclockTimer: number;
    auraDmg: number;
    auraRadius: number;
    auraInterval: number;
    auraTimer: number;
    xp: number;
    xpToNext: number;
    level: number;
    gold: number;
  }

  interface StatUpgrade {
    id: string;
    name: string;
    icon: string;
    desc: string;
    apply: (p: PlayerState) => void;
  }

  const STAT_UPGRADES: StatUpgrade[] = [
    { id: 'fireRate', name: 'Overclocked Trigger', icon: '⚡', desc: '+18% Attack Speed & Rate of Fire', apply: p => { p.fireRateMult += 0.18; } },
    { id: 'moveSpeed', name: 'Kinetic Thrusters', icon: '👟', desc: '+14% Movement Speed', apply: p => { p.speedMult += 0.14; } },
    { id: 'extraDash', name: 'Phase Capacitor', icon: '💨', desc: '+1 Max Dash Charge & +20% Dash Recharge', apply: p => { p.maxDashes += 1; p.dashCharges = p.maxDashes; p.dashCooldownBase *= 0.8; } },
    { id: 'dashNova', name: 'Arc Dash Discharge', icon: '🌩️', desc: 'Unleashes a high-damage plasma shockwave on every dash', apply: p => { p.dashNovaLevel += 1; } },
    { id: 'multiShot', name: 'Split-Chamber Barrel', icon: '🔱', desc: '+1 Extra Projectile on every equipped weapon', apply: p => { p.bonusProjectiles += 1; } },
    { id: 'pierce', name: 'Depleted X-Core Rounds', icon: '🎯', desc: '+1 Enemy Penetration (Pierce) & +20% Bullet Speed', apply: p => { p.bonusPierce += 1; p.projSpeedMult += 0.2; } },
    { id: 'orbitShield', name: 'Orbital X-Blades', icon: '✡️', desc: '+1 Rotating Algebraic Energy Blade around your hero', apply: p => { p.orbitShields += 1; } },
    { id: 'crit', name: 'Precision Crit Optics', icon: '👁️', desc: '+12% Critical Hit Chance & +35% Crit Damage', apply: p => { p.critChance = Math.min(0.85, p.critChance + 0.12); p.critMult += 0.35; } },
    { id: 'regen', name: 'Bio-Regen Matrix', icon: '💚', desc: '+2.5 HP/sec Regeneration & +25 Max HP', apply: p => { p.regen += 2.5; p.bonusMaxHp += 25; recalculateMaxHp(p); p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: 'magnet', name: 'Graviton Harvester', icon: '🧲', desc: '+45% Pickup Magnet Range & +25% Scrap Gold', apply: p => { p.magnetRadius *= 1.45; p.xpMult += 0.25; } },
    { id: 'damage', name: 'High-Energy Coils', icon: '🔥', desc: '+22% Global Weapon Damage', apply: p => { p.damageMult += 0.22; } },
    { id: 'armor', name: 'Aegis Nanoweave', icon: '🛡️', desc: '+35 Max HP, Heal 35 HP & +8% Damage Reduction', apply: p => { p.bonusMaxHp += 35; recalculateMaxHp(p); p.hp = Math.min(p.maxHp, p.hp + 35); p.armor = Math.min(0.65, p.armor + 0.08); } }
  ];

  // =========================================================================
  // 8. GAME ENGINE STATE + OST TOPIC SELECTION (BEFORE & DURING GAME)
  // =========================================================================
  const canvas = byId<HTMLCanvasElement>('gameCanvas');
  const ctx = canvas.getContext('2d')!;

  let selectedHeroId = OPERATIVES[0].id;
  let selectedTopicId = 'all';
  let selectedIntensity = 'medium';
  let latestCloudSnap: CloudSaveSnapshot = firebaseSave.getSnapshot();
  let restoredCloudPrefs = false;
  let pendingGuestRun: {
    heroId: string;
    heroName: string;
    topicId: string;
    topicTitle: string;
    intensity: 'easy' | 'medium' | 'hard' | 'extreme';
    wave: number;
    victory: boolean;
    kills: number;
    gameCorrect: number;
    gameAttempted: number;
    unsyncedCorrectDelta: number;
    unsyncedAttemptedDelta: number;
  } | null = null;

  function getLifetimeTotals(): { totalCorrect: number; totalAttempted: number; rate: number } {
    const p = latestCloudSnap.profile;
    if (!p) return { totalCorrect: 0, totalAttempted: 0, rate: 0 };
    const rate =
      p.totalAttempted > 0 ? Math.min(100, Math.round((p.totalCorrect / p.totalAttempted) * 100)) : 0;
    return { totalCorrect: p.totalCorrect, totalAttempted: p.totalAttempted, rate };
  }

  function isHeroUnlocked(hero: OperativeHero): boolean {
    if (!hero.unlockThreshold) return true;
    return getLifetimeTotals().totalCorrect >= hero.unlockThreshold;
  }

  interface IntensityConfig {
    label: string;
    short: string;
    countMult: number;
    rateMult: number;
    hpMult: number;
    dmgMult: number;
    speedMult: number;
    projSpeedMult: number;
    desc: string;
  }

  const INTENSITY_CONFIG: Record<string, IntensityConfig> = {
    easy: { label: 'EASY', short: 'EASY', countMult: 0.75, rateMult: 0.75, hpMult: 0.8, dmgMult: 0.8, speedMult: 0.88, projSpeedMult: 0.9, desc: 'Easy: Relaxed 0.75x alien swarm density & 0.8x alien HP/damage.' },
    medium: { label: 'MEDIUM', short: 'MED', countMult: 1.0, rateMult: 1.0, hpMult: 1.0, dmgMult: 1.0, speedMult: 1.0, projSpeedMult: 1.0, desc: 'Medium: Standard 1.0x alien spawn rate, swarm cap, HP & speed.' },
    hard: { label: 'HARD', short: 'HARD', countMult: 1.45, rateMult: 1.4, hpMult: 1.25, dmgMult: 1.25, speedMult: 1.1, projSpeedMult: 1.12, desc: 'Hard: 1.45x swarm cap, 1.4x spawn speed & 1.25x alien HP/damage.' },
    extreme: { label: 'EXTREME', short: 'EXT', countMult: 2.0, rateMult: 1.85, hpMult: 1.55, dmgMult: 1.55, speedMult: 1.18, projSpeedMult: 1.25, desc: 'Extreme: 2.0x relentless horde, 1.85x spawn speed & 1.55x alien HP/damage.' }
  };

  function getIntensityCfg(): IntensityConfig {
    return INTENSITY_CONFIG[selectedIntensity] || INTENSITY_CONFIG.medium;
  }

  function setWaveIntensity(level: string, playAudio = true): void {
    if (!INTENSITY_CONFIG[level]) return;
    selectedIntensity = level;
    const cfg = getIntensityCfg();

    byId('intensityBadge').textContent = cfg.label;
    byId('intensityDesc').textContent = cfg.desc;
    byId('pauseIntensityBadge').textContent = cfg.label;
    byId('hudIntensityTag').textContent = `• ${cfg.short}`;

    document.querySelectorAll<HTMLElement>('.intensity-btn').forEach(b => {
      const active = b.dataset.intensity === level;
      b.classList.toggle('bg-cyan-500/20', active);
      b.classList.toggle('border-cyan-400', active);
      b.classList.toggle('shadow-md', active);
      b.classList.toggle('bg-[#0a1814]', !active);
      b.classList.toggle('border-emerald-500/25', !active);
    });

    document.querySelectorAll<HTMLElement>('.pause-intensity-btn').forEach(b => {
      const active = b.dataset.intensity === level;
      b.classList.toggle('bg-cyan-500/20', active);
      b.classList.toggle('border-cyan-400', active);
      b.classList.toggle('bg-[#0a1814]', !active);
      b.classList.toggle('border-emerald-500/25', !active);
    });

    if (playAudio) sfx.play('xp');
  }

  function renderTopicGrid(containerId: string, onSelect: (topicId: string) => void, compact = false): void {
    const container = byId(containerId);
    if (!container) return;
    container.innerHTML = '';

    const allOption = {
      id: 'all',
      label: 'ALL 11 OST TOPICS (MIXED)',
      count: getTopicProblems('all').length,
      color: '#fbbf24'
    };

    const items = [
      allOption,
      ...OST_TOPICS.map(t => ({
        id: t.id,
        label: t.sheetHeader,
        count: getTopicProblems(t.id).length,
        color: t.badgeColor
      }))
    ];

    items.forEach(item => {
      const isActive = selectedTopicId === item.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.topicId = item.id;
      btn.className = `${
        compact ? 'px-2.5 py-2' : 'px-2.5 py-2'
      } rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
        isActive
          ? 'bg-emerald-500/20 border-amber-400 shadow-md'
          : 'bg-[#0a1814] border-emerald-500/25 hover:border-emerald-400/70'
      }`;
      btn.innerHTML = `
        <span class="font-display font-bold text-[11px] leading-snug ${isActive ? 'text-amber-300' : 'text-emerald-100'}">${item.label}</span>
        <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-emerald-500/25 shrink-0">${item.count} Qs</span>
      `;
      btn.addEventListener('click', () => {
        onSelect(item.id);
      });
      container.appendChild(btn);
    });
  }

  function setOstTopic(topicId: string, playAudio = true): void {
    selectedTopicId = topicId;
    const meta = getTopicMeta(topicId);
    const total = getTopicProblems(topicId).length;

    byId('topicBadge').textContent = `${total} Qs`;
    byId('topicDesc').textContent = `${meta.sheetHeader}: ${meta.description}`;
    byId('hudTopicLabel').textContent = meta.shortTitle.toUpperCase();
    byId('topicModalCurrentName').textContent = `${meta.sheetHeader} (${total} Questions)`;

    renderTopicGrid('titleTopicGrid', id => setOstTopic(id, true), false);
    renderTopicGrid('midGameTopicGrid', id => {
      setOstTopic(id, true);
      if (STATE.player) {
        spawnFloatingText(STATE.player.x, STATE.player.y - 34, `TOPIC: ${getTopicMeta(id).shortTitle.toUpperCase()}`, '#34d399', 15);
      }
    }, true);
    renderTopicGrid('pauseTopicGrid', id => {
      setOstTopic(id, true);
    }, true);

    if (playAudio) sfx.play('xp');
  }

  // =========================================================================
  // 9. CORE GAME STATE
  // =========================================================================
  interface EnemyEntity {
    alienLevel: number;
    archetype: string;
    name: string;
    isBoss: boolean;
    bossLabel: string | null;
    x: number;
    y: number;
    radius: number;
    hp: number;
    maxHp: number;
    speed: number;
    dmg: number;
    xp: number;
    gold: number;
    color1: string;
    color2: string;
    glow: string;
    legPhase: number;
    hitFlash: number;
    stunTimer: number;
    chillTimer: number;
    shootTimer: number;
    shootCd: number;
    spawnsMites: boolean;
    dead?: boolean;
  }

  interface ProjectileEntity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    dmg: number;
    pierce: number;
    life: number;
    color: string;
    isGold: boolean;
    crit: boolean;
    chill?: boolean;
    homing?: boolean;
    bounce?: boolean;
    explode: number;
    hitSet?: Set<EnemyEntity>;
  }

  interface EnemyProjectileEntity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    dmg: number;
    color: string;
    life: number;
  }

  const STATE = {
    mode: 'TITLE' as 'TITLE' | 'PLAYING' | 'PAUSED' | 'TOPIC' | 'MATH' | 'UPGRADE' | 'SHOP' | 'END',
    width: window.innerWidth,
    height: window.innerHeight,
    time: 0,
    wave: 1,
    maxWaves: 10,
    waveDuration: 120,
    waveTimer: 120,
    breachTriggers: [90, 60, 30],
    triggeredBreaches: new Set<number>(),
    autoAim: true,
    mouse: { x: 0, y: 0, down: false },
    keys: {} as Record<string, boolean>,
    joystick: { active: false, dx: 0, dy: 0 },
    cameraShake: 0,
    rerollCost: 15,
    stats: {
      kills: 0,
      mathAttempted: 0,
      mathCorrect: 0,
      syncedAttempted: 0,
      syncedCorrect: 0,
      unlockedThisRun: [] as string[],
      runRecorded: false
    },
    player: null as PlayerState | null,
    weapons: [] as Array<{ id: string; tier: number; cooldown: number }>,
    enemies: [] as EnemyEntity[],
    projectiles: [] as ProjectileEntity[],
    enemyProjectiles: [] as EnemyProjectileEntity[],
    gems: [] as Array<{ x: number; y: number; xp: number; gold: number; isBoss: boolean; magnetized: boolean }>,
    crates: [] as Array<{ x: number; y: number; pulse: number }>,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>,
    floatingTexts: [] as Array<{ x: number; y: number; text: string; color: string; size: number; life: number; maxLife: number }>,
    shockwaves: [] as Array<{ x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number }>,
    spawnAccumulator: 0
  };

  function resizeCanvas(): void {
    STATE.width = window.innerWidth;
    STATE.height = window.innerHeight;
    canvas.width = STATE.width;
    canvas.height = STATE.height;
    if (STATE.mode === 'MATH') fitMathChoiceLabels();
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // =========================================================================
  // 10. TITLE ROSTER, GOOGLE SYNC UI & TOPIC SELECTOR UI
  // =========================================================================
  function renderHeroCard(hero: OperativeHero): HTMLButtonElement {
    const isSelected = hero.id === selectedHeroId;
    const unlocked = isHeroUnlocked(hero);
    const totalCorrect = getLifetimeTotals().totalCorrect;
    const threshold = hero.unlockThreshold || 0;
    const card = document.createElement('button');
    card.type = 'button';

    if (hero.isAscended) {
      card.className = `relative p-2.5 rounded-2xl border text-left transition flex flex-col items-center gap-1.5 cursor-pointer ${
        isSelected
          ? 'bg-amber-500/20 border-amber-300 shadow-lg shadow-amber-500/20 scale-[1.02]'
          : unlocked
            ? 'bg-[#091b15] border-amber-400/50 hover:border-amber-300'
            : 'bg-[#06100d]/85 border-slate-700/70 hover:border-amber-400/50 opacity-85'
      }`;
      const badgeHtml = unlocked
        ? `<span class="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-200 border border-amber-400/40">★ TIER ${hero.unlockTier}</span>`
        : `<span class="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-slate-900 text-rose-300 border border-rose-500/40">🔒 ${totalCorrect}/${threshold}</span>`;

      card.innerHTML = `
        <div class="w-full flex items-center justify-between">${badgeHtml}<span class="text-[9px] font-mono-code text-cyan-300">${threshold} Qs</span></div>
        <div class="w-16 h-20 rounded-xl overflow-hidden border ${unlocked ? 'border-amber-400/60' : 'border-slate-700 grayscale-[45%]'}">${buildOperativeSVG(hero)}</div>
        <div class="font-display font-bold text-xs ${unlocked ? 'text-amber-200' : 'text-slate-300'} text-center truncate w-full">${hero.name}</div>
        <div class="text-[10px] font-mono-code text-cyan-300/90 truncate w-full text-center">${WEAPON_CATALOG[hero.weapon].name}</div>
      `;
    } else {
      card.className = `p-2.5 rounded-2xl border text-left transition flex flex-col items-center gap-1.5 cursor-pointer ${
        isSelected
          ? 'bg-emerald-500/20 border-amber-400 shadow-lg shadow-emerald-500/15 scale-[1.02]'
          : 'bg-[#06100d] border-emerald-500/20 hover:border-emerald-400/60'
      }`;
      card.innerHTML = `
        <div class="w-16 h-20 rounded-xl overflow-hidden border border-emerald-500/35">${buildOperativeSVG(hero)}</div>
        <div class="font-display font-bold text-xs text-white text-center truncate w-full">${hero.name}</div>
        <div class="text-[10px] font-mono-code text-amber-300/90 truncate w-full text-center">${WEAPON_CATALOG[hero.weapon].name}</div>
      `;
    }

    card.addEventListener('click', () => {
      selectedHeroId = hero.id;
      sfx.play('xp');
      updateSelectedHeroPanel();
      renderTitleRoster();
      if (unlocked && latestCloudSnap.user) {
        void firebaseSave.savePreferences(hero.id, selectedTopicId);
      }
    });
    return card;
  }

  function renderTitleRoster(): void {
    const starterGrid = byId('heroGrid');
    const ascendedGrid = byId('ascendedHeroGrid');
    if (!starterGrid) return;
    starterGrid.innerHTML = '';
    if (ascendedGrid) ascendedGrid.innerHTML = '';

    let ascendedUnlockedCount = 0;
    OPERATIVES.forEach(hero => {
      if (hero.isAscended) {
        if (isHeroUnlocked(hero)) ascendedUnlockedCount += 1;
        if (ascendedGrid) ascendedGrid.appendChild(renderHeroCard(hero));
      } else {
        starterGrid.appendChild(renderHeroCard(hero));
      }
    });

    const badge = byId('ascendedCountBadge');
    if (badge) badge.textContent = `${ascendedUnlockedCount} / 8 UNLOCKED`;
  }

  function updateSelectedHeroPanel(): void {
    const hero = OPERATIVES.find(h => h.id === selectedHeroId) || OPERATIVES[0];
    const unlocked = isHeroUnlocked(hero);
    const totalCorrect = getLifetimeTotals().totalCorrect;

    byId('selHeroPortrait').innerHTML = buildOperativeSVG(hero);
    byId('selHeroName').textContent = hero.name;
    byId('selHeroRole').textContent = hero.role;
    byId('selHeroGear').textContent = `Gear: ${hero.gearSummary}`;
    byId('selHeroWeapon').textContent = `Weapon: ${WEAPON_CATALOG[hero.weapon].icon} ${WEAPON_CATALOG[hero.weapon].name}`;
    byId('selHeroPassive').textContent = `Passive: ${hero.passive}`;
    byId('selHeroUlt').textContent = hero.ultDesc;
    byId('statHp').textContent = `${hero.hp}`;
    byId('statSpd').textContent = `${hero.speed}`;
    byId('statRate').textContent = `${hero.fireRate.toFixed(2)}x`;

    const unlockBadge = byId('selHeroUnlockBadge');
    const startBtn = byId<HTMLButtonElement>('btnStartGame');
    if (hero.isAscended) {
      unlockBadge.classList.remove('hidden');
      if (unlocked) {
        unlockBadge.className =
          'px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-amber-500/25 text-amber-300 border border-amber-400/50';
        unlockBadge.textContent = `★ UNLOCKED (${hero.unlockThreshold} Qs)`;
      } else {
        unlockBadge.className =
          'px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-rose-500/20 text-rose-300 border border-rose-400/50';
        unlockBadge.textContent = `🔒 NEED ${hero.unlockThreshold} Qs (${totalCorrect}/${hero.unlockThreshold})`;
      }
    } else {
      unlockBadge.classList.add('hidden');
    }

    if (unlocked) {
      startBtn.disabled = false;
      startBtn.className =
        'w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 hover:brightness-110 active:scale-[0.99] text-slate-950 font-display font-extrabold text-lg sm:text-xl tracking-wide shadow-xl glow-emerald transition cursor-pointer';
      startBtn.textContent = 'DEPLOY TO ARENA ▶';
    } else {
      startBtn.disabled = true;
      startBtn.className =
        'w-full py-3.5 rounded-2xl bg-slate-800 border border-rose-500/40 text-rose-300 font-display font-extrabold text-sm sm:text-base tracking-wide cursor-not-allowed opacity-90';
      startBtn.textContent = latestCloudSnap.user
        ? `🔒 UNLOCKS AT ${hero.unlockThreshold} CORRECT (${Math.max(0, (hero.unlockThreshold || 0) - totalCorrect)} TO GO)`
        : `🔒 SIGN IN WITH GOOGLE & REACH ${hero.unlockThreshold} CORRECT`;
    }
  }

  function renderCloudSaveUI(snap: CloudSaveSnapshot): void {
    latestCloudSnap = snap;
    const signedOutBar = byId('authSignedOutBar');
    const signedInBar = byId('authSignedInBar');
    const errBox = byId('authErrorMsg');

    if (snap.syncStatus === 'error' && snap.statusMessage) {
      errBox.textContent = snap.statusMessage;
      errBox.classList.remove('hidden');
    } else {
      errBox.classList.add('hidden');
    }

    if (snap.user) {
      signedOutBar.classList.add('hidden');
      signedInBar.classList.remove('hidden');
      signedInBar.classList.add('flex');

      const displayName = snap.profile?.displayName || snap.user.displayName || 'Operative';
      byId('authUserName').textContent = displayName;

      const avatarEl = byId<HTMLImageElement>('authUserAvatar');
      const photo = snap.profile?.photoURL || snap.user.photoURL;
      if (photo) {
        avatarEl.src = photo;
        avatarEl.classList.remove('hidden');
      } else {
        avatarEl.classList.add('hidden');
      }

      const syncPill = byId('authSyncPill');
      if (snap.syncStatus === 'syncing') {
        syncPill.className = 'px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono-code text-[10px] font-bold';
        syncPill.textContent = 'SYNCING...';
      } else if (snap.syncStatus === 'error') {
        syncPill.className = 'px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/40 text-rose-300 font-mono-code text-[10px] font-bold';
        syncPill.textContent = 'SYNC ISSUE';
      } else {
        syncPill.className = 'px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono-code text-[10px] font-bold';
        syncPill.textContent = 'SYNCED ✓';
      }

      const { totalCorrect, totalAttempted, rate } = getLifetimeTotals();
      byId('lifetimeRateText').textContent = totalAttempted > 0 ? `${rate}%` : '—';
      byId('lifetimeCountText').textContent = `${totalCorrect} / ${totalAttempted}`;

      const lastAtt = snap.profile?.lastGameAttempted || 0;
      const lastCor = snap.profile?.lastGameCorrect || 0;
      const lastRate = snap.profile?.lastGameRate || 0;
      byId('lastGameRateText').textContent = lastAtt > 0 ? `${lastRate}% (${lastCor}/${lastAtt})` : '—';
      byId('gamesPlayedText').textContent = `${snap.profile?.gamesPlayed || 0} Games • ${snap.profile?.victories || 0} Wins`;

      byId('unlockProgressText').textContent = `${Math.min(400, totalCorrect)} / 400`;
      byId('unlockProgressFill').style.width = `${Math.min(100, (totalCorrect / 400) * 100)}%`;

      // Restore preferences once when cloud profile loads on Title screen
      if (snap.profile && !restoredCloudPrefs && STATE.mode === 'TITLE') {
        restoredCloudPrefs = true;
        if (snap.profile.lastTopicId && snap.profile.lastTopicId !== selectedTopicId) {
          setOstTopic(snap.profile.lastTopicId, false);
        }
        if (snap.profile.lastHeroId) {
          const savedHero = OPERATIVES.find(h => h.id === snap.profile?.lastHeroId);
          if (savedHero && isHeroUnlocked(savedHero)) {
            selectedHeroId = savedHero.id;
          }
        }
      }

      // If user played a guest run and just signed in on the end screen, flush pending run cleanly
      if (pendingGuestRun && snap.profile) {
        const toFlush = pendingGuestRun;
        pendingGuestRun = null;
        void firebaseSave.recordGameRun(toFlush);
      }

      // Refresh Stats Modal values
      byId('statsModalLifetimeRate').textContent = totalAttempted > 0 ? `${rate}%` : '—';
      byId('statsModalTotalCorrect').textContent = `${totalCorrect} / ${totalAttempted}`;
      byId('statsModalBestRate').textContent = `${snap.profile?.bestGameRate || 0}%`;
      byId('statsModalGamesWins').textContent = `${snap.profile?.gamesPlayed || 0} / ${snap.profile?.victories || 0}`;

      const listEl = byId('statsGamesList');
      if (snap.games.length === 0) {
        listEl.innerHTML = `<div class="text-center py-6 text-emerald-300/70">No completed runs saved yet. Finish a game to record your per-game accuracy!</div>`;
      } else {
        listEl.innerHTML = snap.games
          .map(g => {
            const dt = new Date(g.playedAtMs);
            const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const timeStr = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
            const rateColor = g.correctRate >= 80 ? 'text-emerald-300 border-emerald-400/50 bg-emerald-500/15' : g.correctRate >= 60 ? 'text-amber-300 border-amber-400/50 bg-amber-500/15' : 'text-rose-300 border-rose-400/50 bg-rose-500/15';
            return `
              <div class="bg-[#0a1814] border border-emerald-500/20 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold ${g.victory ? 'text-amber-300' : 'text-white'}">${g.victory ? '🏆 VICTORY' : `WAVE ${g.wave}/10`}</span>
                    <span class="text-emerald-300">${g.heroName}</span>
                    <span class="text-[10px] text-cyan-300/80 uppercase">${g.intensity}</span>
                  </div>
                  <div class="text-[10px] text-emerald-200/70 truncate">${dateStr} ${timeStr} • ${g.topicTitle} • ${g.kills} kills</div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-emerald-200">${g.correct} / ${g.attempted}</span>
                  <span class="px-2 py-0.5 rounded-lg border font-extrabold ${rateColor}">${g.correctRate}%</span>
                </div>
              </div>
            `;
          })
          .join('');
      }

      // Refresh end screen lifetime readouts if visible
      if (STATE.mode === 'END') {
        byId('endLifetimeRate').textContent = totalAttempted > 0 ? `${rate}%` : '—';
        byId('endLifetimeTotals').textContent = `${totalCorrect} / ${totalAttempted} lifetime correct (${snap.profile?.gamesPlayed || 0} games)`;
        byId('endAuthActionRow').classList.add('hidden');
      }
    } else {
      restoredCloudPrefs = false;
      signedOutBar.classList.remove('hidden');
      signedInBar.classList.add('hidden');
      signedInBar.classList.remove('flex');
      const selected = OPERATIVES.find(h => h.id === selectedHeroId);
      if (selected && selected.isAscended) {
        selectedHeroId = OPERATIVES[0].id;
      }
    }

    renderTitleRoster();
    updateSelectedHeroPanel();
  }

  byId('btnGoogleSignIn').addEventListener('click', () => {
    void firebaseSave.signInWithGoogle();
  });
  byId('btnEndGoogleSignIn').addEventListener('click', () => {
    void firebaseSave.signInWithGoogle();
  });
  byId('btnGoogleSignOut').addEventListener('click', () => {
    void firebaseSave.signOutUser();
  });
  byId('btnOpenStatsModal').addEventListener('click', () => {
    byId('statsModal').classList.remove('hidden');
  });
  byId('btnEndViewStats').addEventListener('click', () => {
    if (!latestCloudSnap.user) {
      void firebaseSave.signInWithGoogle();
      return;
    }
    byId('statsModal').classList.remove('hidden');
  });
  byId('btnCloseStatsModal').addEventListener('click', () => {
    byId('statsModal').classList.add('hidden');
  });

  firebaseSave.subscribe(renderCloudSaveUI);

  document.querySelectorAll<HTMLElement>('.intensity-btn, .pause-intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.intensity) setWaveIntensity(btn.dataset.intensity, true);
    });
  });

  setWaveIntensity('medium', false);
  setOstTopic('all', false);
  renderTitleRoster();
  updateSelectedHeroPanel();

  // =========================================================================
  // 11. PLAYER & 4-TIER WEAPON MERGING
  // =========================================================================
  function createPlayer(hero: OperativeHero): PlayerState {
    return {
      hero,
      x: STATE.width / 2,
      y: STATE.height / 2,
      radius: 20,
      facingAngle: 0,
      walkCycle: 0,
      isMoving: false,
      recoil: 0,
      deaths: 0,
      maxDeaths: 5,
      baseMaxHp: hero.hp,
      bonusMaxHp: 0,
      hp: hero.hp,
      maxHp: hero.hp,
      baseSpeed: hero.speed,
      speedMult: 1.0,
      fireRateMult: hero.fireRate,
      damageMult: 1.0 + (hero.stats.damage || 0),
      projSpeedMult: 1.0 + (hero.stats.projSpeed || 0),
      critChance: hero.stats.critChance || 0.08,
      critMult: 1.75 + (hero.stats.critDmg || 0),
      armor: hero.stats.armor || 0.0,
      regen: hero.stats.regen || 0.6,
      lifeSteal: hero.stats.lifeSteal || 0,
      magnetRadius: 150 * (1 + (hero.stats.magnet || 0)),
      xpMult: 1.0 + (hero.stats.greed || 0),
      bonusProjectiles: hero.stats.multiShot || 0,
      bonusPierce: hero.stats.pierce || 0,
      areaMult: 1.0 + (hero.stats.area || 0),
      orbitShields: hero.stats.orbitShields || 0,
      orbitAngle: 0,
      dashNovaLevel: hero.stats.dashNova || 0,
      dashClones: hero.stats.dashClones || 0,
      maxDashes: hero.dashes,
      dashCharges: hero.dashes,
      dashCooldownBase: 2.2,
      dashRechargeTimer: 0,
      dashActiveTimer: 0,
      dashDirX: 1,
      dashDirY: 0,
      invulnTimer: 0,
      ultCharge: 100,
      overclockTimer: 0,
      auraDmg: hero.stats.auraDmg || 0,
      auraRadius: hero.stats.auraRadius || 0,
      auraInterval: hero.stats.auraInterval || 0,
      auraTimer: 0.4,
      xp: 0,
      xpToNext: 40,
      level: 1,
      gold: 30
    };
  }

  function recalculateMaxHp(p: PlayerState): void {
    const integrityFactor = Math.max(0.2, 1 - p.deaths * 0.2);
    p.maxHp = Math.max(20, Math.round((p.baseMaxHp + p.bonusMaxHp) * integrityFactor));
    if (p.hp > p.maxHp) p.hp = p.maxHp;
  }

  function handlePlayerDamage(rawDmg: number): void {
    const p = STATE.player;
    if (!p || p.invulnTimer > 0) return;

    const taken = Math.max(2, rawDmg * (1 - p.armor));
    p.hp -= taken;
    p.invulnTimer = 0.52;
    STATE.cameraShake = 8;
    spawnFloatingText(p.x, p.y - 26, `-${Math.round(taken)}`, '#fb7185', 15);

    if (p.hp <= 0) {
      p.deaths += 1;
      if (p.deaths >= p.maxDeaths) {
        p.hp = 0;
        updateHUD();
        endGame(false);
        return;
      }
      recalculateMaxHp(p);
      p.hp = p.maxHp;
      p.invulnTimer = 2.2;
      STATE.cameraShake = 16;
      sfx.play('revive');

      STATE.shockwaves.push({ x: p.x, y: p.y, radius: 18, maxRadius: 340, color: '#fbbf24', alpha: 1.0 });
      STATE.enemies.forEach(e => {
        const ang = Math.atan2(e.y - p.y, e.x - p.x);
        if (!e.isBoss) {
          e.x += Math.cos(ang) * 140;
          e.y += Math.sin(ang) * 140;
        }
        e.stunTimer = Math.max(e.stunTimer, 2.5);
      });
      spawnFloatingText(p.x, p.y - 44, `SUIT INTEGRITY -20% (${p.maxDeaths - p.deaths} LIVES LEFT)`, '#fbbf24', 18);
    }
  }

  function addOrMergeWeapon(weaponId: string): void {
    STATE.weapons.push({ id: weaponId, tier: 1, cooldown: 0 });
    let merged = true;
    while (merged) {
      merged = false;
      for (let t = 1; t <= 3; t++) {
        const counts: Record<string, number> = {};
        STATE.weapons.forEach(w => {
          if (w.tier === t) counts[w.id] = (counts[w.id] || 0) + 1;
        });
        for (const id in counts) {
          if (counts[id] >= 2) {
            let removed = 0;
            STATE.weapons = STATE.weapons.filter(w => {
              if (w.id === id && w.tier === t && removed < 2) {
                removed++;
                return false;
              }
              return true;
            });
            const nextTier = t + 1;
            STATE.weapons.push({ id, tier: nextTier, cooldown: 0 });
            const tierStyle = TIER_STYLES[nextTier];
            if (STATE.player) {
              spawnFloatingText(
                STATE.player.x,
                STATE.player.y - 40,
                nextTier === 4 ? `★ FORGED TIER 4 SOVEREIGN GOLD! ★` : `UPGRADED TO ${tierStyle.label}!`,
                tierStyle.color,
                nextTier === 4 ? 20 : 17
              );
            }
            sfx.play('levelup');
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    }
    if (STATE.weapons.length > 6) {
      STATE.weapons = STATE.weapons.slice(0, 6);
    }
    updateHUDWeapons();
  }

  // =========================================================================
  // 12. 10-SPECIES ALIEN SPAWNER & WAVE 10 MEGA-ALIENS
  // =========================================================================
  function getPerimeterSpawnPos(): { x: number; y: number } {
    const pad = 28;
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: Math.random() * STATE.width, y: -pad };
    if (side === 1) return { x: STATE.width + pad, y: Math.random() * STATE.height };
    if (side === 2) return { x: Math.random() * STATE.width, y: STATE.height + pad };
    return { x: -pad, y: Math.random() * STATE.height };
  }

  function spawnAlienByLevel(alienLevel: number, posOverride: { x: number; y: number } | null = null): void {
    const spec = ALIEN_SPECIES[alienLevel] || ALIEN_SPECIES[1];
    const pos = posOverride || getPerimeterSpawnPos();
    const icfg = getIntensityCfg();
    const waveScale = (1 + (STATE.wave - 1) * 0.12) * icfg.hpMult;
    const speedScale = (1 + Math.min(0.35, (STATE.wave - 1) * 0.03)) * icfg.speedMult;

    STATE.enemies.push({
      alienLevel: spec.level,
      archetype: spec.archetype,
      name: spec.name,
      isBoss: false,
      bossLabel: null,
      x: pos.x,
      y: pos.y,
      radius: spec.radius,
      hp: Math.round(spec.baseHp * waveScale),
      maxHp: Math.round(spec.baseHp * waveScale),
      speed: spec.baseSpeed * speedScale,
      dmg: Math.round(spec.baseDmg * (1 + (STATE.wave - 1) * 0.08) * icfg.dmgMult),
      xp: spec.xp,
      gold: spec.gold,
      color1: spec.c1,
      color2: spec.c2,
      glow: spec.glow,
      legPhase: Math.random() * Math.PI * 2,
      hitFlash: 0,
      stunTimer: 0,
      chillTimer: 0,
      shootTimer: spec.shootCd * (0.4 + Math.random() * 0.5),
      shootCd: spec.shootCd,
      spawnsMites: !!spec.spawnsMites
    });
  }

  function spawnWave10MegaBoss(bossKey: 'TOKAR' | 'BAKER', pos: { x: number; y: number }): void {
    const icfg = getIntensityCfg();
    const lv10Wave10Hp = Math.round(ALIEN_SPECIES[10].baseHp * (1 + 9 * 0.12) * icfg.hpMult);
    const megaHp = lv10Wave10Hp * 2 * 6;
    const isTokar = bossKey === 'TOKAR';

    STATE.enemies.push({
      alienLevel: 10,
      archetype: isTokar ? 'megaTokar' : 'megaBaker',
      name: bossKey,
      isBoss: true,
      bossLabel: bossKey,
      x: pos.x,
      y: pos.y,
      radius: 68,
      hp: megaHp,
      maxHp: megaHp,
      speed: (isTokar ? 128 : 118) * icfg.speedMult,
      dmg: Math.round(48 * icfg.dmgMult),
      xp: 500,
      gold: 250,
      color1: isTokar ? '#e11d48' : '#10b981',
      color2: isTokar ? '#4c0519' : '#022c22',
      glow: '#fbbf24',
      legPhase: 0,
      hitFlash: 0,
      stunTimer: 0,
      chillTimer: 0,
      shootTimer: 1.2,
      shootCd: isTokar ? 1.45 : 1.65,
      spawnsMites: false
    });
  }

  function startWave(waveNum: number): void {
    STATE.wave = waveNum;
    STATE.waveTimer = STATE.waveDuration;
    STATE.triggeredBreaches.clear();
    STATE.enemyProjectiles = [];

    const icfg = getIntensityCfg();
    const openingPack = Math.max(8, Math.round(Math.min(30, 18 + (waveNum - 1) * 1.5) * icfg.countMult));
    for (let i = 0; i < openingPack; i++) {
      spawnAlienByLevel(pickAlienLevelForWave(waveNum));
    }

    STATE.crates = [];
    for (let i = 0; i < 2; i++) {
      STATE.crates.push({
        x: 110 + Math.random() * (STATE.width - 220),
        y: 125 + Math.random() * (STATE.height - 250),
        pulse: Math.random() * Math.PI * 2
      });
    }

    const bossHud = byId('hudBossContainer');
    if (waveNum === 10) {
      bossHud.classList.remove('hidden');
      spawnWave10MegaBoss('TOKAR', { x: STATE.width * 0.25, y: 110 });
      spawnWave10MegaBoss('BAKER', { x: STATE.width * 0.75, y: 110 });
      spawnFloatingText(STATE.width / 2, STATE.height * 0.28, 'MEGA-ALIEN TITANS: TOKAR & BAKER!', '#fbbf24', 24);
    } else {
      bossHud.classList.add('hidden');
    }

    updateHUD();
  }

  // =========================================================================
  // 13. COMBAT ACTIONS
  // =========================================================================
  function triggerDash(): void {
    if (STATE.mode !== 'PLAYING' || !STATE.player) return;
    const p = STATE.player;
    if (p.dashCharges <= 0 || p.dashActiveTimer > 0) return;

    p.dashCharges -= 1;
    p.dashActiveTimer = 0.18;
    p.invulnTimer = 0.3;

    let dx = 0;
    let dy = 0;
    if (STATE.keys['KeyW'] || STATE.keys['ArrowUp']) dy -= 1;
    if (STATE.keys['KeyS'] || STATE.keys['ArrowDown']) dy += 1;
    if (STATE.keys['KeyA'] || STATE.keys['ArrowLeft']) dx -= 1;
    if (STATE.keys['KeyD'] || STATE.keys['ArrowRight']) dx += 1;
    if (STATE.joystick.active) {
      dx = STATE.joystick.dx;
      dy = STATE.joystick.dy;
    }
    const len = Math.hypot(dx, dy);
    if (len > 0.05) {
      p.dashDirX = dx / len;
      p.dashDirY = dy / len;
    } else {
      p.dashDirX = Math.cos(p.facingAngle);
      p.dashDirY = Math.sin(p.facingAngle);
    }

    sfx.play('dash');
    STATE.shockwaves.push({ x: p.x, y: p.y, radius: 10, maxRadius: 80, color: '#38bdf8', alpha: 0.9 });

    if (p.dashNovaLevel > 0) {
      const novaRadius = 135 + p.dashNovaLevel * 28;
      const novaDmg = (52 + p.dashNovaLevel * 32) * p.damageMult;
      STATE.shockwaves.push({ x: p.x, y: p.y, radius: 15, maxRadius: novaRadius, color: '#fbbf24', alpha: 1.0 });
      STATE.enemies.forEach(e => {
        if (Math.hypot(e.x - p.x, e.y - p.y) <= novaRadius + e.radius) {
          damageEnemy(e, novaDmg, true);
          e.stunTimer = Math.max(e.stunTimer, 1.2);
        }
      });
    }

    if (p.dashClones > 0) {
      for (let i = 0; i < p.dashClones; i++) {
        const ang = (Math.PI * 2 * i) / p.dashClones;
        STATE.projectiles.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(ang) * 920,
          vy: Math.sin(ang) * 920,
          radius: 7,
          dmg: 58 * p.damageMult,
          pierce: 4,
          life: 1.25,
          color: p.hero.visor,
          isGold: !!p.hero.isAscended,
          crit: true,
          homing: true,
          explode: 55 * p.areaMult
        });
      }
    }
  }

  function triggerUltimate(): void {
    if (STATE.mode !== 'PLAYING' || !STATE.player) return;
    const p = STATE.player;
    if (p.ultCharge < 100) return;
    p.ultCharge = 0;
    STATE.cameraShake = 12;
    sfx.play('ult');

    const id = p.hero.id;
    STATE.shockwaves.push({ x: p.x, y: p.y, radius: 20, maxRadius: 300, color: p.hero.accent, alpha: 1.0 });
    spawnFloatingText(p.x, p.y - 42, `${p.hero.name.toUpperCase()} ULTIMATE!`, '#fbbf24', 20);

    if (id === 'lyra' || id === 'terra') {
      const heal = 65;
      p.hp = Math.min(p.maxHp, p.hp + heal);
      spawnFloatingText(p.x, p.y - 22, `+${heal} HP`, '#34d399', 18);
    }
    if (id === 'ada') {
      p.overclockTimer = 5.0;
    }
    if (id === 'rook' || id === 'glacia' || id === 'euclid') {
      STATE.enemies.forEach(e => {
        e.stunTimer = 4.0;
        e.chillTimer = 5.0;
        damageEnemy(e, 75 * p.damageMult, false);
      });
      if (id === 'euclid') {
        STATE.gems.forEach(g => {
          g.magnetized = true;
        });
      }
      return;
    }

    // 8 Ascended Legend Unique Ultimates
    if (id === 'orion') {
      p.overclockTimer = 3.5;
      for (let i = 0; i < 30; i++) {
        const ang = (Math.PI * 2 * i) / 30;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 920, vy: Math.sin(ang) * 920,
          radius: 8, dmg: 105 * p.damageMult, pierce: 6, life: 1.6,
          color: '#5eead4', isGold: true, crit: true, bounce: true, explode: 60
        });
      }
      return;
    }
    if (id === 'kestrel') {
      const sorted = [...STATE.enemies].sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, 12);
      sorted.forEach(e => {
        STATE.shockwaves.push({ x: e.x, y: e.y, radius: 8, maxRadius: 72, color: '#38bdf8', alpha: 0.95 });
        damageEnemy(e, 140 * p.damageMult, true);
        e.chillTimer = 3.5;
      });
      for (let i = 0; i < 28; i++) {
        const ang = (Math.PI * 2 * i) / 28;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 980, vy: Math.sin(ang) * 980,
          radius: 8, dmg: 110 * p.damageMult, pierce: 5, life: 1.4,
          color: '#fde047', isGold: true, crit: true, homing: true, chill: true, explode: 65
        });
      }
      return;
    }
    if (id === 'ren') {
      const heal = Math.round(p.maxHp * 0.5);
      p.hp = Math.min(p.maxHp, p.hp + heal);
      spawnFloatingText(p.x, p.y - 24, `+${heal} HP SIPHON`, '#fb7185', 18);
      for (let i = 0; i < 32; i++) {
        const ang = (Math.PI * 2 * i) / 32;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 880, vy: Math.sin(ang) * 880,
          radius: 9.5, dmg: 135 * p.damageMult, pierce: 8, life: 1.45,
          color: '#e11d48', isGold: true, crit: true, explode: 75
        });
      }
      return;
    }
    if (id === 'helios') {
      STATE.shockwaves.push({ x: p.x, y: p.y, radius: 24, maxRadius: 420, color: '#fbbf24', alpha: 1.0 });
      STATE.enemies.forEach(e => {
        if (Math.hypot(e.x - p.x, e.y - p.y) <= 430) {
          e.stunTimer = Math.max(e.stunTimer, 4.0);
          damageEnemy(e, 165 * p.damageMult, true);
        }
      });
      for (let i = 0; i < 28; i++) {
        const ang = (Math.PI * 2 * i) / 28;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 780, vy: Math.sin(ang) * 780,
          radius: 10, dmg: 145 * p.damageMult, pierce: 5, life: 1.4,
          color: '#f59e0b', isGold: true, crit: true, explode: 120
        });
      }
      return;
    }
    if (id === 'selene') {
      STATE.enemies.forEach(e => {
        e.stunTimer = Math.max(e.stunTimer, 4.5);
        e.chillTimer = 5.0;
        damageEnemy(e, 145 * p.damageMult, true);
      });
      for (let i = 0; i < 36; i++) {
        const ang = (Math.PI * 2 * i) / 36;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 1050, vy: Math.sin(ang) * 1050,
          radius: 8.5, dmg: 140 * p.damageMult, pierce: 7, life: 1.5,
          color: '#e879f9', isGold: true, crit: true, homing: true, explode: 75
        });
      }
      return;
    }
    if (id === 'atlas') {
      p.overclockTimer = 5.0;
      p.invulnTimer = Math.max(p.invulnTimer, 2.2);
      p.hp = Math.min(p.maxHp, p.hp + 90);
      spawnFloatingText(p.x, p.y - 24, '+90 HP & SIEGE OVERCLOCK!', '#34d399', 18);
      for (let i = 0; i < 36; i++) {
        const ang = (Math.PI * 2 * i) / 36;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900,
          radius: 10, dmg: 155 * p.damageMult, pierce: 6, life: 1.45,
          color: '#10b981', isGold: true, crit: true, explode: 110
        });
      }
      return;
    }
    if (id === 'seraphina') {
      STATE.gems.forEach(g => {
        g.magnetized = true;
      });
      STATE.enemies.forEach(e => {
        e.stunTimer = Math.max(e.stunTimer, 5.0);
        e.chillTimer = 5.0;
        damageEnemy(e, 170 * p.damageMult, true);
      });
      for (let i = 0; i < 40; i++) {
        const ang = (Math.PI * 2 * i) / 40;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 860, vy: Math.sin(ang) * 860,
          radius: 10, dmg: 170 * p.damageMult, pierce: 9, life: 1.7,
          color: '#d946ef', isGold: true, crit: true, bounce: true, homing: true, explode: 118
        });
      }
      return;
    }
    if (id === 'baker_prime') {
      p.overclockTimer = 6.0;
      p.invulnTimer = Math.max(p.invulnTimer, 2.5);
      p.hp = Math.min(p.maxHp, p.hp + 100);
      STATE.shockwaves.push({ x: p.x, y: p.y, radius: 24, maxRadius: 480, color: '#fbbf24', alpha: 1.0 });
      STATE.enemies.forEach(e => {
        e.stunTimer = Math.max(e.stunTimer, 5.0);
        e.chillTimer = 6.0;
        damageEnemy(e, 220 * p.damageMult, true);
      });
      for (let i = 0; i < 48; i++) {
        const ang = (Math.PI * 2 * i) / 48;
        STATE.projectiles.push({
          x: p.x, y: p.y, vx: Math.cos(ang) * 1020, vy: Math.sin(ang) * 1020,
          radius: 10.5, dmg: 195 * p.damageMult, pierce: 10, life: 1.8,
          color: '#fbbf24', isGold: true, crit: true, bounce: true, homing: true, chill: true, explode: 130
        });
      }
      return;
    }

    const count = 24;
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count;
      STATE.projectiles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(ang) * 800,
        vy: Math.sin(ang) * 800,
        radius: 10,
        dmg: 95 * p.damageMult,
        pierce: 4,
        life: 1.2,
        color: '#fbbf24',
        isGold: true,
        crit: true,
        explode: 72
      });
    }
  }

  function damageEnemy(enemy: EnemyEntity, amount: number, isCrit = false): void {
    enemy.hp -= amount;
    enemy.hitFlash = 0.08;
    if (isCrit) {
      spawnFloatingText(enemy.x, enemy.y - enemy.radius - 6, `${Math.round(amount)}!`, '#fbbf24', 15);
    }
    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      STATE.stats.kills += 1;
      const p = STATE.player;
      if (p) {
        p.ultCharge = Math.min(100, p.ultCharge + (enemy.isBoss ? 50 : 3.8));
        if (p.lifeSteal > 0) {
          p.hp = Math.min(p.maxHp, p.hp + p.lifeSteal);
        }
        STATE.gems.push({
          x: enemy.x,
          y: enemy.y,
          xp: Math.round(enemy.xp * p.xpMult),
          gold: Math.round(enemy.gold * p.xpMult),
          isBoss: enemy.isBoss || enemy.alienLevel >= 7,
          magnetized: false
        });
      }

      const burstCount = enemy.isBoss ? 36 : 6 + enemy.alienLevel;
      for (let i = 0; i < burstCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 65 + Math.random() * 210;
        STATE.particles.push({
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.6,
          size: 3 + Math.random() * 4.5,
          color: i % 2 === 0 ? enemy.color1 : enemy.glow
        });
      }
      sfx.play('kill');
    }
  }

  function spawnFloatingText(x: number, y: number, text: string, color = '#ffffff', size = 14): void {
    STATE.floatingTexts.push({ x, y, text, color, size, life: 0.85, maxLife: 0.85 });
  }

  // =========================================================================
  // 14. OST PLAYBOOK BREACH MODAL (NO-CLIPPING + DYNAMIC VISUAL/X-METHOD)
  // =========================================================================
  let activeProblem: OstProblem | null = null;
  let breachIsEndOfWave = false;
  let breachResolved = false;
  let lastAnswerCorrect = false;
  let lastBonusGold = 0;

  function fitMathChoiceLabels(): void {
    const eqEl = byId('mathEquation');
    if (eqEl) {
      eqEl.style.fontSize = '';
      const promptAtoms = eqEl.querySelectorAll<HTMLElement>('.math-atom');
      promptAtoms.forEach(a => {
        a.style.whiteSpace = a.scrollWidth > eqEl.clientWidth - 8 ? 'normal' : 'nowrap';
      });
    }

    const buttons = document.querySelectorAll<HTMLButtonElement>('.math-opt-btn');
    buttons.forEach(btn => {
      const label = btn.querySelector<HTMLElement>('.math-choice-text');
      const badge = btn.firstElementChild as HTMLElement | null;
      if (!label || !badge) return;

      // Natural wrapping allowed so words & equations NEVER clip
      label.style.whiteSpace = 'normal';
      label.style.fontSize = '15px';

      const styles = getComputedStyle(btn);
      const padLeft = parseFloat(styles.paddingLeft) || 12;
      const padRight = parseFloat(styles.paddingRight) || 12;
      const gap = parseFloat(styles.columnGap || styles.gap) || 10;
      const maxWidth = Math.max(120, btn.clientWidth - padLeft - padRight - badge.offsetWidth - gap - 4);

      const atoms = label.querySelectorAll<HTMLElement>('.math-atom');
      atoms.forEach(a => {
        a.style.whiteSpace = 'nowrap';
      });

      // Gently scale font down slightly if an unbroken math atom exceeds option width
      let fontSize = 15;
      while (label.scrollWidth > maxWidth && fontSize > 12) {
        fontSize -= 0.5;
        label.style.fontSize = `${fontSize}px`;
      }

      // If any single math atom is still wider than maxWidth, allow clean wrapping at spaces inside that atom
      atoms.forEach(a => {
        if (a.scrollWidth > maxWidth) {
          a.style.whiteSpace = 'normal';
        }
      });
    });
  }

  function revealXMethodDiamond(prob: OstProblem, illuminateAll = false): void {
    if (!prob.xMethodData) return;
    const xm = prob.xMethodData;
    byId('xLeftTop').textContent = `${xm.m1}`;
    byId('xRightTop').textContent = `${xm.m2}`;
    if (illuminateAll) {
      ['xQuadTop', 'xQuadBot', 'xQuadLeft', 'xQuadRight'].forEach(id => {
        byId(id).setAttribute('opacity', '0.20');
      });
    }
    const noteEl = byId('xSimplifiedNote');
    if (xm.a > 1) {
      noteEl.innerHTML =
        `<span>Simplified:</span> ${frac(xm.m1, xm.a)} <span>=</span> ${frac(xm.simp1Num, xm.simp1Den)} <span>&amp;</span> ${frac(xm.m2, xm.a)} <span>=</span> ${frac(xm.simp2Num, xm.simp2Den)}`;
    } else {
      noteEl.innerHTML =
        `<span>Verified: (${xm.m1})(${xm.m2}) = ${xm.ac} and ${xm.m1} + ${xm.m2} = ${xm.b}</span>`;
    }
  }

  function openQuadraticBreach(tagText: string, isEndOfWave = false): void {
    STATE.mode = 'MATH';
    breachIsEndOfWave = isEndOfWave;
    breachResolved = false;
    lastAnswerCorrect = false;
    lastBonusGold = 0;

    const drawn = drawOstProblem(selectedTopicId);
    const prob = drawn.problem;
    activeProblem = prob;

    byId('mathBreachTag').textContent = tagText;
    byId('mathModeLabel').textContent = `${drawn.topicMeta.shortTitle.toUpperCase()} • Q ${drawn.questionNumber}/${drawn.totalInDeck}`;
    byId('mathTaskType').textContent = prob.taskType;
    byId('mathEquation').innerHTML = prob.promptHtml;
    byId('mathHintSub').innerHTML = prob.xMethodData
      ? 'Find <span class="math-atom">m₁</span> and <span class="math-atom">m₂</span> that multiply to A·C and add to B, then divide by a.'
      : `OST Playbook Sheet: <span class="text-amber-300 font-bold">${drawn.topicMeta.sheetHeader}</span>`;

    // Configure Right-Hand Panel: Visual Diagram vs X-Method Diamond vs Strategy Card
    const visualPanel = byId('mathVisualPanel');
    const xPanel = byId('xMethodPanel');
    const tipPanel = byId('mathStrategyPanel');

    visualPanel.classList.add('hidden');
    xPanel.classList.add('hidden');
    tipPanel.classList.add('hidden');

    if (prob.visualHtml) {
      byId('mathVisualTitle').textContent = prob.visualTitle || 'DATA / GRAPH';
      byId('mathVisualContent').innerHTML = prob.visualHtml;
      visualPanel.classList.remove('hidden');
    } else if (prob.xMethodData) {
      const xm = prob.xMethodData;
      byId('xTopVal').textContent = `${xm.ac}`;
      byId('xBotVal').textContent = `${xm.b}`;
      byId('xLeftTop').textContent = '?';
      byId('xLeftBot').textContent = `${xm.a}`;
      byId('xRightTop').textContent = '?';
      byId('xRightBot').textContent = `${xm.a}`;
      byId('xSimplifiedNote').innerHTML = '';
      ['xQuadTop', 'xQuadBot', 'xQuadLeft', 'xQuadRight'].forEach(id => {
        byId(id).setAttribute('opacity', '0.05');
      });
      xPanel.classList.remove('hidden');
    } else {
      const tip = TOPIC_STRATEGY_TIPS[prob.topicId] || TOPIC_STRATEGY_TIPS.lazy_way;
      byId('mathStrategyTitle').textContent = tip.title;
      byId('mathStrategyBullets').innerHTML = tip.bullets
        .map(b => `<div class="leading-relaxed bg-emerald-950/35 border border-emerald-500/20 rounded-xl px-3 py-2">${b}</div>`)
        .join('');
      tipPanel.classList.remove('hidden');
    }

    byId('mathFeedbackBox').classList.add('hidden');

    // Determine whether to lay choices in 1 col (for longer text / multi-part expressions) or 2 cols
    const maxPlainLen = Math.max(
      ...prob.choices.map(c => c.html.replace(/<[^>]+>/g, '').trim().length)
    );
    const useSingleCol = !!prob.isLongChoice || maxPlainLen > 20;

    const choicesGrid = byId('mathChoices');
    choicesGrid.className = useSingleCol
      ? 'grid grid-cols-1 gap-2.5'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-2.5';
    choicesGrid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    prob.choices.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.isCorrect = opt.isCorrect ? '1' : '0';
      btn.className =
        'math-opt-btn w-full min-w-0 px-3.5 py-3 rounded-2xl bg-[#06100d] hover:bg-emerald-950/80 border-2 border-emerald-500/35 hover:border-amber-400 text-left transition flex items-center gap-3 cursor-pointer';
      btn.innerHTML = `
        <span class="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-mono-code font-extrabold text-xs text-amber-300 shrink-0">${letters[idx]}</span>
        <span class="math-choice-text flex-1 min-w-0 font-mono-code font-bold text-white leading-[1.85]">${opt.html}</span>
      `;
      btn.addEventListener('click', () => handleMathChoice(opt, btn));
      choicesGrid.appendChild(btn);
    });

    byId('mathModal').classList.remove('hidden');
    requestAnimationFrame(() => {
      fitMathChoiceLabels();
    });
  }

  function handleMathChoice(option: OstChoice, btnEl: HTMLButtonElement): void {
    if (breachResolved || !activeProblem || !STATE.player) return;
    breachResolved = true;
    STATE.stats.mathAttempted += 1;

    document.querySelectorAll<HTMLButtonElement>('.math-opt-btn').forEach(b => {
      b.disabled = true;
      b.classList.add('opacity-75');
    });

    const feedbackBox = byId('mathFeedbackBox');
    const feedbackIcon = byId('mathFeedbackIcon');
    const feedbackTitle = byId('mathFeedbackTitle');
    const diagnosisText = byId('mathDiagnosisText');
    const stepsContainer = byId('mathStepsText');
    const continueBtn = byId('btnContinueBreach');

    const stepHtml = activeProblem.steps
      .map(s => `<div class="leading-[1.85]">${s}</div>`)
      .join('');

    if (option.isCorrect) {
      lastAnswerCorrect = true;
      const prevCloudCorrect = getLifetimeTotals().totalCorrect;
      STATE.stats.mathCorrect += 1;
      sfx.play('correct');
      revealXMethodDiamond(activeProblem, false);
      btnEl.classList.remove('border-emerald-500/35', 'opacity-75');
      btnEl.classList.add('bg-emerald-500/30', 'border-emerald-300');

      const p = STATE.player;
      lastBonusGold = 25 + STATE.wave * 5;
      p.gold += lastBonusGold;
      p.hp = Math.min(p.maxHp, p.hp + 25);
      p.ultCharge = Math.min(100, p.ultCharge + 35);
      updateHUD();

      let unlockCalloutHtml = '';
      if (latestCloudSnap.user) {
        STATE.stats.syncedAttempted += 1;
        STATE.stats.syncedCorrect += 1;
        const projectedTotal = prevCloudCorrect + 1;
        const newlyUnlocked = OPERATIVES.filter(
          h => h.unlockThreshold && prevCloudCorrect < h.unlockThreshold && projectedTotal >= h.unlockThreshold
        );
        if (newlyUnlocked.length > 0) {
          newlyUnlocked.forEach(h => {
            if (!STATE.stats.unlockedThisRun.includes(h.name)) {
              STATE.stats.unlockedThisRun.push(h.name);
            }
          });
          unlockCalloutHtml = `<div class="mt-2 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-200 font-bold text-xs">★ NEW ASCENDED OPERATIVE UNLOCKED: ${newlyUnlocked.map(h => h.name).join(', ')}!</div>`;
        }
        void firebaseSave.recordQuestionDelta(1, 1, p.hero.id, selectedTopicId);
      }

      feedbackBox.className = 'mt-4 bg-emerald-950/75 border-2 border-emerald-400/80 rounded-2xl p-4';
      feedbackIcon.textContent = '✅';
      feedbackTitle.className = 'font-display font-extrabold text-emerald-300 text-sm sm:text-base tracking-wide';
      feedbackTitle.textContent = 'CORRECT! — OST SOLUTION VERIFIED';
      diagnosisText.className = 'text-xs sm:text-sm text-emerald-100 mt-1 leading-[1.7]';
      diagnosisText.innerHTML = `Great job! You earned <span class="text-amber-300 font-bold">+${lastBonusGold} ⬡ Scrap</span>, <span class="text-emerald-300 font-bold">+25 HP</span>, <span class="text-cyan-300 font-bold">+35% Ultimate</span>, and an <span class="text-amber-300 font-bold">X-Stun Shockwave</span> upon continuing.${unlockCalloutHtml}`;
      stepsContainer.innerHTML = stepHtml;
      continueBtn.className =
        'px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-extrabold text-sm shadow-lg transition cursor-pointer';
      continueBtn.textContent = 'Continue Battle (Enter) ▶';
      feedbackBox.classList.remove('hidden');
    } else {
      lastAnswerCorrect = false;
      if (latestCloudSnap.user) {
        STATE.stats.syncedAttempted += 1;
        void firebaseSave.recordQuestionDelta(0, 1, STATE.player.hero.id, selectedTopicId);
      }
      sfx.play('wrong');
      revealXMethodDiamond(activeProblem, true);
      btnEl.classList.remove('border-emerald-500/35', 'opacity-75');
      btnEl.classList.add('bg-rose-500/30', 'border-rose-400');

      document.querySelectorAll<HTMLButtonElement>('.math-opt-btn').forEach(b => {
        if (b.dataset.isCorrect === '1') {
          b.classList.remove('opacity-75');
          b.classList.add('bg-emerald-500/25', 'border-emerald-400');
        }
      });

      const p = STATE.player;
      p.deaths += 1;
      const isFatal = p.deaths >= p.maxDeaths;
      if (isFatal) {
        p.hp = 0;
      } else {
        recalculateMaxHp(p);
      }
      updateHUD();

      const remainingLives = Math.max(0, p.maxDeaths - p.deaths);
      const integrityPct = Math.max(0, 100 - p.deaths * 20);

      feedbackBox.className = 'mt-4 bg-rose-950/75 border-2 border-rose-400/80 rounded-2xl p-4';
      feedbackIcon.textContent = '❌';
      feedbackTitle.className = 'font-display font-extrabold text-rose-300 text-sm sm:text-base tracking-wide';
      feedbackTitle.textContent = isFatal
        ? 'INCORRECT — 5TH STRIKE! SUIT INTEGRITY DEPLETED (0%)'
        : `INCORRECT — SUIT INTEGRITY -20% (${integrityPct}% MAX HP • ${remainingLives} ${remainingLives === 1 ? 'LIFE' : 'LIVES'} LEFT)`;
      diagnosisText.className = 'text-xs sm:text-sm text-rose-100 mt-1 leading-[1.85]';
      diagnosisText.innerHTML = option.reason;
      stepsContainer.innerHTML = stepHtml;
      continueBtn.className =
        'px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm shadow-lg transition cursor-pointer';
      continueBtn.textContent = isFatal ? 'View Results (Enter) ▶' : 'Continue Battle (Enter) ▶';
      feedbackBox.classList.remove('hidden');
    }
  }

  function resumeAfterBreach(): void {
    if (byId('mathFeedbackBox').classList.contains('hidden')) return;
    byId('mathModal').classList.add('hidden');

    const p = STATE.player;
    if (!p) return;

    if (!lastAnswerCorrect && p.deaths >= p.maxDeaths) {
      endGame(false);
      return;
    }

    if (lastAnswerCorrect) {
      STATE.shockwaves.push({ x: p.x, y: p.y, radius: 15, maxRadius: 260, color: '#10b981', alpha: 1.0 });
      STATE.enemies.forEach(e => {
        e.stunTimer = Math.max(e.stunTimer, 2.5);
      });
      spawnFloatingText(p.x, p.y - 38, `BREACH CLEARED! +${lastBonusGold} ⬡ & STUN!`, '#34d399', 16);
    } else {
      STATE.cameraShake = 12;
      spawnFloatingText(p.x, p.y - 38, `WRONG ANSWER: -20% MAX HP (${p.maxDeaths - p.deaths} LIVES LEFT)`, '#fb7185', 16);
    }

    if (breachIsEndOfWave) {
      completeWaveAndOpenShop();
    } else {
      STATE.mode = 'PLAYING';
    }
  }

  byId('btnContinueBreach').addEventListener('click', resumeAfterBreach);

  // =========================================================================
  // 15. LEVEL-UP DRAFT & BETWEEN-WAVE ARMORY SHOP
  // =========================================================================
  function openUpgradeModal(isShop = false): void {
    if (!STATE.player) return;
    STATE.mode = isShop ? 'SHOP' : 'UPGRADE';
    const modal = byId('upgradeModal');
    byId('upgradeTag').textContent = isShop
      ? `WAVE ${STATE.wave} CLEARED — ARMORY`
      : `LEVEL ${STATE.player.level} REACHED!`;
    byId('upgradeTitle').textContent = isShop
      ? 'ARMORY & GOLD WEAPON EVOLUTION'
      : 'CHOOSE FREE TACTICAL UPGRADE';
    byId('shopGoldDisplay').textContent = `${STATE.player.gold}`;
    byId('rerollCostText').textContent = `${STATE.rerollCost}`;

    const footer = byId('shopFooter');
    if (isShop) footer.classList.remove('hidden');
    else footer.classList.add('hidden');

    populateUpgradeCards(isShop);
    modal.classList.remove('hidden');
  }

  function populateUpgradeCards(isShop: boolean): void {
    const grid = byId('upgradeCardsGrid');
    grid.innerHTML = '';
    if (!STATE.player) return;

    type Offer =
      | { kind: 'stat'; data: StatUpgrade; cost: number }
      | { kind: 'weapon'; data: WeaponSpec; cost: number };

    const ownedIds = [...new Set(STATE.weapons.filter(w => w.tier < 4).map(w => w.id))];
    const shopPool = [...new Set([...STANDARD_WEAPON_KEYS, ...STATE.weapons.map(w => w.id)])];
    const shuffledStats = [...STAT_UPGRADES].sort(() => Math.random() - 0.5);
    const shuffledWeapons = [...shopPool].sort(() => Math.random() - 0.5);

    const weaponOffer1 =
      ownedIds.length > 0 && Math.random() < 0.72
        ? ownedIds[Math.floor(Math.random() * ownedIds.length)]
        : shuffledWeapons[0];
    const weaponOffer2 = shuffledWeapons.find(id => id !== weaponOffer1) || shuffledWeapons[1];

    const offers: Offer[] = [];
    offers.push({ kind: 'stat', data: shuffledStats[0], cost: isShop ? 22 + STATE.wave * 3 : 0 });
    offers.push({ kind: 'weapon', data: WEAPON_CATALOG[weaponOffer1], cost: isShop ? 26 + STATE.wave * 4 : 0 });
    offers.push({ kind: 'weapon', data: WEAPON_CATALOG[weaponOffer2], cost: isShop ? 26 + STATE.wave * 4 : 0 });
    offers.push({ kind: 'stat', data: shuffledStats[1], cost: isShop ? 24 + STATE.wave * 3 : 0 });

    offers.forEach(offer => {
      const canAfford = !isShop || (STATE.player?.gold ?? 0) >= offer.cost;
      const card = document.createElement('div');
      card.className = `rounded-2xl border-2 p-4 flex flex-col justify-between transition ${
        canAfford
          ? 'bg-[#06100d] border-emerald-500/40 hover:border-amber-400 hover:-translate-y-1 cursor-pointer shadow-lg'
          : 'bg-[#06100d]/50 border-slate-700/50 opacity-60'
      }`;

      if (offer.kind === 'stat') {
        const s = offer.data;
        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl">${s.icon}</span>
              <span class="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">TACTICAL</span>
            </div>
            <h3 class="font-display font-bold text-base text-white">${s.name}</h3>
            <p class="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">${s.desc}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
            <span class="font-mono-code font-extrabold text-xs ${isShop ? 'text-amber-300' : 'text-emerald-300'}">
              ${isShop ? `⬡ ${offer.cost} SCRAP` : 'FREE DRAFT'}
            </span>
            <span class="text-xs font-display font-bold text-amber-300">SELECT ▶</span>
          </div>
        `;
      } else {
        const w = offer.data;
        const existing = STATE.weapons.filter(ow => ow.id === w.id);
        let badge = 'T1 EMERALD';
        let badgeStyle = 'bg-emerald-500/20 text-emerald-300';
        if (existing.some(ow => ow.tier === 3)) {
          badge = '★ FORGE T4 GOLD!';
          badgeStyle = 'bg-amber-500/30 text-amber-300 border border-amber-400';
        } else if (existing.some(ow => ow.tier === 2)) {
          badge = 'MERGE → T3 AMETHYST';
          badgeStyle = 'bg-purple-500/25 text-purple-300';
        } else if (existing.some(ow => ow.tier === 1)) {
          badge = 'MERGE → T2 COBALT';
          badgeStyle = 'bg-sky-500/25 text-sky-300';
        }

        card.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-2 gap-1">
              <span class="text-2xl">${w.icon}</span>
              <span class="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded ${badgeStyle}">${badge}</span>
            </div>
            <h3 class="font-display font-bold text-base text-white">${w.name}</h3>
            <p class="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">${w.desc}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
            <span class="font-mono-code font-extrabold text-xs ${isShop ? 'text-amber-300' : 'text-emerald-300'}">
              ${isShop ? `⬡ ${offer.cost} SCRAP` : 'FREE DRAFT'}
            </span>
            <span class="text-xs font-display font-bold text-amber-300">EQUIP ▶</span>
          </div>
        `;
      }

      if (canAfford) {
        card.addEventListener('click', () => {
          const p = STATE.player;
          if (!p) return;
          if (isShop) {
            if (p.gold < offer.cost) return;
            p.gold -= offer.cost;
            byId('shopGoldDisplay').textContent = `${p.gold}`;
          }
          if (offer.kind === 'stat') {
            offer.data.apply(p);
            recalculateMaxHp(p);
          } else {
            addOrMergeWeapon(offer.data.id);
          }
          sfx.play('levelup');
          updateHUD();

          if (!isShop) {
            byId('upgradeModal').classList.add('hidden');
            STATE.mode = 'PLAYING';
          } else {
            card.classList.add('opacity-40', 'pointer-events-none');
            card.innerHTML = `<div class="h-full flex items-center justify-center font-display font-bold text-emerald-300">✓ ACQUIRED</div>`;
          }
        });
      }

      grid.appendChild(card);
    });
  }

  byId('btnRerollShop').addEventListener('click', () => {
    if (!STATE.player || STATE.player.gold < STATE.rerollCost) return;
    STATE.player.gold -= STATE.rerollCost;
    STATE.rerollCost += 8;
    byId('shopGoldDisplay').textContent = `${STATE.player.gold}`;
    byId('rerollCostText').textContent = `${STATE.rerollCost}`;
    sfx.play('xp');
    populateUpgradeCards(STATE.mode === 'SHOP');
  });

  function completeWaveAndOpenShop(): void {
    if (STATE.wave >= STATE.maxWaves) {
      endGame(true);
      return;
    }
    STATE.rerollCost = 15;
    openUpgradeModal(true);
  }

  byId('btnNextWave').addEventListener('click', () => {
    byId('upgradeModal').classList.add('hidden');
    STATE.mode = 'PLAYING';
    startWave(STATE.wave + 1);
  });

  // =========================================================================
  // 16. HUD UPDATES & END-OF-RUN SUMMARY
  // =========================================================================
  function updateHUDWeapons(): void {
    const container = byId('hudWeapons');
    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const w = STATE.weapons[i];
      const slot = document.createElement('div');
      if (w) {
        const meta = WEAPON_CATALOG[w.id];
        const tStyle = TIER_STYLES[w.tier] || TIER_STYLES[1];
        slot.className = `w-10 h-10 rounded-xl border-2 ${tStyle.borderClass} flex flex-col items-center justify-center relative`;
        slot.title = `${meta.name} — ${tStyle.label}`;
        slot.innerHTML = `
          <span class="text-sm leading-none">${meta.icon}</span>
          <span class="text-[9px] font-mono-code font-extrabold leading-none mt-0.5">${w.tier === 4 ? '★T4' : 'T' + w.tier}</span>
        `;
      } else {
        slot.className =
          'w-10 h-10 rounded-xl border border-emerald-500/15 bg-[#06100d]/60 flex items-center justify-center text-emerald-700 text-xs';
        slot.textContent = '+';
      }
      container.appendChild(slot);
    }
  }

  function updateHUD(): void {
    const p = STATE.player;
    if (!p) return;
    byId('hudHeroName').textContent = p.hero.name;
    byId('hudLevelBadge').textContent = `LVL ${p.level}`;
    byId('hudHpBar').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    byId('hudHpText').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    byId('hudXpBar').style.width = `${Math.min(100, (p.xp / p.xpToNext) * 100)}%`;

    const livesEl = byId('hudLivesPips');
    livesEl.innerHTML = '';
    const livesRemaining = Math.max(0, p.maxDeaths - p.deaths);
    for (let i = 0; i < p.maxDeaths; i++) {
      const heart = document.createElement('span');
      heart.className = `w-2 h-2.5 rounded-sm ${i < livesRemaining ? 'bg-emerald-400' : 'bg-rose-950 border border-rose-700/60'}`;
      livesEl.appendChild(heart);
    }

    byId('hudWave').innerHTML = `${STATE.wave} <span class="text-xs text-emerald-400">/ ${STATE.maxWaves}</span>`;
    byId('hudIntensityTag').textContent = `• ${getIntensityCfg().short}`;
    const mins = Math.floor(Math.max(0, STATE.waveTimer) / 60);
    const secs = Math.floor(Math.max(0, STATE.waveTimer) % 60);
    byId('hudTimer').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const nextB = STATE.breachTriggers.find(t => t < STATE.waveTimer && !STATE.triggeredBreaches.has(t));
    if (nextB !== undefined) {
      const bm = Math.floor(nextB / 60);
      const bs = nextB % 60;
      byId('hudNextBreach').textContent = `${String(bm).padStart(2, '0')}:${String(bs).padStart(2, '0')}`;
    } else {
      byId('hudNextBreach').textContent = '00:00';
    }

    const acc =
      STATE.stats.mathAttempted === 0
        ? 100
        : Math.round((STATE.stats.mathCorrect / STATE.stats.mathAttempted) * 100);
    byId('hudAccuracy').textContent = `${acc}%`;
    byId('hudGold').textContent = `${p.gold}`;

    const pips = byId('hudDashPips');
    pips.innerHTML = '';
    for (let i = 0; i < p.maxDashes; i++) {
      const pip = document.createElement('span');
      pip.className = `w-3.5 h-2 rounded-sm transition ${
        i < p.dashCharges ? 'bg-cyan-400 shadow-sm shadow-cyan-300' : 'bg-slate-800 border border-cyan-900'
      }`;
      pips.appendChild(pip);
    }

    byId('ultCooldownOverlay').style.height = `${p.ultCharge}%`;
    byId('ultStatusText').textContent = p.ultCharge >= 100 ? 'READY [E]' : `${Math.floor(p.ultCharge)}%`;

    const chips = byId('hudStatChips');
    chips.innerHTML = `
      <span>DMG ${Math.round(p.damageMult * 100)}%</span>
      <span class="text-emerald-600">|</span>
      <span>SPD ${Math.round(p.speedMult * 100)}%</span>
      <span class="text-emerald-600">|</span>
      <span>RATE ${Math.round(p.fireRateMult * 100)}%</span>
      <span class="text-emerald-600">|</span>
      <span>INTEGRITY ${Math.max(0, 100 - p.deaths * 20)}%</span>
    `;

    if (STATE.wave === 10) {
      const tokar = STATE.enemies.find(e => e.bossLabel === 'TOKAR');
      const baker = STATE.enemies.find(e => e.bossLabel === 'BAKER');
      const tPct = tokar ? Math.max(0, (tokar.hp / tokar.maxHp) * 100) : 0;
      const bPct = baker ? Math.max(0, (baker.hp / baker.maxHp) * 100) : 0;
      byId('bossTokarHpBar').style.width = `${tPct}%`;
      byId('bossTokarHpText').textContent = `${Math.ceil(tPct)}%`;
      byId('bossBakerHpBar').style.width = `${bPct}%`;
      byId('bossBakerHpText').textContent = `${Math.ceil(bPct)}%`;
    }
  }

  function syncRunToCloud(victory: boolean): void {
    if (STATE.stats.runRecorded || !STATE.player) return;
    STATE.stats.runRecorded = true;

    const unsyncedCorrectDelta = Math.max(0, STATE.stats.mathCorrect - STATE.stats.syncedCorrect);
    const unsyncedAttemptedDelta = Math.max(0, STATE.stats.mathAttempted - STATE.stats.syncedAttempted);
    const topicMeta = getTopicMeta(selectedTopicId);

    const payload = {
      heroId: STATE.player.hero.id,
      heroName: STATE.player.hero.name,
      topicId: selectedTopicId,
      topicTitle: topicMeta.shortTitle,
      intensity: (selectedIntensity as 'easy' | 'medium' | 'hard' | 'extreme') || 'medium',
      wave: STATE.wave,
      victory,
      kills: STATE.stats.kills,
      gameCorrect: STATE.stats.mathCorrect,
      gameAttempted: STATE.stats.mathAttempted,
      unsyncedCorrectDelta,
      unsyncedAttemptedDelta
    };

    if (latestCloudSnap.user) {
      STATE.stats.syncedCorrect = STATE.stats.mathCorrect;
      STATE.stats.syncedAttempted = STATE.stats.mathAttempted;
      void firebaseSave.recordGameRun(payload);
    } else {
      pendingGuestRun = payload;
    }
  }

  function endGame(victory: boolean): void {
    STATE.mode = 'END';
    syncRunToCloud(victory);

    byId('endIcon').textContent = victory ? '🏆' : '💀';
    byId('endTitle').textContent = victory ? 'ARENA CONQUERED!' : 'SUIT INTEGRITY DEPLETED';
    byId('endSubtitle').textContent = victory
      ? 'Legendary! You defeated all 10 Alien Species and Mega-Aliens TOKAR & BAKER!'
      : 'Your suit integrity hit 0% after 5 failures/deaths. Re-deploy and sharpen your OST Playbook skills!';
    byId('endWave').textContent = `${STATE.wave} / ${STATE.maxWaves}`;
    byId('endKills').textContent = `${STATE.stats.kills}`;

    const gameRate =
      STATE.stats.mathAttempted > 0
        ? Math.round((STATE.stats.mathCorrect / STATE.stats.mathAttempted) * 100)
        : 100;
    byId('endGameRate').textContent = `${gameRate}%`;
    byId('endMathScore').textContent = `${STATE.stats.mathCorrect} / ${STATE.stats.mathAttempted}`;
    byId('endHero').textContent = STATE.player?.hero.name || '';

    const unlockBanner = byId('endUnlockBanner');
    if (STATE.stats.unlockedThisRun.length > 0) {
      byId('endUnlockText').textContent = `Unlocked: ${STATE.stats.unlockedThisRun.join(', ')}!`;
      unlockBanner.classList.remove('hidden');
    } else {
      unlockBanner.classList.add('hidden');
    }

    if (latestCloudSnap.user) {
      const { totalCorrect, totalAttempted, rate } = getLifetimeTotals();
      byId('endLifetimeRate').textContent = totalAttempted > 0 ? `${rate}%` : `${gameRate}%`;
      byId('endLifetimeTotals').textContent = `${totalCorrect} / ${totalAttempted} lifetime correct (Cloud Synced ✓)`;
      byId('endAuthActionRow').classList.add('hidden');
    } else {
      byId('endLifetimeRate').textContent = 'NOT SIGNED IN';
      byId('endLifetimeTotals').textContent = 'Sign in with Google below to save this run & track lifetime rate';
      byId('endAuthActionRow').classList.remove('hidden');
    }

    byId('endModal').classList.remove('hidden');
  }

  // =========================================================================
  // 17. MAIN SIMULATION STEP
  // =========================================================================
  function update(dt: number): void {
    if (STATE.mode !== 'PLAYING' || !STATE.player) return;

    STATE.time += dt;
    STATE.waveTimer -= dt;
    if (STATE.cameraShake > 0) STATE.cameraShake = Math.max(0, STATE.cameraShake - dt * 28);

    const p = STATE.player;

    for (const mark of STATE.breachTriggers) {
      if (STATE.waveTimer <= mark && !STATE.triggeredBreaches.has(mark)) {
        STATE.triggeredBreaches.add(mark);
        const mins = Math.floor(mark / 60);
        const secs = mark % 60;
        openQuadraticBreach(`TIMED BREACH (${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`, false);
        return;
      }
    }

    if (STATE.waveTimer <= 0) {
      STATE.waveTimer = 0;
      updateHUD();
      openQuadraticBreach(`WAVE ${STATE.wave} EXTRACTION BREACH`, true);
      return;
    }

    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    if (p.overclockTimer > 0) p.overclockTimer -= dt;
    if (p.recoil > 0) p.recoil = Math.max(0, p.recoil - dt * 26);
    p.orbitAngle += dt * 3.5;

    if (p.auraDmg > 0 && p.auraInterval > 0) {
      p.auraTimer -= dt;
      if (p.auraTimer <= 0) {
        p.auraTimer = p.auraInterval;
        const rad = p.auraRadius * p.areaMult;
        STATE.shockwaves.push({ x: p.x, y: p.y, radius: 18, maxRadius: rad, color: p.hero.visor, alpha: 0.55 });
        for (const e of STATE.enemies) {
          if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) <= rad + e.radius) {
            damageEnemy(e, p.auraDmg * p.damageMult, false);
          }
        }
      }
    }

    if (p.regen > 0 && p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);
    }

    if (p.dashCharges < p.maxDashes) {
      p.dashRechargeTimer += dt;
      if (p.dashRechargeTimer >= p.dashCooldownBase) {
        p.dashRechargeTimer = 0;
        p.dashCharges += 1;
      }
    }

    let moveX = 0;
    let moveY = 0;
    p.isMoving = false;
    if (p.dashActiveTimer > 0) {
      p.dashActiveTimer -= dt;
      p.isMoving = true;
      const dashSpd = 800;
      p.x += p.dashDirX * dashSpd * dt;
      p.y += p.dashDirY * dashSpd * dt;
      STATE.particles.push({
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        life: 0.18,
        maxLife: 0.18,
        size: 13,
        color: '#38bdf8'
      });
    } else {
      if (STATE.keys['KeyW'] || STATE.keys['ArrowUp']) moveY -= 1;
      if (STATE.keys['KeyS'] || STATE.keys['ArrowDown']) moveY += 1;
      if (STATE.keys['KeyA'] || STATE.keys['ArrowLeft']) moveX -= 1;
      if (STATE.keys['KeyD'] || STATE.keys['ArrowRight']) moveX += 1;
      if (STATE.joystick.active) {
        moveX = STATE.joystick.dx;
        moveY = STATE.joystick.dy;
      }
      const len = Math.hypot(moveX, moveY);
      if (len > 0.01) {
        p.isMoving = true;
        const nx = moveX / len;
        const ny = moveY / len;
        const spd = p.baseSpeed * p.speedMult;
        p.x += nx * spd * dt;
        p.y += ny * spd * dt;
        p.walkCycle += dt * 14;
      }
    }

    const margin = 28;
    p.x = Math.max(margin, Math.min(STATE.width - margin, p.x));
    p.y = Math.max(margin + 56, Math.min(STATE.height - margin, p.y));

    let nearestEnemy: EnemyEntity | null = null;
    let nearestDist = Infinity;
    for (const e of STATE.enemies) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearestEnemy = e;
      }
    }

    if (STATE.autoAim && nearestEnemy) {
      p.facingAngle = Math.atan2(nearestEnemy.y - p.y, nearestEnemy.x - p.x);
    } else {
      p.facingAngle = Math.atan2(STATE.mouse.y - p.y, STATE.mouse.x - p.x);
    }

    const effectiveRateMult = p.fireRateMult * (p.overclockTimer > 0 ? 2.5 : 1.0);
    for (const wSlot of STATE.weapons) {
      const meta = WEAPON_CATALOG[wSlot.id];
      const tStyle = TIER_STYLES[wSlot.tier] || TIER_STYLES[1];
      wSlot.cooldown -= dt * effectiveRateMult;
      if (wSlot.cooldown <= 0 && (STATE.enemies.length > 0 || !STATE.autoAim)) {
        wSlot.cooldown = meta.rate * tStyle.rateMult;
        p.recoil = 6.5;
        sfx.play('shoot');

        const totalCount = meta.count + p.bonusProjectiles + tStyle.extraCount;
        const baseAngle = p.facingAngle;

        for (let i = 0; i < totalCount; i++) {
          const offsetIndex = i - (totalCount - 1) / 2;
          const ang = baseAngle + offsetIndex * (meta.spread || 0.09) + (Math.random() - 0.5) * 0.03;
          const isCrit = Math.random() < p.critChance || wSlot.tier === 4;
          const dmg = meta.dmg * tStyle.dmgMult * p.damageMult * (isCrit ? p.critMult : 1.0);
          const spd = meta.speed * p.projSpeedMult * (wSlot.tier === 4 ? 1.25 : 1.0);

          STATE.projectiles.push({
            x: p.x + Math.cos(ang) * 24,
            y: p.y + Math.sin(ang) * 24,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            radius: wSlot.tier === 4 ? 8.5 : 4.5 + wSlot.tier * 0.8,
            dmg,
            pierce: meta.pierce + p.bonusPierce + tStyle.extraPierce,
            life: 1.55,
            color: tStyle.color,
            isGold: wSlot.tier === 4,
            crit: isCrit,
            chill: !!meta.chill,
            homing: !!meta.homing || wSlot.tier === 4,
            bounce: !!meta.bounce,
            explode: Math.max(meta.explode || 0, tStyle.goldExplode) * p.areaMult,
            hitSet: new Set()
          });
        }
      }
    }

    if (p.orbitShields > 0) {
      const orbitR = 58;
      for (let i = 0; i < p.orbitShields; i++) {
        const a = p.orbitAngle + (Math.PI * 2 * i) / p.orbitShields;
        const sx = p.x + Math.cos(a) * orbitR;
        const sy = p.y + Math.sin(a) * orbitR;
        for (const e of STATE.enemies) {
          if (Math.hypot(e.x - sx, e.y - sy) < e.radius + 14) {
            damageEnemy(e, 45 * p.damageMult * dt * 5, false);
          }
        }
      }
    }

    const icfg = getIntensityCfg();
    const targetActiveEnemies = Math.max(10, Math.round(Math.min(68, 18 + STATE.wave * 4) * icfg.countMult));
    const spawnInterval = Math.max(0.1, (0.72 - STATE.wave * 0.045) / icfg.rateMult);
    STATE.spawnAccumulator += dt;
    if (STATE.spawnAccumulator >= spawnInterval && STATE.enemies.length < targetActiveEnemies) {
      STATE.spawnAccumulator = 0;
      spawnAlienByLevel(pickAlienLevelForWave(STATE.wave));
    }

    for (let i = STATE.projectiles.length - 1; i >= 0; i--) {
      const proj = STATE.projectiles[i];
      proj.life -= dt;
      if (proj.life <= 0) {
        STATE.projectiles.splice(i, 1);
        continue;
      }

      if (proj.homing && nearestEnemy) {
        const desired = Math.atan2(nearestEnemy.y - proj.y, nearestEnemy.x - proj.x);
        const cur = Math.atan2(proj.vy, proj.vx);
        const spd = Math.hypot(proj.vx, proj.vy);
        const diff = Math.atan2(Math.sin(desired - cur), Math.cos(desired - cur));
        const next = cur + diff * Math.min(1, dt * (proj.isGold ? 9 : 6.5));
        proj.vx = Math.cos(next) * spd;
        proj.vy = Math.sin(next) * spd;
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;

      if (proj.isGold && Math.random() < 0.65) {
        STATE.particles.push({
          x: proj.x,
          y: proj.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          life: 0.2,
          maxLife: 0.2,
          size: 3.5,
          color: '#fbbf24'
        });
      }

      if (proj.bounce) {
        if (proj.x < 10 || proj.x > STATE.width - 10) proj.vx *= -1;
        if (proj.y < 60 || proj.y > STATE.height - 10) proj.vy *= -1;
      }

      for (const e of STATE.enemies) {
        if (e.dead || (proj.hitSet && proj.hitSet.has(e))) continue;
        if (Math.hypot(e.x - proj.x, e.y - proj.y) <= e.radius + proj.radius) {
          if (proj.hitSet) proj.hitSet.add(e);
          damageEnemy(e, proj.dmg, proj.crit);
          if (proj.chill) e.chillTimer = 2.6;
          sfx.play('hit');

          if (proj.explode > 0) {
            STATE.shockwaves.push({ x: proj.x, y: proj.y, radius: 8, maxRadius: proj.explode, color: proj.color, alpha: 0.85 });
            for (const other of STATE.enemies) {
              if (!other.dead && other !== e && Math.hypot(other.x - proj.x, other.y - proj.y) <= proj.explode + other.radius) {
                damageEnemy(other, proj.dmg * 0.65, false);
              }
            }
          }

          proj.pierce -= 1;
          if (proj.pierce <= 0) {
            proj.life = 0;
            break;
          }
        }
      }
    }

    for (let i = STATE.enemies.length - 1; i >= 0; i--) {
      const e = STATE.enemies[i];
      if (e.dead) {
        STATE.enemies.splice(i, 1);
        continue;
      }
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        continue;
      }
      if (e.chillTimer > 0) e.chillTimer -= dt;

      const angleToPlayer = Math.atan2(p.y - e.y, p.x - e.x);
      const speedMult = e.chillTimer > 0 ? 0.55 : 1.0;
      const moveSpd = e.speed * speedMult;

      e.x += Math.cos(angleToPlayer) * moveSpd * dt;
      e.y += Math.sin(angleToPlayer) * moveSpd * dt;
      e.legPhase += dt * (moveSpd * 0.085);

      if (e.shootCd < 100) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.shootCd;
          const maxSwarmCap = Math.round(65 * getIntensityCfg().countMult);
          if (e.spawnsMites && STATE.enemies.length < maxSwarmCap) {
            spawnAlienByLevel(1, { x: e.x + 25, y: e.y + 20 });
            spawnAlienByLevel(1, { x: e.x - 25, y: e.y - 20 });
          } else {
            const burst = e.isBoss ? 7 : e.alienLevel >= 9 ? 3 : 1;
            const projSpd = (e.isBoss ? 360 : 285) * getIntensityCfg().projSpeedMult;
            for (let b = 0; b < burst; b++) {
              const spread = burst > 1 ? (b - (burst - 1) / 2) * 0.22 : 0;
              const shotAng = angleToPlayer + spread;
              STATE.enemyProjectiles.push({
                x: e.x + Math.cos(shotAng) * e.radius,
                y: e.y + Math.sin(shotAng) * e.radius,
                vx: Math.cos(shotAng) * projSpd,
                vy: Math.sin(shotAng) * projSpd,
                radius: e.isBoss ? 9 : 6,
                dmg: e.dmg,
                color: e.glow,
                life: 3.4
              });
            }
          }
        }
      }

      if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius - 3) {
        handlePlayerDamage(e.dmg);
        if ((STATE.mode as string) === 'END') return;
      }
    }

    if (STATE.wave === 10) {
      const bossesAlive = STATE.enemies.some(e => e.isBoss);
      if (!bossesAlive) {
        endGame(true);
        return;
      }
    }

    for (let i = STATE.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = STATE.enemyProjectiles[i];
      ep.life -= dt;
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;
      if (ep.life <= 0) {
        STATE.enemyProjectiles.splice(i, 1);
        continue;
      }
      if (Math.hypot(ep.x - p.x, ep.y - p.y) < ep.radius + p.radius - 3) {
        handlePlayerDamage(ep.dmg);
        STATE.enemyProjectiles.splice(i, 1);
        if ((STATE.mode as string) === 'END') return;
      }
    }

    for (let i = STATE.gems.length - 1; i >= 0; i--) {
      const g = STATE.gems[i];
      const dist = Math.hypot(p.x - g.x, p.y - g.y);
      if (dist < p.magnetRadius || g.magnetized) {
        const ang = Math.atan2(p.y - g.y, p.x - g.x);
        g.x += Math.cos(ang) * 580 * dt;
        g.y += Math.sin(ang) * 580 * dt;
      }
      if (dist < p.radius + 14) {
        p.xp += g.xp;
        p.gold += g.gold;
        sfx.play('xp');
        STATE.gems.splice(i, 1);

        if (p.xp >= p.xpToNext) {
          p.xp -= p.xpToNext;
          p.level += 1;
          p.xpToNext = Math.round(p.xpToNext * 1.24 + 18);
          sfx.play('levelup');
          updateHUD();
          openUpgradeModal(false);
          return;
        }
      }
    }

    for (let i = STATE.crates.length - 1; i >= 0; i--) {
      const c = STATE.crates[i];
      c.pulse += dt * 4;
      if (Math.hypot(p.x - c.x, p.y - c.y) < p.radius + 22) {
        STATE.crates.splice(i, 1);
        openQuadraticBreach('OST SUPPLY CACHE BREACH', false);
        return;
      }
    }

    for (let i = STATE.particles.length - 1; i >= 0; i--) {
      const pt = STATE.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) STATE.particles.splice(i, 1);
    }
    for (let i = STATE.shockwaves.length - 1; i >= 0; i--) {
      const sw = STATE.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 11);
      sw.alpha -= dt * 2.4;
      if (sw.alpha <= 0) STATE.shockwaves.splice(i, 1);
    }
    for (let i = STATE.floatingTexts.length - 1; i >= 0; i--) {
      const ft = STATE.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 34 * dt;
      if (ft.life <= 0) STATE.floatingTexts.splice(i, 1);
    }

    updateHUD();
  }

  // =========================================================================
  // 18. 2.5D ILLUSTRATED RENDERER
  // =========================================================================
  function drawArenaFloor(): void {
    ctx.fillStyle = '#06100d';
    ctx.fillRect(0, 0, STATE.width, STATE.height);

    const cx = STATE.width / 2;
    const cy = STATE.height / 2;
    const maxR = Math.max(STATE.width, STATE.height) * 0.68;
    const bgGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, maxR);
    bgGrad.addColorStop(0, '#0f2a22');
    bgGrad.addColorStop(0.55, '#091813');
    bgGrad.addColorStop(1, '#040a08');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, STATE.width, STATE.height);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.065)';
    ctx.lineWidth = 1;
    const step = 64;
    ctx.beginPath();
    for (let x = 0; x <= STATE.width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, STATE.height);
    }
    for (let y = 0; y <= STATE.height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(STATE.width, y);
    }
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy + 16);
    const xSize = Math.min(STATE.width, STATE.height) * 0.22;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-xSize, -xSize);
    ctx.lineTo(xSize, xSize);
    ctx.moveTo(xSize, -xSize);
    ctx.lineTo(-xSize, xSize);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.09)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, xSize * 1.25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.20)';
    ctx.fillText('A · C', 0, -xSize * 0.58);

    ctx.fillStyle = 'rgba(52, 211, 153, 0.20)';
    ctx.fillText('B', 0, xSize * 0.72);

    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.fillText('_____', -xSize * 0.78, -6);
    ctx.fillText('a', -xSize * 0.78, 16);
    ctx.fillText('_____', xSize * 0.78, -6);
    ctx.fillText('a', xSize * 0.78, 16);
    ctx.restore();
  }

  function drawDistinctAlien(e: EnemyEntity): void {
    if (!STATE.player) return;
    ctx.save();
    ctx.translate(e.x, e.y);

    const r = e.radius;
    const angle = Math.atan2(STATE.player.y - e.y, STATE.player.x - e.x);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.58, r * 1.18, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(angle);

    const arch = e.archetype;
    if (arch === 'leviathan') {
      for (let s = 3; s >= 1; s--) {
        const segX = -s * r * 0.58;
        const segY = Math.sin(e.legPhase * 0.8 + s * 1.1) * (r * 0.35);
        const segR = r * (0.85 - s * 0.14);
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : s % 2 === 0 ? e.color1 : e.color2;
        ctx.beginPath();
        ctx.arc(segX, segY, segR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    } else if (arch === 'squid' || arch === 'hivemother') {
      ctx.strokeStyle = e.hitFlash > 0 ? '#ffffff' : e.glow;
      ctx.lineWidth = arch === 'hivemother' ? 4 : 2.6;
      for (let t = -2; t <= 2; t++) {
        const wave = Math.sin(e.legPhase + t) * (r * 0.35);
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, t * r * 0.25);
        ctx.quadraticCurveTo(-r * 1.2, t * r * 0.45 + wave, -r * 1.75, t * r * 0.3 - wave);
        ctx.stroke();
      }
    } else if (arch === 'hydra') {
      for (let h = -1; h <= 1; h++) {
        const sway = Math.sin(e.legPhase + h * 1.4) * 5;
        ctx.strokeStyle = e.hitFlash > 0 ? '#ffffff' : e.color1;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(r * 0.2, h * r * 0.35);
        ctx.lineTo(r * 1.25, h * r * 0.62 + sway);
        ctx.stroke();

        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(r * 1.3, h * r * 0.62 + sway, r * 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (arch === 'quadwalker' || arch === 'dreadnought' || arch === 'megaTokar' || arch === 'megaBaker') {
      ctx.strokeStyle = e.hitFlash > 0 ? '#ffffff' : '#0f172a';
      ctx.lineWidth = e.isBoss ? 7 : 4.5;
      for (let i = 0; i < 4; i++) {
        const off = (i - 1.5) * r * 0.48;
        const swing = Math.sin(e.legPhase + i * 1.4) * (r * 0.32);
        ctx.beginPath();
        ctx.moveTo(off, -r * 0.5);
        ctx.lineTo(off + swing, -r * 1.38);
        ctx.moveTo(off, r * 0.5);
        ctx.lineTo(off - swing, r * 1.38);
        ctx.stroke();
      }
      ctx.fillStyle = e.glow;
      ctx.fillRect(r * 0.2, -r * 1.05, r * 0.95, r * 0.28);
      ctx.fillRect(r * 0.2, r * 0.77, r * 0.95, r * 0.28);
    } else {
      const pairs = arch === 'beetle' ? 3 : 2;
      ctx.strokeStyle = e.hitFlash > 0 ? '#ffffff' : e.color2;
      ctx.lineWidth = 3;
      for (let i = 0; i < pairs; i++) {
        const off = (i - (pairs - 1) / 2) * r * 0.55;
        const swing = Math.sin(e.legPhase + i * 1.6) * (r * 0.38);
        ctx.beginPath();
        ctx.moveTo(off, -r * 0.4);
        ctx.lineTo(off + swing, -r * 1.35);
        ctx.moveTo(off, r * 0.4);
        ctx.lineTo(off - swing, r * 1.35);
        ctx.stroke();
      }
      if (arch === 'mantis') {
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(r * 0.3, -r * 0.5);
        ctx.lineTo(r * 1.35, -r * 0.85);
        ctx.lineTo(r * 1.65, -r * 0.25);
        ctx.moveTo(r * 0.3, r * 0.5);
        ctx.lineTo(r * 1.35, r * 0.85);
        ctx.lineTo(r * 1.65, r * 0.25);
        ctx.stroke();
      }
    }

    const bodyGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.1, 0, 0, r * 1.15);
    if (e.hitFlash > 0) {
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(1, '#fde047');
    } else if (e.chillTimer > 0) {
      bodyGrad.addColorStop(0, '#a5f3fc');
      bodyGrad.addColorStop(1, '#0e7490');
    } else {
      bodyGrad.addColorStop(0, e.glow);
      bodyGrad.addColorStop(0.45, e.color1);
      bodyGrad.addColorStop(1, e.color2);
    }

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    if (arch === 'beetle' || arch === 'dreadnought' || e.isBoss) {
      ctx.ellipse(0, 0, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
    } else if (arch === 'mantis' || arch === 'arachnid') {
      ctx.ellipse(-r * 0.35, 0, r * 0.65, r * 0.52, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.3, 0, r * 0.62, r * 0.54, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.strokeStyle = e.isBoss ? '#fbbf24' : 'rgba(255,255,255,0.38)';
    ctx.lineWidth = e.isBoss ? 3 : 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.32, r * 0.52, r * 0.16, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = e.isBoss ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(r * 0.72, -r * 0.28);
    ctx.quadraticCurveTo(r * 1.35, -r * 0.28, r * 1.15, -r * 0.05);
    ctx.moveTo(r * 0.72, r * 0.28);
    ctx.quadraticCurveTo(r * 1.35, r * 0.28, r * 1.15, r * 0.05);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.62, -r * 0.22, e.isBoss ? 4.5 : 2.5, 0, Math.PI * 2);
    ctx.arc(r * 0.62, r * 0.22, e.isBoss ? 4.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (e.isBoss && e.bossLabel) {
      ctx.save();
      ctx.font = '900 18px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#020617';
      ctx.fillText(e.bossLabel, 1.5, -r - 16);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(e.bossLabel, 0, -r - 18);
      ctx.restore();
    } else {
      if (e.hp < e.maxHp) {
        const bw = r * 1.8;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(-bw / 2, -r - 12, bw, 4.5);
        ctx.fillStyle = e.glow;
        ctx.fillRect(-bw / 2, -r - 12, bw * Math.max(0, e.hp / e.maxHp), 4.5);
      }
      if (e.alienLevel >= 4) {
        ctx.font = '800 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = e.glow;
        ctx.fillText(`LV.${e.alienLevel}`, 0, -r - 15);
      }
    }

    if (e.stunTimer > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✕ STUNNED', 0, r + 16);
    }

    ctx.restore();
  }

  function drawFullBody25DOperative(p: PlayerState): void {
    const hero = p.hero;
    const wMeta = WEAPON_CATALOG[hero.weapon];
    const highestTier = STATE.weapons.reduce((m, w) => Math.max(m, w.tier), 1);
    const activeWepColor = TIER_STYLES[highestTier].color;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = highestTier === 4 ? '#fbbf24' : hero.primary;
    ctx.lineWidth = highestTier === 4 ? 2.5 : 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 17, 25, 11.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.rotate(p.facingAngle);
    ctx.fillStyle = hero.accent;
    ctx.beginPath();
    ctx.moveTo(33, 0);
    ctx.lineTo(25, -5.5);
    ctx.lineTo(27.5, 0);
    ctx.lineTo(25, 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const stride = p.isMoving ? Math.sin(p.walkCycle) * 7 : 0;
    const drawLegAndBoot = (lx: number, ly: number) => {
      ctx.fillStyle = hero.secondary;
      ctx.strokeStyle = hero.primary;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(lx - 4, ly - 10, 8, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = hero.accent;
      ctx.beginPath();
      ctx.arc(lx, ly - 4, 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = hero.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(lx, ly + 3, 5.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };
    drawLegAndBoot(-6.5, 13 + stride * 0.55);
    drawLegAndBoot(6.5, 13 - stride * 0.55);

    if (hero.isAscended) {
      const pulseR = 29 + Math.sin(STATE.time * 5) * 3;
      ctx.strokeStyle = hero.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.ellipse(0, 17, pulseR, 13.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (hero.backGear === 'wings' || hero.backGear === 'seraphWings') {
      const flap = Math.sin(STATE.time * 8) * 4;
      const span = hero.backGear === 'seraphWings' ? 40 : 32;
      ctx.fillStyle = hero.accent;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-span, -20 + flap);
      ctx.lineTo(-23, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(span, -20 + flap);
      ctx.lineTo(23, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hero.backGear === 'prismRings') {
      ctx.save();
      ctx.rotate(STATE.time * 1.8);
      ctx.strokeStyle = hero.visor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(-19, -19, 38, 38);
      ctx.stroke();
      ctx.restore();
    } else if (hero.backGear === 'cape' || hero.backGear === 'novaCloak') {
      const sway = Math.sin(STATE.time * 6) * 3;
      ctx.fillStyle = hero.secondary;
      ctx.strokeStyle = hero.backGear === 'novaCloak' ? hero.visor : hero.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, -5);
      ctx.lineTo(12, -5);
      ctx.lineTo(19 + sway, 19);
      ctx.lineTo(-19 + sway, 19);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = hero.accent;
      ctx.lineWidth = 1.4;
      ctx.fillRect(-15, -11, 6, 15);
      ctx.strokeRect(-15, -11, 6, 15);
      ctx.fillRect(9, -11, 6, 15);
      ctx.strokeRect(9, -11, 6, 15);
    }

    const torsoGrad = ctx.createRadialGradient(-4, -9, 2, 0, -2, 19);
    torsoGrad.addColorStop(0, '#ffffff');
    torsoGrad.addColorStop(0.35, hero.primary);
    torsoGrad.addColorStop(1, hero.secondary);

    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(-13, -13, 26, 22, 8);
    ctx.fill();
    ctx.strokeStyle = hero.accent;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, 4, 24, 4.5);
    ctx.fillStyle = hero.accent;
    ctx.fillRect(-3, 3.5, 6, 5.5);

    ctx.fillStyle = hero.primary;
    ctx.beginPath();
    ctx.arc(-14, -7, 5.5, 0, Math.PI * 2);
    ctx.arc(14, -7, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -2);
    ctx.rotate(p.facingAngle);
    const rx = -p.recoil;

    ctx.fillStyle = hero.secondary;
    ctx.beginPath();
    ctx.arc(11 + rx, -5, 3.4, 0, Math.PI * 2);
    ctx.arc(17 + rx, 4, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = activeWepColor;
    ctx.fillStyle = '#0f172a';
    ctx.lineWidth = 1.8;

    if (wMeta.shape === 'katana' || wMeta.shape === 'glaive' || wMeta.shape === 'lance' || wMeta.shape === 'scythe') {
      ctx.fillStyle = activeWepColor;
      ctx.beginPath();
      ctx.moveTo(10 + rx, -2.5);
      ctx.lineTo(37 + rx, 0);
      ctx.lineTo(10 + rx, 2.5);
      ctx.closePath();
      ctx.fill();
    } else if (wMeta.shape === 'bow') {
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(15 + rx, 0, 13, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
    } else if (wMeta.shape === 'staff' || wMeta.shape === 'orb' || wMeta.shape === 'prism' || wMeta.shape === 'quantum' || wMeta.shape === 'trident' || wMeta.shape === 'sovereign') {
      ctx.beginPath();
      ctx.moveTo(6 + rx, 0);
      ctx.lineTo(30 + rx, 0);
      ctx.stroke();
      ctx.fillStyle = activeWepColor;
      ctx.beginPath();
      ctx.arc(32 + rx, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(9 + rx, -4.5, 22, 9);
      ctx.strokeRect(9 + rx, -4.5, 22, 9);
      ctx.fillStyle = activeWepColor;
      ctx.fillRect(25 + rx, -2.5, 6, 5);
    }

    if (p.recoil > 3.5) {
      ctx.fillStyle = activeWepColor;
      ctx.beginPath();
      ctx.moveTo(31 + rx, 0);
      ctx.lineTo(44 + rx, -7);
      ctx.lineTo(39 + rx, 0);
      ctx.lineTo(44 + rx, 7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(0, -11);
    ctx.fillStyle = hero.primary;
    ctx.strokeStyle = hero.accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.rotate(p.facingAngle);
    ctx.fillStyle = hero.visor;
    ctx.beginPath();
    ctx.ellipse(5.5, 0, 4.2, 6.8, 0, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    if (hero.headgear === 'crown' || hero.headgear === 'halo' || hero.headgear === 'omegaCrown' || hero.headgear === 'valkyrieCrest' || hero.headgear === 'oniMask') {
      ctx.strokeStyle = hero.accent;
      ctx.lineWidth = hero.isAscended ? 2.4 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();

    if (p.orbitShields > 0) {
      const orbitR = 60;
      for (let i = 0; i < p.orbitShields; i++) {
        const a = p.orbitAngle + (Math.PI * 2 * i) / p.orbitShields;
        const sx = p.x + Math.cos(a) * orbitR;
        const sy = p.y + Math.sin(a) * orbitR;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(a * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(8, 8);
        ctx.moveTo(8, -8);
        ctx.lineTo(-8, 8);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function render(): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (STATE.cameraShake > 0) {
      const sx = (Math.random() - 0.5) * STATE.cameraShake;
      const sy = (Math.random() - 0.5) * STATE.cameraShake;
      ctx.translate(sx, sy);
    }

    drawArenaFloor();

    if (STATE.mode === 'TITLE') return;

    for (const c of STATE.crates) {
      const scale = 1 + Math.sin(c.pulse) * 0.08;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.24)';
      ctx.beginPath();
      ctx.arc(0, 0, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0a1814';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.fillRect(-15, -15, 30, 30);
      ctx.strokeRect(-15, -15, 30, 30);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OST', 0, 1);
      ctx.restore();
    }

    for (const g of STATE.gems) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.fillStyle = g.isBoss ? '#fbbf24' : '#34d399';
      ctx.beginPath();
      const r = g.isBoss ? 9 : 5.5;
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    for (const sw of STATE.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const e of STATE.enemies) {
      drawDistinctAlien(e);
    }

    if (STATE.player) {
      drawFullBody25DOperative(STATE.player);
    }

    for (const proj of STATE.projectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      if (proj.isGold) {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ep of STATE.enemyProjectiles) {
      ctx.save();
      ctx.translate(ep.x, ep.y);
      ctx.fillStyle = ep.color;
      ctx.beginPath();
      ctx.arc(0, 0, ep.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of STATE.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const ft of STATE.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.font = `800 ${ft.size}px "Chakra Petch", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#020617';
      ctx.fillText(ft.text, ft.x + 1.5, ft.y + 1.5);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // =========================================================================
  // 19. CONTROLS, TOPIC MODAL & PAUSE TOGGLES
  // =========================================================================
  function togglePause(): void {
    if (STATE.mode === 'PLAYING') {
      STATE.mode = 'PAUSED';
      byId('pauseModal').classList.remove('hidden');
    } else if (STATE.mode === 'PAUSED') {
      STATE.mode = 'PLAYING';
      byId('pauseModal').classList.add('hidden');
    } else if (STATE.mode === 'TOPIC') {
      STATE.mode = 'PLAYING';
      byId('topicModal').classList.add('hidden');
    }
  }

  function openMidGameTopicModal(): void {
    if (STATE.mode !== 'PLAYING' && STATE.mode !== 'PAUSED') return;
    byId('pauseModal').classList.add('hidden');
    STATE.mode = 'TOPIC';
    byId('topicModal').classList.remove('hidden');
  }

  function closeMidGameTopicModal(): void {
    byId('topicModal').classList.add('hidden');
    if (STATE.mode === 'TOPIC') {
      STATE.mode = 'PLAYING';
    }
  }

  window.addEventListener('keydown', e => {
    STATE.keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      if (STATE.mode === 'PLAYING') {
        e.preventDefault();
        triggerDash();
      }
    }
    if (e.code === 'KeyE' || e.code === 'KeyQ') {
      if (STATE.mode === 'PLAYING') {
        triggerUltimate();
      }
    }
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (STATE.mode === 'PLAYING' || STATE.mode === 'PAUSED' || STATE.mode === 'TOPIC') {
        togglePause();
      }
    }
    if (e.code === 'Enter' && STATE.mode === 'MATH') {
      resumeAfterBreach();
    }
  });

  window.addEventListener('keyup', e => {
    STATE.keys[e.code] = false;
  });

  canvas.addEventListener('mousemove', e => {
    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;
  });

  canvas.addEventListener('mousedown', e => {
    STATE.mouse.x = e.clientX;
    STATE.mouse.y = e.clientY;
    if (e.button === 2 && STATE.mode === 'PLAYING') {
      triggerDash();
    } else {
      STATE.mouse.down = true;
    }
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  window.addEventListener('mouseup', () => {
    STATE.mouse.down = false;
  });

  const joyZone = byId('mobileJoystickZone');
  const joyKnob = byId('mobileJoystickKnob');

  function handleJoystickMove(clientX: number, clientY: number): void {
    const rect = joyZone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width / 2 - 16;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    STATE.joystick.active = true;
    STATE.joystick.dx = dx / maxR;
    STATE.joystick.dy = dy / maxR;
  }

  joyZone.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
      handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );

  joyZone.addEventListener(
    'touchmove',
    e => {
      e.preventDefault();
      handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );

  joyZone.addEventListener('touchend', () => {
    STATE.joystick.active = false;
    STATE.joystick.dx = 0;
    STATE.joystick.dy = 0;
    joyKnob.style.transform = 'translate(0px, 0px)';
  });

  byId('btnDashAction').addEventListener('click', triggerDash);
  byId('btnUltAction').addEventListener('click', triggerUltimate);
  byId('btnPauseToggle').addEventListener('click', togglePause);
  byId('btnResumeGame').addEventListener('click', togglePause);
  byId('btnOpenTopicModal').addEventListener('click', openMidGameTopicModal);
  byId('btnCloseTopicModal').addEventListener('click', closeMidGameTopicModal);

  byId('btnQuitToMenu').addEventListener('click', () => {
    if (STATE.stats.mathAttempted > 0) {
      syncRunToCloud(false);
    }
    byId('pauseModal').classList.add('hidden');
    byId('topicModal').classList.add('hidden');
    byId('hudTop').classList.add('hidden');
    byId('hudBottomControls').classList.add('hidden');
    byId('mobileJoystickZone').classList.add('hidden');
    byId('titleScreen').classList.remove('hidden');
    STATE.mode = 'TITLE';
  });

  byId('btnAimToggle').addEventListener('click', () => {
    STATE.autoAim = !STATE.autoAim;
    byId('hudAimMode').textContent = STATE.autoAim ? 'AUTO' : 'MOUSE';
  });

  byId('btnSoundToggle').addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    byId('btnSoundToggle').textContent = sfx.enabled ? '🔊' : '🔇';
  });

  function launchGame(): void {
    const hero = OPERATIVES.find(h => h.id === selectedHeroId) || OPERATIVES[0];
    if (!isHeroUnlocked(hero)) {
      sfx.play('wrong');
      return;
    }
    sfx.init();
    pendingGuestRun = null;
    if (latestCloudSnap.user) {
      void firebaseSave.savePreferences(hero.id, selectedTopicId);
    }
    STATE.player = createPlayer(hero);
    STATE.weapons = [];
    STATE.enemies = [];
    STATE.projectiles = [];
    STATE.enemyProjectiles = [];
    STATE.gems = [];
    STATE.particles = [];
    STATE.floatingTexts = [];
    STATE.shockwaves = [];
    STATE.stats = {
      kills: 0,
      mathAttempted: 0,
      mathCorrect: 0,
      syncedAttempted: 0,
      syncedCorrect: 0,
      unlockedThisRun: [],
      runRecorded: false
    };

    byId('hudAvatar').innerHTML = buildOperativeSVG(hero);
    addOrMergeWeapon(hero.weapon);

    byId('titleScreen').classList.add('hidden');
    byId('endModal').classList.add('hidden');
    byId('hudTop').classList.remove('hidden');
    byId('hudBottomControls').classList.remove('hidden');

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      byId('mobileJoystickZone').classList.remove('hidden');
    }

    STATE.mode = 'PLAYING';
    startWave(1);
  }

  byId('btnStartGame').addEventListener('click', launchGame);
  byId('btnRestartGame').addEventListener('click', () => {
    byId('endModal').classList.add('hidden');
    byId('hudTop').classList.add('hidden');
    byId('hudBottomControls').classList.add('hidden');
    byId('mobileJoystickZone').classList.add('hidden');
    byId('titleScreen').classList.remove('hidden');
    STATE.mode = 'TITLE';
    renderTitleRoster();
    updateSelectedHeroPanel();
  });

  // =========================================================================
  // 20. MAIN ANIMATION LOOP
  // =========================================================================
  let lastTimestamp = 0;
  function gameLoop(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    update(dt);
    render();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
