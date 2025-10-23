import { useState, useEffect } from 'react';
import { ProgressBar, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import type { Task } from '../types';

type Props = {
  completedTasks: Task[];
  currentXP: number;
  onXPUpdate: (xp: number, level: number) => void;
};

// Enhanced XP calculation based on workload, responsiveness, and base XP
function calculateTaskXP(task: Task): { totalXP: number; breakdown: { base: number; workload: number; responsiveness: number; multiplier: number } } {
  const baseXP = 500; // Base XP for completing any task
  
  // Enhanced workload bonus (0-3000 XP) - more rewarding for high workload tasks
  const workload = task.workload || 1;
  const workloadBonus = Math.min(workload * 300, 3000); // 300 XP per workload point, max 3000
  
  // Enhanced responsiveness bonus (0-4000 XP) - more granular time scaling
  const createdTime = new Date(task.createdAt).getTime();
  const completedTime = new Date(task.completedAt || Date.now()).getTime();
  const timeToComplete = completedTime - createdTime;
  const hoursToComplete = timeToComplete / (1000 * 60 * 60);
  
  let responsivenessBonus = 0;
  if (hoursToComplete <= 0.5) responsivenessBonus = 4000; // Completed within 30 minutes - lightning fast!
  else if (hoursToComplete <= 2) responsivenessBonus = 3500; // Completed within 2 hours - very fast
  else if (hoursToComplete <= 6) responsivenessBonus = 3000; // Completed within 6 hours - fast
  else if (hoursToComplete <= 12) responsivenessBonus = 2500; // Completed within 12 hours - good
  else if (hoursToComplete <= 24) responsivenessBonus = 2000; // Completed within 1 day - decent
  else if (hoursToComplete <= 48) responsivenessBonus = 1500; // Completed within 2 days - okay
  else if (hoursToComplete <= 72) responsivenessBonus = 1000; // Completed within 3 days - slow
  else if (hoursToComplete <= 168) responsivenessBonus = 500; // Completed within 1 week - very slow
  else responsivenessBonus = 100; // Completed after 1 week - minimal bonus
  
  // Difficulty multiplier based on task complexity
  let difficultyMultiplier = 1.0;
  if (workload >= 8) difficultyMultiplier = 1.5; // High workload tasks get 50% bonus
  else if (workload >= 5) difficultyMultiplier = 1.25; // Medium-high workload gets 25% bonus
  else if (workload >= 3) difficultyMultiplier = 1.1; // Medium workload gets 10% bonus
  
  const totalXP = Math.floor((baseXP + workloadBonus + responsivenessBonus) * difficultyMultiplier);
  
  return {
    totalXP,
    breakdown: {
      base: baseXP,
      workload: workloadBonus,
      responsiveness: responsivenessBonus,
      multiplier: difficultyMultiplier
    }
  };
}

// Level thresholds (exponential growth)
function getLevelThreshold(level: number): number {
  return Math.floor(10000 * Math.pow(1.5, level - 1));
}


function getCurrentLevelFromXP(totalXP: number): { level: number; xpInLevel: number; xpToNext: number } {
  let level = 1;
  let xpInLevel = totalXP;
  let xpToNext = getLevelThreshold(1);
  
  while (xpInLevel >= xpToNext) {
    xpInLevel -= xpToNext;
    level++;
    xpToNext = getLevelThreshold(level);
  }
  
  return { level, xpInLevel, xpToNext };
}

export default function XPBar({ completedTasks, currentXP, onXPUpdate }: Props) {
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [lastCompletedCount, setLastCompletedCount] = useState(completedTasks.length);
  const [gainedXP, setGainedXP] = useState(0);
  const [lastXPBreakdown, setLastXPBreakdown] = useState<{ base: number; workload: number; responsiveness: number; multiplier: number } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [badgeEffects, setBadgeEffects] = useState({
    color: '#8B7D6B',
    glow: false,
    pulse: false,
    sparkle: false,
    size: 1,
    rotation: 0,
    shadow: false,
    majorChange: false,
    rainbow: false,
    shake: false,
    morph: false,
    explode: false
  });

  // Calculate current level from XP
  const { level, xpInLevel, xpToNext } = getCurrentLevelFromXP(currentXP);

  // Initialize lastCompletedCount when component mounts
  useEffect(() => {
    if (!isInitialized) {
      setLastCompletedCount(completedTasks.length);
      setIsInitialized(true);
    }
  }, [completedTasks.length, isInitialized]);

  // Generate badge effects based on level (deterministic)
  useEffect(() => {
    const generateLevelBasedEffects = (level: number) => {
      // Use level as seed for deterministic "random" effects
      const seed = level;
      const pseudoRandom = (multiplier: number = 1) => {
        const x = Math.sin(seed * multiplier) * 10000;
        return x - Math.floor(x);
      };
      
      const newEffects = {
        color: '#8B7D6B',
        glow: false,
        pulse: false,
        sparkle: false,
        size: 1,
        rotation: 0,
        shadow: false,
        majorChange: false,
        rainbow: false,
        shake: false,
        morph: false,
        explode: false
      };
      
      // Determine if this level should have a major change (every 8-12 levels)
      const majorChangeInterval = 8 + Math.floor(pseudoRandom(1.7) * 5); // 8-12 levels
      const isMajorChange = level % majorChangeInterval === 0;
      
      if (isMajorChange) {
        // MAJOR CHANGE - Dramatic effects based on level
        newEffects.majorChange = true;
        
        // Major effect type based on level
        const majorEffectTypes = ['rainbow', 'shake', 'morph', 'explode'];
        const majorEffectIndex = Math.floor(pseudoRandom(2.3) * majorEffectTypes.length);
        const majorEffect = majorEffectTypes[majorEffectIndex];
        
        // Apply the selected major effect
        if (majorEffect === 'rainbow') newEffects.rainbow = true;
        else if (majorEffect === 'shake') newEffects.shake = true;
        else if (majorEffect === 'morph') newEffects.morph = true;
        else if (majorEffect === 'explode') newEffects.explode = true;
        
        // Extreme colors based on level
        const extremeColors = [
          '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
          '#FF4500', '#8A2BE2', '#FF1493', '#00CED1', '#FFD700', '#FF6347',
          '#32CD32', '#FF69B4', '#00FA9A', '#FF8C00', '#DC143C', '#7B68EE'
        ];
        const colorIndex = Math.floor(pseudoRandom(3.1) * extremeColors.length);
        newEffects.color = extremeColors[colorIndex];
        
        // Size based on level (grows with level)
        newEffects.size = 0.8 + (level / 50) + pseudoRandom(4.7) * 0.4;
        
        // No permanent rotation - only during animations
        newEffects.rotation = 0;
        
        // All effects active for major changes
        newEffects.glow = true;
        newEffects.sparkle = true;
        newEffects.shadow = true;
        newEffects.pulse = true;
        
      } else {
        // NORMAL CHANGE - Subtle effects based on level
        newEffects.majorChange = false;
        newEffects.rainbow = false;
        newEffects.shake = false;
        newEffects.morph = false;
        newEffects.explode = false;
        
        // Color based on level progression
        const colors = [
          '#8B7D6B', '#A8967A', '#B8A68A', '#C8B69A', 
          '#D4C4A8', '#E0D2B6', '#ECDFC4', '#F2E8D8',
          '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', 
          '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
        ];
        
        // Color selection based on level - more conservative for lower levels
        let colorIndex;
        if (level >= 20) {
          colorIndex = Math.floor(pseudoRandom(6.1) * colors.length);
        } else if (level >= 10) {
          colorIndex = Math.floor(pseudoRandom(7.3) * 12);
        } else if (level >= 5) {
          colorIndex = Math.floor(pseudoRandom(8.7) * 8);
        } else {
          // For levels 1-4, stick to the first 2 neutral colors
          colorIndex = Math.floor(pseudoRandom(9.1) * 2);
        }
        newEffects.color = colors[colorIndex];
        
        // Effects based on level thresholds
        if (level >= 25) {
          newEffects.glow = pseudoRandom(10.1) > 0.3;
          newEffects.sparkle = pseudoRandom(11.3) > 0.2;
          newEffects.shadow = pseudoRandom(12.7) > 0.4;
        } else if (level >= 15) {
          newEffects.glow = pseudoRandom(13.1) > 0.5;
          newEffects.sparkle = pseudoRandom(14.3) > 0.3;
          newEffects.shadow = pseudoRandom(15.7) > 0.6;
        } else if (level >= 10) {
          newEffects.glow = pseudoRandom(16.1) > 0.7;
          newEffects.pulse = pseudoRandom(17.3) > 0.3;
        } else if (level >= 5) {
          newEffects.pulse = pseudoRandom(18.7) > 0.2;
        }
        
        // Size based on level (subtle growth) - more conservative for lower levels
        if (level >= 20) {
          newEffects.size = 1 + (level / 100) + pseudoRandom(19.1) * 0.1;
        } else if (level >= 10) {
          newEffects.size = 1 + (level / 150) + pseudoRandom(19.1) * 0.05;
        } else if (level >= 5) {
          newEffects.size = 1 + (level / 200) + pseudoRandom(19.1) * 0.03;
        } else {
          // For levels 1-4, keep size very close to normal
          newEffects.size = 1 + (level / 300) + pseudoRandom(19.1) * 0.02;
        }
        
        // No permanent rotation - only during animations
        newEffects.rotation = 0;
      }
      
      return newEffects;
    };
    
    setBadgeEffects(generateLevelBasedEffects(level));
  }, [level]);

  // Calculate XP when tasks are completed
  useEffect(() => {
    if (isInitialized && completedTasks.length > lastCompletedCount) {
      const newTasks = completedTasks.slice(lastCompletedCount);
      const xpCalculations = newTasks.map(task => calculateTaskXP(task));
      const newXP = xpCalculations.reduce((total, calc) => total + calc.totalXP, 0);
      
      if (newXP > 0) {
        // Store the breakdown from the most recent task for display
        const latestBreakdown = xpCalculations[xpCalculations.length - 1].breakdown;
        setLastXPBreakdown(latestBreakdown);
        setGainedXP(newXP);
        setShowXPAnimation(true);
        setLastCompletedCount(completedTasks.length);
        
        // Update XP after animation
        setTimeout(() => {
          const newTotalXP = currentXP + newXP;
          const { level } = getCurrentLevelFromXP(newTotalXP);
          onXPUpdate(newTotalXP, level);
          setShowXPAnimation(false);
        }, 2000);
      }
    }
  }, [completedTasks, lastCompletedCount, currentXP, onXPUpdate, isInitialized]);

  const progressPercentage = (xpInLevel / xpToNext) * 100;

  return (
    <div className="xp-bar-container w-100">
      <div className="d-flex align-items-center justify-content-between w-100">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <div className="xp-progress-container flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Badge 
                className={`level-badge ${badgeEffects.shake ? 'shake' : ''} ${badgeEffects.morph ? 'morph' : ''} ${badgeEffects.explode ? 'explode' : ''}`}
                style={{
                  ...(badgeEffects.rainbow ? {
                    background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                    backgroundSize: '400% 400%'
                  } : {
                    backgroundColor: badgeEffects.color
                  }),
                  transform: `scale(${badgeEffects.size}) rotate(${badgeEffects.rotation}deg)`,
                  boxShadow: badgeEffects.glow ? `0 0 30px ${badgeEffects.color}, 0 0 60px ${badgeEffects.color}` : 
                            badgeEffects.shadow ? '0 4px 8px rgba(0,0,0,0.3)' : 'none',
                  animation: badgeEffects.pulse ? 'pulse 1s infinite' : 
                            badgeEffects.sparkle ? 'sparkle 2s infinite' :
                            badgeEffects.rainbow ? 'rainbow 3s infinite' :
                            badgeEffects.shake ? 'shake 0.5s infinite' :
                            badgeEffects.morph ? 'morph 2s infinite' :
                            badgeEffects.explode ? 'explode 1s infinite' : 'none',
                  transition: badgeEffects.majorChange ? 'all 0.1s ease' : 'all 0.5s ease',
                  filter: badgeEffects.explode ? 'brightness(1.5) saturate(2)' : 'none'
                }}
              >
                Level {level}
              </Badge>
              <div className="xp-text">
                {xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP
              </div>
            </div>
            <ProgressBar 
              now={progressPercentage} 
              variant="success" 
              className="xp-progress-bar"
            />
          </div>
        </div>
        <div className="d-flex align-items-center gap-3 flex-shrink-0 position-relative">
          {showXPAnimation && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="xp-breakdown-tooltip">
                  {lastXPBreakdown && (
                    <div className="xp-breakdown">
                      <div><strong>XP Breakdown:</strong></div>
                      <div>Base: {lastXPBreakdown.base} XP</div>
                      <div>Workload: {lastXPBreakdown.workload} XP</div>
                      <div>Speed: {lastXPBreakdown.responsiveness} XP</div>
                      {lastXPBreakdown.multiplier > 1 && (
                        <div>Difficulty: {Math.round((lastXPBreakdown.multiplier - 1) * 100)}% bonus</div>
                      )}
                    </div>
                  )}
                </Tooltip>
              }
            >
              <div className="xp-gain-animation">
                +{gainedXP.toLocaleString()} XP
              </div>
            </OverlayTrigger>
          )}
        </div>
      </div>
    </div>
  );
}
